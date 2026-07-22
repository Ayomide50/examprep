import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, UserPlus, Loader2, ArrowLeft, KeyRound, Eye, EyeOff, User, Gift } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [referralCode, setReferralCode] = useState(
    () => new URLSearchParams(window.location.search).get("ref") || ""
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const startResendCooldown = () => {
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await base44.auth.register({ email, password });
      setStep("otp");
      startResendCooldown();
    } catch (err) {
      setError(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    setError("");
    try {
      const res = await base44.auth.verifyOtp({ email, otpCode: otp });
      base44.auth.setToken(res.access_token);
      try {
        const me = await base44.auth.me();
        const existing = await base44.entities.StudentProfile.filter({ user_id: me.id });
        if (existing.length === 0) {
          await base44.entities.StudentProfile.create({
            user_id: me.id,
            email: me.email,
            full_name: fullName.trim(),
            referral_code: referralCode.trim(),
            is_activated: false,
            free_trial_used: {},
            total_questions_answered: 0,
            total_correct: 0,
            total_practice_sessions: 0,
            total_mock_exams: 0,
          });
        }
        const codeEntered = referralCode.trim().toUpperCase();
        if (codeEntered) {
          const referrers = await base44.entities.StudentProfile.filter({ my_referral_code: codeEntered });
          if (referrers.length > 0 && referrers[0].user_id !== me.id) {
            await base44.entities.Referral.create({
              referrer_user_id: referrers[0].user_id,
              referrer_code: codeEntered,
              referred_user_id: me.id,
              referred_email: me.email,
              referred_name: fullName.trim(),
              status: "pending",
              reward_amount: 500,
            });
          }
        }
      } catch (_) {
        // Profile will be auto-created on first dashboard load if this fails
      }
      window.location.href = "/";
    } catch (err) {
      setError(err?.message || "Invalid or expired code");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      await base44.auth.resendOtp(email);
      startResendCooldown();
    } catch (err) {
      setError(err?.message || "Failed to resend code");
    }
  };

  if (step === "otp") {
    return (
      <AuthLayout
        icon={KeyRound}
        title="Verify your email"
        subtitle={`We sent a 6-digit code to ${email}`}
        footer={
          <button
            onClick={() => { setStep("form"); setError(""); }}
            className="text-primary font-medium hover:underline"
          >
            <ArrowLeft className="w-3 h-3 inline mr-1" />Use a different email
          </button>
        }
      >
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Verification code</Label>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              autoFocus
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="h-12 text-center text-lg tracking-widest"
              maxLength={6}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/5 px-3 py-2 rounded-lg">{error}</p>
          )}

          <Button type="submit" className="w-full h-12 font-medium" disabled={otpLoading || otp.length < 6}>
            {otpLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify & continue"
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Didn't get the code?{" "}
            {resendCooldown > 0 ? (
              <span className="text-muted-foreground">Resend in {resendCooldown}s</span>
            ) : (
              <button type="button" onClick={handleResendOtp} className="text-primary font-medium hover:underline">
                Resend code
              </button>
            )}
          </div>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={UserPlus}
      title="Create your account"
      subtitle="Start learning with a free account"
      footer={
        <Link to="/login" className="text-primary font-medium hover:underline">
          <ArrowLeft className="w-3 h-3 inline mr-1" />Already have an account? Sign in
        </Link>
      }
    >
      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="fullName"
              type="text"
              autoComplete="name"
              autoFocus
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="confirm"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="pl-10 pr-10 h-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="referralCode">Referral Code (Optional)</Label>
          <div className="relative">
            <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="referralCode"
              type="text"
              placeholder="Enter referral code if you have one"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/5 px-3 py-2 rounded-lg">{error}</p>
        )}

        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Create account
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
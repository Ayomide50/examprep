import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import { useLevelActivations } from "@/hooks/useLevelActivations";
import { getWhatsAppLink } from "@/lib/constants";
import { formatLevel } from "@/lib/access";
import { activationForLevel, expiryForDuration, fetchDepartmentLevels } from "@/lib/levels";
import { KeyRound, CheckCircle, MessageCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import LevelStatusList from "@/components/student/LevelStatusList";

export default function Activate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, user, loading: profileLoading, refresh } = useStudentProfile();
  const { activations, loading: activationsLoading, refresh: refreshActivations } = useLevelActivations(
    profile?.user_id
  );
  const [levels, setLevels] = useState([]);
  const [code, setCode] = useState("");
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile?.department_id) {
      fetchDepartmentLevels(profile.department_id).then(setLevels);
    }
  }, [profile?.department_id]);

  const currentLevel = profile?.level;
  const currentActivation = activationForLevel(activations, currentLevel);

  const handleActivate = async () => {
    const trimmed = code.trim().toUpperCase();

    if (!trimmed) {
      setError("Please enter an activation code");
      return;
    }
    if (!currentLevel) {
      setError("Please set your academic level first.");
      return;
    }

    setActivating(true);
    setError("");

    try {
      const codes = await base44.entities.ActivationCode.filter({ code: trimmed });

      if (codes.length === 0) {
        setError("Invalid activation code. Please check and try again.");
        return;
      }

      const activationCode = codes[0];

      if (activationCode.status === "used") {
        setError("This activation code has already been used by another student.");
        return;
      }

      if (activationCode.status === "revoked") {
        setError("This activation code has been revoked. Please contact the administrator.");
        return;
      }

      // First activation ever — only then does the referrer get credited.
      const isFirstActivation = activations.length === 0;
      const activationDate = new Date().toISOString();
      const duration = activationCode.access_duration || "full_time";
      const accessExpires = expiryForDuration(duration);

      await base44.entities.ActivationCode.update(activationCode.id, {
        status: "used",
        assigned_student_id: user.id,
        assigned_student_email: user.email,
        assigned_student_name: user.full_name || "",
        date_activated: activationDate,
      });

      // Activation is tracked per academic level.
      await base44.entities.LevelActivation.create({
        user_id: user.id,
        student_profile_id: profile.id,
        level: currentLevel,
        department_id: profile.department_id || "",
        department_name: profile.department_name || "",
        is_active: true,
        activation_code: trimmed,
        activation_date: activationDate,
        access_duration: duration,
        access_expires: accessExpires,
      });

      await base44.entities.StudentProfile.update(profile.id, {
        is_activated: true,
        activation_code: trimmed,
        activation_date: activationDate,
        access_expires: accessExpires,
      });

      if (isFirstActivation) {
        try {
          const referrals = await base44.entities.Referral.filter({
            referred_user_id: user.id,
            status: "pending",
          });
          if (referrals.length > 0) {
            await base44.entities.Referral.update(referrals[0].id, {
              status: "paid",
              paid_date: new Date().toISOString(),
            });
          }
        } catch (_) {
          // Referral crediting must not block activation
        }
      }

      await Promise.all([refreshActivations(), refresh()]);
      setCode("");
      toast({
        title: `${formatLevel(currentLevel)} Activated!`,
        description: `You now have full access to all ${formatLevel(currentLevel)} courses and mock exams.`,
      });
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setActivating(false);
    }
  };

  if (profileLoading || activationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-8 space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4">
          <KeyRound className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-display text-2xl font-bold mb-2">
          {currentLevel ? `Activate ${formatLevel(currentLevel)}` : "Activate Your Account"}
        </h1>
        <p className="text-muted-foreground">
          Activation is required separately for each academic level.
        </p>
      </div>

      {/* Activation status per level */}
      <div className="bg-card border border-border/60 rounded-xl p-6 space-y-4">
        <h2 className="font-heading font-semibold">Your Activation Status</h2>
        <LevelStatusList levels={levels} currentLevel={currentLevel} activations={activations} />
      </div>

      {currentActivation ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="font-heading font-semibold text-green-900">
            {formatLevel(currentLevel)} is Active
          </h2>
          <p className="text-sm text-green-700 mt-1">
            You have full access to all {formatLevel(currentLevel)} courses, questions and mock exams.
          </p>
          <Button className="rounded-full mt-4" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      ) : (
        <div className="bg-card border border-border/60 rounded-xl p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Activation Code for {formatLevel(currentLevel) || "your level"}
            </label>
            <Input
              placeholder="e.g. EXP-8K4M-92P1"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError("");
              }}
              className="text-center font-mono text-lg tracking-widest"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Button
            className="w-full rounded-full"
            onClick={handleActivate}
            disabled={activating || !code.trim()}
          >
            {activating
              ? "Activating..."
              : `Activate ${formatLevel(currentLevel) || "Account"}`}
          </Button>
        </div>
      )}

      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          {currentActivation
            ? "Need access to another level? Change your level from your dashboard, then activate it here."
            : "Don't have an activation code?"}
        </p>
        <a href={getWhatsAppLink(user?.email || "")} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="rounded-full gap-2">
            <MessageCircle className="w-4 h-4" />
            Contact Admin via WhatsApp
          </Button>
        </a>
        {currentActivation && (
          <div className="mt-3">
            <Link to="/dashboard" className="text-sm text-primary hover:underline">
              Back to Dashboard
            </Link>
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="bg-muted/50 rounded-xl p-5">
        <h3 className="font-heading font-semibold text-sm mb-3">How to get an activation code:</h3>
        <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
          <li>Click "Contact Admin via WhatsApp" above</li>
          <li>Send the pre-filled message to the admin</li>
          <li>Complete the payment as instructed</li>
          <li>Receive your unique activation code</li>
          <li>Enter the code above to unlock full access to your current level</li>
        </ol>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import { getWhatsAppLink } from "@/lib/constants";
import { KeyRound, CheckCircle, MessageCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export default function Activate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, user, loading: profileLoading, refresh } = useStudentProfile();
  const [code, setCode] = useState("");
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState("");

  const handleActivate = async () => {
    if (!code.trim()) {
      setError("Please enter an activation code");
      return;
    }

    setActivating(true);
    setError("");

    try {
      const codes = await base44.entities.ActivationCode.filter({ code: code.trim().toUpperCase() });

      if (codes.length === 0) {
        setError("Invalid activation code. Please check and try again.");
        setActivating(false);
        return;
      }

      const activationCode = codes[0];

      if (activationCode.status === "used") {
        setError("This activation code has already been used by another student.");
        setActivating(false);
        return;
      }

      if (activationCode.status === "revoked") {
        setError("This activation code has been revoked. Please contact the administrator.");
        setActivating(false);
        return;
      }

      // Activate the code
      await base44.entities.ActivationCode.update(activationCode.id, {
        status: "used",
        assigned_student_id: user.id,
        assigned_student_email: user.email,
        assigned_student_name: user.full_name || "",
        date_activated: new Date().toISOString(),
      });

      // Update student profile
      await base44.entities.StudentProfile.update(profile.id, {
        is_activated: true,
        activation_code: code.trim().toUpperCase(),
        activation_date: new Date().toISOString(),
      });

      toast({ title: "Account Activated!", description: "You now have full access to all courses and features." });
      navigate("/dashboard");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setActivating(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (profile?.is_activated) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="font-display text-2xl font-bold mb-2">Account Already Active</h1>
        <p className="text-muted-foreground mb-6">Your account has full premium access.</p>
        <Button className="rounded-full" onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4">
          <KeyRound className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-display text-2xl font-bold mb-2">Activate Your Account</h1>
        <p className="text-muted-foreground">Enter the activation code you received from the administrator</p>
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-6 space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Activation Code</label>
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
          {activating ? "Activating..." : "Activate Account"}
        </Button>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground mb-4">Don't have an activation code?</p>
        <a href={getWhatsAppLink(user?.email || "")} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="rounded-full gap-2">
            <MessageCircle className="w-4 h-4" />
            Contact Admin via WhatsApp
          </Button>
        </a>
      </div>

      {/* How it works */}
      <div className="mt-8 bg-muted/50 rounded-xl p-5">
        <h3 className="font-heading font-semibold text-sm mb-3">How to get an activation code:</h3>
        <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
          <li>Click "Contact Admin via WhatsApp" above</li>
          <li>Send the pre-filled message to the admin</li>
          <li>Complete the payment as instructed</li>
          <li>Receive your unique activation code</li>
          <li>Enter the code above to unlock full access</li>
        </ol>
      </div>
    </div>
  );
}
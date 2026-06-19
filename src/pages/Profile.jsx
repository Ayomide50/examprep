import React from "react";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import { User, Mail, Shield, Calendar, CheckCircle, XCircle } from "lucide-react";
import moment from "moment";

export default function Profile() {
  const { profile, user, loading } = useStudentProfile();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="font-display text-2xl md:text-3xl font-bold">Profile</h1>

      <div className="bg-card border border-border/60 rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-lg">{user?.full_name || "Student"}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="border-t border-border pt-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email</span>
            </div>
            <span className="text-sm font-medium">{user?.email}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Account Status</span>
            </div>
            {profile?.is_activated ? (
              <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                <CheckCircle className="w-4 h-4" /> Premium Active
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm font-medium text-amber-600">
                <XCircle className="w-4 h-4" /> Free Trial
              </span>
            )}
          </div>

          {profile?.activation_date && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Activated</span>
              </div>
              <span className="text-sm font-medium">{moment(profile.activation_date).format("MMM D, YYYY")}</span>
            </div>
          )}

          {profile?.activation_code && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Activation Code</span>
              <span className="text-sm font-mono font-medium">{profile.activation_code}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Member Since</span>
            <span className="text-sm font-medium">{moment(user?.created_date).format("MMM D, YYYY")}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-card border border-border/60 rounded-xl p-6">
        <h3 className="font-heading font-semibold mb-4">Performance Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="font-display text-2xl font-bold">{profile?.total_questions_answered || 0}</p>
            <p className="text-xs text-muted-foreground">Questions Answered</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="font-display text-2xl font-bold">
              {profile?.total_questions_answered > 0
                ? Math.round(((profile?.total_correct || 0) / profile.total_questions_answered) * 100)
                : 0}%
            </p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="font-display text-2xl font-bold">{profile?.total_mock_exams || 0}</p>
            <p className="text-xs text-muted-foreground">Mock Exams</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="font-display text-2xl font-bold">{profile?.total_practice_sessions || 0}</p>
            <p className="text-xs text-muted-foreground">Practice Sessions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Download, Lock, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import { Link } from "react-router-dom";

export default function Summaries() {
  const { profile, loading: profileLoading } = useStudentProfile();
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!profile?.department_id) {
        setLoading(false);
        return;
      }
      const items = await base44.entities.CourseSummary.filter(
        { is_active: true, department_id: profile.department_id },
        "-created_date",
        200
      );
      setSummaries(items);
      setLoading(false);
    };
    load();
  }, [profile]);

  if (profileLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const activated = profile?.is_activated;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Course Summaries</h1>
        <p className="text-muted-foreground mt-1">
          Download study summaries for your department
        </p>
      </div>

      {!activated && (
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 rounded-xl p-4">
          <Lock className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Activation required</p>
            <p className="mt-0.5">
              Activate your account to download course summaries.{" "}
              <Link to="/activate" className="underline font-medium">
                Activate now
              </Link>
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {summaries.map((s) => (
          <div
            key={s.id}
            className="bg-card border border-border/60 rounded-xl p-5 flex flex-col gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading font-semibold leading-tight">{s.title}</h3>
              {s.course_code && (
                <p className="text-xs font-mono text-muted-foreground mt-1">{s.course_code}</p>
              )}
              {s.description && (
                <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{s.description}</p>
              )}
            </div>
            <Button
              asChild
              className="rounded-full gap-2 w-full"
              disabled={!activated}
            >
              <a href={activated ? s.file_url : undefined} target="_blank" rel="noreferrer">
                {activated ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                {activated ? "Download" : "Locked"}
              </a>
            </Button>
          </div>
        ))}
      </div>

      {summaries.length === 0 && (
        <div className="text-center py-16">
          <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No summaries available for your department yet.</p>
        </div>
      )}
    </div>
  );
}
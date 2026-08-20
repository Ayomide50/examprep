import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Lock, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudentProfile } from "@/hooks/useStudentProfile";

export default function SummaryViewer() {
  const { summaryId } = useParams();
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useStudentProfile();
  const [state, setState] = useState({ status: "loading", url: null, title: null, code: null });

  useEffect(() => {
    const load = async () => {
      if (profileLoading) return;
      if (!profile || !profile.is_activated) {
        setState({ status: "locked", url: null, title: null, code: "not_activated" });
        return;
      }
      try {
        const res = await base44.functions.invoke("getSummaryFileUrl", { summary_id: summaryId });
        setState({
          status: "ready",
          url: res.data.signed_url,
          title: res.data.title || "Summary",
          code: null,
        });
      } catch (err) {
        const code = err?.response?.data?.code;
        if (code === "not_activated" || code === "not_authorized") {
          setState({ status: "locked", url: null, title: null, code });
        } else {
          setState({ status: "error", url: null, title: null, code: code || "error" });
        }
      }
    };
    load();
  }, [summaryId, profile, profileLoading]);

  if (state.status === "loading" || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (state.status === "locked" || state.status === "error") {
    const isAuthBlock = state.code === "not_activated" || state.code === "not_authorized";
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-4">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isAuthBlock ? "bg-amber-100 dark:bg-amber-950/40" : "bg-destructive/10"
          }`}
        >
          {isAuthBlock ? (
            <Lock className="w-7 h-7 text-amber-600" />
          ) : (
            <AlertCircle className="w-7 h-7 text-destructive" />
          )}
        </div>
        <h1 className="font-display text-xl font-bold">
          {isAuthBlock ? "Account Activation Required" : "Couldn't Load Summary"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {state.code === "not_authorized"
            ? "You are not authorized to view this summary."
            : state.code === "not_activated"
            ? "Your account must be activated before you can access course summaries. Please contact your department representative or administrator for assistance."
            : "This summary could not be loaded. Please try again later."}
        </p>
        <Button asChild className="rounded-full gap-2 mt-6">
          <Link to="/summaries">
            <ArrowLeft className="w-4 h-4" /> Back to Summaries
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          className="rounded-full gap-2 shrink-0"
          onClick={() => navigate("/summaries")}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <h1 className="font-heading font-semibold truncate flex-1">{state.title}</h1>
      </div>
      <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
        <iframe
          src={`${state.url}#toolbar=0&navpanes=0&view=FitH`}
          title={state.title || "Summary"}
          className="w-full h-[75vh] sm:h-[80vh] border-0"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}
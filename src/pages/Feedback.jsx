import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Send, MessageSquare, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useStudentProfile } from "@/hooks/useStudentProfile";

const statusMeta = {
  open: { label: "Open", icon: Clock, color: "text-amber-600 bg-amber-100" },
  in_progress: { label: "In Progress", icon: Loader2, color: "text-blue-600 bg-blue-100" },
  resolved: { label: "Resolved", icon: CheckCircle2, color: "text-green-600 bg-green-100" },
};

export default function Feedback() {
  const { profile, user, loading: profileLoading } = useStudentProfile();
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const data = await base44.entities.Feedback.filter(
      { user_id: user.id },
      "-created_date",
      50
    );
    setItems(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast({ title: "Please fill in the subject and message", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.Feedback.create({
        user_id: user.id,
        email: user.email,
        full_name: profile?.full_name || user.full_name || "",
        subject: subject.trim(),
        message: message.trim(),
        status: "open",
      });
      setSubject("");
      setMessage("");
      toast({ title: "Feedback submitted", description: "We'll get back to you soon." });
      load();
    } catch (err) {
      toast({ title: "Failed to submit feedback", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (profileLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Feedback & Complaints</h1>
        <p className="text-muted-foreground mt-1">
          Tell us about any issue or suggestion. Our team will respond to you here.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border/60 rounded-xl p-6 space-y-4"
      >
        <div>
          <label className="text-sm font-medium mb-1 block">Subject</label>
          <Input
            placeholder="Brief summary of your complaint"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={120}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Message</label>
          <Textarea
            placeholder="Describe your issue in detail..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
          />
        </div>
        <Button type="submit" className="rounded-full gap-2" disabled={submitting}>
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Submit Feedback
        </Button>
      </form>

      <div className="space-y-3">
        <h2 className="font-heading font-semibold flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> Your Feedback History
        </h2>
        {items.map((item) => {
          const meta = statusMeta[item.status] || statusMeta.open;
          const Icon = meta.icon;
          return (
            <div
              key={item.id}
              className="bg-card border border-border/60 rounded-xl p-5 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-medium leading-tight">{item.subject}</h3>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${meta.color}`}
                >
                  <Icon className="w-3 h-3" />
                  {meta.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.message}</p>
              {item.admin_reply && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm">
                  <p className="text-xs font-semibold text-primary mb-1">Admin Reply</p>
                  <p className="whitespace-pre-wrap">{item.admin_reply}</p>
                </div>
              )}
            </div>
          );
        })}
        {items.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            You haven't submitted any feedback yet.
          </p>
        )}
      </div>
    </div>
  );
}
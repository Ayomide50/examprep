import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

const statusOptions = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

const statusColor = {
  open: "bg-amber-100 text-amber-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
};

export default function AdminFeedback() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState(null);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState("open");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const data = await base44.entities.Feedback.list("-created_date", 200);
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openItem = (item) => {
    setActive(item);
    setReply(item.admin_reply || "");
    setStatus(item.status || "open");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.Feedback.update(active.id, {
        admin_reply: reply.trim(),
        status,
      });
      toast({ title: "Reply sent" });
      setActive(null);
      load();
    } catch (err) {
      toast({ title: "Failed to update feedback", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const filtered = items.filter((i) => filter === "all" || i.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Feedback</h1>
          <p className="text-muted-foreground mt-1">{items.length} total messages</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-48 rounded-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {statusOptions.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map((item) => (
          <button
            key={item.id}
            onClick={() => openItem(item)}
            className="w-full text-left bg-card border border-border/60 rounded-xl p-5 hover:border-primary/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-heading font-semibold leading-tight">{item.subject}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.full_name || item.email || "Unknown user"}
                </p>
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                  statusColor[item.status] || statusColor.open
                }`}
              >
                {statusOptions.find((s) => s.value === item.status)?.label || "Open"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{item.message}</p>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No feedback found.</p>
        )}
      </div>

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle>{active.subject}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-xs text-muted-foreground">
                  From: {active.full_name || "Unknown"} • {active.email || ""}
                </div>
                <div className="bg-muted/60 rounded-lg p-3 text-sm whitespace-pre-wrap">
                  {active.message}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Reply</label>
                  <Textarea
                    placeholder="Type your reply to this student..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Status</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setActive(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Save Reply
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
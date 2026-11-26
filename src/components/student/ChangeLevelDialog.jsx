import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { formatLevel } from "@/lib/access";
import { activationFieldsForLevel, fetchDepartmentLevels } from "@/lib/levels";

// Lets a student move themselves to another academic level.
// Nothing is promoted automatically — the student picks and confirms.
export default function ChangeLevelDialog({ profile, open, onOpenChange, onChanged }) {
  const { toast } = useToast();
  const [levels, setLevels] = useState([]);
  const [selected, setSelected] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !profile?.department_id) return;
    setSelected("");
    fetchDepartmentLevels(profile.department_id).then(setLevels);
  }, [open, profile?.department_id]);

  const otherLevels = levels.filter((l) => l !== profile?.level);
  const canConfirm = !!selected && selected !== profile?.level && levels.includes(selected);

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setSaving(true);
    try {
      const activations = await base44.entities.LevelActivation.filter(
        { user_id: profile.user_id },
        "-created_date",
        100
      );
      const history = Array.isArray(profile.level_history) ? profile.level_history : [];

      await base44.entities.StudentProfile.update(profile.id, {
        level: selected,
        level_history: [
          ...history,
          {
            previous_level: profile.level || "",
            level: selected,
            changed_date: new Date().toISOString(),
          },
        ],
        ...activationFieldsForLevel(activations, selected),
      });

      toast({
        title: `You are now on ${formatLevel(selected)}`,
        description: "Your dashboard and courses now match your new level.",
      });
      await onChanged?.();
      onOpenChange(false);
    } catch (err) {
      toast({ title: "Could not change your level", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !saving && onOpenChange(v)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Academic Level</DialogTitle>
          <DialogDescription>
            You are currently on {formatLevel(profile?.level) || "no level"}.
          </DialogDescription>
        </DialogHeader>

        {otherLevels.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No other academic levels are available for your department yet. Please contact the
            administrator.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">New Academic Level</label>
              <Select value={selected} onValueChange={setSelected}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your new level" />
                </SelectTrigger>
                <SelectContent>
                  {otherLevels.map((l) => (
                    <SelectItem key={l} value={l}>
                      {formatLevel(l)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {canConfirm && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Your dashboard and available courses will change to {formatLevel(selected)}. Your
                  account, department, referrals, wallet and past results are kept. Activation is
                  handled separately for each level.
                </span>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm || saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1" /> Switching...
              </>
            ) : (
              "Confirm Change"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
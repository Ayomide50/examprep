import React, { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatLevel } from "@/lib/access";
import { fetchDepartmentLevels } from "@/lib/levels";
import { useLevelActivations } from "@/hooks/useLevelActivations";
import LevelStatusList from "@/components/student/LevelStatusList";
import ChangeLevelDialog from "@/components/student/ChangeLevelDialog";
import moment from "moment";

// Current level, per-level activation status, level-change control and academic history.
export default function AcademicLevelCard({ profile, onChanged }) {
  const { activations } = useLevelActivations(profile?.user_id);
  const [levels, setLevels] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchDepartmentLevels(profile?.department_id).then(setLevels);
  }, [profile?.department_id]);

  const history = Array.isArray(profile?.level_history) ? profile.level_history : [];

  return (
    <div className="bg-card border border-border/60 rounded-xl p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="font-heading font-semibold">Academic Level</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {profile?.department_name ? `${profile.department_name} • ` : ""}
            {formatLevel(profile?.level) || "Not set"}
          </p>
        </div>
        <Button variant="outline" className="rounded-full gap-2" onClick={() => setDialogOpen(true)}>
          <GraduationCap className="w-4 h-4" /> Change Academic Level
        </Button>
      </div>

      <LevelStatusList levels={levels} currentLevel={profile?.level} activations={activations} />

      {history.length > 0 && (
        <div className="border-t border-border pt-4">
          <p className="text-sm font-medium mb-2">Academic History</p>
          <ul className="space-y-1.5">
            {[...history].reverse().map((entry, index) => (
              <li key={index} className="text-xs text-muted-foreground">
                {entry.previous_level ? `${formatLevel(entry.previous_level)} → ` : ""}
                {formatLevel(entry.level)}
                {entry.changed_date ? ` • ${moment(entry.changed_date).format("MMM D, YYYY")}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      <ChangeLevelDialog
        profile={profile}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onChanged={onChanged}
      />
    </div>
  );
}
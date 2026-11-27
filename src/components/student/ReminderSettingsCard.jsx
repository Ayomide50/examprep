import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { REMINDER_TYPES, reminderPrefs } from "@/lib/reminders";

export default function ReminderSettingsCard({ profile, onSaved }) {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState(() => reminderPrefs(profile));
  const [saving, setSaving] = useState(false);

  const toggle = async (key, value) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    setSaving(true);
    try {
      await base44.entities.StudentProfile.update(profile.id, { reminder_prefs: next });
      Object.assign(profile, { reminder_prefs: next });
      onSaved?.();
    } catch (err) {
      setPrefs(prefs);
      toast({ title: "Could not save your reminder settings", variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="font-heading font-semibold">Reminder settings</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Choose which study reminders appear in your notification bell.
        </p>
        <div className="space-y-4">
          {REMINDER_TYPES.map((type) => (
            <div key={type.key} className="flex items-start justify-between gap-4">
              <div>
                <Label htmlFor={`reminder-${type.key}`} className="text-sm font-medium">
                  {type.label}
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
              </div>
              <Switch
                id={`reminder-${type.key}`}
                checked={!!prefs[type.key]}
                disabled={saving}
                onCheckedChange={(value) => toggle(type.key, value)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { GraduationCap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatLevel } from "@/lib/access";

export default function DepartmentSetup({ profile, onDone }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deptId, setDeptId] = useState("");
  const [level, setLevel] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.Department.filter({ is_active: true }).then((d) => {
      setDepartments(d);
      setLoading(false);
    });
  }, []);

  const dept = departments.find((d) => d.id === deptId);
  const levels = dept?.levels || [];

  const handleSave = async () => {
    if (!deptId || !level) return;
    setSaving(true);
    await base44.entities.StudentProfile.update(profile.id, {
      department_id: deptId,
      department_name: dept.name,
      level,
    });
    onDone();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 md:mt-16">
      <div className="bg-card border border-border/60 rounded-xl p-6 md:p-8">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
          <GraduationCap className="w-6 h-6 text-primary" />
        </div>
        <h1 className="font-display text-xl md:text-2xl font-bold mb-1">Set up your account</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Select your department and academic level. You will only see courses assigned to your department and level.
        </p>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Department</label>
            <Select value={deptId} onValueChange={(v) => { setDeptId(v); setLevel(""); }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Academic Level</label>
            <Select value={level} onValueChange={setLevel} disabled={!deptId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={deptId ? "Select your level" : "Select a department first"} />
              </SelectTrigger>
              <SelectContent>
                {levels.map((l) => (
                  <SelectItem key={l} value={l}>{formatLevel(l)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSave} disabled={!deptId || !level || saving} className="w-full rounded-full">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Saving...</> : "Continue"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            This cannot be changed later. Contact the admin if you need to switch department or level.
          </p>
        </div>
      </div>
    </div>
  );
}
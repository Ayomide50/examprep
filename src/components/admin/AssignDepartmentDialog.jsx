import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { formatLevel } from "@/lib/access";

export default function AssignDepartmentDialog({ student, departments, onClose, onSaved }) {
  const { toast } = useToast();
  const [deptId, setDeptId] = useState("");
  const [level, setLevel] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (student) {
      setDeptId(student.department_id || "");
      setLevel(student.level || "");
    }
  }, [student]);

  const dept = departments.find((d) => d.id === deptId);
  const levels = dept?.levels || [];

  const handleSave = async () => {
    if (!deptId || !level) return;
    setSaving(true);
    try {
      await base44.entities.StudentProfile.update(student.id, {
        department_id: deptId,
        department_name: dept.name,
        level,
      });
      toast({ title: "Department assigned" });
      onSaved();
    } catch (err) {
      toast({ title: "Failed to update student", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!student} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Assign Department & Level</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2">{student?.full_name || student?.email}</p>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Department</label>
            <Select value={deptId} onValueChange={(v) => { setDeptId(v); setLevel(""); }}>
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Level</label>
            <Select value={level} onValueChange={setLevel} disabled={!deptId}>
              <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
              <SelectContent>
                {levels.map((l) => <SelectItem key={l} value={l}>{formatLevel(l)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!deptId || !level || saving}>
            {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Saving...</> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
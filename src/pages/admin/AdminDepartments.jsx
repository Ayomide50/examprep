import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Building2, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { formatLevel } from "@/lib/access";

const ALL_LEVELS = ["100", "200", "300", "400", "500", "600"];
const emptyForm = { name: "", description: "", levels: ["100"] };

export default function AdminDepartments() {
  const { toast } = useToast();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    const data = await base44.entities.Department.list("-created_date", 100);
    setDepartments(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleLevel = (level) => {
    setForm((f) => ({
      ...f,
      levels: f.levels.includes(level) ? f.levels.filter((l) => l !== level) : [...f.levels, level].sort(),
    }));
  };

  const handleSave = async () => {
    if (!form.name || form.levels.length === 0) {
      toast({ title: "Name and at least one level are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    if (editing) {
      await base44.entities.Department.update(editing.id, form);
      // Keep denormalized department name in sync on courses and student profiles
      if (editing.name !== form.name) {
        await Promise.all([
          base44.entities.Course.updateMany({ department_id: editing.id, department_name: editing.name }, { $set: { department_name: form.name } }),
          base44.entities.StudentProfile.updateMany({ department_id: editing.id, department_name: editing.name }, { $set: { department_name: form.name } }),
        ]);
      }
      toast({ title: "Department updated" });
    } else {
      await base44.entities.Department.create({ ...form, is_active: true });
      toast({ title: "Department created" });
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    load();
  };

  const handleToggleActive = async (dept) => {
    await base44.entities.Department.update(dept.id, { is_active: !dept.is_active });
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await base44.entities.Department.delete(deleteTarget.id);
    toast({ title: "Department deleted" });
    setDeleteTarget(null);
    load();
  };

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
          <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Building2 className="w-7 h-7 text-primary" /> Departments
          </h1>
          <p className="text-muted-foreground mt-1">{departments.length} departments</p>
        </div>
        <Button className="rounded-full gap-2 w-full sm:w-auto" onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> Add Department
        </Button>
      </div>

      <div className="space-y-3">
        {departments.map((dept) => (
          <div key={dept.id} className="bg-card border border-border/60 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-semibold">{dept.name}</h3>
                {!dept.is_active && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Inactive</span>
                )}
              </div>
              {dept.description && <p className="text-sm text-muted-foreground mt-0.5">{dept.description}</p>}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(dept.levels || []).map((l) => (
                  <span key={l} className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{formatLevel(l)}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Active</span>
                <Switch checked={dept.is_active !== false} onCheckedChange={() => handleToggleActive(dept)} />
              </div>
              <button onClick={() => { setEditing(dept); setForm({ name: dept.name, description: dept.description || "", levels: dept.levels || [] }); setShowForm(true); }} className="p-2 hover:bg-muted rounded-lg">
                <Pencil className="w-4 h-4 text-muted-foreground" />
              </button>
              <button onClick={() => setDeleteTarget(dept)} className="p-2 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        ))}
        {departments.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No departments yet. Add your first department.</p>
        )}
      </div>

      {/* Form dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Department" : "Add Department"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Name</label>
              <Input placeholder="e.g. Computer Science" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description (optional)</label>
              <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Available Levels</label>
              <div className="flex flex-wrap gap-2">
                {ALL_LEVELS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => toggleLevel(l)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      form.levels.includes(l)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-transparent text-muted-foreground border-border hover:border-primary/40"
                    }`}
                  >
                    {formatLevel(l)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : editing ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleteTarget?.name}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Students and courses assigned to this department will lose access to it. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
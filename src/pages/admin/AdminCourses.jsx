import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { GraduationCap, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

export default function AdminCourses() {
  const { toast } = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ code: "", title: "", description: "", icon: "briefcase" });
  const [saving, setSaving] = useState(false);

  const loadCourses = async () => {
    const data = await base44.entities.Course.list("-created_date", 50);
    setCourses(data);
    setLoading(false);
  };

  useEffect(() => { loadCourses(); }, []);

  const handleSave = async () => {
    if (!form.code || !form.title) return;
    setSaving(true);
    if (editing) {
      await base44.entities.Course.update(editing.id, form);
      toast({ title: "Course updated" });
    } else {
      await base44.entities.Course.create({ ...form, is_active: true, question_count: 0 });
      toast({ title: "Course created" });
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    setForm({ code: "", title: "", description: "", icon: "briefcase" });
    loadCourses();
  };

  const handleEdit = (course) => {
    setEditing(course);
    setForm({ code: course.code, title: course.title, description: course.description || "", icon: course.icon || "briefcase" });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await base44.entities.Course.delete(id);
    toast({ title: "Course deleted" });
    loadCourses();
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
          <h1 className="font-display text-2xl md:text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground mt-1">{courses.length} courses</p>
        </div>
        <Button className="rounded-full gap-2 w-full sm:w-auto" onClick={() => { setEditing(null); setForm({ code: "", title: "", description: "", icon: "briefcase" }); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> Add Course
        </Button>
      </div>

      <div className="space-y-3">
        {courses.map((course) => (
          <div key={course.id} className="bg-card border border-border/60 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-muted-foreground">{course.code}</p>
              <h3 className="font-heading font-semibold">{course.title}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{course.description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => handleEdit(course)} className="p-2 hover:bg-muted rounded-lg">
                <Pencil className="w-4 h-4 text-muted-foreground" />
              </button>
              <button onClick={() => handleDelete(course.id)} className="p-2 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Course" : "Add Course"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Course Code</label>
              <Input placeholder="e.g. ACC 111" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Title</label>
              <Input placeholder="e.g. Accounting" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Textarea placeholder="Brief description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : editing ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
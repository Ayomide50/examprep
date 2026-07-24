import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { formatLevel } from "@/lib/access";

const emptyForm = { code: "", title: "", description: "", icon: "briefcase", department_id: "", level: "" };

export default function AdminCourses() {
  const { toast } = useToast();
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filterDept, setFilterDept] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [c, d] = await Promise.all([
      base44.entities.Course.list("-created_date", 200),
      base44.entities.Department.list("-created_date", 100),
    ]);
    setCourses(c);
    setDepartments(d);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.code || !form.title || !form.department_id || !form.level) {
      toast({ title: "Code, title, department and level are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const dept = departments.find((d) => d.id === form.department_id);
    const data = { ...form, department_name: dept?.name || "" };
    if (editing) {
      await base44.entities.Course.update(editing.id, data);
      toast({ title: "Course updated" });
    } else {
      await base44.entities.Course.create({ ...data, is_active: true, question_count: 0 });
      toast({ title: "Course created" });
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    load();
  };

  const handleEdit = (course) => {
    setEditing(course);
    setForm({
      code: course.code, title: course.title, description: course.description || "",
      icon: course.icon || "briefcase", department_id: course.department_id || "", level: course.level || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await base44.entities.Course.delete(id);
    toast({ title: "Course deleted" });
    load();
  };

  const formDept = departments.find((d) => d.id === form.department_id);
  const formLevels = formDept?.levels || [];

  const filterDeptObj = departments.find((d) => d.id === filterDept);
  const filterLevels = filterDept === "all"
    ? [...new Set(departments.flatMap((d) => d.levels || []))].sort()
    : (filterDeptObj?.levels || []);

  const filtered = courses.filter((c) => {
    const matchDept = filterDept === "all" || c.department_id === filterDept;
    const matchLevel = filterLevel === "all" || c.level === filterLevel;
    return matchDept && matchLevel;
  });

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
          <p className="text-muted-foreground mt-1">{filtered.length} courses</p>
        </div>
        <Button className="rounded-full gap-2 w-full sm:w-auto" onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> Add Course
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={filterDept} onValueChange={(v) => { setFilterDept(v); setFilterLevel("all"); }}>
          <SelectTrigger className="w-full sm:w-56 rounded-full">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterLevel} onValueChange={setFilterLevel}>
          <SelectTrigger className="w-full sm:w-40 rounded-full">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {filterLevels.map((l) => <SelectItem key={l} value={l}>{formatLevel(l)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map((course) => (
          <div key={course.id} className="bg-card border border-border/60 rounded-xl p-5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs font-mono text-muted-foreground">{course.code}</p>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {course.department_name || "No department"}{course.level ? ` • ${formatLevel(course.level)}` : ""}
                </span>
              </div>
              <h3 className="font-heading font-semibold">{course.title}</h3>
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{course.description}</p>
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
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">No courses found</p>}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Course" : "Add Course"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Department</label>
                <Select value={form.department_id} onValueChange={(v) => setForm({ ...form, department_id: v, level: "" })}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Level</label>
                <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })} disabled={!form.department_id}>
                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    {formLevels.map((l) => <SelectItem key={l} value={l}>{formatLevel(l)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Course Code</label>
              <Input placeholder="e.g. BUS 101" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Title</label>
              <Input placeholder="e.g. Introduction to Business" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
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
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { formatLevel } from "@/lib/access";

const emptyForm = {
  title: "",
  description: "",
  department_id: "",
  level: "",
  course_id: "",
  file_url: "",
  file_name: "",
};

export default function AdminSummaries() {
  const { toast } = useToast();
  const [summaries, setSummaries] = useState([]);
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filterDept, setFilterDept] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const [s, c, d] = await Promise.all([
      base44.entities.CourseSummary.list("-created_date", 200),
      base44.entities.Course.list("-created_date", 200),
      base44.entities.Department.list("-created_date", 100),
    ]);
    setSummaries(s);
    setCourses(c);
    setDepartments(d);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // Store privately so the file is never reachable via a permanent public URL.
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      setForm((f) => ({ ...f, file_url: file_uri, file_name: file.name }));
    } catch (err) {
      toast({ title: "File upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.department_id || !form.file_url) {
      toast({ title: "Title, department and a file are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const dept = departments.find((d) => d.id === form.department_id);
    const course = form.course_id ? courses.find((c) => c.id === form.course_id) : null;
    const data = {
      ...form,
      department_name: dept?.name || "",
      course_code: course?.code || "",
    };
    try {
      if (editing) {
        await base44.entities.CourseSummary.update(editing.id, data);
        toast({ title: "Summary updated" });
      } else {
        await base44.entities.CourseSummary.create({ ...data, is_active: true });
        toast({ title: "Summary added" });
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (err) {
      toast({ title: "Failed to save summary", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description || "",
      department_id: item.department_id || "",
      level: item.level || "",
      course_id: item.course_id || "",
      file_url: item.file_url || "",
      file_name: item.file_name || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await base44.entities.CourseSummary.delete(id);
    toast({ title: "Summary deleted" });
    load();
  };

  const formDept = departments.find((d) => d.id === form.department_id);
  const formLevels = formDept?.levels || [];
  const formCourses = courses.filter(
    (c) => !form.department_id || c.department_id === form.department_id
  );

  const filtered = summaries.filter(
    (s) => filterDept === "all" || s.department_id === filterDept
  );

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
          <h1 className="font-display text-2xl md:text-3xl font-bold">Course Summaries</h1>
          <p className="text-muted-foreground mt-1">
            {filtered.length} summaries uploaded for students to download
          </p>
        </div>
        <Button
          className="rounded-full gap-2 w-full sm:w-auto"
          onClick={() => {
            setEditing(null);
            setForm(emptyForm);
            setShowForm(true);
          }}
        >
          <Plus className="w-4 h-4" /> Add Summary
        </Button>
      </div>

      <Select value={filterDept} onValueChange={setFilterDept}>
        <SelectTrigger className="w-full sm:w-64 rounded-full">
          <SelectValue placeholder="All Departments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          {departments.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              {d.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="space-y-3">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="bg-card border border-border/60 rounded-xl p-5 flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {s.department_name || "No department"}
                  {s.level ? ` • ${formatLevel(s.level)}` : ""}
                </span>
                {s.course_code && (
                  <span className="text-xs font-mono text-muted-foreground">{s.course_code}</span>
                )}
              </div>
              <h3 className="font-heading font-semibold mt-1">{s.title}</h3>
              {s.description && (
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{s.description}</p>
              )}
              {s.file_name && (
                <p className="text-xs text-muted-foreground mt-1">📎 {s.file_name}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => handleEdit(s)} className="p-2 hover:bg-muted rounded-lg">
                <Pencil className="w-4 h-4 text-muted-foreground" />
              </button>
              <button
                onClick={() => handleDelete(s.id)}
                className="p-2 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No summaries uploaded yet.</p>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Summary" : "Add Summary"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Department</label>
              <Select
                value={form.department_id}
                onValueChange={(v) =>
                  setForm({ ...form, department_id: v, level: "", course_id: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Level (optional)</label>
                <Select
                  value={form.level}
                  onValueChange={(v) => setForm({ ...form, level: v })}
                  disabled={!form.department_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any level</SelectItem>
                    {formLevels.map((l) => (
                      <SelectItem key={l} value={l}>
                        {formatLevel(l)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Course (optional)</label>
                <Select
                  value={form.course_id}
                  onValueChange={(v) => setForm({ ...form, course_id: v })}
                  disabled={!form.department_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No specific course" />
                  </SelectTrigger>
                  <SelectContent>
                    {formCourses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.code} - {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Title</label>
              <Input
                placeholder="e.g. Full Semester Notes"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Textarea
                placeholder="What does this summary cover?"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Summary File (PDF, DOC, etc.)</label>
              {form.file_url ? (
                <div className="flex items-center justify-between bg-muted/60 border border-border rounded-lg px-3 py-2.5">
                  <span className="text-sm truncate">{form.file_name || "File uploaded"}</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, file_url: "", file_name: "" })}
                    className="text-xs text-destructive hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg py-8 cursor-pointer hover:bg-muted/40">
                  {uploading ? (
                    <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {uploading ? "Uploading..." : "Click to upload a file"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleUpload}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || uploading}>
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
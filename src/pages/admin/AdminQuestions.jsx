import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { HelpCircle, Plus, Search, Pencil, Trash2, Upload, ChevronDown, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

const emptyForm = {
  question_text: "", course_id: "", course_code: "", option_a: "", option_b: "", option_c: "", option_d: "",
  correct_answer: "A", explanation: "", difficulty: "medium", is_free_trial: false, is_active: true,
};

export default function AdminQuestions() {
  const { toast } = useToast();
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const [q, c] = await Promise.all([
      base44.entities.Question.list("-created_date", 200),
      base44.entities.Course.list("-created_date", 50),
    ]);
    setQuestions(q);
    setCourses(c);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.question_text || !form.course_id || !form.option_a) return;
    setSaving(true);
    const course = courses.find((c) => c.id === form.course_id);
    const data = { ...form, course_code: course?.code || "" };
    if (editing) {
      await base44.entities.Question.update(editing.id, data);
      toast({ title: "Question updated" });
    } else {
      await base44.entities.Question.create(data);
      toast({ title: "Question created" });
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    load();
  };

  const handleEdit = (q) => {
    setEditing(q);
    setForm({
      question_text: q.question_text, course_id: q.course_id, course_code: q.course_code || "",
      option_a: q.option_a, option_b: q.option_b, option_c: q.option_c, option_d: q.option_d,
      correct_answer: q.correct_answer, explanation: q.explanation || "", difficulty: q.difficulty || "medium",
      is_free_trial: q.is_free_trial || false, is_active: q.is_active !== false,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await base44.entities.Question.delete(id);
    toast({ title: "Question deleted" });
    load();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              question_text: { type: "string" },
              course_code: { type: "string" },
              option_a: { type: "string" },
              option_b: { type: "string" },
              option_c: { type: "string" },
              option_d: { type: "string" },
              correct_answer: { type: "string" },
              explanation: { type: "string" },
              difficulty: { type: "string" },
            },
          },
        },
      });

      if (extracted.status === "success" && extracted.output) {
        const items = Array.isArray(extracted.output) ? extracted.output : [extracted.output];
        let created = 0;
        for (const item of items) {
          const course = courses.find((c) => c.code === item.course_code);
          if (course && item.question_text) {
            await base44.entities.Question.create({
              ...item,
              course_id: course.id,
              correct_answer: (item.correct_answer || "A").toUpperCase().charAt(0),
              difficulty: item.difficulty || "medium",
              is_active: true,
              is_free_trial: false,
            });
            created++;
          }
        }
        toast({ title: `${created} questions imported` });
        load();
      } else {
        toast({ title: "Import failed", description: extracted.details || "Could not parse file", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Upload error", description: "Please try again", variant: "destructive" });
    }

    setUploading(false);
    setShowUpload(false);
  };

  const handleDownloadTemplate = () => {
    const headers = ["question_text", "course_code", "option_a", "option_b", "option_c", "option_d", "correct_answer", "explanation", "difficulty"];
    const sampleRow = ["What is 2 + 2?", "ACC 111", "3", "4", "5", "6", "B", "2 + 2 equals 4", "easy"];
    const csv = [headers.join(","), sampleRow.map((v) => `"${v}"`).join(",")].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "questions_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = questions.filter((q) => {
    const matchSearch = q.question_text.toLowerCase().includes(search.toLowerCase());
    const matchCourse = filterCourse === "all" || q.course_id === filterCourse;
    return matchSearch && matchCourse;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Questions</h1>
          <p className="text-muted-foreground mt-1">{questions.length} total questions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full gap-2" onClick={handleDownloadTemplate}>
            <FileDown className="w-4 h-4" /> <span className="hidden sm:inline">Template</span>
          </Button>
          <Button variant="outline" className="rounded-full gap-2" onClick={() => setShowUpload(true)}>
            <Upload className="w-4 h-4" /> Import
          </Button>
          <Button className="rounded-full gap-2" onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }}>
            <Plus className="w-4 h-4" /> Add Question
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search questions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-full" />
        </div>
        <Select value={filterCourse} onValueChange={setFilterCourse}>
          <SelectTrigger className="w-48 rounded-full">
            <SelectValue placeholder="All Courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.code} — {c.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filtered.slice(0, 50).map((q) => (
          <div key={q.id} className="bg-card border border-border/60 rounded-xl p-4 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-muted-foreground">{q.course_code}</span>
                {q.is_free_trial && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Free</span>}
                <span className={`text-xs px-1.5 py-0.5 rounded ${q.difficulty === "easy" ? "bg-green-100 text-green-700" : q.difficulty === "hard" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                  {q.difficulty}
                </span>
              </div>
              <p className="text-sm line-clamp-2">{q.question_text}</p>
              <p className="text-xs text-muted-foreground mt-1">Answer: {q.correct_answer}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => handleEdit(q)} className="p-2 hover:bg-muted rounded-lg">
                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <button onClick={() => handleDelete(q.id)} className="p-2 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
              </button>
            </div>
          </div>
        ))}
        {filtered.length > 50 && <p className="text-center text-sm text-muted-foreground py-4">Showing 50 of {filtered.length} questions</p>}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No questions found</p>}
      </div>

      {/* Question form dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Question" : "Add Question"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Course</label>
              <Select value={form.course_id} onValueChange={(v) => setForm({ ...form, course_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>
                  {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.code} — {c.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Question</label>
              <Textarea rows={3} value={form.question_text} onChange={(e) => setForm({ ...form, question_text: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {["A", "B", "C", "D"].map((key) => (
                <div key={key}>
                  <label className="text-sm font-medium mb-1 block">Option {key}</label>
                  <Input
                    value={form[`option_${key.toLowerCase()}`]}
                    onChange={(e) => setForm({ ...form, [`option_${key.toLowerCase()}`]: e.target.value })}
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Correct Answer</label>
                <Select value={form.correct_answer} onValueChange={(v) => setForm({ ...form, correct_answer: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["A", "B", "C", "D"].map((k) => <SelectItem key={k} value={k}>Option {k}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Difficulty</label>
                <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Explanation</label>
              <Textarea rows={3} value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_free_trial} onCheckedChange={(v) => setForm({ ...form, is_free_trial: v })} />
              <span className="text-sm">Include in Free Trial</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : editing ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Questions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Download the template first, fill it with your questions, then upload it. Columns: question_text, course_code, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty
            </p>
            <Input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} disabled={uploading} />
            {uploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin" />
                Importing questions...
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Search, CheckCircle, XCircle, Trash2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import moment from "moment";

export default function AdminStudents() {
  const { toast } = useToast();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadStudents = () => {
    base44.entities.StudentProfile.list("-created_date", 200).then((data) => {
      setStudents(data);
      setLoading(false);
    });
  };

  useEffect(() => { loadStudents(); }, []);

  const handleDeleteStudent = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await base44.entities.User.delete(deleteTarget.user_id);
      try {
        await base44.entities.StudentProfile.delete(deleteTarget.id);
      } catch (_) {}
      toast({ title: "Student deleted" });
      setDeleteTarget(null);
      loadStudents();
    } catch (error) {
      toast({ title: "Failed to delete student", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const filtered = students.filter(
    (s) =>
      (s.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.full_name || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Students</h1>
        <p className="text-muted-foreground mt-1">{students.length} registered students</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rounded-full"
        />
      </div>

      <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 font-medium text-muted-foreground">Student</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-5 py-3 font-medium text-muted-foreground hidden md:table-cell">Code</th>
                <th className="px-5 py-3 font-medium text-muted-foreground hidden md:table-cell">Questions</th>
                <th className="px-5 py-3 font-medium text-muted-foreground hidden md:table-cell">Exams</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Joined</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-medium">{s.full_name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{s.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {s.is_activated ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        <XCircle className="w-3 h-3" /> Free Trial
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground hidden md:table-cell">
                    {s.activation_code || "—"}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground hidden md:table-cell">{s.total_questions_answered || 0}</td>
                  <td className="px-5 py-3 text-muted-foreground hidden md:table-cell">{s.total_mock_exams || 0}</td>
                  <td className="px-5 py-3 text-muted-foreground">{moment(s.created_date).format("MMM D")}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => setDeleteTarget(s)}
                      className="p-1.5 hover:bg-red-50 rounded-md"
                      title="Delete student"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">
                    {search ? "No students match your search" : "No students registered yet"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this student?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {deleteTarget?.full_name || deleteTarget?.email} and their profile data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStudent}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Deleting...</> : "Delete Student"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
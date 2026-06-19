import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Search, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import moment from "moment";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.StudentProfile.list("-created_date", 200).then((data) => {
      setStudents(data);
      setLoading(false);
    });
  }, []);

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
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                    {search ? "No students match your search" : "No students registered yet"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
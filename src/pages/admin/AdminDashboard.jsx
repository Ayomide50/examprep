import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, BookOpen, KeyRound, HelpCircle, CheckCircle, XCircle } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, courses: 0, questions: 0, codes: 0, usedCodes: 0, activeStudents: 0 });
  const [recentCodes, setRecentCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.StudentProfile.list("-created_date", 1000),
      base44.entities.Course.list("-created_date", 1000),
      base44.entities.Question.list("-created_date", 1000),
      base44.entities.ActivationCode.list("-created_date", 1000),
    ]).then(([students, courses, questions, codes]) => {
      let questionCount = questions.length;
      const fetchRemaining = async (skip) => {
        const batch = await base44.entities.Question.list("-created_date", 1000, skip);
        questionCount += batch.length;
        if (batch.length === 1000) {
          await fetchRemaining(skip + 1000);
        }
      };
      (async () => {
        if (questions.length === 1000) {
          await fetchRemaining(1000);
        }
        setStats({
          students: students.length,
          courses: courses.length,
          questions: questionCount,
          codes: codes.length,
          usedCodes: codes.filter((c) => c.status === "used").length,
          activeStudents: students.filter((s) => s.is_activated).length,
        });
        setRecentCodes(codes.slice(0, 10));
        setLoading(false);
      })();
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Students", value: stats.students, icon: Users, color: "text-blue-600" },
          { label: "Active", value: stats.activeStudents, icon: CheckCircle, color: "text-green-600" },
          { label: "Courses", value: stats.courses, icon: BookOpen, color: "text-purple-600" },
          { label: "Questions", value: stats.questions, icon: HelpCircle, color: "text-orange-600" },
          { label: "Total Codes", value: stats.codes, icon: KeyRound, color: "text-cyan-600" },
          { label: "Used Codes", value: stats.usedCodes, icon: KeyRound, color: "text-pink-600" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border/60 rounded-xl p-4">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className="font-display text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent activation codes */}
      <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-heading font-semibold">Recent Activation Codes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 font-medium text-muted-foreground">Code</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Student</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentCodes.map((code) => (
                <tr key={code.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-5 py-3 font-mono font-medium">{code.code}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                      code.status === "unused"
                        ? "bg-green-100 text-green-700"
                        : code.status === "used"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {code.status === "unused" ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {code.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{code.assigned_student_email || "—"}</td>
                  <td className="px-5 py-3 text-muted-foreground">{new Date(code.created_date).toLocaleDateString()}</td>
                </tr>
              ))}
              {recentCodes.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">No codes generated yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import { FileText, Lock, Calculator, Briefcase, TrendingUp, BarChart3, Users, Megaphone, Settings, BookOpen } from "lucide-react";

const iconMap = {
  calculator: Calculator,
  briefcase: Briefcase,
  "trending-up": TrendingUp,
  "bar-chart": BarChart3,
  users: Users,
  megaphone: Megaphone,
  settings: Settings,
};

export default function MockExams() {
  const { profile, loading: profileLoading } = useStudentProfile();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Course.filter({ is_active: true }).then((data) => {
      setCourses(data);
      setLoading(false);
    });
  }, []);

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const isActivated = profile?.is_activated;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Mock Exams</h1>
        <p className="text-muted-foreground mt-1">Select a course for a timed CBT simulation</p>
      </div>

      {!isActivated && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900">Premium Feature</p>
            <p className="text-sm text-amber-700 mt-0.5">Mock exams require an activated account. <Link to="/activate" className="underline">Activate now</Link></p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {courses.map((course) => {
          const Icon = iconMap[course.icon] || BookOpen;
          return isActivated ? (
            <Link
              key={course.id}
              to={`/mock-exam/${course.id}`}
              className="bg-card border border-border/60 rounded-xl p-5 hover:border-primary/20 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0 group-hover:bg-purple-100 transition-colors">
                  <Icon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-mono text-muted-foreground">{course.code}</p>
                  <h3 className="font-heading font-semibold">{course.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">20 questions • 30 minutes</p>
                </div>
              </div>
            </Link>
          ) : (
            <div key={course.id} className="bg-card border border-border/30 rounded-xl p-5 opacity-60">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-mono text-muted-foreground">{course.code}</p>
                  <h3 className="font-heading font-semibold">{course.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Locked — activate to access</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
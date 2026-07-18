import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { BookOpen, Calculator, Briefcase, TrendingUp, BarChart3, Users, Megaphone, Settings, ArrowRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const iconMap = {
  calculator: Calculator,
  briefcase: Briefcase,
  "trending-up": TrendingUp,
  "bar-chart": BarChart3,
  users: Users,
  megaphone: Megaphone,
  settings: Settings,
};

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Course.filter({ is_active: true }).then((data) => {
      setCourses(data);
      setLoading(false);
    });
  }, []);

  const filtered = courses.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase())
  );

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
        <h1 className="font-display text-2xl md:text-3xl font-bold">Courses</h1>
        <p className="text-muted-foreground mt-1">Select a course to start practicing</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rounded-full"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((course) => {
          const Icon = iconMap[course.icon] || BookOpen;
          return (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="bg-card border border-border/60 rounded-xl p-6 hover:border-primary/20 hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <p className="text-xs font-mono text-muted-foreground mb-1">{course.code}</p>
              <h3 className="font-heading font-semibold text-lg mb-2">{course.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{course.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{Math.max(course.question_count || 0, 100)}+ questions</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No courses found matching "{search}"</p>
        </div>
      )}
    </div>
  );
}
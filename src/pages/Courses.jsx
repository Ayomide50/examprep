import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import { formatLevel } from "@/lib/access";
import { BookOpen, Calculator, Briefcase, TrendingUp, BarChart3, Users, Megaphone, Settings, Landmark, Laptop, Scale, Brain, Lightbulb, Store, ArrowRight, Search, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const iconMap = {
  calculator: Calculator,
  briefcase: Briefcase,
  "trending-up": TrendingUp,
  "bar-chart": BarChart3,
  users: Users,
  megaphone: Megaphone,
  settings: Settings,
  landmark: Landmark,
  laptop: Laptop,
  scale: Scale,
  brain: Brain,
  lightbulb: Lightbulb,
  store: Store,
};

export default function Courses() {
  const { profile, loading: profileLoading } = useStudentProfile();
  const [departments, setDepartments] = useState([]);
  const [browseDept, setBrowseDept] = useState("");
  const [browseLevel, setBrowseLevel] = useState("");
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Department.filter({ is_active: true }).then(setDepartments);
  }, []);

  // Default the browse selectors to the student's own department & level
  useEffect(() => {
    if (profile?.department_id) {
      setBrowseDept((d) => d || profile.department_id);
      setBrowseLevel((l) => l || profile.level);
    }
  }, [profile]);

  useEffect(() => {
    if (!browseDept || !browseLevel) return;
    setLoading(true);
    base44.entities.Course.filter({ is_active: true, department_id: browseDept, level: browseLevel }).then((data) => {
      setCourses(data);
      setLoading(false);
    });
  }, [browseDept, browseLevel]);

  const isHome = browseDept === profile?.department_id && browseLevel === profile?.level;
  const browseDeptObj = departments.find((d) => d.id === browseDept);
  const levelOptions = browseDeptObj?.levels || [];

  const handleDeptChange = (v) => {
    setBrowseDept(v);
    const dept = departments.find((d) => d.id === v);
    const levels = dept?.levels || [];
    setBrowseLevel(levels.includes(browseLevel) ? browseLevel : levels[0] || "");
  };

  const filtered = courses.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase())
  );

  if (profileLoading || (loading && courses.length === 0 && !browseDept)) {
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

      {/* Browse controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={browseDept} onValueChange={handleDeptChange}>
          <SelectTrigger className="w-full sm:w-64 rounded-full">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={browseLevel} onValueChange={setBrowseLevel}>
          <SelectTrigger className="w-full sm:w-40 rounded-full">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            {levelOptions.map((l) => (
              <SelectItem key={l} value={l}>{formatLevel(l)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-full"
          />
        </div>
      </div>

      {/* Browsing notice */}
      {!isHome && browseDept && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            You're browsing <span className="font-medium">{browseDeptObj?.name} • {formatLevel(browseLevel)}</span>.
            You can only try the free trial questions for these courses. Request activation for this department to unlock full access.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((course) => {
              const Icon = iconMap[course.icon] || BookOpen;
              return (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="bg-card border border-border/60 rounded-xl p-6 hover:border-primary/20 hover:shadow-lg transition-all group relative"
                >
                  {!isHome && (
                    <span className="absolute top-4 right-4 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                      Free Trial
                    </span>
                  )}
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
              <p className="text-muted-foreground">
                {search ? `No courses found matching "${search}"` : "No courses have been added for this department and level yet."}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
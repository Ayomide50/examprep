import React, { useState, useEffect } from "react";
import { GraduationCap, BookOpen, Layers } from "lucide-react";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/ui/FadeIn";
import { base44 } from "@/api/base44Client";

export default function DepartmentsSection() {
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [depts, crs] = await Promise.all([
          base44.entities.Department.filter({ is_active: true }),
          base44.entities.Course.filter({ is_active: true }),
        ]);
        setDepartments(depts);
        setCourses(crs);
      } catch {
        // Not accessible without login — keep section hidden
      }
    };
    load();
  }, []);

  if (departments.length === 0) return null;

  return (
    <section id="courses" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Departments We Cover
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Practice questions organized by department and level — with detailed explanations for every answer.
          </p>
        </FadeIn>

        <StaggerGroup key={departments.length} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto" stagger={0.1}>
          {departments.map((dept) => {
            const deptCourses = courses.filter((c) => c.department_id === dept.id);
            return (
              <StaggerItem key={dept.id}>
                <div className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 h-full">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-1">{dept.name}</h3>
                  {dept.description && (
                    <p className="text-sm text-muted-foreground mb-4">{dept.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary/5 text-primary rounded-full px-3 py-1">
                      <BookOpen className="w-3 h-3" />
                      {deptCourses.length} course{deptCourses.length !== 1 ? "s" : ""}
                    </span>
                    {(dept.levels || []).map((level) => (
                      <span key={level} className="inline-flex items-center gap-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-full px-3 py-1">
                        <Layers className="w-3 h-3" />
                        {level} Level
                      </span>
                    ))}
                  </div>
                  {deptCourses.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-gray-100">
                      {deptCourses.map((c) => (
                        <span key={c.id} className="text-[11px] font-mono text-muted-foreground bg-muted rounded-md px-2 py-0.5">
                          {c.code.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
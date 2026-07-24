import React, { useState, useEffect } from "react";
import { GraduationCap } from "lucide-react";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/ui/FadeIn";
import { base44 } from "@/api/base44Client";

export default function DepartmentsSection() {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const depts = await base44.entities.Department.filter({ is_active: true });
        setDepartments(depts);
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

        <StaggerGroup key={departments.length} className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto" stagger={0.1}>
          {departments.map((dept) => (
            <StaggerItem key={dept.id}>
              <div className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 h-full flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg">{dept.name}</h3>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
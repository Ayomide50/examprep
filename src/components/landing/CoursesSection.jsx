import React from "react";
import { Calculator, Briefcase, TrendingUp, BarChart3, Users, Megaphone, Settings } from "lucide-react";

const iconMap = {
  calculator: Calculator,
  briefcase: Briefcase,
  "trending-up": TrendingUp,
  "bar-chart": BarChart3,
  users: Users,
  megaphone: Megaphone,
  settings: Settings,
};

const courses = [
  { code: "ACC 111", title: "Accounting", icon: "calculator", questions: "100+" },
  { code: "BUS 112", title: "Intro to Business", icon: "briefcase", questions: "100+" },
  { code: "ECN 131", title: "Microeconomics", icon: "trending-up", questions: "100+" },
  { code: "ECN 141", title: "Macroeconomics", icon: "bar-chart", questions: "100+" },
  { code: "IRP 120", title: "Human Resources", icon: "users", questions: "100+" },
  { code: "BUS 121", title: "Marketing", icon: "megaphone", questions: "100+" },
  { code: "BUS 120", title: "Management", icon: "settings", questions: "100+" },
];

export default function CoursesSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Seven Courses, One Platform
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive question banks covering all major subjects with detailed explanations for every answer.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => {
            const Icon = iconMap[course.icon];
            return (
              <div
                key={course.code}
                className="group bg-card border border-border/60 rounded-xl p-6 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-mono text-muted-foreground mb-1">{course.code}</p>
                    <h3 className="font-heading font-semibold text-base">{course.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{course.questions} questions</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
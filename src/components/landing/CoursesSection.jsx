import React from "react";
import { Calculator, Briefcase, TrendingUp, BarChart3, Users, Megaphone, Settings, ArrowRight } from "lucide-react";

const courses = [
  { code: "ACC 111", title: "Accounting", icon: Calculator, questions: "100+" },
  { code: "BUS 112", title: "Intro to Business", icon: Briefcase, questions: "100+" },
  { code: "ECN 131", title: "Microeconomics", icon: TrendingUp, questions: "100+" },
  { code: "ECN 141", title: "Macroeconomics", icon: BarChart3, questions: "100+" },
  { code: "IRP 120", title: "Human Resources", icon: Users, questions: "100+" },
  { code: "BUS 121", title: "Marketing", icon: Megaphone, questions: "100+" },
  { code: "BUS 120", title: "Management", icon: Settings, questions: "100+" },
];

export default function CoursesSection() {
  return (
    <section id="courses" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Seven Courses, One Platform
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Comprehensive question banks covering all major subjects with detailed explanations for every answer.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {courses.map((course) => (
            <div
              key={course.code}
              className="group bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <course.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xs font-mono text-muted-foreground mb-0.5">{course.code}</p>
              <h3 className="font-heading font-semibold text-sm">{course.title}</h3>
              <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                <span>{course.questions} questions</span>
                <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
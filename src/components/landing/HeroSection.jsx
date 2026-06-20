import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CheckCircle, Users, FileText, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { value: "700+", label: "Practice Questions", sub: "Across all 7 courses", icon: FileText, color: "text-blue-600 bg-blue-50" },
  { value: "7", label: "Courses Available", sub: "WAEC/NECO subjects", icon: BookOpen, color: "text-purple-600 bg-purple-50" },
  { value: "100%", label: "Explanations", sub: "Every single question", icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
  { value: "500+", label: "Students", sub: "And growing daily", icon: Users, color: "text-amber-600 bg-amber-50" },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 md:pt-44 md:pb-24">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero Text */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Platform Features</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
            Everything You Need{" "}
            <span className="text-primary">to Excel</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
            Comprehensive tools designed to help you prepare effectively and walk into your exam with full confidence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register">
              <Button size="lg" className="h-12 px-8 rounded-xl text-base font-semibold gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow">
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="h-12 px-8 rounded-xl text-base font-medium border-2">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-100 p-5 text-center hover:shadow-lg hover:border-primary/20 transition-all duration-300 group"
            >
              <div className={`w-11 h-11 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="font-display text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{stat.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
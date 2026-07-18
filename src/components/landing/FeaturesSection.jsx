import React from "react";
import { BookOpen, Clock, MessageCircle, BarChart3, Smartphone, Brain } from "lucide-react";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/ui/FadeIn";

const features = [
  {
    icon: BookOpen,
    title: "Practice Mode",
    description: "Answer questions one at a time with instant feedback and detailed explanations for every answer.",
    color: "text-blue-600 bg-blue-50",
    iconBg: "bg-blue-100",
  },
  {
    icon: Clock,
    title: "Mock CBT Exams",
    description: "Experience realistic timed exam simulations that mirror the actual CBT testing environment.",
    color: "text-orange-600 bg-orange-50",
    iconBg: "bg-orange-100",
  },
  {
    icon: MessageCircle,
    title: "Instant Explanations",
    description: "Get detailed step-by-step explanations after every question to understand concepts deeply.",
    color: "text-emerald-600 bg-emerald-50",
    iconBg: "bg-emerald-100",
  },
  {
    icon: BarChart3,
    title: "Performance Tracking",
    description: "Monitor your progress across courses with detailed analytics on your strengths and weaknesses.",
    color: "text-rose-600 bg-rose-50",
    iconBg: "bg-rose-100",
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    description: "Practice anywhere, anytime — the platform works seamlessly on your phone, tablet, or desktop.",
    color: "text-violet-600 bg-violet-50",
    iconBg: "bg-violet-100",
  },
  {
    icon: Brain,
    title: "1000+ Questions",
    description: "Access a comprehensive bank of curated questions spanning ten major courses with full coverage.",
    color: "text-indigo-600 bg-indigo-50",
    iconBg: "bg-indigo-100",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-28 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-sm font-semibold text-primary">Platform Features</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Everything You Need to Excel
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Comprehensive tools designed to help you prepare effectively and walk into your exam with full confidence.
          </p>
        </FadeIn>

        <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" stagger={0.1}>
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:border-primary/20 transition-all duration-300 group h-full">
                <div className={`w-11 h-11 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4 md:group-hover:scale-110 md:transition-transform`}>
                  <feature.icon className={`w-5 h-5 ${feature.color.replace(" bg-", "").split(" ")[0]}`} />
                </div>
                <h3 className="font-heading font-semibold text-base mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
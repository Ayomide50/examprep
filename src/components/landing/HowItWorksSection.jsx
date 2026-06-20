import React from "react";
import { UserPlus, BookOpen, MessageCircle, CreditCard, KeyRound, Unlock } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create an Account",
    description: "Sign up in seconds with just your email and password. No credit card needed to get started.",
    color: "text-blue-600 bg-blue-50",
    iconBg: "bg-blue-100",
  },
  {
    icon: BookOpen,
    title: "Practice Free Questions",
    description: "Try 3 free questions from each subject to experience the platform before subscribing.",
    color: "text-purple-600 bg-purple-50",
    iconBg: "bg-purple-100",
  },
  {
    icon: CreditCard,
    title: "Subscribe",
    description: "Choose the Starter Plan and view our bank payment instructions to make your payment.",
    color: "text-rose-600 bg-rose-50",
    iconBg: "bg-rose-100",
  },
  {
    icon: MessageCircle,
    title: "Contact Admin",
    description: "After payment, message the admin on WhatsApp with your payment proof and email.",
    color: "text-orange-600 bg-orange-50",
    iconBg: "bg-orange-100",
  },
  {
    icon: KeyRound,
    title: "Receive Activation Code",
    description: "The admin will verify your payment and send you a unique personal activation code.",
    color: "text-emerald-600 bg-emerald-50",
    iconBg: "bg-emerald-100",
  },
  {
    icon: Unlock,
    title: "Unlock Full Access",
    description: "Enter your activation code in the platform to unlock full access to all 700+ questions.",
    color: "text-indigo-600 bg-indigo-50",
    iconBg: "bg-indigo-100",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-sm font-semibold text-primary">Simple Process</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Get started in 6 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {steps.map((step, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl ${step.iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <step.icon className={`w-5 h-5 ${step.color.split(" ")[0]}`} />
                </div>
                <div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Step {i + 1}</span>
                  <h3 className="font-heading font-semibold text-sm mt-1 mb-1.5">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
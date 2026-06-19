import React from "react";
import { UserPlus, BookOpen, MessageCircle, KeyRound, Unlock } from "lucide-react";

const steps = [
  { icon: UserPlus, title: "Create an Account", description: "Sign up for free in seconds" },
  { icon: BookOpen, title: "Try Free Questions", description: "Access 3 free questions per course" },
  { icon: MessageCircle, title: "Contact Admin", description: "Reach out via WhatsApp for activation" },
  { icon: KeyRound, title: "Get Activation Code", description: "Receive your unique access code" },
  { icon: Unlock, title: "Unlock Full Access", description: "Enjoy 700+ questions & mock exams" },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 md:py-28 bg-secondary/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Getting started is simple. Follow these five easy steps to unlock your full exam preparation experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="text-center relative">
              <div className="w-14 h-14 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="absolute top-7 left-1/2 w-full h-px bg-border hidden md:block last:hidden" style={{ display: i === steps.length - 1 ? 'none' : undefined }} />
              <span className="text-xs font-mono text-muted-foreground">Step {i + 1}</span>
              <h3 className="font-heading font-semibold mt-1 mb-1">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
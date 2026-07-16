import React from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/FadeIn";

const features = [
  "Full access to all available courses",
  "Access to 700+ CBT practice questions",
  "Detailed explanations for every question",
  "Realistic Mock CBT examinations",
  "Performance tracking & analytics",
  "Mobile-friendly learning",
  "Access for your assigned duration",
  "WhatsApp support from admin",
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-sm font-semibold text-primary">Simple Pricing</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3">
            One Plan. Full Access.
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Everything you need to pass your exams. No hidden fees.
          </p>
        </FadeIn>

        <FadeIn className="max-w-md mx-auto">
          <div className="bg-[#0f172a] rounded-2xl p-8 relative overflow-hidden">
            <div className="flex justify-center -mt-12 mb-6">
              <span className="inline-flex items-center bg-primary/20 text-primary text-xs font-semibold px-4 py-1.5 rounded-full">
                Most Popular
              </span>
            </div>

            <h3 className="text-white font-display font-bold text-xl mb-1">Starter Plan</h3>
            <p className="text-gray-400 text-sm mb-6">Everything you need, nothing you don't</p>

            <div className="mb-8">
              <div className="flex items-baseline gap-0.5">
                <span className="text-white font-display font-bold text-5xl">₦2,000</span>
              </div>
              <span className="text-gray-400 text-sm">per access period</span>
            </div>

            <ul className="space-y-3 mb-8">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            <Link to="/register">
              <Button className="w-full h-12 rounded-xl text-base font-semibold gap-2">
                Subscribe Now <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <p className="text-center text-gray-500 text-xs mt-4">
              Bank transfer payment + WhatsApp activation
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
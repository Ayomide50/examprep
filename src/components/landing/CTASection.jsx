import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="py-20 md:py-28 bg-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-1.5 mb-6">
          <Sparkles className="w-4 h-4 text-white" />
          <span className="text-sm font-semibold text-white">Start Today</span>
        </div>
        <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
          Ready to Ace Your Exams?
        </h2>
        <p className="text-white/70 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Join hundreds of students who have improved their grades with ExamPrep CBT. Start with free trial questions today — no commitment required.
        </p>
        <Link to="/register">
          <Button size="lg" variant="secondary" className="h-12 px-8 rounded-xl text-base font-semibold gap-2 shadow-lg hover:shadow-xl transition-shadow bg-white text-primary hover:bg-gray-50">
            Create Free Account
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
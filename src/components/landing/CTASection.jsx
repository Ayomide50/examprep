import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="py-20 md:py-28 relative">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl py-16 md:py-20 px-6 md:px-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-semibold text-white">Start with 3 free questions — no card required</span>
            </div>

            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
              Ready to Start Preparing?
            </h2>
            <p className="text-white/70 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Join hundreds of students already using ExamPrep CBT to boost their exam scores. Don't wait until it's too late — start practicing today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/register">
                <Button size="lg" className="h-12 px-8 rounded-xl text-base font-semibold gap-2 shadow-lg bg-white text-primary hover:bg-gray-100">
                  Create Free Account <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="h-12 px-8 rounded-xl text-base font-semibold border-white/30 text-white hover:bg-white/10 bg-transparent">
                  Already have an account?
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="py-20 md:py-28 bg-primary text-primary-foreground">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">
          Ready to Ace Your Exams?
        </h2>
        <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto mb-10">
          Join thousands of students who have improved their grades with ExamPrep CBT. 
          Start with free trial questions today.
        </p>
        <Link to="/register">
          <Button size="lg" variant="secondary" className="h-13 px-8 rounded-full text-base font-semibold gap-2">
            Create Free Account
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
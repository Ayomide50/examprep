import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/30" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-4 py-1.5 mb-8">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">700+ CBT Questions Available</span>
          </div>
          
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-tight mb-6">
            Pass Your Exams
            <br />
            <span className="text-muted-foreground">with Confidence</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Practice over 700 carefully curated CBT questions across seven courses. 
            Access detailed explanations and improve your performance through realistic exam simulations.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/register">
              <Button size="lg" className="h-13 px-8 rounded-full text-base font-semibold gap-2 shadow-lg shadow-primary/20">
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="h-13 px-8 rounded-full text-base font-medium">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            {["7 Courses", "Detailed Explanations", "Mock Exams", "Free Trial"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
import React from "react";
import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import CoursesSection from "@/components/landing/CoursesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <HeroSection />
      <div id="courses"><CoursesSection /></div>
      <div id="how-it-works"><HowItWorksSection /></div>
      <div id="testimonials"><TestimonialsSection /></div>
      <CTASection />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
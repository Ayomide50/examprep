import React from "react";
import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import DepartmentsSection from "@/components/landing/DepartmentsSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import InstallAppBanner from "@/components/InstallAppBanner";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <div id="courses"><DepartmentsSection /></div>
      <div id="how-it-works"><HowItWorksSection /></div>
      <PricingSection />
      <FAQSection />
      <div id="testimonials"><TestimonialsSection /></div>
      <CTASection />
      <Footer />
      <WhatsAppButton />
      <InstallAppBanner />
    </div>
  );
}
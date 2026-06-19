import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-xl">ExamPrep CBT</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#courses" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Courses</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="rounded-full px-5">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="rounded-full px-5">Get Started</Button>
            </Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 border-t border-border/50 pt-4 space-y-3">
            <a href="#courses" onClick={() => setOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground">Courses</a>
            <a href="#how-it-works" onClick={() => setOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground">How It Works</a>
            <a href="#testimonials" onClick={() => setOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground">Testimonials</a>
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="flex-1"><Button variant="outline" size="sm" className="w-full rounded-full">Sign In</Button></Link>
              <Link to="/register" className="flex-1"><Button size="sm" className="w-full rounded-full">Get Started</Button></Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#courses", label: "Courses" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export default function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg">MyStudyApp</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Sign In
            </Link>
            <Link to="/register">
              <Button size="sm" className="rounded-lg px-5 font-semibold shadow-sm shadow-primary/25">
                Start Free Trial
              </Button>
            </Link>
          </div>

          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-5 border-t border-gray-100 pt-4 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="flex gap-3 pt-3">
              <Link to="/login" className="flex-1">
                <Button variant="outline" size="sm" className="w-full rounded-lg">Sign In</Button>
              </Link>
              <Link to="/register" className="flex-1">
                <Button size="sm" className="w-full rounded-lg">Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
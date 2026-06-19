import React from "react";
import { BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-lg">ExamPrep CBT</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ExamPrep CBT. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
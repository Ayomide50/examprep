import React from "react";
import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-1.5 mb-6">
            <Link to="/" className="inline-flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              <span className="font-display font-bold text-xl">MyStudyApp</span>
            </Link>
            <div className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-primary">
              <Icon className="w-4 h-4 text-primary-foreground" aria-hidden="true" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
        </div>
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
        )}
      </div>
    </div>
  );
}
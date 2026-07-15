import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { BookOpen, LayoutDashboard, GraduationCap, FileText, Clock, KeyRound, LogOut, Menu, X, User, Pencil } from "lucide-react";
import { base44 } from "@/api/base44Client";
import WhatsAppButton from "@/components/WhatsAppButton";
import ThemeToggle from "@/components/ThemeToggle";

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/courses", icon: GraduationCap, label: "Courses" },
  { path: "/courses", icon: Pencil, label: "Practice" },
  { path: "/mock-exams", icon: FileText, label: "Mock Exams" },
  { path: "/history", icon: Clock, label: "History" },
  { path: "/activate", icon: KeyRound, label: "Activate" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    base44.auth.logout("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border h-14 flex items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <span className="font-display font-bold">MyStudyApp</span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="hidden lg:flex items-center gap-2 p-6 border-b border-border">
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-lg">MyStudyApp</span>
          </div>

          <nav className="flex-1 p-4 pt-20 lg:pt-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Appearance</span>
              <ThemeToggle />
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors w-full"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      <WhatsAppButton />
    </div>
  );
}
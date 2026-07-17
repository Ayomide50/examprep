import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { BookOpen, LayoutDashboard, Users, GraduationCap, HelpCircle, KeyRound, LogOut, Menu, X, BarChart3, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ThemeToggle from "@/components/ThemeToggle";

const navItems = [
  { path: "/admin", icon: LayoutDashboard, label: "Overview" },
  { path: "/admin/students", icon: Users, label: "Students" },
  { path: "/admin/courses", icon: GraduationCap, label: "Courses" },
  { path: "/admin/questions", icon: HelpCircle, label: "Questions" },
  { path: "/admin/codes", icon: KeyRound, label: "Activation Codes" },
  { path: "/admin/admins", icon: Shield, label: "Admins" },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    base44.auth.logout("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border h-14 flex items-center justify-between px-4">
        <Link to="/admin" className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <span className="font-display font-bold">Admin Panel</span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="hidden lg:flex items-center gap-2 p-6 border-b border-border">
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-lg">Admin Panel</span>
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
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted mb-1"
            >
              <BarChart3 className="w-4 h-4" />
              Student View
            </Link>
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

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
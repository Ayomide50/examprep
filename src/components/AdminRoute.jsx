import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import AdminGate from "@/components/AdminGate";
import { Shield } from "lucide-react";

export default function AdminRoute() {
  const { isAuthenticated, isLoadingAuth, authChecked, user } = useAuth();
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem("admin_panel_unlocked") === "true"
  );

  // Wait for auth to complete
  if (isLoadingAuth || !authChecked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not an admin → deny access
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-xl font-heading font-bold mb-2">Access Denied</h1>
          <p className="text-sm text-muted-foreground">
            You need admin privileges to access this page. Please log in with an admin account.
          </p>
        </div>
      </div>
    );
  }

  // Authenticated admin → show password gate if not yet unlocked
  if (!unlocked) {
    return <AdminGate onAuthorized={() => setUnlocked(true)} />;
  }

  return <Outlet />;
}
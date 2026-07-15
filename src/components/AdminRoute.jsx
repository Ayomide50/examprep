import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import AdminGate from "@/components/AdminGate";

export default function AdminRoute() {
  const [state, setState] = useState({ loading: true, isAdmin: false });
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem("admin_panel_unlocked") === "true"
  );

  useEffect(() => {
    base44.auth
      .me()
      .then((user) => {
        setState({ loading: false, isAdmin: user?.role === "admin" });
      })
      .catch(() => {
        setState({ loading: false, isAdmin: false });
      });
  }, []);

  if (state.loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!state.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!unlocked) {
    return <AdminGate onAuthorized={() => setUnlocked(true)} />;
  }

  return <Outlet />;
}
import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminGate from "@/components/AdminGate";

export default function AdminRoute() {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem("admin_panel_unlocked") === "true"
  );

  if (!unlocked) {
    return <AdminGate onAuthorized={() => setUnlocked(true)} />;
  }

  return <Outlet />;
}
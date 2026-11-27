import React from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";

export default function NotificationBell({ unread = 0 }) {
  return (
    <Link
      to="/notifications"
      aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
      className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
    >
      <Bell className="w-5 h-5" />
      {unread > 0 && (
        <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold flex items-center justify-center">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
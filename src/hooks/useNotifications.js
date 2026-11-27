import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { syncReminders } from "@/lib/reminders";

export function useNotifications(profile) {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile?.user_id) {
      setLoading(false);
      return;
    }
    try {
      await syncReminders(profile);
      const [page, count] = await Promise.all([
        base44.entities.Notification.filter(
          { user_id: profile.user_id },
          { sort: "-created_date", limit: 50 }
        ),
        base44.entities.Notification.count({ user_id: profile.user_id, is_read: false }),
      ]);
      setItems(page.items);
      setUnread(count);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    load();
  }, [load]);

  const markAllRead = useCallback(async () => {
    if (!profile?.user_id || unread === 0) return;
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
    try {
      await base44.entities.Notification.updateMany(
        { user_id: profile.user_id, is_read: false },
        { $set: { is_read: true } }
      );
    } catch (err) {
      console.error("Failed to mark notifications as read", err);
    }
  }, [profile, unread]);

  return { items, unread, loading, markAllRead, refresh: load };
}
import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

// Per-level activation records for a student.
export function useLevelActivations(userId) {
  const [activations, setActivations] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      const records = await base44.entities.LevelActivation.filter(
        { user_id: userId },
        "-created_date",
        100
      );
      setActivations(records || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { activations, loading, refresh };
}
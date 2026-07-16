import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

export function useStudentProfile() {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const me = await base44.auth.me();
      setUser(me);
      
      const profiles = await base44.entities.StudentProfile.filter({ user_id: me.id });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      } else {
        // Create profile for new student
        const pendingName = localStorage.getItem("pending_full_name") || "";
        const newProfile = await base44.entities.StudentProfile.create({
          user_id: me.id,
          email: me.email,
          full_name: me.full_name || pendingName || "",
          is_activated: false,
          free_trial_used: {},
          total_questions_answered: 0,
          total_correct: 0,
          total_practice_sessions: 0,
          total_mock_exams: 0,
        });
        setProfile(newProfile);
        if (pendingName) localStorage.removeItem("pending_full_name");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return { profile, user, loading, refresh: loadProfile };
}
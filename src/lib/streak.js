import moment from "moment";
import { base44 } from "@/api/base44Client";

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 180, 365];

const HISTORY_LIMIT = 180;

const todayKey = () => moment().format("YYYY-MM-DD");

const daysAgoKey = (dateKey, n) =>
  moment(dateKey, "YYYY-MM-DD").subtract(n, "days").format("YYYY-MM-DD");

/**
 * Read-only view of a student's streak.
 * A streak breaks as soon as one full day passes without activity, so the
 * effective current streak is derived from the last activity date.
 */
export function streakSummary(profile) {
  const history = Array.isArray(profile?.streak_history) ? profile.streak_history : [];
  const today = todayKey();
  const last = profile?.last_activity_date || "";
  const activeToday = last === today;
  const stillAlive = activeToday || last === daysAgoKey(today, 1);
  const current = last && stillAlive ? profile?.current_streak || 0 : 0;
  const earned = (Array.isArray(profile?.streak_milestones) ? profile.streak_milestones : [])
    .slice()
    .sort((a, b) => a - b);

  return {
    current,
    longest: Math.max(profile?.longest_streak || 0, current),
    activeToday,
    lastActivityDate: last,
    history,
    earned,
    nextMilestone: STREAK_MILESTONES.find((m) => m > current) || null,
  };
}

/**
 * Records a meaningful learning activity for today.
 * Safe to call repeatedly: it only counts the first activity of the day.
 * Extending this (e.g. a streak freeze that keeps a missed day alive) only
 * needs to change the "stillAlive" rule here.
 */
export async function recordDailyActivity(profile) {
  if (!profile?.id) return null;

  const today = todayKey();
  if (profile.last_activity_date === today) return null;

  const history = Array.isArray(profile.streak_history) ? profile.streak_history : [];
  const continued = profile.last_activity_date === daysAgoKey(today, 1);
  const current = continued ? (profile.current_streak || 0) + 1 : 1;
  const earned = Array.isArray(profile.streak_milestones) ? profile.streak_milestones : [];
  const milestone = STREAK_MILESTONES.includes(current) && !earned.includes(current) ? current : null;

  const data = {
    current_streak: current,
    longest_streak: Math.max(profile.longest_streak || 0, current),
    last_activity_date: today,
    streak_history: Array.from(new Set([...history, today])).sort().slice(-HISTORY_LIMIT),
    streak_milestones: milestone ? [...earned, milestone] : earned,
  };

  // Keep the in-memory profile in sync so later calls in the same session skip the write.
  Object.assign(profile, data);

  try {
    await base44.entities.StudentProfile.update(profile.id, data);
  } catch (err) {
    console.error("Failed to record daily activity", err);
    return null;
  }

  return { ...data, milestone };
}

/** Persists a broken streak once, so stored counters match what the student sees. */
export async function settleStreak(profile) {
  if (!profile?.id || (profile.current_streak || 0) === 0) return;
  if (streakSummary(profile).current > 0) return;
  profile.current_streak = 0;
  try {
    await base44.entities.StudentProfile.update(profile.id, { current_streak: 0 });
  } catch (err) {
    console.error("Failed to reset streak", err);
  }
}
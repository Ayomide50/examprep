import moment from "moment";
import { base44 } from "@/api/base44Client";
import { streakSummary } from "@/lib/streak";

export const REMINDER_TYPES = [
  {
    key: "daily",
    label: "Daily study reminder",
    description: "A nudge on days you haven't studied yet.",
  },
  {
    key: "streak",
    label: "Streak reminders",
    description: "A warning before an active streak breaks.",
  },
  {
    key: "milestones",
    label: "Learning milestones",
    description: "Celebrate streak milestones and near misses.",
  },
  {
    key: "weekly",
    label: "Weekly progress report",
    description: "Your last seven days in questions, accuracy and mock exams.",
  },
];

export const DEFAULT_PREFS = { daily: true, streak: true, milestones: true, weekly: true };

export function reminderPrefs(profile) {
  const stored = profile?.reminder_prefs || {};
  return { ...DEFAULT_PREFS, ...stored };
}

const dayKey = (offset = 0) => moment().subtract(offset, "days").format("YYYY-MM-DD");

/** Reminders that need no extra data: daily nudge, streak warning, milestone news. */
function draftReminders(profile, prefs) {
  const drafts = [];
  const today = dayKey();
  const summary = streakSummary(profile);
  const streak = summary.current;
  const studiedToday = summary.activeToday;
  const studiedYesterday = profile.last_activity_date === dayKey(1);
  const level = profile.level ? `${profile.level}-level ` : "";

  if (!studiedToday) {
    if (prefs.streak && studiedYesterday && streak >= 2) {
      drafts.push({
        type: "streak",
        dedupe_key: `streak:${today}`,
        title: `Your ${streak}-day streak ends tonight`,
        message: `Study for a few minutes today and keep your ${streak}-day streak alive.`,
        action_label: "Practice now",
        action_url: "/courses",
      });
    } else if (prefs.daily) {
      drafts.push({
        type: "daily",
        dedupe_key: `daily:${today}`,
        title: "Time to study today",
        message: `You haven't answered any ${level}questions today. A short session keeps your revision on track.`,
        action_label: "Start studying",
        action_url: "/courses",
      });
    }
  }

  if (prefs.milestones) {
    const earned = Array.isArray(profile.streak_milestones) ? profile.streak_milestones : [];
    if (studiedToday && streak >= 3 && earned.includes(streak)) {
      drafts.push({
        type: "milestone",
        dedupe_key: `milestone-earned:${streak}`,
        title: `${streak}-day streak unlocked!`,
        message: `You've studied ${streak} days in a row. That consistency is exactly what raises your score.`,
        action_label: "Keep it going",
        action_url: "/courses",
      });
    } else if (!studiedToday && streak > 0 && summary.nextMilestone && summary.nextMilestone - streak === 1) {
      drafts.push({
        type: "milestone",
        dedupe_key: `milestone-next:${today}`,
        title: `One day from a ${summary.nextMilestone}-day streak`,
        message: `Study today to stay on course for your ${summary.nextMilestone}-day milestone.`,
        action_label: "Practice now",
        action_url: "/courses",
      });
    }
  }

  return drafts;
}

async function weeklyStats(profile) {
  const since = moment().subtract(7, "days").toISOString();
  const query = { user_id: profile.user_id, created_date: { $gte: since } };
  const [answered, correct, exams] = await Promise.all([
    base44.entities.PracticeAttempt.count(query),
    base44.entities.PracticeAttempt.count({ ...query, is_correct: true }),
    base44.entities.MockExamResult.count(query),
  ]);
  return { answered, correct, exams, accuracy: answered ? Math.round((correct / answered) * 100) : 0 };
}

function weeklyReminder(stats, weekKey) {
  const exams = `${stats.exams} mock exam${stats.exams === 1 ? "" : "s"}`;
  const verdict =
    stats.accuracy >= 70
      ? "Strong week — keep the pace."
      : "A little more practice will push that score up.";
  return {
    type: "weekly",
    dedupe_key: `weekly:${weekKey}`,
    title: "Your week in review",
    message: `You answered ${stats.answered} questions with ${stats.accuracy}% accuracy and took ${exams}. ${verdict}`,
    action_label: "See your history",
    action_url: "/history",
  };
}

/**
 * Creates any reminders the student is due today (and at most one weekly report
 * per week). Existing reminders are never duplicated, so this is safe to call on
 * every app open.
 */
export async function syncReminders(profile) {
  if (!profile?.user_id) return [];

  const prefs = reminderPrefs(profile);
  const weekKey = moment().format("GGGG-[W]WW");
  const candidates = draftReminders(profile, prefs);

  const keys = candidates.map((c) => c.dedupe_key);
  if (prefs.weekly) keys.push(`weekly:${weekKey}`);
  if (keys.length === 0) return [];

  const existing = await base44.entities.Notification.filter(
    { user_id: profile.user_id, dedupe_key: { $in: keys } },
    { limit: 50 }
  );
  const have = new Set(existing.items.map((n) => n.dedupe_key));

  const pending = candidates.filter((c) => !have.has(c.dedupe_key));
  if (prefs.weekly && !have.has(`weekly:${weekKey}`)) {
    const stats = await weeklyStats(profile);
    if (stats.answered > 0) pending.push(weeklyReminder(stats, weekKey));
  }

  if (pending.length === 0) return [];

  return await base44.entities.Notification.bulkCreate(
    pending.map((reminder) => ({
      ...reminder,
      user_id: profile.user_id,
      is_read: false,
    }))
  );
}
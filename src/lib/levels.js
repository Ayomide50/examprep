import { base44 } from "@/api/base44Client";

// Helpers for multi-level academic progression.
// A student's activation is tracked per academic level in the LevelActivation entity,
// while StudentProfile.is_activated always mirrors the activation of the CURRENT level.

export function sortLevels(levels) {
  return [...(levels || [])].sort((a, b) => Number(a) - Number(b));
}

// Load the levels an administrator has enabled for a department.
export async function fetchDepartmentLevels(departmentId) {
  if (!departmentId) return [];
  const departments = await base44.entities.Department.filter({ id: departmentId });
  return sortLevels(departments[0]?.levels || []);
}

export function activationForLevel(activations, level) {
  if (!level) return null;
  return (activations || []).find((a) => a.level === level && a.is_active !== false) || null;
}

export function isLevelActivated(activations, level) {
  return !!activationForLevel(activations, level);
}

// Profile fields that keep is_activated in sync with a given level.
export function activationFieldsForLevel(activations, level) {
  const record = activationForLevel(activations, level);
  return {
    is_activated: !!record,
    activation_code: record?.activation_code || "",
    activation_date: record?.activation_date || null,
  };
}

// Per-level progress counters stored on the student profile.
export function emptyLevelStats() {
  return { answered: 0, correct: 0, mock_exams: 0, practice_sessions: 0 };
}

export function levelStats(profile, level) {
  const stored = profile?.level_stats?.[level || "100"];
  return { ...emptyLevelStats(), ...(stored || {}) };
}

export function bumpLevelStats(profile, level, delta) {
  const key = level || "100";
  const current = levelStats(profile, key);
  const next = {};
  Object.keys(emptyLevelStats()).forEach((k) => {
    next[k] = (current[k] || 0) + (delta[k] || 0);
  });
  return { ...(profile?.level_stats || {}), [key]: next };
}

const DURATION_DAYS = {
  "30_days": 30,
  "60_days": 60,
  "90_days": 90,
  "180_days": 180,
  "365_days": 365,
};

export function expiryForDuration(duration) {
  const days = DURATION_DAYS[duration];
  if (!days) return null;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}
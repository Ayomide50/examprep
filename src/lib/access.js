// Department/level access helpers.
// A student may only access courses that belong to their assigned department + level.

export function courseMatchesProfile(course, profile) {
  if (!course || !profile?.department_id) return false;
  return course.department_id === profile.department_id && course.level === profile.level;
}

// Query filter for loading only the courses a student is allowed to see.
export function courseQueryForProfile(profile) {
  return {
    is_active: true,
    department_id: profile?.department_id || "__none__",
    level: profile?.level || "__none__",
  };
}

export function formatLevel(level) {
  return level ? `${level} Level` : "";
}
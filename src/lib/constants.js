export const ADMIN_WHATSAPP = "2348000000000"; // Replace with actual admin WhatsApp number
export const FREE_TRIAL_LIMIT = 3; // Questions per course for free trial
export const MOCK_EXAM_DURATION = 30 * 60; // 30 minutes in seconds
export const MOCK_EXAM_QUESTIONS = 20; // Questions per mock exam
export const PASS_MARK = 50; // Percentage

export const COURSE_ICONS = {
  calculator: "Calculator",
  briefcase: "Briefcase",
  "trending-up": "TrendingUp",
  "bar-chart": "BarChart3",
  users: "Users",
  megaphone: "Megaphone",
  settings: "Settings",
};

export const getWhatsAppLink = (email) => {
  const message = encodeURIComponent(
    `Hello Admin, I would like to activate my ExamPrep CBT account. My registered email is ${email}.`
  );
  return `https://wa.me/${ADMIN_WHATSAPP}?text=${message}`;
};

export const generateActivationCode = () => {
  const prefixes = ["EXP", "CBT", "ACE", "PRO", "TOP"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${prefix}-${part1}-${part2}`;
};
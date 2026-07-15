export const ADMIN_WHATSAPP = "2347038662598"; // Admin WhatsApp number
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

export const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const generateActivationCode = () => {
  const prefixes = ["EXP", "CBT", "ACE", "PRO", "TOP"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${prefix}-${part1}-${part2}`;
};
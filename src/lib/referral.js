export const REWARD_PER_REFERRAL = 500;
export const MIN_WITHDRAWAL = 1000;

export function generateReferralCode(name = "") {
  const prefix = (name.replace(/[^a-zA-Z]/g, "").slice(0, 3) || "REF").toUpperCase();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 7; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return prefix + suffix;
}

export function getReferralLink(code) {
  return `${window.location.origin}/register?ref=${code}`;
}

export function formatNaira(amount) {
  return `\u20a6${(amount || 0).toLocaleString()}`;
}
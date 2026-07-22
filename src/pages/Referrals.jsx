import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import { generateReferralCode, REWARD_PER_REFERRAL } from "@/lib/referral";
import BalanceCard from "@/components/referrals/BalanceCard";
import ReferralCodeCard from "@/components/referrals/ReferralCodeCard";
import ReferralStats from "@/components/referrals/ReferralStats";
import HowItWorksCard from "@/components/referrals/HowItWorksCard";
import WithdrawDialog from "@/components/referrals/WithdrawDialog";

export default function Referrals() {
  const { profile, user, loading: profileLoading, refresh } = useStudentProfile();
  const [referrals, setReferrals] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    const [refs, wds] = await Promise.all([
      base44.entities.Referral.filter({ referrer_user_id: user.id }),
      base44.entities.WithdrawalRequest.filter({ user_id: user.id }),
    ]);
    setReferrals(refs);
    setWithdrawals(wds);
    setLoadingData(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  // Ensure this student has their own referral code
  useEffect(() => {
    const ensureCode = async () => {
      if (profile && !profile.my_referral_code) {
        const code = generateReferralCode(profile.full_name || user?.full_name || "");
        await base44.entities.StudentProfile.update(profile.id, { my_referral_code: code });
        refresh();
      }
    };
    ensureCode();
  }, [profile, user, refresh]);

  if (profileLoading || loadingData || !profile?.my_referral_code) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const paidReferrals = referrals.filter((r) => r.status === "paid");
  const pendingReferrals = referrals.filter((r) => r.status === "pending");
  const totalRewards = paidReferrals.reduce((sum, r) => sum + (r.reward_amount || REWARD_PER_REFERRAL), 0);
  const withdrawn = withdrawals
    .filter((w) => w.status !== "rejected")
    .reduce((sum, w) => sum + (w.amount || 0), 0);
  const balance = Math.max(0, totalRewards - withdrawn);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Refer & Earn</h1>
        <p className="text-muted-foreground mt-1">Invite friends and earn ₦{REWARD_PER_REFERRAL} for each one that activates</p>
      </div>

      <BalanceCard balance={balance} onWithdraw={() => setWithdrawOpen(true)} />
      <ReferralCodeCard code={profile.my_referral_code} />
      <ReferralStats
        total={referrals.length}
        active={paidReferrals.length}
        pending={pendingReferrals.length}
        totalRewards={totalRewards}
      />
      <HowItWorksCard />

      {referrals.length > 0 && (
        <div className="bg-card border border-border/60 rounded-xl p-6">
          <h2 className="font-heading font-semibold mb-4">Your Referrals</h2>
          <div className="space-y-3">
            {referrals.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm border-b border-border/50 last:border-0 pb-3 last:pb-0">
                <div className="min-w-0">
                  <p className="font-medium truncate">{r.referred_name || r.referred_email}</p>
                  <p className="text-xs text-muted-foreground truncate">{r.referred_email}</p>
                </div>
                {r.status === "paid" ? (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 shrink-0">
                    +₦{r.reward_amount || REWARD_PER_REFERRAL}
                  </span>
                ) : (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 shrink-0">
                    Pending
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <WithdrawDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        balance={balance}
        user={user}
        profile={profile}
        onSubmitted={loadData}
      />
    </div>
  );
}
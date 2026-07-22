import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Gift } from "lucide-react";
import { REWARD_PER_REFERRAL } from "@/lib/referral";
import ReferrerTable from "@/components/admin/ReferrerTable";
import WithdrawalRequestsPanel from "@/components/admin/WithdrawalRequestsPanel";
import { useToast } from "@/components/ui/use-toast";

export default function AdminReferrals() {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [pfs, refs, wds] = await Promise.all([
        base44.entities.StudentProfile.list("-created_date", 500),
        base44.entities.Referral.list("-created_date", 500),
        base44.entities.WithdrawalRequest.list("-created_date", 500),
      ]);
      setProfiles(pfs);
      setReferrals(refs);
      setWithdrawals(wds);
    } catch (err) {
      toast({ title: "Failed to load referral data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleMarkPaid = async (request) => {
    setMarkingId(request.id);
    try {
      await base44.entities.WithdrawalRequest.update(request.id, {
        status: "paid",
        paid_date: new Date().toISOString(),
      });
      toast({ title: "Marked as paid", description: `${request.full_name || request.email}'s balance has been cleared.` });
      loadData();
    } catch (err) {
      toast({ title: "Failed to mark as paid", variant: "destructive" });
    } finally {
      setMarkingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Build referral performance rows per referrer
  const byReferrer = {};
  referrals.forEach((r) => {
    if (!byReferrer[r.referrer_user_id]) byReferrer[r.referrer_user_id] = [];
    byReferrer[r.referrer_user_id].push(r);
  });

  const rows = Object.entries(byReferrer).map(([userId, refs]) => {
    const profile = profiles.find((p) => p.user_id === userId);
    const paid = refs.filter((r) => r.status === "paid");
    const earnings = paid.reduce((sum, r) => sum + (r.reward_amount || REWARD_PER_REFERRAL), 0);
    const withdrawn = withdrawals
      .filter((w) => w.user_id === userId && w.status !== "rejected")
      .reduce((sum, w) => sum + (w.amount || 0), 0);
    return {
      userId,
      name: profile?.full_name,
      email: profile?.email || "—",
      code: profile?.my_referral_code,
      total: refs.length,
      active: paid.length,
      pending: refs.length - paid.length,
      earnings,
      balance: Math.max(0, earnings - withdrawn),
    };
  }).sort((a, b) => b.earnings - a.earnings);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Gift className="w-7 h-7 text-primary" />
          Referrals
        </h1>
        <p className="text-muted-foreground mt-1">Monitor referral performance and process withdrawal payments</p>
      </div>

      <WithdrawalRequestsPanel requests={withdrawals} onMarkPaid={handleMarkPaid} markingId={markingId} />
      <ReferrerTable rows={rows} />
    </div>
  );
}
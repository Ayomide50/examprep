import React from "react";
import { Wallet, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MIN_WITHDRAWAL, formatNaira } from "@/lib/referral";

export default function BalanceCard({ balance, onWithdraw }) {
  return (
    <div className="bg-card border border-border/60 rounded-xl p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Available Balance</p>
            <p className="font-display text-3xl font-bold">{formatNaira(balance)}</p>
          </div>
        </div>
        <Button onClick={onWithdraw} className="rounded-full">Withdraw</Button>
      </div>
      <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-sm rounded-lg px-3 py-2.5">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <span>Minimum withdrawal amount is {formatNaira(MIN_WITHDRAWAL)}. Refer more friends to increase your balance!</span>
      </div>
    </div>
  );
}
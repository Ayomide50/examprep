import React from "react";
import { REWARD_PER_REFERRAL, MIN_WITHDRAWAL, formatNaira } from "@/lib/referral";

const steps = [
  { title: "Invite someone to MyStudyApp with your referral code", },
  { title: `Earn ${formatNaira(REWARD_PER_REFERRAL)} per referral`, },
  { title: "Withdraw to your bank",  },
];

export default function HowItWorksCard() {
  return (
    <div className="bg-card border border-border/60 rounded-xl p-6">
      <h2 className="font-heading font-semibold mb-4">Get your invite code</h2>
      <ol className="space-y-4">
        {steps.map((step, i) => (
          <li key={step.title} className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <div>
              <p className="text-sm font-medium">{step.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
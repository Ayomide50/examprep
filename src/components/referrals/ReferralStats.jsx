
import React from "react";
import {
  UserPlus,
  UserCheck,
  UserRoundClock,
  BadgeDollarSign,
} from "lucide-react";
import { formatNaira } from "@/lib/referral";

export default function ReferralStats({
  total,
  active,
  pending,
  totalRewards,
}) {
  const stats = [
    {
      icon: UserPlus,
      label: "Total Referrals",
      value: total,
      color: "text-foreground",
    },
    {
      icon: UserCheck,
      label: "Active Referrals",
      value: active,
      color: "text-green-600",
    },
    {
      icon: UserRoundClock,
      label: "Pending Referrals",
      value: pending,
      color: "text-amber-600",
    },
    {
      icon: BadgeDollarSign,
      label: "Total Rewards",
      value: formatNaira(totalRewards),
      color: "text-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="text-center">
          <s.icon className={`w-5 h-5 mx-auto mb-2 ${s.color}`} />
          <p className={`font-display text-xl font-bold ${s.color}`}>
            {s.value}
          </p>
          <p className="text-sm text-muted-foreground">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}

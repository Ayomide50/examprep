import React from "react";
import moment from "moment";
import { formatNaira } from "@/lib/referral";

const statusStyle = {
  pending: { label: "Pending Payment", cls: "bg-amber-100 text-amber-700" },
  paid: { label: "Paid", cls: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", cls: "bg-red-100 text-red-700" },
};

export default function WithdrawalHistory({ withdrawals }) {
  if (!withdrawals || withdrawals.length === 0) return null;

  return (
    <div className="bg-card border border-border/60 rounded-xl p-6">
      <h2 className="font-heading font-semibold mb-4">Withdrawal History</h2>
      <div className="space-y-3">
        {withdrawals.map((w) => {
          const s = statusStyle[w.status] || statusStyle.pending;
          return (
            <div key={w.id} className="flex items-center justify-between text-sm border-b border-border/50 last:border-0 pb-3 last:pb-0">
              <div>
                <p className="font-medium">{formatNaira(w.amount)}</p>
                <p className="text-xs text-muted-foreground">
                  Requested {moment(w.created_date).format("MMM D, YYYY h:mm A")}
                  {w.status === "paid" && w.paid_date && ` · Paid ${moment(w.paid_date).format("MMM D, YYYY")}`}
                </p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${s.cls}`}>{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
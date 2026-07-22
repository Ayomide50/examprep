import React from "react";
import moment from "moment";
import { Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/referral";

const statusStyle = {
  pending: { label: "Pending", cls: "bg-amber-100 text-amber-700" },
  paid: { label: "Paid", cls: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", cls: "bg-red-100 text-red-700" },
};

export default function WithdrawalRequestsPanel({ requests, onMarkPaid, markingId }) {
  return (
    <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
      <div className="p-5 border-b border-border/60">
        <h2 className="font-heading font-semibold text-sm">Withdrawal Requests</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {requests.filter((r) => r.status === "pending").length} pending payment(s)
        </p>
      </div>
      <div className="divide-y divide-border/50">
        {requests.map((r) => {
          const s = statusStyle[r.status] || statusStyle.pending;
          return (
            <div key={r.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{r.full_name || r.email}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${s.cls}`}>{s.label}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {r.email}
                  {r.referral_code && ` · ${r.referral_code}`}
                  {` · Requested ${moment(r.created_date).format("MMM D, YYYY h:mm A")}`}
                  {r.status === "paid" && r.paid_date && ` · Paid ${moment(r.paid_date).format("MMM D, YYYY")}`}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-bold">{formatNaira(r.amount)}</span>
                {r.status === "pending" && (
                  <Button
                    size="sm"
                    onClick={() => onMarkPaid(r)}
                    disabled={markingId === r.id}
                    className="rounded-full gap-1.5"
                  >
                    {markingId === r.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5" />
                    )}
                    Mark as Paid
                  </Button>
                )}
              </div>
            </div>
          );
        })}
        {requests.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">No withdrawal requests yet</p>
        )}
      </div>
    </div>
  );
}
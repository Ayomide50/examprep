import React from "react";
import { formatNaira } from "@/lib/referral";

export default function ReferrerTable({ rows }) {
  return (
    <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
      <div className="p-5 border-b border-border/60">
        <h2 className="font-heading font-semibold text-sm">Referral Performance</h2>
        <p className="text-xs text-muted-foreground mt-1">{rows.length} student(s) with referrals</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-5 py-3 font-medium text-muted-foreground">Student</th>
              <th className="px-5 py-3 font-medium text-muted-foreground hidden md:table-cell">Code</th>
              <th className="px-5 py-3 font-medium text-muted-foreground">Referrals</th>
              <th className="px-5 py-3 font-medium text-muted-foreground">Active</th>
              <th className="px-5 py-3 font-medium text-muted-foreground hidden md:table-cell">Pending</th>
              <th className="px-5 py-3 font-medium text-muted-foreground">Earnings</th>
              <th className="px-5 py-3 font-medium text-muted-foreground">Balance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.userId} className="border-b border-border/50 hover:bg-muted/30">
                <td className="px-5 py-3">
                  <p className="font-medium truncate max-w-[160px]">{r.name || "—"}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[160px]">{r.email}</p>
                </td>
                <td className="px-5 py-3 font-mono text-xs text-muted-foreground hidden md:table-cell">{r.code || "—"}</td>
                <td className="px-5 py-3">{r.total}</td>
                <td className="px-5 py-3 text-green-600 font-medium">{r.active}</td>
                <td className="px-5 py-3 text-amber-600 hidden md:table-cell">{r.pending}</td>
                <td className="px-5 py-3 font-medium">{formatNaira(r.earnings)}</td>
                <td className="px-5 py-3 font-bold">{formatNaira(r.balance)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">No referrals yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import React, { useEffect } from "react";
import { Flame, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { STREAK_MILESTONES, streakSummary, settleStreak } from "@/lib/streak";
import StreakActivityGrid from "./StreakActivityGrid";

export default function StreakCard({ profile }) {
  const summary = streakSummary(profile);
  const { current, longest, activeToday, history, earned, nextMilestone } = summary;
  const remaining = nextMilestone ? nextMilestone - current : 0;

  // Reset a streak that was broken by a missed day.
  useEffect(() => {
    if (profile?.id) settleStreak(profile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, profile?.last_activity_date]);

  return (
    <div className="bg-card border border-border/60 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
          <Flame className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h2 className="font-display text-sm font-semibold">Daily Streak</h2>
          <p className="text-xs text-muted-foreground">
            {activeToday
              ? "Today's activity is done — keep it going tomorrow"
              : "Answer questions or take a mock exam to keep your streak"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-lg bg-orange-500/5 p-4">
          <p className="text-2xl font-display font-bold text-orange-600">{current}</p>
          <p className="text-xs text-muted-foreground mt-1">Current streak (days)</p>
        </div>
        <div className="rounded-lg bg-primary/5 p-4">
          <p className="text-2xl font-display font-bold text-primary">{longest}</p>
          <p className="text-xs text-muted-foreground mt-1">Longest streak (days)</p>
        </div>
      </div>

      <div className="mb-5">
        <p className="text-xs font-medium text-muted-foreground mb-2">Daily activity — last 14 days</p>
        <StreakActivityGrid history={history} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-muted-foreground">Streak milestones</p>
          {nextMilestone && (
            <p className="text-xs text-muted-foreground">
              {remaining} more day{remaining === 1 ? "" : "s"} to {nextMilestone}
            </p>
          )}
        </div>
        {nextMilestone && (
          <Progress value={(current / nextMilestone) * 100} className="h-1.5 mb-3" />
        )}
        <div className="flex flex-wrap gap-2">
          {STREAK_MILESTONES.map((milestone) => {
            const done = earned.includes(milestone);
            return (
              <span
                key={milestone}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium",
                  done
                    ? "bg-orange-500/10 text-orange-600 border-orange-500/20"
                    : "bg-muted/50 text-muted-foreground border-border/60"
                )}
              >
                {done && <Check className="w-3 h-3" />}
                {milestone}-day
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
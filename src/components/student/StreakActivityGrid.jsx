import React from "react";
import moment from "moment";
import { cn } from "@/lib/utils";

const DAYS = 14;

export default function StreakActivityGrid({ history = [] }) {
  const active = new Set(history);
  const days = Array.from({ length: DAYS }, (_, i) => {
    const day = moment().subtract(DAYS - 1 - i, "days");
    const key = day.format("YYYY-MM-DD");
    return {
      key,
      label: day.format("dd").charAt(0),
      isActive: active.has(key),
      isToday: i === DAYS - 1,
    };
  });

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {days.map((day) => (
        <div key={day.key} className="text-center">
          <div
            title={`${day.key}${day.isActive ? " — active" : ""}`}
            className={cn(
              "h-7 rounded-md flex items-center justify-center text-[10px] font-medium transition-colors",
              day.isActive
                ? "bg-orange-500 text-white"
                : "bg-muted text-muted-foreground",
              day.isToday && "ring-2 ring-orange-500/40 ring-offset-1 ring-offset-background"
            )}
          >
            {day.label}
          </div>
        </div>
      ))}
    </div>
  );
}
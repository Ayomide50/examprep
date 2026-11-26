import React from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { formatLevel } from "@/lib/access";
import { isLevelActivated } from "@/lib/levels";

// Shows ACTIVE / NOT ACTIVATED for each academic level available to the student.
export default function LevelStatusList({ levels, currentLevel, activations }) {
  const list = levels?.length > 0 ? levels : currentLevel ? [currentLevel] : [];
  if (list.length === 0) return null;

  return (
    <div className="space-y-2">
      {list.map((level) => {
        const active = isLevelActivated(activations, level);
        const isCurrent = level === currentLevel;
        return (
          <div
            key={level}
            className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
              isCurrent ? "border-primary/30 bg-primary/5" : "border-border/60"
            }`}
          >
            <div>
              <p className="text-sm font-medium">{formatLevel(level)}</p>
              {isCurrent && <p className="text-xs text-primary">Current level</p>}
            </div>
            {active ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                <CheckCircle className="w-3 h-3" /> ACTIVE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                <XCircle className="w-3 h-3" /> NOT ACTIVATED
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
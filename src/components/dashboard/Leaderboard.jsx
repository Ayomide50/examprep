import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Trophy, Medal, User } from "lucide-react";

export default function Leaderboard() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const exams = await base44.entities.MockExamResult.list("-created_date", 500);

      // Group by user_id and compute average score
      const userScores = {};
      exams.forEach((exam) => {
        if (!userScores[exam.user_id]) {
          userScores[exam.user_id] = { totalScore: 0, examCount: 0 };
        }
        userScores[exam.user_id].totalScore += exam.score_percentage || 0;
        userScores[exam.user_id].examCount += 1;
      });

      // Fetch profiles for names
      const profiles = await base44.entities.StudentProfile.list();
      const profileMap = {};
      profiles.forEach((p) => { profileMap[p.user_id] = p; });

      // Build rankings
      const entries = Object.entries(userScores)
        .map(([userId, data]) => ({
          user_id: userId,
          name: profileMap[userId]?.full_name || profileMap[userId]?.email || "Student",
          averageScore: Math.round(data.totalScore / data.examCount),
          examsTaken: data.examCount,
        }))
        .sort((a, b) => b.averageScore - a.averageScore)
        .slice(0, 20);

      setRankings(entries);
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (index) => {
    if (index === 0) return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (index === 1) return <Medal className="w-4 h-4 text-gray-400" />;
    if (index === 2) return <Medal className="w-4 h-4 text-amber-600" />;
    return <span className="w-4 h-4 text-xs font-bold text-muted-foreground text-center">{index + 1}</span>;
  };

  if (loading) {
    return (
      <div className="bg-card border border-border/60 rounded-xl p-5">
        <h2 className="font-display text-lg font-semibold mb-4">Leaderboard</h2>
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (rankings.length === 0) {
    return (
      <div className="bg-card border border-border/60 rounded-xl p-5">
        <h2 className="font-display text-lg font-semibold mb-4">Leaderboard</h2>
        <p className="text-sm text-muted-foreground text-center py-6">
          No mock exams taken yet. Be the first to climb the ranks!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/60 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h2 className="font-display text-lg font-semibold">Leaderboard</h2>
      </div>

      {/* Top 3 */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {rankings.slice(0, 3).map((entry, idx) => (
          <div
            key={entry.user_id}
            className={`text-center p-3 rounded-lg ${
              idx === 0 ? "bg-yellow-50 border border-yellow-200" :
              idx === 1 ? "bg-gray-50 border border-gray-200" :
              "bg-amber-50 border border-amber-200"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <User className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs font-medium truncate">{entry.name.split(" ")[0]}</p>
            <p className="font-display font-bold text-lg mt-0.5">{entry.averageScore}%</p>
            <p className="text-xs text-muted-foreground">{entry.examsTaken} exams</p>
          </div>
        ))}
      </div>

      {/* Rest of rankings */}
      {rankings.slice(3).length > 0 && (
        <div className="space-y-1">
          {rankings.slice(3).map((entry, idx) => (
            <div
              key={entry.user_id}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="w-6 flex justify-center">{getMedalIcon(idx + 3)}</div>
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="flex-1 text-sm truncate">{entry.name}</span>
              <span className="font-display font-semibold text-sm">{entry.averageScore}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
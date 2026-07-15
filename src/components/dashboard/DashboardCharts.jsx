import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { TrendingUp, BarChart3 } from "lucide-react";

export default function DashboardCharts({ userId }) {
  const [courseAverages, setCourseAverages] = useState([]);
  const [scoreTrend, setScoreTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      base44.entities.MockExamResult.filter({ user_id: userId }, "created_date", 50),
      base44.entities.PracticeSession.filter({ user_id: userId }, "created_date", 50),
    ]).then(([exams, sessions]) => {
      const courseMap = {};
      [...exams, ...sessions].forEach((item) => {
        const code = item.course_code || "Unknown";
        if (!courseMap[code]) courseMap[code] = [];
        courseMap[code].push(item.score_percentage);
      });
      setCourseAverages(
        Object.entries(courseMap).map(([course, scores]) => ({
          course,
          avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        }))
      );

      const trend = [...exams, ...sessions]
        .filter((r) => r.score_percentage != null)
        .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
        .slice(-10)
        .map((r) => ({
          date: new Date(r.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          score: r.score_percentage,
        }));
      setScoreTrend(trend);
      setLoading(false);
    });
  }, [userId]);

  if (loading) return null;
  if (courseAverages.length === 0 && scoreTrend.length === 0) return null;

  const tooltipStyle = {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: "12px",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {courseAverages.length > 0 && (
        <div className="bg-card border border-border/60 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-semibold text-sm">Average Scores by Course</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={courseAverages}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="course" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="avgScore" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {scoreTrend.length > 1 && (
        <div className="bg-card border border-border/60 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-semibold text-sm">Score Trend Over Time</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={scoreTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Trophy, XCircle, CheckCircle, Clock, ArrowLeft, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PASS_MARK } from "@/lib/constants";

export default function MockExamResult() {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.MockExamResult.filter({ id: resultId }).then((data) => {
      if (data.length > 0) setResult(data[0]);
      setLoading(false);
    });
  }, [resultId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Result not found</p>
      </div>
    );
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <button onClick={() => navigate("/history")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to History
      </button>

      {/* Score card */}
      <div className={`text-center p-8 rounded-2xl ${result.passed ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
        <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${result.passed ? "bg-green-100" : "bg-red-100"}`}>
          {result.passed ? <Trophy className="w-8 h-8 text-green-600" /> : <XCircle className="w-8 h-8 text-red-500" />}
        </div>
        <h1 className="font-display text-3xl font-bold mb-1">
          {Math.round(result.score_percentage)}%
        </h1>
        <p className={`text-lg font-medium ${result.passed ? "text-green-700" : "text-red-600"}`}>
          {result.passed ? "Passed!" : "Not Passed"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">{result.course_code} Mock Exam</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Correct", value: result.correct_answers, icon: CheckCircle, color: "text-green-600" },
          { label: "Wrong", value: result.wrong_answers, icon: XCircle, color: "text-red-500" },
          { label: "Unanswered", value: result.unanswered || 0, icon: Clock, color: "text-amber-500" },
          { label: "Time Spent", value: formatTime(result.time_spent_seconds || 0), icon: Clock, color: "text-blue-500" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border/60 rounded-xl p-4 text-center">
            <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
            <p className="font-display text-xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Score breakdown */}
      <div className="bg-card border border-border/60 rounded-xl p-6">
        <h2 className="font-heading font-semibold mb-4">Score Breakdown</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Score</span>
            <span className="font-semibold">{result.correct_answers}/{result.total_questions}</span>
          </div>
          <Progress value={result.score_percentage} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span className="text-amber-600">Pass: {PASS_MARK}%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button variant="outline" className="rounded-full gap-2" onClick={() => navigate(`/mock-exam/${result.course_id}`)}>
          <RotateCcw className="w-4 h-4" /> Retake Exam
        </Button>
        <Link to="/dashboard">
          <Button className="rounded-full gap-2">
            <Home className="w-4 h-4" /> Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Trophy, XCircle, CheckCircle, Clock, ArrowLeft, RotateCcw, Home, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PASS_MARK } from "@/lib/constants";

export default function MockExamResult() {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedQs, setExpandedQs] = useState({});

  useEffect(() => {
    base44.entities.MockExamResult.filter({ id: resultId }).then(async (data) => {
      if (data.length > 0) {
        const res = data[0];
        setResult(res);
        // Fetch question details for each answer
        const qIds = (res.answers || []).map((a) => a.question_id).filter(Boolean);
        if (qIds.length > 0) {
          const qData = await base44.entities.Question.filter({ id: { $in: qIds } });
          setQuestions(qData);
        }
      }
      setLoading(false);
    });
  }, [resultId]);

  const toggleQuestion = (idx) => {
    setExpandedQs((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

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

      {/* Question Review */}
      {result.answers && result.answers.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-heading text-lg font-semibold">Question Review</h2>
          {result.answers.map((ans, idx) => {
            const question = questions.find((q) => q.id === ans.question_id);
            if (!question) return null;

            const options = [
              { key: "A", text: question.option_a },
              { key: "B", text: question.option_b },
              { key: "C", text: question.option_c },
              { key: "D", text: question.option_d },
            ].filter((o) => o.text);

            const isExpanded = expandedQs[idx];
            const wasAnswered = ans.selected && ans.selected !== "";

            return (
              <div key={idx} className="bg-card border border-border/60 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleQuestion(idx)}
                  className="w-full flex items-start gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    ans.is_correct ? "bg-green-100 text-green-600" : wasAnswered ? "bg-red-100 text-red-500" : "bg-amber-100 text-amber-600"
                  }`}>
                    {ans.is_correct ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-medium pt-0.5 flex-1">
                    <span className="text-muted-foreground">Q{idx + 1}.</span> {question.question_text}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 space-y-2 border-t border-border/40">
                    {options.map((opt) => {
                      const isCorrect = opt.key === ans.correct;
                      const isSelected = opt.key === ans.selected;

                      let style = "border-border/40";
                      if (isCorrect) {
                        style = "border-green-500 bg-green-50";
                      } else if (isSelected && !isCorrect) {
                        style = "border-red-500 bg-red-50";
                      }

                      return (
                        <div key={opt.key} className={`flex items-start gap-3 p-3 rounded-lg border ${style}`}>
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-semibold shrink-0 ${
                            isCorrect
                              ? "bg-green-500 text-white"
                              : isSelected && !isCorrect
                              ? "bg-red-500 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {opt.key}
                          </span>
                          <span className="text-sm leading-relaxed pt-1 flex-1">{opt.text}</span>
                          {isCorrect && (
                            <span className="flex items-center gap-1 text-xs font-medium text-green-600 shrink-0 pt-1.5">
                              <CheckCircle className="w-3.5 h-3.5" /> Correct Answer
                            </span>
                          )}
                          {isSelected && !isCorrect && (
                            <span className="flex items-center gap-1 text-xs font-medium text-red-500 shrink-0 pt-1.5">
                              <XCircle className="w-3.5 h-3.5" /> Your Answer
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {!wasAnswered && (
                      <p className="text-xs text-amber-600 font-medium pt-1">You did not answer this question.</p>
                    )}

                    {question.explanation && (
                      <div className="mt-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
                        <p className="text-xs font-medium text-blue-900 mb-1">Explanation</p>
                        <p className="text-sm text-blue-800 leading-relaxed">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

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
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import { PASS_MARK } from "@/lib/constants";
import { Clock, ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function MockExam() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const questionCount = parseInt(searchParams.get("questions")) || 20;
  const timeLimitMinutes = parseInt(searchParams.get("time")) || 30;
  const timeLimitSeconds = timeLimitMinutes * 60;

  const { profile, user } = useStudentProfile();
  const [course, setCourse] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const [finished, setFinished] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef(null);

  useEffect(() => {
    Promise.all([
      base44.entities.Course.filter({ id: courseId }),
      base44.entities.Question.filter({ course_id: courseId, is_active: true }),
    ]).then(([courseData, qData]) => {
      if (courseData.length > 0) setCourse(courseData[0]);
      const shuffled = [...qData].sort(() => Math.random() - 0.5).slice(0, questionCount);
      setQuestions(shuffled);
      setLoading(false);
    });
  }, [courseId, questionCount]);

  useEffect(() => {
    if (!loading && !finished) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [loading, finished]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (key) => {
    if (finished) return;
    setAnswers((prev) => ({ ...prev, [currentIndex]: key }));
  };

  const handleSubmit = useCallback(async () => {
    if (finished) return;
    setFinished(true);
    clearInterval(timerRef.current);

    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    let correct = 0;
    const answerDetails = questions.map((q, i) => {
      const sel = answers[i] || null;
      const isCorrect = sel === q.correct_answer;
      if (isCorrect) correct++;
      return { question_id: q.id, selected: sel, correct: q.correct_answer, is_correct: isCorrect };
    });

    const score = Math.round((correct / questions.length) * 100);
    const result = {
      user_id: user.id,
      course_id: courseId,
      course_code: course?.code || "",
      total_questions: questions.length,
      correct_answers: correct,
      wrong_answers: questions.length - correct - Object.keys(answers).filter(k => !answers[k]).length,
      unanswered: questions.length - Object.keys(answers).length,
      score_percentage: score,
      time_allowed_seconds: timeLimitSeconds,
      time_spent_seconds: timeSpent,
      answers: answerDetails,
      passed: score >= PASS_MARK,
    };

    try {
      const created = await base44.entities.MockExamResult.create(result);
      await base44.entities.StudentProfile.update(profile.id, {
        total_mock_exams: (profile.total_mock_exams || 0) + 1,
        total_questions_answered: (profile.total_questions_answered || 0) + Object.keys(answers).length,
        total_correct: (profile.total_correct || 0) + correct,
      });
      navigate(`/mock-exam-result/${created.id}`);
    } catch (err) {
      console.error(err);
    }
  }, [finished, answers, questions, user, courseId, course, profile, navigate, timeLimitSeconds]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const question = questions[currentIndex];
  const options = [
    { key: "A", text: question.option_a },
    { key: "B", text: question.option_b },
    { key: "C", text: question.option_c },
    { key: "D", text: question.option_d },
  ];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Timer bar */}
      <div className="bg-card border border-border/60 rounded-xl p-3 flex items-center justify-between sticky top-0 z-10">
        <span className="text-sm font-medium">{course?.code}</span>
        <div className={`flex items-center gap-2 text-sm font-mono font-semibold ${timeLeft < 300 ? "text-red-500" : ""}`}>
          <Clock className="w-4 h-4" />
          {formatTime(timeLeft)}
        </div>
        <span className="text-sm text-muted-foreground">{answeredCount}/{questions.length}</span>
      </div>

      {/* Question */}
      <div className="bg-card border border-border/60 rounded-xl p-6">
        <p className="text-xs text-muted-foreground mb-3">Question {currentIndex + 1} of {questions.length}</p>
        <h2 className="font-heading text-lg font-semibold leading-relaxed mb-6">
          {question.question_text}
        </h2>

        <div className="space-y-3">
          {options.map((opt) => (
            <button
              key={opt.key}
              onClick={() => handleAnswer(opt.key)}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                answers[currentIndex] === opt.key
                  ? "border-primary bg-primary/5"
                  : "border-border/60 hover:border-primary/30"
              }`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold shrink-0 ${
                answers[currentIndex] === opt.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {opt.key}
              </span>
              <span className="text-sm leading-relaxed pt-1">{opt.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full gap-1"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(currentIndex - 1)}
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </Button>

        <Button
          variant="destructive"
          size="sm"
          className="rounded-full gap-1"
          onClick={() => setShowConfirm(true)}
        >
          <Flag className="w-3 h-3" /> Submit Exam
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="rounded-full gap-1"
          disabled={currentIndex === questions.length - 1}
          onClick={() => setCurrentIndex(currentIndex + 1)}
        >
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Question navigator */}
      <div className="bg-card border border-border/60 rounded-xl p-4">
        <p className="text-xs text-muted-foreground mb-3">Question Navigator</p>
        <div className="flex flex-wrap gap-2">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                i === currentIndex
                  ? "bg-primary text-primary-foreground"
                  : answers[i]
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Exam?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            You have answered {answeredCount} of {questions.length} questions.
            {answeredCount < questions.length && (
              <span className="text-amber-600"> {questions.length - answeredCount} questions are unanswered and will be marked wrong.</span>
            )}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Continue Exam</Button>
            <Button variant="destructive" onClick={handleSubmit}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
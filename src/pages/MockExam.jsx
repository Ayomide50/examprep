import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import { PASS_MARK, shuffleArray } from "@/lib/constants";
import { courseMatchesProfile } from "@/lib/access";
import { Clock, ChevronLeft, ChevronRight, Flag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

export default function MockExam() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const questionCount = parseInt(searchParams.get("questions")) || 20;
  const timeLimitMinutes = parseInt(searchParams.get("time")) || 30;
  const timeLimitSeconds = timeLimitMinutes * 60;

  const { profile, user } = useStudentProfile();
  const { toast } = useToast();
  const [course, setCourse] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
      const shuffled = shuffleArray(qData).slice(0, questionCount);
      setQuestions(shuffled);
      setLoading(false);
    });
  }, [courseId, questionCount]);

  const submittingRef = useRef(false);
  const handleSubmitRef = useRef(null);

  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  });

  useEffect(() => {
    if (!loading && !finished) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmitRef.current?.();
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
    if (submittingRef.current || finished) return;
    submittingRef.current = true;
    setSubmitting(true);
    setShowConfirm(false);
    clearInterval(timerRef.current);

    if (!user?.id || !profile?.id) {
      toast({ variant: "destructive", title: "Unable to submit", description: "Your profile is still loading. Please try again." });
      submittingRef.current = false;
      setSubmitting(false);
      return;
    }

    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    let correct = 0;
    const answerDetails = questions.map((q, i) => {
      const sel = answers[i] || "";
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
      setFinished(true);
      navigate(`/mock-exam-result/${created.id}`);
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Submission failed", description: "Please try submitting again." });
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [finished, answers, questions, user, courseId, course, profile, navigate, timeLimitSeconds, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (course && profile && !courseMatchesProfile(course, profile)) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <h2 className="font-display text-xl font-bold mb-2">Access Restricted</h2>
        <p className="text-muted-foreground mb-6">This course is not available for your account.</p>
        <Button variant="outline" className="rounded-full" onClick={() => navigate("/mock-exams")}>Back to Mock Exams</Button>
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
      <div className="bg-card border border-border/60 rounded-xl p-3 flex items-center justify-between gap-2 sticky top-0 z-10">
        <span className="text-sm font-medium truncate">{course?.code}</span>
        <div className={`flex items-center gap-1.5 text-sm font-mono font-semibold shrink-0 ${timeLeft < 300 ? "text-red-500" : ""}`}>
          <Clock className="w-4 h-4" />
          {formatTime(timeLeft)}
        </div>
        <span className="text-sm text-muted-foreground shrink-0">{answeredCount}/{questions.length}</span>
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
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full gap-1 shrink-0"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(currentIndex - 1)}
        >
          <ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline">Previous</span>
        </Button>

        <Button
          variant="destructive"
          size="sm"
          className="rounded-full gap-1 shrink-0"
          disabled={submitting}
          onClick={() => setShowConfirm(true)}
        >
          <Flag className="w-3 h-3" /> Submit
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="rounded-full gap-1 shrink-0"
          disabled={currentIndex === questions.length - 1}
          onClick={() => setCurrentIndex(currentIndex + 1)}
        >
          <span className="hidden sm:inline">Next</span> <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Question navigator */}
      <div className="bg-card border border-border/60 rounded-xl p-4">
        <p className="text-xs text-muted-foreground mb-3">Question Navigator ({answeredCount}/{questions.length} answered)</p>
        <div className="flex flex-wrap gap-2">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs font-semibold transition-colors ${
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
            <Button variant="destructive" onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
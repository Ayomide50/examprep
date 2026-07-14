import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import { FREE_TRIAL_LIMIT, getWhatsAppLink } from "@/lib/constants";
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, RotateCcw, MessageCircle, Lock, BookOpen, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function PracticeMode() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, user, loading: profileLoading, refresh } = useStudentProfile();
  const [course, setCourse] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trialBlocked, setTrialBlocked] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  useEffect(() => {
    Promise.all([
      base44.entities.Course.filter({ id: courseId }),
      base44.entities.Question.filter({ course_id: courseId, is_active: true }),
      base44.entities.Bookmark.filter({ user_id: user?.id, course_id: courseId }, "-created_date", 500).catch(() => []),
    ]).then(([courseData, qData, bookmarks]) => {
      if (courseData.length > 0) setCourse(courseData[0]);
      // Shuffle questions
      const shuffled = [...qData].sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
      setBookmarkedIds(new Set((bookmarks || []).map((b) => b.question_id)));
      setLoading(false);
    });
  }, [courseId, user]);

  useEffect(() => {
    if (!profileLoading && profile && !profile.is_activated) {
      const used = profile.free_trial_used?.[courseId] || 0;
      if (used >= FREE_TRIAL_LIMIT) {
        setTrialBlocked(true);
      }
      setQuestionsAnswered(used);
    }
  }, [profileLoading, profile, courseId]);

  const handleSelect = useCallback(async (answer) => {
    if (showResult) return;
    setSelected(answer);
    setShowResult(true);

    const question = questions[currentIndex];
    const isCorrect = answer === question.correct_answer;

    // Record attempt
    try {
      await base44.entities.PracticeAttempt.create({
        user_id: user.id,
        question_id: question.id,
        course_id: courseId,
        course_code: course?.code || "",
        selected_answer: answer,
        correct_answer: question.correct_answer,
        is_correct: isCorrect,
        mode: "practice",
      });

      // Update profile stats
      const newAnswered = (profile.total_questions_answered || 0) + 1;
      const newCorrect = (profile.total_correct || 0) + (isCorrect ? 1 : 0);
      const updateData = {
        total_questions_answered: newAnswered,
        total_correct: newCorrect,
      };

      if (!profile.is_activated) {
        const freeUsed = { ...(profile.free_trial_used || {}) };
        freeUsed[courseId] = (freeUsed[courseId] || 0) + 1;
        updateData.free_trial_used = freeUsed;
        setQuestionsAnswered(freeUsed[courseId]);
        if (freeUsed[courseId] >= FREE_TRIAL_LIMIT) {
          setTrialBlocked(true);
        }
      }

      await base44.entities.StudentProfile.update(profile.id, updateData);
    } catch (err) {
      console.error(err);
    }
  }, [showResult, questions, currentIndex, user, courseId, course, profile]);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelected(null);
      setShowResult(false);
    }
  };

  const handleRetry = () => {
    setSelected(null);
    setShowResult(false);
  };

  const toggleBookmark = async () => {
    const question = questions[currentIndex];
    if (!question) return;

    if (bookmarkedIds.has(question.id)) {
      const bookmarks = await base44.entities.Bookmark.filter({ user_id: user.id, question_id: question.id });
      await Promise.all(bookmarks.map((b) => base44.entities.Bookmark.delete(b.id)));
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        next.delete(question.id);
        return next;
      });
      toast({ title: "Bookmark removed" });
    } else {
      await base44.entities.Bookmark.create({
        user_id: user.id,
        question_id: question.id,
        course_id: courseId,
        course_code: course?.code || "",
        question_text: question.question_text,
        option_a: question.option_a,
        option_b: question.option_b,
        option_c: question.option_c,
        option_d: question.option_d,
        correct_answer: question.correct_answer,
        explanation: question.explanation || "",
      });
      setBookmarkedIds((prev) => new Set(prev).add(question.id));
      toast({ title: "Question bookmarked" });
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold mb-2">No Questions Available</h2>
        <p className="text-muted-foreground mb-4">Questions for this course are being added. Check back soon.</p>
        <Button variant="outline" onClick={() => navigate(`/courses/${courseId}`)}>Back to Course</Button>
      </div>
    );
  }

  if (trialBlocked && showResult === false) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <Lock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold mb-2">Free Trial Complete</h2>
        <p className="text-muted-foreground mb-6">
          You've used all {FREE_TRIAL_LIMIT} free questions for this course. Activate your account to unlock all questions.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate("/activate")} variant="outline" className="rounded-full">
            Enter Activation Code
          </Button>
          <a href={getWhatsAppLink(user?.email || "")} target="_blank" rel="noopener noreferrer">
            <Button className="rounded-full bg-green-500 hover:bg-green-600 gap-2 w-full">
              <MessageCircle className="w-4 h-4" /> Activate via WhatsApp
            </Button>
          </a>
        </div>
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(`/courses/${courseId}`)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> {course?.code}
        </button>
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} / {questions.length}
          {!profile?.is_activated && (
            <span className="ml-2 text-amber-600">({questionsAnswered}/{FREE_TRIAL_LIMIT} free)</span>
          )}
        </span>
      </div>

      {/* Progress */}
      <div className="w-full bg-muted rounded-full h-1.5">
        <div
          className="bg-primary h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="bg-card border border-border/60 rounded-xl p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <h2 className="font-heading text-lg font-semibold leading-relaxed">
            {question.question_text}
          </h2>
          <button
            onClick={toggleBookmark}
            className={`p-2 rounded-lg shrink-0 transition-colors ${
              bookmarkedIds.has(question.id)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted"
            }`}
            title={bookmarkedIds.has(question.id) ? "Remove bookmark" : "Bookmark this question"}
          >
            <Bookmark className={`w-5 h-5 ${bookmarkedIds.has(question.id) ? "fill-primary" : ""}`} />
          </button>
        </div>

        <div className="space-y-3">
          {options.map((opt) => {
            let style = "border-border/60 hover:border-primary/30 hover:bg-muted/50";
            if (showResult) {
              if (opt.key === question.correct_answer) {
                style = "border-green-500 bg-green-50";
              } else if (opt.key === selected && opt.key !== question.correct_answer) {
                style = "border-red-500 bg-red-50";
              } else {
                style = "border-border/30 opacity-50";
              }
            } else if (selected === opt.key) {
              style = "border-primary bg-primary/5";
            }

            return (
              <button
                key={opt.key}
                onClick={() => handleSelect(opt.key)}
                disabled={showResult}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${style}`}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold shrink-0 ${
                  showResult && opt.key === question.correct_answer
                    ? "bg-green-500 text-white"
                    : showResult && opt.key === selected
                    ? "bg-red-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {opt.key}
                </span>
                <span className="text-sm leading-relaxed pt-1">{opt.text}</span>
                {showResult && opt.key === question.correct_answer && (
                  <CheckCircle className="w-5 h-5 text-green-500 ml-auto shrink-0 mt-1" />
                )}
                {showResult && opt.key === selected && opt.key !== question.correct_answer && (
                  <XCircle className="w-5 h-5 text-red-500 ml-auto shrink-0 mt-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showResult && question.explanation && (
          <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-100">
            <p className="text-sm font-medium text-blue-900 mb-1">Explanation</p>
            <p className="text-sm text-blue-800 leading-relaxed">{question.explanation}</p>
          </div>
        )}

        {/* Actions */}
        {showResult && (
          <div className="flex gap-3 mt-6">
            <Button variant="outline" size="sm" className="rounded-full gap-1" onClick={handleRetry}>
              <RotateCcw className="w-3 h-3" /> Retry
            </Button>
            {currentIndex < questions.length - 1 && !trialBlocked && (
              <Button size="sm" className="rounded-full gap-1" onClick={handleNext}>
                Next <ArrowRight className="w-3 h-3" />
              </Button>
            )}
            {trialBlocked && (
              <Button size="sm" className="rounded-full gap-1" onClick={() => navigate("/activate")}>
                Activate Account <ArrowRight className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
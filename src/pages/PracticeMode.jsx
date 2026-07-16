import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import { FREE_TRIAL_LIMIT, getWhatsAppLink, shuffleArray } from "@/lib/constants";
import { ArrowLeft, ArrowRight, RotateCcw, MessageCircle, Lock, BookOpen, Bookmark, Trophy, Home, Eye, CheckCircle, XCircle, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export default function PracticeMode() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, user, loading: profileLoading, refresh } = useStudentProfile();
  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [questionCount, setQuestionCount] = useState("unlimited");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionAnswered, setSessionAnswered] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [trialBlocked, setTrialBlocked] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  useEffect(() => {
    Promise.all([
      base44.entities.Course.filter({ id: courseId }),
      base44.entities.Question.filter({ course_id: courseId, is_active: true }),
      base44.entities.Topic.filter({ course_id: courseId, is_active: true }),
      base44.entities.Bookmark.filter({ user_id: user?.id, course_id: courseId }, "-created_date", 500).catch(() => []),
    ]).then(([courseData, qData, topicData, bookmarks]) => {
      if (courseData.length > 0) setCourse(courseData[0]);
      setTopics(topicData || []);
      setAllQuestions(qData);
      const shuffled = shuffleArray(qData);
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

  const shuffleAndFilter = (topicId, count, pool) => {
    const source = pool || allQuestions;
    const filtered = topicId === "all" ? source : source.filter((q) => q.topic_id === topicId);
    const shuffled = shuffleArray(filtered);
    if (count && count !== "unlimited") {
      return shuffled.slice(0, parseInt(count));
    }
    return shuffled;
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setSessionAnswered(0);
    setSessionCorrect(0);
    setSessionComplete(false);
  };

  const handleTopicChange = (value) => {
    setSelectedTopic(value);
    setQuestions(shuffleAndFilter(value, questionCount));
    resetSession();
  };

  const handleCountChange = (value) => {
    setQuestionCount(value);
    setQuestions(shuffleAndFilter(selectedTopic, value));
    resetSession();
  };

  const saveCurrentAnswer = async () => {
    if (!selectedAnswer) return { answered: sessionAnswered, correct: sessionCorrect };

    const question = questions[currentIndex];
    const isCorrect = selectedAnswer === question.correct_answer;

    const newAnswered = sessionAnswered + 1;
    const newCorrect = sessionCorrect + (isCorrect ? 1 : 0);
    setSessionAnswered(newAnswered);
    setSessionCorrect(newCorrect);

    let hitTrialLimit = false;
    try {
      await base44.entities.PracticeAttempt.create({
        user_id: user.id,
        question_id: question.id,
        course_id: courseId,
        course_code: course?.code || "",
        selected_answer: selectedAnswer,
        correct_answer: question.correct_answer,
        is_correct: isCorrect,
        mode: "practice",
      });

      const updateData = {
        total_questions_answered: (profile.total_questions_answered || 0) + newAnswered,
        total_correct: (profile.total_correct || 0) + newCorrect,
      };
      if (!profile.is_activated) {
        const freeUsed = { ...(profile.free_trial_used || {}) };
        freeUsed[courseId] = (freeUsed[courseId] || 0) + 1;
        updateData.free_trial_used = freeUsed;
        setQuestionsAnswered(freeUsed[courseId]);
        hitTrialLimit = freeUsed[courseId] >= FREE_TRIAL_LIMIT;
      }

      await base44.entities.StudentProfile.update(profile.id, updateData);
      // Update local profile so subsequent answers use the updated count
      profile.free_trial_used = updateData.free_trial_used;
      if (hitTrialLimit) setTrialBlocked(true);
    } catch (err) {
      console.error(err);
    }

    return { answered: newAnswered, correct: newCorrect, hitTrialLimit: hitTrialLimit || false };
  };

  const finishSession = async (answered, correct) => {
    const finalAnswered = answered ?? sessionAnswered;
    const finalCorrect = correct ?? sessionCorrect;
    const wrongCount = finalAnswered - finalCorrect;
    const percentage = finalAnswered > 0 ? Math.round((finalCorrect / finalAnswered) * 100) : 0;

    try {
      await base44.entities.PracticeSession.create({
        user_id: user.id,
        course_id: courseId,
        course_code: course?.code || "",
        topic_id: selectedTopic !== "all" ? selectedTopic : "",
        total_questions: finalAnswered,
        correct_answers: finalCorrect,
        wrong_answers: wrongCount,
        score_percentage: percentage,
        mode: "practice",
      });

      await base44.entities.StudentProfile.update(profile.id, {
        total_practice_sessions: (profile.total_practice_sessions || 0) + 1,
      });
      refresh();
    } catch (err) {
      console.error(err);
    }

    setSessionComplete(true);
  };

  const handleNext = async () => {
    const { answered, correct, hitTrialLimit } = await saveCurrentAnswer();
    if (hitTrialLimit) {
      await finishSession(answered, correct);
      return;
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    } else {
      await finishSession(answered, correct);
    }
  };

  const handleStop = async () => {
    if (sessionAnswered === 0 && !selectedAnswer) {
      navigate("/dashboard");
      return;
    }
    const { answered, correct } = await saveCurrentAnswer();
    await finishSession(answered, correct);
  };

  const handlePracticeAgain = () => {
    setQuestions(shuffleAndFilter(selectedTopic, questionCount));
    resetSession();
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
        <Button variant="outline" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
      </div>
    );
  }

  if (trialBlocked) {
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

  if (sessionComplete) {
    const wrongCount = sessionAnswered - sessionCorrect;
    const percentage = sessionAnswered > 0 ? Math.round((sessionCorrect / sessionAnswered) * 100) : 0;
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
          percentage >= 50 ? "bg-green-100" : "bg-red-100"
        }`}>
          <Trophy className={`w-8 h-8 ${percentage >= 50 ? "text-green-600" : "text-red-500"}`} />
        </div>
        <h2 className="font-display text-2xl font-bold mb-2">Practice Complete!</h2>
        <p className="text-muted-foreground mb-8">
          {course?.code} • {selectedTopic !== "all" ? (topics.find((t) => t.id === selectedTopic)?.title || "Topic") : "All Topics"}
        </p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="font-display text-2xl font-bold text-green-700">{sessionCorrect}</p>
            <p className="text-xs text-green-600">Correct</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="font-display text-2xl font-bold text-red-700">{wrongCount}</p>
            <p className="text-xs text-red-600">Wrong</p>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
            <p className="font-display text-2xl font-bold text-primary">{percentage}%</p>
            <p className="text-xs text-primary">Score</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" className="rounded-full gap-2" onClick={handlePracticeAgain}>
            <RotateCcw className="w-4 h-4" /> Practice Again
          </Button>
          <Button className="rounded-full gap-2" onClick={() => navigate("/dashboard")}>
            <Home className="w-4 h-4" /> Dashboard
          </Button>
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
  ].filter((o) => o.text);

  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <button onClick={handleStop} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Stop &amp; See Results
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            <span className="text-green-600 font-medium">{sessionCorrect}</span> correct •{" "}
            <span className="text-red-500 font-medium">{sessionAnswered - sessionCorrect}</span> wrong
          </span>
          {!profile?.is_activated && (
            <span className="text-xs text-amber-600">({questionsAnswered}/{FREE_TRIAL_LIMIT} free)</span>
          )}
        </div>
      </div>

      {/* Topic filter + count + progress */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Select value={selectedTopic} onValueChange={handleTopicChange}>
          <SelectTrigger className="w-full sm:w-48 rounded-full">
            <SelectValue placeholder="All Topics" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Topics</SelectItem>
            {topics.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={questionCount} onValueChange={handleCountChange}>
          <SelectTrigger className="w-full sm:w-40 rounded-full">
            <SelectValue placeholder="Questions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="20">20 Questions</SelectItem>
            <SelectItem value="30">30 Questions</SelectItem>
            <SelectItem value="50">50 Questions</SelectItem>
            <SelectItem value="60">60 Questions</SelectItem>
            <SelectItem value="80">80 Questions</SelectItem>
            <SelectItem value="100">100 Questions</SelectItem>
            <SelectItem value="unlimited">All Questions</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1 flex items-center gap-3">
          <span className="text-sm text-muted-foreground shrink-0">
            {currentIndex + 1} / {questions.length}
          </span>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
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
            const isSelected = selectedAnswer === opt.key;
            const isCorrect = opt.key === question.correct_answer;

            let style = "border-border/60 hover:border-primary/30 hover:bg-muted/50";
            if (showAnswer) {
              if (isCorrect) {
                style = "border-green-500 bg-green-50";
              } else if (isSelected) {
                style = "border-red-500 bg-red-50";
              } else {
                style = "border-border/30 opacity-50";
              }
            } else if (isSelected) {
              style = "border-primary bg-primary/5";
            }

            return (
              <button
                key={opt.key}
                onClick={() => !showAnswer && setSelectedAnswer(opt.key)}
                disabled={showAnswer}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${style}`}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold shrink-0 ${
                  showAnswer && isCorrect
                    ? "bg-green-500 text-white"
                    : showAnswer && isSelected
                    ? "bg-red-500 text-white"
                    : isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {opt.key}
                </span>
                <span className="text-sm leading-relaxed pt-1">{opt.text}</span>
                {showAnswer && isCorrect && (
                  <CheckCircle className="w-5 h-5 text-green-500 ml-auto shrink-0 mt-1" />
                )}
                {showAnswer && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-red-500 ml-auto shrink-0 mt-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation (shown after "Show Answer") */}
        {showAnswer && question.explanation && (
          <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-100">
            <p className="text-sm font-medium text-blue-900 mb-1">Explanation</p>
            <p className="text-sm text-blue-800 leading-relaxed">{question.explanation}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mt-6">
          <Button variant="outline" className="rounded-full gap-2 text-destructive hover:text-destructive" onClick={handleStop}>
            <Square className="w-4 h-4 fill-current" /> Stop
          </Button>
          {!showAnswer && (
            <Button variant="outline" className="rounded-full gap-2" onClick={() => setShowAnswer(true)}>
              <Eye className="w-4 h-4" /> Show Answer
            </Button>
          )}
          {isLastQuestion ? (
            <Button className="rounded-full gap-2 ml-auto" onClick={handleNext}>
              Finish <Trophy className="w-4 h-4" />
            </Button>
          ) : (
            <Button className="rounded-full gap-2 ml-auto" onClick={handleNext}>
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
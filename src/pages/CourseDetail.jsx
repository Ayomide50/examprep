import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import { FREE_TRIAL_LIMIT, getWhatsAppLink } from "@/lib/constants";
import { BookOpen, Play, FileText, Lock, ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { profile, user, loading: profileLoading } = useStudentProfile();
  const [course, setCourse] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Course.filter({ id: courseId }),
      base44.entities.Question.filter({ course_id: courseId, is_active: true }),
    ]).then(([courseData, questionData]) => {
      if (courseData.length > 0) setCourse(courseData[0]);
      setQuestions(questionData);
      setLoading(false);
    });
  }, [courseId]);

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Course not found</p>
        <Link to="/courses"><Button variant="outline" className="mt-4">Back to Courses</Button></Link>
      </div>
    );
  }

  const freeUsed = profile?.free_trial_used?.[courseId] || 0;
  const isActivated = profile?.is_activated;
  const canPractice = isActivated || freeUsed < FREE_TRIAL_LIMIT;
  const freeRemaining = Math.max(0, FREE_TRIAL_LIMIT - freeUsed);
  const totalQuestions = questions.length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button onClick={() => navigate("/courses")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Courses
      </button>

      <div className="bg-card border border-border/60 rounded-xl p-6 md:p-8">
        <p className="text-xs font-mono text-muted-foreground mb-2">{course.code}</p>
        <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">{course.title}</h1>
        <p className="text-muted-foreground mb-6">{course.description}</p>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-8">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" /> {totalQuestions} Questions
          </span>
        </div>

        {!isActivated && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900">Free Trial Mode</p>
                <p className="text-sm text-amber-700 mt-0.5">
                  {freeRemaining > 0
                    ? `You have ${freeRemaining} free question${freeRemaining !== 1 ? "s" : ""} remaining for this course.`
                    : "You've used all free trial questions for this course. Activate your account for full access."}
                </p>
                {freeRemaining === 0 && (
                  <div className="flex gap-2 mt-3">
                    <Link to="/activate">
                      <Button size="sm" variant="outline" className="rounded-full">Enter Activation Code</Button>
                    </Link>
                    <a href={getWhatsAppLink(user?.email || "")} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="rounded-full bg-green-500 hover:bg-green-600 gap-1">
                        <MessageCircle className="w-3 h-3" /> Activate via WhatsApp
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => {
              if (canPractice) navigate(`/practice/${courseId}`);
            }}
            disabled={!canPractice}
            className={`flex items-center gap-4 p-5 rounded-xl border transition-all text-left ${
              canPractice
                ? "border-border/60 hover:border-primary/20 hover:shadow-md cursor-pointer"
                : "border-border/30 opacity-50 cursor-not-allowed"
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <Play className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-heading font-semibold">Practice Mode</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Answer questions with instant feedback</p>
            </div>
          </button>

          <button
            onClick={() => {
              if (isActivated) navigate(`/mock-exam/${courseId}`);
            }}
            disabled={!isActivated}
            className={`flex items-center gap-4 p-5 rounded-xl border transition-all text-left ${
              isActivated
                ? "border-border/60 hover:border-primary/20 hover:shadow-md cursor-pointer"
                : "border-border/30 opacity-50 cursor-not-allowed"
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-heading font-semibold">Mock Exam</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isActivated ? "Timed CBT simulation" : "Premium feature — activate to access"}
              </p>
            </div>
            {!isActivated && <Lock className="w-4 h-4 text-muted-foreground ml-auto" />}
          </button>
        </div>
      </div>
    </div>
  );
}
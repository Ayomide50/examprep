import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import { BookOpen, Target, Trophy, Clock, ArrowRight, AlertCircle, CheckCircle, Calculator, Briefcase, TrendingUp, BarChart3, Users, Megaphone, Settings, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const iconMap = {
  calculator: Calculator,
  briefcase: Briefcase,
  "trending-up": TrendingUp,
  "bar-chart": BarChart3,
  users: Users,
  megaphone: Megaphone,
  settings: Settings,
};

export default function Dashboard() {
  const { profile, user, loading, refresh } = useStudentProfile();
  const { toast } = useToast();
  const [courses, setCourses] = useState([]);
  const [recentExams, setRecentExams] = useState([]);
  const [clearing, setClearing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    base44.entities.Course.filter({ is_active: true }).then(setCourses);
  }, []);

  useEffect(() => {
    if (user) {
      base44.entities.MockExamResult.filter({ user_id: user.id }, "-created_date", 5).then(setRecentExams);
    }
  }, [user]);

  const handleClearProgress = async () => {
    setClearing(true);
    try {
      await Promise.all([
        base44.entities.MockExamResult.deleteMany({ user_id: user.id }),
        base44.entities.PracticeAttempt.deleteMany({ user_id: user.id }),
        base44.entities.PracticeSession.deleteMany({ user_id: user.id }),
      ]);

      await base44.entities.StudentProfile.update(profile.id, {
        total_questions_answered: 0,
        total_correct: 0,
        total_practice_sessions: 0,
        total_mock_exams: 0,
      });

      setRecentExams([]);
      refresh();
      setDialogOpen(false);
      toast({ title: "Progress cleared successfully" });
    } catch (error) {
      console.error("Failed to clear progress:", error);
      toast({ title: "Failed to clear progress", variant: "destructive" });
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const accuracy = profile?.total_questions_answered > 0
    ? Math.round((profile.total_correct / profile.total_questions_answered) * 100)
    : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            Welcome back{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-muted-foreground mt-1">Track your progress and keep practicing</p>
        </div>
        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogTrigger asChild>
            <button className="inline-flex items-center gap-2 text-sm font-medium text-destructive hover:text-destructive/80 border border-destructive/30 hover:bg-destructive/5 rounded-lg px-3 py-2 transition-colors shrink-0">
              <Trash2 className="w-4 h-4" />
              Clear Progress
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear all progress?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all your practice attempts, mock exam results, and reset your stats to zero. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={clearing}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearProgress}
                disabled={clearing}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {clearing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1" /> Clearing...
                  </>
                ) : (
                  "Yes, Clear All"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Account Status Banner */}
      {!profile?.is_activated && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-amber-900">Free Trial Account</p>
            <p className="text-sm text-amber-700 mt-0.5">
              You have access to 3 free questions per course. Activate your account for full access to 700+ questions and mock exams.
            </p>
            <Link to="/activate">
              <Button size="sm" className="mt-3 rounded-full" variant="outline">
                Activate Now <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {profile?.is_activated && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <div>
            <p className="font-medium text-green-900">Premium Account Active</p>
            <p className="text-sm text-green-700 mt-0.5">Full access to all courses, questions, and mock exams</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Questions Answered", value: profile?.total_questions_answered || 0, icon: BookOpen, color: "text-blue-600" },
          { label: "Accuracy", value: `${accuracy}%`, icon: Target, color: "text-green-600" },
          { label: "Mock Exams", value: profile?.total_mock_exams || 0, icon: Trophy, color: "text-purple-600" },
          { label: "Practice Sessions", value: profile?.total_practice_sessions || 0, icon: Clock, color: "text-orange-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border/60 rounded-xl p-5">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
            <p className="text-2xl font-display font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Performance Charts */}
      <DashboardCharts userId={user?.id} />

      {/* Courses Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">Your Courses</h2>
          <Link to="/courses" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.slice(0, 6).map((course) => {
            const Icon = iconMap[course.icon] || BookOpen;
            return (
              <Link
                key={course.id}
                to={`/practice/${course.id}`}
                className="bg-card border border-border/60 rounded-xl p-5 hover:border-primary/20 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-muted-foreground">{course.code}</p>
                    <h3 className="font-heading font-semibold text-sm truncate">{course.title}</h3>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{course.question_count || 0}+ questions</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Mock Exams */}
      {recentExams.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-semibold mb-4">Recent Mock Exams</h2>
          <div className="space-y-3">
            {recentExams.map((exam) => (
              <div key={exam.id} className="bg-card border border-border/60 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{exam.course_code}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {exam.correct_answers}/{exam.total_questions} correct
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`font-display font-bold text-lg ${exam.passed ? "text-green-600" : "text-red-500"}`}>
                      {Math.round(exam.score_percentage)}%
                    </p>
                    <p className="text-xs text-muted-foreground">{exam.passed ? "Passed" : "Failed"}</p>
                  </div>
                  <Progress value={exam.score_percentage} className="w-16 h-2 hidden sm:block" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
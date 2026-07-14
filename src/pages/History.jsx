import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import { Clock, Trophy, XCircle, CheckCircle, Trash2, Loader2, Bookmark } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import moment from "moment";

export default function History() {
  const { user, loading: profileLoading, refresh: refreshProfile } = useStudentProfile();
  const { toast } = useToast();
  const [mockResults, setMockResults] = useState([]);
  const [practiceAttempts, setPracticeAttempts] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedBookmark, setExpandedBookmark] = useState(null);

  const loadHistory = () => {
    if (user) {
      Promise.all([
        base44.entities.MockExamResult.filter({ user_id: user.id }, "-created_date", 50),
        base44.entities.PracticeAttempt.filter({ user_id: user.id }, "-created_date", 50),
        base44.entities.Bookmark.filter({ user_id: user.id }, "-created_date", 200),
      ]).then(([mocks, practices, bms]) => {
        setMockResults(mocks);
        setPracticeAttempts(practices);
        setBookmarks(bms);
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  const handleClearHistory = async () => {
    setClearing(true);
    try {
      await Promise.all([
        base44.entities.MockExamResult.deleteMany({ user_id: user.id }),
        base44.entities.PracticeAttempt.deleteMany({ user_id: user.id }),
      ]);

      const profile = await base44.entities.StudentProfile.filter({ user_id: user.id });
      if (profile.length > 0) {
        await base44.entities.StudentProfile.update(profile[0].id, {
          total_questions_answered: 0,
          total_correct: 0,
          total_practice_sessions: 0,
          total_mock_exams: 0,
        });
      }

      setMockResults([]);
      setPracticeAttempts([]);
      refreshProfile();
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to clear history:", error);
    } finally {
      setClearing(false);
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const hasHistory = mockResults.length > 0 || practiceAttempts.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">History</h1>
          <p className="text-muted-foreground mt-1">Your practice and exam history</p>
        </div>
        {hasHistory && (
          <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <AlertDialogTrigger asChild>
              <button className="inline-flex items-center gap-2 text-sm font-medium text-destructive hover:text-destructive/80 border border-destructive/30 hover:bg-destructive/5 rounded-lg px-3 py-2 transition-colors shrink-0">
                <Trash2 className="w-4 h-4" />
                Clear History
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all history?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your mock exam results and practice attempts. Your progress stats will also be reset. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={clearing}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearHistory}
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
        )}
      </div>

      <Tabs defaultValue="mock" className="w-full">
        <TabsList className="rounded-full">
          <TabsTrigger value="mock" className="rounded-full">Mock Exams ({mockResults.length})</TabsTrigger>
          <TabsTrigger value="practice" className="rounded-full">Practice ({practiceAttempts.length})</TabsTrigger>
          <TabsTrigger value="bookmarks" className="rounded-full">Bookmarks ({bookmarks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="mock" className="mt-6">
          {mockResults.length === 0 ? (
            <div className="text-center py-16">
              <Trophy className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No mock exams taken yet</p>
              <Link to="/courses" className="text-sm text-primary hover:underline mt-2 inline-block">Start a mock exam</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {mockResults.map((r) => (
                <Link
                  key={r.id}
                  to={`/mock-exam-result/${r.id}`}
                  className="bg-card border border-border/60 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow block"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${r.passed ? "bg-green-100" : "bg-red-100"}`}>
                      {r.passed ? <Trophy className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-500" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{r.course_code}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.correct_answers}/{r.total_questions} correct • {moment(r.created_date).fromNow()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-display font-bold text-lg ${r.passed ? "text-green-600" : "text-red-500"}`}>
                      {Math.round(r.score_percentage)}%
                    </p>
                    <p className="text-xs text-muted-foreground">{r.passed ? "Passed" : "Failed"}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="practice" className="mt-6">
          {practiceAttempts.length === 0 ? (
            <div className="text-center py-16">
              <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No practice sessions yet</p>
              <Link to="/courses" className="text-sm text-primary hover:underline mt-2 inline-block">Start practicing</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {practiceAttempts.map((a) => (
                <div key={a.id} className="bg-card border border-border/60 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {a.is_correct ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{a.course_code}</p>
                      <p className="text-xs text-muted-foreground">{moment(a.created_date).fromNow()}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${a.is_correct ? "text-green-600" : "text-red-500"}`}>
                    {a.is_correct ? "Correct" : "Wrong"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookmarks" className="mt-6">
          {bookmarks.length === 0 ? (
            <div className="text-center py-16">
              <Bookmark className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No bookmarked questions yet</p>
              <Link to="/courses" className="text-sm text-primary hover:underline mt-2 inline-block">Start practicing</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarks.map((bm) => {
                const options = [
                  { key: "A", text: bm.option_a },
                  { key: "B", text: bm.option_b },
                  { key: "C", text: bm.option_c },
                  { key: "D", text: bm.option_d },
                ].filter((o) => o.text);

                const isExpanded = expandedBookmark === bm.id;

                return (
                  <div key={bm.id} className="bg-card border border-border/60 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <button
                        onClick={() => setExpandedBookmark(isExpanded ? null : bm.id)}
                        className="text-left flex-1"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Bookmark className="w-4 h-4 text-primary fill-primary shrink-0" />
                          <span className="text-xs text-muted-foreground">{bm.course_code}</span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed">{bm.question_text}</p>
                      </button>
                      <button
                        onClick={async () => {
                          await base44.entities.Bookmark.delete(bm.id);
                          setBookmarks(bookmarks.filter((b) => b.id !== bm.id));
                          toast({ title: "Bookmark removed" });
                        }}
                        className="p-1.5 hover:bg-red-50 rounded-md shrink-0"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="mt-4 space-y-2">
                        {options.map((opt) => (
                          <div
                            key={opt.key}
                            className={`flex items-start gap-2 p-2 rounded-lg text-sm ${
                              opt.key === bm.correct_answer
                                ? "bg-green-50 border border-green-200"
                                : ""
                            }`}
                          >
                            <span className={`w-5 h-5 rounded flex items-center justify-center text-xs font-semibold shrink-0 ${
                              opt.key === bm.correct_answer ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                            }`}>
                              {opt.key}
                            </span>
                            <span className="pt-0.5">{opt.text}</span>
                            {opt.key === bm.correct_answer && (
                              <CheckCircle className="w-4 h-4 text-green-500 ml-auto shrink-0" />
                            )}
                          </div>
                        ))}
                        {bm.explanation && (
                          <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                            <p className="text-xs font-medium text-blue-900 mb-1">Explanation</p>
                            <p className="text-xs text-blue-800 leading-relaxed">{bm.explanation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
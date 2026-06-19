import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import { Clock, Trophy, XCircle, CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import moment from "moment";

export default function History() {
  const { user, loading: profileLoading } = useStudentProfile();
  const [mockResults, setMockResults] = useState([]);
  const [practiceAttempts, setPracticeAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      Promise.all([
        base44.entities.MockExamResult.filter({ user_id: user.id }, "-created_date", 50),
        base44.entities.PracticeAttempt.filter({ user_id: user.id }, "-created_date", 50),
      ]).then(([mocks, practices]) => {
        setMockResults(mocks);
        setPracticeAttempts(practices);
        setLoading(false);
      });
    }
  }, [user]);

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">History</h1>
        <p className="text-muted-foreground mt-1">Your practice and exam history</p>
      </div>

      <Tabs defaultValue="mock" className="w-full">
        <TabsList className="rounded-full">
          <TabsTrigger value="mock" className="rounded-full">Mock Exams ({mockResults.length})</TabsTrigger>
          <TabsTrigger value="practice" className="rounded-full">Practice ({practiceAttempts.length})</TabsTrigger>
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
      </Tabs>
    </div>
  );
}
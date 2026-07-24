import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import { courseQueryForProfile } from "@/lib/access";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";

export default function MockExams() {
  const { profile, loading: profileLoading } = useStudentProfile();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [questionCount, setQuestionCount] = useState("20");
  const [timeLimit, setTimeLimit] = useState("30");

  useEffect(() => {
    if (!profile) return;
    base44.entities.Course.filter(courseQueryForProfile(profile)).then((data) => {
      setCourses(data);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.department_id, profile?.level]);

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const isActivated = profile?.is_activated;

  const handleStart = () => {
    if (!selectedCourse || !isActivated) return;
    navigate(`/mock-exam/${selectedCourse}?questions=${questionCount}&time=${timeLimit}`);
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="font-display text-2xl md:text-3xl font-bold">Mock Exam</h1>
      <p className="text-muted-foreground mt-1 mb-8">Simulate a real CBT exam experience</p>

      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <h2 className="font-heading font-semibold text-lg">Exam Setup</h2>

        {!isActivated && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Mock exams require an activated account. <Link to="/activate" className="underline font-medium">Activate now</Link>
            </p>
          </div>
        )}

        {/* Course */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Course</label>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.code} — {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Number of Questions */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Number of Questions</label>
          <Select value={questionCount} onValueChange={setQuestionCount}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="60">60</SelectItem>
              <SelectItem value="80">80</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Time Limit */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Time Limit</label>
          <Select value={timeLimit} onValueChange={setTimeLimit}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 min</SelectItem>
              <SelectItem value="30">30 min</SelectItem>
              <SelectItem value="45">45 min</SelectItem>
              <SelectItem value="60">60 min</SelectItem>
              <SelectItem value="75">75 min</SelectItem>
              <SelectItem value="90">90 min</SelectItem>
              <SelectItem value="120">120 min</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleStart}
          disabled={!selectedCourse || !isActivated}
          className="w-full gap-2"
        >
          <span className="text-xs">▶</span> Start Exam
        </Button>
      </div>
    </div>
  );
}
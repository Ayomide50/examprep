import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "@/components/ProtectedRoute";
import ThemeProvider from "@/components/ThemeProvider";
import AdminRoute from "@/components/AdminRoute";

// Auth pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";

// Public
import Landing from "@/pages/Landing";

// Student pages
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Courses from "@/pages/Courses";
import CourseDetail from "@/pages/CourseDetail";
import PracticeMode from "@/pages/PracticeMode";
import MockExams from "@/pages/MockExams";
import MockExam from "@/pages/MockExam";
import MockExamResult from "@/pages/MockExamResult";
import History from "@/pages/History";
import Activate from "@/pages/Activate";
import Referrals from "@/pages/Referrals";
import Profile from "@/pages/Profile";

// Layouts
import StudentLayout from "@/components/dashboard/StudentLayout";
import AdminLayout from "@/components/dashboard/AdminLayout";

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminStudents from "@/pages/admin/AdminStudents";
import AdminCourses from "@/pages/admin/AdminCourses";
import AdminQuestions from "@/pages/admin/AdminQuestions";
import AdminCodes from "@/pages/admin/AdminCodes";
import AdminAdmins from "@/pages/admin/AdminAdmins";
import AdminReferrals from "@/pages/admin/AdminReferrals";
import AdminDepartments from "@/pages/admin/AdminDepartments";

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  if (isLoadingPublicSettings) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes — accessible without auth */}
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/landing" replace />} />}>
        <Route path="/" element={<Home />} />

        {/* Student routes */}
        <Route element={<StudentLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          <Route path="/practice/:courseId" element={<PracticeMode />} />
          <Route path="/mock-exams" element={<MockExams />} />
          <Route path="/mock-exam/:courseId" element={<MockExam />} />
          <Route path="/mock-exam-result/:resultId" element={<MockExamResult />} />
          <Route path="/history" element={<History />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/activate" element={<Activate />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Admin routes — accessible via URL + password only */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/departments" element={<AdminDepartments />} />
          <Route path="/admin/courses" element={<AdminCourses />} />
          <Route path="/admin/questions" element={<AdminQuestions />} />
          <Route path="/admin/codes" element={<AdminCodes />} />
          <Route path="/admin/referrals" element={<AdminReferrals />} />
          <Route path="/admin/admins" element={<AdminAdmins />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
// src/app/routes/index.tsx

import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "../layouts/layout";
import { LandingPage } from "../pages/landing-page";
import { SignUpPage } from "../pages/signup-page";
import { LoginPage } from "../pages/login-page";
import { SubscriptionPage } from "../pages/subscription-page";
import { useAuth } from "../context/AuthContext";

import { TeacherLayout } from "../layouts/teacherLayout";
import { TeacherWorkspacePage } from "../pages/Teacher/teacher-workspace-page";
import { PaymentPage } from "../pages/payment-page";
import { AssignmentListPage } from "../pages/Teacher/assignment-list-page";
import { CreateExamPage } from "../pages/Teacher/create-exam-page";
import { ExamDetailPage } from "../pages/Teacher/exam-detail-page";
import { ClassroomListPage } from "../pages/Teacher/classroom-list-page";
import { AssignmentDetailPage } from "../pages/Teacher/assignment-detail-page";
import { CreateAssignmentPage } from "../pages/Teacher/create-assignment-page";
import { ClassroomDetailScreen } from "../pages/Teacher/classroom-detail-page";
import { AIGradingPage } from "../pages/Teacher/ai-grading-page";
import { ProfileEditPage } from "../pages/Teacher/profile-edit-page";
import { AdminLayout } from "../layouts/adminLayout";
import AdminDashboardPage from "../pages/Admin/admin-dashboard-page";
import UserManagementPage from "../pages/Admin/user-management-page";

function ProtectedRoute({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole: "teacher" | "admin";
}) {
  const { user, profile, loading } = useAuth();

  if (loading && !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#111A2E]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const isAuthenticated = !!user;
  const currentRole = profile?.role || "teacher";

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (currentRole !== allowedRole) {
    return (
      <Navigate
        to={currentRole === "admin" ? "/admin/dashboard" : "/workspace"}
        replace
      />
    );
  }

  return <>{children}</>;
}

export function RouteCentral() {
  return (
    <Routes>
      {/* 1. Public Routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="signup" element={<SignUpPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="pricing" element={<SubscriptionPage />} />
      </Route>

      {/* 2. Teacher Protected Routes*/}
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRole="teacher">
            <TeacherLayout />
          </ProtectedRoute>
        }
      >
        <Route path="workspace" element={<TeacherWorkspacePage />} />
        <Route path="profile/edit" element={<ProfileEditPage />} />
        <Route path="rubrics" element={<AssignmentListPage />} />
        <Route path="rubrics/create" element={<CreateExamPage />} />
        <Route path="rubrics/:id" element={<ExamDetailPage />} />
        <Route path="rubrics/:id/edit" element={<CreateExamPage />} />
        <Route path="classrooms" element={<ClassroomListPage />} />
        <Route path="classrooms/:classId" element={<ClassroomDetailScreen />} />
        <Route
          path="classrooms/:classId/assignments/create"
          element={<CreateAssignmentPage />}
        />
        <Route
          path="classrooms/:classId/assignments/:id"
          element={<AssignmentDetailPage />}
        />
        <Route
          path="classrooms/:classId/assignments/:id/grading"
          element={<AIGradingPage />}
        />
        <Route path="workspace/pricing" element={<SubscriptionPage />} />
        <Route path="payment" element={<PaymentPage />} />

        <Route path="*" element={<Navigate to="/workspace" replace />} />
      </Route>

      {/* 3. Admin Protected Routes*/}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<UserManagementPage />} />

        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

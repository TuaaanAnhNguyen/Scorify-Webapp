// src/app/routes/index.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "../layouts/layout";
import { LandingPage } from "../pages/landing-page";
import { SignUpPage } from "../pages/signup-page";
import { LoginPage } from "../pages/login-page";

import { TeacherRoutes } from "./teacherRoutes";
import { AdminRoutes } from "./adminRoutes";
import { SubscriptionPage } from "../pages/subscription-page";

function ProtectedRoute({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole: "teacher" | "admin";
}) {
  const auth = {
    isAuthenticated: true,
    role: "teacher" as "teacher" | "admin",
  };

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (auth.role !== allowedRole) {
    return (
      <Navigate to={auth.role === "admin" ? "/admin" : "/dashboard"} replace />
    );
  }

  return <>{children}</>;
}

export function RouteCentral() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="signup" element={<SignUpPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="pricing" element={<SubscriptionPage />} />
      </Route>

      <Route
        path="/*"
        element={
          <ProtectedRoute allowedRole="teacher">
            <TeacherRoutes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminRoutes />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import { createBrowserRouter } from "react-router-dom";
import { LandingPage } from "./pages/landing-page";
import { SignUpPage } from "./pages/signup-page";
import { LoginPage } from "./pages/login-page";
import { DashboardPage } from "./pages/dashboard-page";
import { ClassesPage } from "./pages/classes-page";
import { ClassDetailPage } from "./pages/class-detail-page";
import { CreateExamPage } from "./pages/create-exam-page";
import { StudentDashboardPage } from "./pages/student-dashboard-page";
import { StudentClassesPage } from "./pages/student-classes-page";
import { StudentClassDetailPage } from "./pages/student-class-detail-page";
import { SubmitEssayPage } from "./pages/submit-essay-page";
import { ViewEssayDetailPage } from "./pages/view-essay-detail-page";
import { AdminDashboardPage } from "./pages/admin-dashboard-page";
import { AdminTeachersPage } from "./pages/admin-teachers-page";
import { PaymentPage } from "./pages/payment-page";
import { Layout } from "./components/layout";
import { AdminLayout } from "./components/admin-layout";
import { StudentGradingDetailPage } from "./pages/student-submission-detail-page";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: LandingPage },
      { path: "signup", Component: SignUpPage },
      { path: "login", Component: LoginPage },
      { path: "dashboard", Component: DashboardPage },
      { path: "classes", Component: ClassesPage },
      { path: "classes/:id", Component: ClassDetailPage },
      { path: "classes/:id/create-exam", Component: CreateExamPage },

      {
        // This is the page with the Folder Upload and Student List
        path: "classes/:id/essay/:assignmentId",
        Component: ViewEssayDetailPage,
      },
      {
        // This is the specific Math grading detail page
        path: "classes/:id/essay/:assignmentId/:submissionId/detail",
        Component: StudentGradingDetailPage,
      },

      { path: "payment", Component: PaymentPage },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboardPage },
      { path: "teachers", Component: AdminTeachersPage },
      { path: "teachers/create", Component: AdminTeachersPage },
    ],
  },
]);

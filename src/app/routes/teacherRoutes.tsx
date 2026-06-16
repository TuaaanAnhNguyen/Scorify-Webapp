// src/app/routes/teacherRoutes.tsx

import { Routes, Route, Navigate } from "react-router-dom";
import { TeacherLayout } from "../layouts/teacherLayout";
import { WorkspacePage } from "../pages/Teacher/teacher-workspace-page";
import { PaymentPage } from "../pages/payment-page";
import { RubricListPage } from "../pages/Teacher/rubric-list-page";
import { CreateRubricPage } from "../pages/Teacher/create-rubric-page";
import { ClassroomListPage } from "../pages/Teacher/classroom-list-page";
import { AssignmentDetailPage } from "../pages/Teacher/assignment-detail-page";
import { CreateAssignmentPage } from "../pages/Teacher/create-assignment-page";
import { ClassroomDetailScreen } from "../pages/Teacher/classroom-detail-page";
import { AIGradingPage } from "../pages/Teacher/ai-grading-page";
import { SubscriptionPage } from "../pages/subscription-page";

export function TeacherRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TeacherLayout />}>
        <Route index element={<Navigate to="/workspace" replace />} />
        <Route path="workspace" element={<WorkspacePage />} />

        <Route path="rubrics" element={<RubricListPage />} />
        <Route path="rubrics/create" element={<CreateRubricPage />} />
        <Route path="rubrics/:id" element={<CreateRubricPage />} />

        <Route path="classrooms" element={<ClassroomListPage />} />
        <Route path="classrooms/:classId" element={<ClassroomDetailScreen />} />
        <Route path="classrooms/:classId/assignments/create" element={<CreateAssignmentPage />} />
        <Route path="classrooms/:classId/assignments/:id" element={<AssignmentDetailPage />} />
        <Route path="classrooms/:classId/assignments/:id/grading" element={<AIGradingPage />} />
        
        <Route path="workspace/pricing" element={<SubscriptionPage />} />
        <Route path="payment" element={<PaymentPage />} />
      </Route>
    </Routes>
  );
}
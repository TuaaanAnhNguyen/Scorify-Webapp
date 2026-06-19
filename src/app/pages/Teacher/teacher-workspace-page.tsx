// src/app/pages/Teacher/teacher-workspace-page.tsx

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Binary,
  UserCog,
  School,
  FileText,
  Cpu,
  ArrowRight,
  Plus,
  Users,
  Layers,
  Loader2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { useAuth } from "@/app/context/AuthContext";
import { supabaseClient } from "@/app/services/supabaseClient";

interface DashboardStats {
  classroomsCount: number;
  assignmentsCount: number;
  gradedCount: number;
}

interface ClassroomActivity {
  id: string;
  name: string;
  description: string;
  studentCount: number;
  activeAssignments: number;
}

interface AIActivityLog {
  studentName: string;
  assignmentName: string;
  score: string;
  feedback: string;
}

interface DocumentLine {
  line_index: number;
  content: string;
  score: number;
  feedback: string;
}

interface ParsedFeedback {
  document_lines?: DocumentLine[];
  generalComment?: string;
  status?: string;
}

function BeautifulFeedback({ feedback }: { feedback: string }) {
  const cleanFeedback = feedback?.trim();

  if (!cleanFeedback || cleanFeedback === "{}") {
    return (
      <p className="text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-100/50 italic text-[11px] text-center">
        Chưa có nhận xét chi tiết tự động từ hệ thống.
      </p>
    );
  }

  try {
    const parsed: ParsedFeedback = JSON.parse(cleanFeedback);
    const hasLines = parsed.document_lines && parsed.document_lines.length > 0;

    return (
      <div className="space-y-2 max-w-full">
        {parsed.generalComment && (
          <div className="bg-indigo-50/50 border border-indigo-100/60 rounded-xl p-2 px-2.5 text-[11px] font-medium text-indigo-700 flex items-center justify-between">
            <span>{parsed.generalComment}</span>
            <span className="text-[9px] bg-indigo-100 px-1.5 py-0.5 rounded text-indigo-800 uppercase font-bold tracking-wider">
              {parsed.status || "Graded"}
            </span>
          </div>
        )}

        {hasLines && (
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 border border-slate-100/60 rounded-xl p-1.5 bg-slate-50/30">
            {parsed.document_lines?.map((line, index) => (
              <div
                key={line.line_index ?? index}
                className="bg-white border border-slate-100 rounded-lg p-2 shadow-2xs space-y-1 text-[11px]"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold border-b border-slate-50 pb-1 mb-1">
                  <span>Dòng #{line.line_index + 1}</span>
                  <span
                    className={`px-1 rounded font-mono font-bold ${line.score > 0 ? "text-emerald-600 bg-emerald-50" : "text-slate-400 bg-slate-100"}`}
                  >
                    +{line.score}đ
                  </span>
                </div>

                <div
                  className="text-slate-800 font-medium break-words overflow-x-auto selection:bg-indigo-100
                  [&_.katex-display]:my-1 [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden
                  [&_.katex]:text-[12px] [&_.katex]:text-indigo-950"
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {line.content}
                  </ReactMarkdown>
                </div>

                {line.feedback && (
                  <p className="text-[10.5px] text-slate-500 bg-slate-50/80 p-1.5 rounded border border-slate-100/50 italic leading-relaxed">
                    {line.feedback}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } catch (e) {
    return (
      <div
        className="text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100/50 italic text-[11px] leading-relaxed break-words
        [&_.katex-display]:my-1 [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden
        [&_.katex]:text-[12px] [&_.katex]:text-indigo-950"
      >
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {feedback}
        </ReactMarkdown>
      </div>
    );
  }
}

export function WorkspacePage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    classroomsCount: 0,
    assignmentsCount: 0,
    gradedCount: 0,
  });
  const [recentClassrooms, setRecentClassrooms] = useState<ClassroomActivity[]>(
    [],
  );
  const [recentAIActivities, setRecentAIActivities] = useState<AIActivityLog[]>(
    [],
  );

  useEffect(() => {
    if (!user?.id) return;

    async function fetchDashboardTelemetry() {
      try {
        setLoading(true);

        // 1. Concurrent Fetching engine targeting the correct PostgreSQL relations
        const [
          classroomsCountRes,
          assignmentsCountRes,
          gradedSubmissionsCountRes,
          classroomsDataRes,
          activitiesDataRes,
        ] = await Promise.all([
          // Fix table: public.class | Field: teacher_profile_id
          supabaseClient
            .from("class")
            .select("*", { count: "exact", head: true })
            .eq("teacher_profile_id", user.id),

          // Fix table: public.exam | Field: created_by
          supabaseClient
            .from("exam")
            .select("*", { count: "exact", head: true })
            .eq("created_by", user.id),

          // Fix table: public.exam_result (This stores scores/feedbacks) linked through exam table
          supabaseClient
            .from("exam_result")
            .select("*, exam!inner(*)", { count: "exact", head: true })
            .eq("exam.created_by", user.id)
            .not("score", "is", null),

          // Fix table: Get recent classes joined with exact class_student and exam counter definitions
          supabaseClient
            .from("class")
            .select(
              `
              class_id,
              class_name,
              description,
              created_at,
              class_student(count),
              exam(count)
            `,
            )
            .eq("teacher_profile_id", user.id)
            .order("created_at", { ascending: false })
            .limit(4),

          // Fix table: Extract recent evaluations from exam_result joined with student metadata
          supabaseClient
            .from("exam_result")
            .select(
              `
              exam_result_id,
              score,
              feedback,
              graded_at,
              student:student_id(full_name),
              exam:exam_id(exam_name, created_by)
            `,
            )
            .eq("exam.created_by", user.id)
            .not("score", "is", null)
            .order("graded_at", { ascending: false })
            .limit(5),
        ]);

        // 2. Set Overview Counters
        setStats({
          classroomsCount: classroomsCountRes.count || 0,
          assignmentsCount: assignmentsCountRes.count || 0,
          gradedCount: gradedSubmissionsCountRes.count || 0,
        });

        // 3. Mapping Recent Workspaces (Classes)
        if (classroomsDataRes.data) {
          const mappedClassrooms = classroomsDataRes.data.map((cls: any) => ({
            id: cls.class_id,
            name: cls.class_name,
            description: cls.description || "Chưa có mô tả lớp học",
            studentCount: cls.class_student?.[0]?.count || 0,
            activeAssignments: cls.exam?.[0]?.count || 0,
          }));
          setRecentClassrooms(mappedClassrooms);
        }

        // 4. Mapping Activity Feed Log rows
        if (activitiesDataRes.data) {
          const mappedActivities = activitiesDataRes.data.map((res: any) => ({
            studentName: res.student?.full_name || "Học sinh ẩn danh",
            assignmentName: res.exam?.exam_name || "Bài tập không tên",
            score:
              res.score !== undefined && res.score !== null
                ? `${res.score}/10`
                : "Chưa chấm",
            feedback: res.feedback || "Không có nhận xét tự động từ hệ thống.",
          }));
          setRecentAIActivities(mappedActivities);
          console.log(
            "Recent AI gradings: ",
            JSON.stringify(mappedActivities, null, 2),
          );
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu màn hình chính:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardTelemetry();
  }, [user?.id]);

  const statCardsConfig = [
    {
      label: "Lớp học đang quản lý",
      value: `${stats.classroomsCount} lớp`,
      icon: School,
      color: "text-indigo-600 bg-indigo-50 border border-indigo-100",
    },
    {
      label: "Quản lý bài tập",
      value: `${stats.assignmentsCount} bộ`,
      icon: Binary,
      color: "text-amber-600 bg-amber-50 border border-amber-100",
    },
    {
      label: "Tổng số bài đã chấm AI",
      value: `${stats.gradedCount.toLocaleString()} bài`,
      icon: FileText,
      color: "text-emerald-600 bg-emerald-50 border border-emerald-100",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">
          Đang đồng bộ dữ liệu Scorify hệ thống...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Xin chào, {profile?.name || "Giáo viên"}! 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Hệ thống trợ lý chấm điểm Scorify AI đã sẵn sàng đồng hành cùng các
            đợt đánh giá của bạn.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/profile/edit"
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-bold text-xs rounded-xl transition-all shadow-sm shrink-0 h-10"
          >
            <UserCog className="size-4" />
            Hồ sơ của tôi
          </Link>
          <Button
            onClick={() => navigate("/classrooms")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 h-10 px-4 rounded-xl shadow-md shadow-indigo-950/10"
          >
            <Plus className="size-4" />
            Tạo đợt chấm bài mới
          </Button>
        </div>
      </div>

      {/* SYSTEM METRICS */}
      <div className="grid sm:grid-cols-3 gap-5">
        {statCardsConfig.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </span>
                <div className={`p-2.5 rounded-xl ${stat.color}`}>
                  <Icon className="size-5" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-800 tracking-tight">
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* MAIN CONTAINER */}
      <div className="grid lg:grid-cols-3 gap-8 pt-2">
        {/* RECENT WORKSPACES */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Lớp học hoạt động gần đây
              </h2>
              <p className="text-xs text-slate-400">
                Truy cập nhanh vào danh sách học sinh và đợt bài tập
              </p>
            </div>
            <Link
              to="/classrooms"
              className="text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center gap-1"
            >
              Xem toàn bộ lớp học <ArrowRight className="size-3" />
            </Link>
          </div>

          {recentClassrooms.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-xl p-8 text-center text-sm text-slate-400">
              Bạn chưa có lớp học nào. Hãy bấm nút Tạo đợt chấm bài mới để bắt
              đầu.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {recentClassrooms.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/classrooms/${item.id}`)}
                  className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group flex flex-col justify-between min-h-[135px]"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="p-2 bg-indigo-50/70 text-indigo-600 rounded-lg group-hover:scale-105 transition-transform">
                        <School className="size-4" />
                      </div>
                      <Badge className="bg-slate-100 text-slate-500 font-bold text-[9px] rounded px-1.5 py-0">
                        Lớp học
                      </Badge>
                    </div>
                    <h3 className="font-bold text-slate-800 text-xs tracking-tight line-clamp-1 group-hover:text-indigo-600 transition-colors pt-1">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {item.description}
                    </p>
                  </div>

                  <div className="border-t border-slate-50 pt-3 mt-4 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Users className="size-3 text-slate-400" />
                      {item.studentCount} Học viên
                    </span>
                    <span className="flex items-center gap-1 text-indigo-600 font-bold bg-indigo-50/50 px-1.5 py-0.5 rounded">
                      <Layers className="size-3" />
                      {item.activeAssignments} Đợt kiểm tra
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RECENT EVALUATIONS LOG FEED */}
        <div className="lg:col-span-1 space-y-4">
          <div className="px-1">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Nhật ký chấm điểm AI
            </h2>
            <p className="text-xs text-slate-400">
              Kết quả phân tích nhận xét tự động thời gian thực
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
            {recentAIActivities.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 italic">
                Chưa có hoạt động chấm điểm bằng AI nào được ghi nhận.
              </div>
            ) : (
              <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                {recentAIActivities.map((activity, idx) => (
                  <div
                    key={idx}
                    className="text-xs border-b border-slate-50 pb-3.5 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-slate-800 truncate flex items-center gap-1">
                        <Cpu className="size-3 text-indigo-500 shrink-0" />
                        {activity.studentName}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-black text-[10px] shrink-0">
                        {activity.score}
                      </span>
                    </div>
                    <p className="text-[10px] text-indigo-500 font-medium mb-1.5">
                      Đợt: {activity.assignmentName}
                    </p>
                    <div className="mt-1">
                      <BeautifulFeedback feedback={activity.feedback} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
  GraduationCap,
  Loader2,
} from "lucide-react";
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
  grade: string;
  studentCount: number;
  activeAssignments: number;
}

interface AIActivityLog {
  studentName: string;
  assignmentName: string;
  score: string;
  feedback: string;
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

        // 1. Chạy đồng thời tất cả các truy vấn đếm số lượng (Stats Card) và dữ liệu danh sách
        const [
          classroomsCountRes,
          assignmentsCountRes,
          gradedSubmissionsCountRes,
          classroomsDataRes,
          activitiesDataRes,
        ] = await Promise.all([
          // Đếm số lớp học của giáo viên hiện tại
          supabaseClient
            .from("classrooms")
            .select("*", { count: "exact", head: true })
            .eq("teacher_id", user.id),

          // Đếm số bài tập/rubric của giáo viên hiện tại
          supabaseClient
            .from("assignments")
            .select("*", { count: "exact", head: true })
            .eq("teacher_id", user.id),

          // Đếm tổng số bài nộp đã được AI chấm (ai_score không null) thuộc các bài tập của giáo viên này
          supabaseClient
            .from("submissions")
            .select("*, assignments!inner(*)", { count: "exact", head: true })
            .eq("assignments.teacher_id", user.id)
            .not("ai_score", "is", null),

          // Lấy danh sách lớp học hoạt động gần đây kèm theo đếm số học sinh và số bài tập bên trong
          supabaseClient
            .from("classrooms")
            .select(
              `
              id,
              name,
              grade,
              updated_at,
              classroom_students(count),
              assignments(count)
            `,
            )
            .eq("teacher_id", user.id)
            .order("updated_at", { ascending: false })
            .limit(4),

          // Lấy nhật ký chấm điểm AI gần đây nhất
          supabaseClient
            .from("submissions")
            .select(
              `
              id,
              ai_score,
              ai_feedback,
              updated_at,
              profiles:student_id(name),
              assignments:assignment_id(name, teacher_id)
            `,
            )
            .eq("assignments.teacher_id", user.id)
            .not("ai_score", "is", null)
            .order("updated_at", { ascending: false })
            .limit(5),
        ]);

        // 2. Cập nhật State cho các thẻ thống kê tổng quan
        setStats({
          classroomsCount: classroomsCountRes.count || 0,
          assignmentsCount: assignmentsCountRes.count || 0,
          gradedCount: gradedSubmissionsCountRes.count || 0,
        });

        // 3. Mapping dữ liệu lớp học gần đây
        if (classroomsDataRes.data) {
          const mappedClassrooms = classroomsDataRes.data.map((cls: any) => ({
            id: cls.id,
            name: cls.name,
            grade: cls.grade || "Khối chung",
            studentCount: cls.classroom_students?.[0]?.count || 0,
            activeAssignments: cls.assignments?.[0]?.count || 0,
          }));
          setRecentClassrooms(mappedClassrooms);
        }

        // 4. Mapping dữ liệu nhật ký chấm AI gần đây
        if (activitiesDataRes.data) {
          const mappedActivities = activitiesDataRes.data.map((sub: any) => ({
            studentName: sub.profiles?.name || "Học sinh ẩn danh",
            assignmentName: sub.assignments?.name || "Bài tập không tên",
            score:
              sub.ai_score !== undefined && sub.ai_score !== null
                ? `${sub.ai_score}/10`
                : "Chưa chấm",
            feedback: sub.ai_feedback || "Không có nhận xét tự động.",
          }));
          setRecentAIActivities(mappedActivities);
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
      {/* 🌟 ĐỒNG BỘ TÊN THẬT TỪ AUTH CONTEXT */}
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

      {/* 📊 CORE SYSTEM METRIC CARDS */}
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

      {/* 🚀 WORKSPACE CONTENT SECTION */}
      <div className="grid lg:grid-cols-3 gap-8 pt-2">
        {/* LEFT COLUMN: ACTIVE CLASSROOM WORKSPACES */}
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
                        <GraduationCap className="size-4.5" />
                      </div>
                      <Badge className="bg-slate-100 text-slate-500 font-bold text-[9px] rounded px-1.5 py-0">
                        {item.grade}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-slate-800 text-xs tracking-tight line-clamp-1 group-hover:text-indigo-600 transition-colors pt-1">
                      {item.name}
                    </h3>
                  </div>

                  <div className="border-t border-slate-50 pt-3 mt-4 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Users className="size-3 text-slate-400" />
                      {item.studentCount} Học viên
                    </span>
                    <span className="flex items-center gap-1 text-indigo-600 font-bold bg-indigo-50/50 px-1.5 py-0.5 rounded">
                      <Layers className="size-3" />
                      {item.activeAssignments} Bài tập
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: AI LOG & FEEDBACK TELEMETRY SCREENER */}
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
              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
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
                    <p className="text-slate-500 bg-slate-50 p-2 rounded-lg leading-relaxed italic border border-slate-100/50 text-[11px]">
                      "{activity.feedback}"
                    </p>
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

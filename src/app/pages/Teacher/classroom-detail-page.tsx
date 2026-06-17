// src/app/pages/Teacher/classroom-detail-screen.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  FolderPlus,
  FileSpreadsheet,
  Binary,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Search,
  Upload,
  Loader2,
  Calendar,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent } from "@/app/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { toast } from "sonner";
import { supabaseClient } from "@/app/services/supabaseClient";
import { useAuth } from "@/app/context/AuthContext";

export function ClassroomDetailScreen() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"classroom" | "assignments">(
    "classroom",
  );
  const [studentSearch, setStudentSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [classInfo, setClassInfo] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    const fetchClassroomData = async () => {
      if (!classId || !user) return;

      try {
        setLoading(true);
        
        // 1. Fetch Class Info
        const { data: classData, error: classError } = await supabaseClient
          .from('class')
          .select('*')
          .eq('class_id', classId)
          .single();

        if (classError) throw classError;
        setClassInfo(classData);

        // 2. Fetch Students in Class
        const { data: studentData, error: studentError } = await supabaseClient
          .from('class_student')
          .select(`
            student (
              student_id,
              student_code,
              full_name,
              email,
              created_at
            )
          `)
          .eq('class_id', classId);

        if (studentError) throw studentError;
        
        // Map to flat structure
        const formattedStudents = (studentData || []).map((item: any) => ({
          id: item.student.student_id,
          code: item.student.student_code,
          name: item.student.full_name,
          email: item.student.email,
          birthdate: null, // Schema doesn't have birthdate, using created_at as placeholder for UI if needed
          assignmentsCount: 0, // Would need another query or RPC for this
          averageScore: 0, // Would need another query or RPC for this
        }));
        setStudents(formattedStudents);

        // 3. Fetch Assignments (Exams)
        const { data: examData, error: examError } = await supabaseClient
          .from('exam')
          .select('*')
          .eq('class_id', classId)
          .order('created_at', { ascending: false });

        if (examError) throw examError;
        setAssignments(examData || []);

      } catch (error: any) {
        console.error("Error fetching classroom data:", error);
        toast.error("Không thể tải thông tin lớp học.");
      } finally {
        setLoading(false);
      }
    };

    fetchClassroomData();
  }, [classId, user]);

  const handleImportFileClick = () => {
    // Logic for importing stays as simulation for now or can be expanded later
    toast.info("Tính năng nhập từ Excel đang được phát triển.");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="size-8 text-indigo-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Đang tải dữ liệu lớp học...</p>
      </div>
    );
  }

  if (!classInfo) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-bold text-slate-800">Không tìm thấy lớp học</h2>
        <Button onClick={() => navigate("/classrooms")} className="mt-4">Quay lại danh sách</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/classrooms")}
            className="rounded-xl border border-slate-100 bg-white shadow-sm size-9"
          >
            <ArrowLeft className="size-4 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <GraduationCap className="size-5 text-indigo-600" />
              {classInfo.class_name}
            </h1>
            <p className="text-xs text-slate-500">
              Mã lớp: {classInfo.class_code || `#${classInfo.class_id.substring(0, 8)}`} • {classInfo.description}
            </p>
          </div>
        </div>

        {/* CONTROLS SWITCH BASED ON ACTIVE TAB */}
        <div>
          {activeTab === "classroom" ? (
            <Button
              onClick={handleImportFileClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 h-10 px-4 rounded-xl shadow-md"
            >
              <Upload className="size-4" />
              Nhập danh sách học sinh (Excel/CSV)
            </Button>
          ) : (
            <Button
              onClick={() =>
                navigate(`/classrooms/${classId}/assignments/create`)
              }
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 h-10 px-4 rounded-xl shadow-md"
            >
              <FolderPlus className="size-4" />
              Tạo bài tập mới
            </Button>
          )}
        </div>
      </div>

      {/* HORIZONTAL CENTERED TAB ROW CONTROLLER */}
      <div className="flex justify-center w-full">
        <div className="bg-slate-200/60 p-1 rounded-xl flex items-center gap-1 w-full max-w-sm shadow-inner border border-slate-200/20">
          <button
            onClick={() => setActiveTab("classroom")}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "classroom"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="size-3.5" />
            Danh sách lớp học
          </button>
          <button
            onClick={() => setActiveTab("assignments")}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "assignments"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileSpreadsheet className="size-3.5" />
            Bài tập & Đợt chấm
          </button>
        </div>
      </div>

      {/* RENDER VIEW BLOCKS */}
      {activeTab === "classroom" ? (
        <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardContent className="p-6 space-y-4">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
              <Input
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Tìm họ tên học sinh..."
                className="pl-9 h-9 text-xs rounded-lg border-slate-200"
              />
            </div>

            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50/75">
                  <TableRow>
                    <TableHead className="text-xs font-bold text-slate-500">
                      Mã Số HS
                    </TableHead>
                    <TableHead className="text-xs font-bold text-slate-500">
                      Họ và Tên
                    </TableHead>
                    <TableHead className="text-xs font-bold text-slate-500">
                      Email
                    </TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 text-center">
                      Ngày tham gia
                    </TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 text-right">
                      Điểm TB (Tạm tính)
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students
                    .filter((s) =>
                      s.name
                        .toLowerCase()
                        .includes(studentSearch.toLowerCase()),
                    )
                    .map((student) => (
                      <TableRow
                        key={student.id}
                        className="hover:bg-slate-50/40 text-xs"
                      >
                        <TableCell className="font-mono text-slate-400">
                          {student.code || student.id.substring(0, 8)}
                        </TableCell>
                        <TableCell className="font-bold text-slate-800">
                          {student.name}
                        </TableCell>
                        
                        <TableCell className="text-slate-500 font-medium">
                          {student.email || "---"}
                        </TableCell>

                        <TableCell className="text-center font-medium">
                          {student.created_at ? new Date(student.created_at).toLocaleDateString('vi-VN') : "--/--/----"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            className="bg-slate-50 text-slate-400 font-black text-xs px-2 py-0.5 rounded shadow-none border-0"
                          >
                            --
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              {students.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Chưa có học sinh nào trong lớp này.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.exam_id}
              onClick={() =>
                navigate(`/classrooms/${classId}/assignments/${assignment.exam_id}`)
              }
              className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group flex flex-col justify-between min-h-[150px]"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
                    <FileSpreadsheet className="size-4.5" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <Calendar className="size-3" />
                    {new Date(assignment.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 text-xs tracking-tight line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {assignment.exam_name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Binary className="size-3 text-slate-400 shrink-0" />
                    <span className="text-[10px] text-slate-500 truncate font-medium">
                      Điểm tối đa: {assignment.max_score}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-50 pt-3 mt-4 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-medium">
                  {assignment.exam_date ? `Ngày thi: ${new Date(assignment.exam_date).toLocaleDateString('vi-VN')}` : "Chưa đặt ngày thi"}
                </span>
                <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                  Chi tiết <ArrowRight className="size-2.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          ))}
          {assignments.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
              <p className="text-xs text-slate-400">Chưa có bài tập nào được tạo cho lớp này.</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 text-xs font-bold"
                onClick={() => navigate(`/classrooms/${classId}/assignments/create`)}
              >
                Tạo bài tập đầu tiên
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
// src/app/pages/Teacher/classroom-detail-screen.tsx
import { useState } from "react";
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

const MOCK_STUDENTS = [
  {
    id: "STU-001",
    name: "Nguyễn Văn An",
    birthdate: "14/03/2010",
    assignmentsCount: 4,
    averageScore: 8.2,
  },
  {
    id: "STU-002",
    name: "Lê Hoàng Minh",
    birthdate: "22/11/2010",
    assignmentsCount: 4,
    averageScore: 6.8,
  },
  {
    id: "STU-003",
    name: "Trần Thị Hồng",
    birthdate: "05/08/2010",
    assignmentsCount: 3,
    averageScore: 9.0,
  },
  {
    id: "STU-004",
    name: "Phạm Minh Đức",
    birthdate: "19/02/2010",
    assignmentsCount: 4,
    averageScore: 7.4,
  },
];

const MOCK_ASSIGNMENTS = [
  {
    id: "a-1",
    name: "Kiểm tra Tập hợp & Bất phương trình bậc nhất",
    rubricName: "Barem ma trận Đại Số Khối 10 Chuẩn",
    totalSubmissions: 35,
    gradedCount: 35,
    dateCreated: "12/05/2026",
  },
  {
    id: "a-2",
    name: "Bài tập rèn luyện Hình học Không gian tiết 12",
    rubricName: "Hệ thức lượng trong tam giác V2",
    totalSubmissions: 35,
    gradedCount: 31,
    dateCreated: "02/06/2026",
  },
];

export function ClassroomDetailScreen() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"classroom" | "assignments">(
    "classroom",
  );
  const [studentSearch, setStudentSearch] = useState("");
  const [students, setStudents] = useState(MOCK_STUDENTS);

  const handleImportFileClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv, .xlsx, .xls";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        toast.success(
          `Đã đọc tệp "${file.name}". Đồng bộ danh sách học sinh thành công!`,
        );
        const batchStudent = {
          id: `STU-00${students.length + 1}`,
          name: "Đặng Hoàng Việt (Imported)",
          birthdate: "01/01/2010",
          assignmentsCount: 0,
          averageScore: 0.0,
        };
        setStudents([...students, batchStudent]);
      }
    };
    input.click();
  };

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
              Lớp 10 L1 — Không gian học tập
            </h1>
            <p className="text-xs text-slate-500">
              Mã lớp: #{classId || "CLASS-10L1"}
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
                      Ngày sinh
                    </TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 text-center">
                      Đợt kiểm tra
                    </TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 text-right">
                      Điểm trung bình
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
                          {student.id}
                        </TableCell>
                        <TableCell className="font-bold text-slate-800">
                          {student.name}
                        </TableCell>
                        
                        {/* Rendered Birthdate column completely active now */}
                        <TableCell className="text-slate-500 font-medium">
                          {student.birthdate || "--/--/----"}
                        </TableCell>

                        <TableCell className="text-center font-medium">
                          {student.assignmentsCount} bài làm
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            className={`${
                              student.averageScore >= 8.0
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                                : "bg-amber-50 text-amber-700 hover:bg-amber-50"
                            } font-black text-xs px-2 py-0.5 rounded shadow-none border-0`}
                          >
                            {student.averageScore > 0
                              ? student.averageScore.toFixed(1)
                              : "--"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {MOCK_ASSIGNMENTS.map((assignment) => (
            <div
              key={assignment.id}
              onClick={() =>
                navigate(`/classrooms/${classId}/assignments/${assignment.id}`)
              }
              className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group flex flex-col justify-between min-h-[150px]"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
                    <FileSpreadsheet className="size-4.5" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Khởi tạo: {assignment.dateCreated}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 text-xs tracking-tight line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {assignment.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Binary className="size-3 text-slate-400 shrink-0" />
                    <span className="text-[10px] text-slate-500 truncate font-medium">
                      Đề thi & Đáp án: {assignment.rubricName}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-50 pt-3 mt-4 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-medium">
                  Số bài đã nộp: {assignment.totalSubmissions}
                </span>
                <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Sparkles className="size-2.5" /> Hoàn tất (
                  {assignment.gradedCount}/{assignment.totalSubmissions})
                  <ArrowRight className="size-2.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
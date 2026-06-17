// src/app/pages/Teacher/classroom-detail-screen.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  User,
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
  UserPlus,
  FileText
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { toast } from "sonner";
import { supabaseClient } from "@/app/services/supabaseClient";
import { useAuth } from "@/app/context/AuthContext";

export function ClassroomDetailScreen() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"classroom" | "assignments">("classroom");
  const [studentSearch, setStudentSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [classInfo, setClassInfo] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  // Add Student State
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [addMode, setAddMode] = useState<"manual" | "file">("manual");
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const fetchClassroomData = async () => {
    if (!classId || !user) return;

    try {
      setLoading(true);
      
      const { data: classData, error: classError } = await supabaseClient
        .from('class')
        .select('*')
        .eq('class_id', classId)
        .single();

      if (classError) throw classError;
      setClassInfo(classData);

      const { data: studentData, error: studentError } = await supabaseClient
        .from('class_student')
        .select(`
          joined_at,
          student (
            student_id,
            student_code,
            full_name,
            email
          )
        `)
        .eq('class_id', classId);

      if (studentError) throw studentError;
      
      const formattedStudents = (studentData || []).map((item: any) => {
        // Defensive mapping: Ensure student object exists before accessing properties
        const stu = item.student || {};
        return {
          id: stu.student_id || `temp-${Math.random()}`,
          code: stu.student_code || "",
          name: stu.full_name || "Học sinh ẩn danh",
          email: stu.email || "",
          joined_at: item.joined_at || null,
        };
      });
      setStudents(formattedStudents);

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

  useEffect(() => {
    fetchClassroomData();
  }, [classId, user]);

  const handleAddStudentManual = async () => {
    if (!newStudentName.trim()) {
      toast.error("Vui lòng nhập tên học sinh!");
      return;
    }

    setIsAdding(true);
    try {
      console.log("Adding student:", newStudentName, newStudentEmail);
      
      // 1. Create student in 'student' table
      const studentCode = `STU${Date.now().toString().slice(-6)}`;
      const { data: studentDataArray, error: studentError } = await supabaseClient
        .from('student')
        .insert({
          full_name: newStudentName,
          email: newStudentEmail || null,
          student_code: studentCode,
          created_at: new Date().toISOString()
        })
        .select();

      if (studentError) {
        console.error("Error inserting student:", studentError);
        toast.error("Lỗi khi tạo hồ sơ học sinh: " + studentError.message);
        return;
      }

      if (!studentDataArray || studentDataArray.length === 0) {
        console.error("Insert succeeded but no data returned. RLS might be blocking SELECT after INSERT.");
        toast.error("Tạo thành công nhưng không thể lấy lại thông tin.");
        return;
      }

      const newStudentId = studentDataArray[0].student_id;
      console.log("Student created with ID:", newStudentId);

      // 2. Link student to class in 'class_student' table
      const joinedAt = new Date().toISOString();
      const { error: linkError } = await supabaseClient
        .from('class_student')
        .insert({
          class_id: classId,
          student_id: newStudentId,
          joined_at: joinedAt
        });

      if (linkError) {
        console.error("Error linking student to class:", linkError);
        toast.error("Lỗi khi thêm học sinh vào lớp: " + linkError.message);
        return;
      }

      toast.success("Đã thêm học sinh thành công!");
      setNewStudentName("");
      setNewStudentEmail("");
      setIsAddStudentOpen(false);
      
      // Force UI update securely
      await fetchClassroomData();

    } catch (error: any) {
      console.error("CRITICAL ERROR in handleAddStudentManual:", error);
      toast.error(`Có lỗi hệ thống: ${error.message || "Vui lòng thử lại"}`);
    } finally {
      setIsAdding(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAdding(true);
    try {
      const text = await file.text();
      // Simple CSV parsing assuming format: Name,Email
      const rows = text.split('\n').filter(row => row.trim());
      
      const newStudents = rows.map((row, index) => {
        // Skip header if it exists (basic check)
        if (index === 0 && row.toLowerCase().includes('tên')) return null;
        
        const [name, email] = row.split(',').map(s => s.trim());
        if (!name) return null;
        
        return {
          full_name: name,
          email: email || null,
          student_code: `STU${Date.now().toString().slice(-6)}${index}`,
          created_at: new Date().toISOString()
        };
      }).filter(Boolean);

      if (newStudents.length === 0) {
        toast.error("Không tìm thấy dữ liệu học sinh hợp lệ trong file.");
        setIsAdding(false);
        return;
      }

      // Insert all students
      const { data: insertedStudents, error: insertError } = await supabaseClient
        .from('student')
        .insert(newStudents as any)
        .select();

      if (insertError) throw insertError;

      // Link them to the class
      if (insertedStudents) {
        const links = insertedStudents.map(stu => ({
          class_id: classId,
          student_id: stu.student_id,
          joined_at: new Date().toISOString()
        }));

        const { error: linkError } = await supabaseClient
          .from('class_student')
          .insert(links);

        if (linkError) throw linkError;
      }

      toast.success(`Đã nhập thành công ${newStudents.length} học sinh!`);
      setIsAddStudentOpen(false);
      fetchClassroomData();

    } catch (error: any) {
      console.error("Lỗi khi xử lý file:", error);
      toast.error("Lỗi khi đọc file. Đảm bảo file là định dạng CSV (Tên, Email).");
    } finally {
      setIsAdding(false);
      if (e.target) e.target.value = ''; // Reset input
    }
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
              onClick={() => setIsAddStudentOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 h-10 px-4 rounded-xl shadow-md"
            >
              <UserPlus className="size-4" />
              Thêm học sinh
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
            <div className="flex items-center justify-between">
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                <Input
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Tìm họ tên học sinh..."
                  className="pl-9 h-9 text-xs rounded-lg border-slate-200"
                />
              </div>
              <Badge className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1">
                Sĩ số: {students.length}
              </Badge>
            </div>

            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50/75">
                  <TableRow>
                    <TableHead className="text-xs font-bold text-slate-500 w-[20%]">
                      Mã học sinh
                    </TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 w-[35%]">
                      Họ và Tên
                    </TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 w-[25%]">
                      Email
                    </TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 text-right w-[20%]">
                      Ngày tham gia
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
                        <TableCell className="font-mono text-slate-400 font-medium">
                          {student.code || "---"}
                        </TableCell>
                        <TableCell className="font-bold text-slate-800 flex items-center gap-2">
                           <div className="size-6 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                             <User className="size-3" />
                           </div>
                          {student.name}
                        </TableCell>
                        <TableCell className="text-slate-500 font-medium">
                          {student.email || "---"}
                        </TableCell>
                        <TableCell className="text-right font-medium text-slate-500">
                          {student.joined_at ? new Date(student.joined_at).toLocaleDateString('vi-VN') : "--/--/----"}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              {students.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-xs flex flex-col items-center">
                  <Users className="size-8 text-slate-200 mb-2" />
                  <p>Chưa có học sinh nào trong lớp này.</p>
                  <Button variant="link" onClick={() => setIsAddStudentOpen(true)} className="text-indigo-600 font-bold mt-1 text-xs">
                    Thêm học sinh ngay
                  </Button>
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

      {/* DIALOG ADD STUDENT */}
      <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
        <DialogContent className="rounded-2xl max-w-md p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="size-5 text-indigo-600" />
              Thêm học sinh mới
            </DialogTitle>
          </DialogHeader>

          <div className="flex border-b border-slate-100 mb-4">
            <button
              className={`flex-1 pb-2 text-xs font-bold border-b-2 transition-colors ${addMode === 'manual' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              onClick={() => setAddMode('manual')}
            >
              Nhập thủ công
            </button>
            <button
              className={`flex-1 pb-2 text-xs font-bold border-b-2 transition-colors ${addMode === 'file' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              onClick={() => setAddMode('file')}
            >
              Nhập từ file (CSV)
            </button>
          </div>

          <div className="space-y-4 py-2">
            {addMode === "manual" ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Họ và tên</label>
                  <Input 
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="VD: Nguyễn Văn A"
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Email (Không bắt buộc)</label>
                  <Input 
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    placeholder="VD: nguyenvana@gmail.com"
                    type="email"
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
              </>
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                <FileText className="size-8 text-slate-300 mb-3" />
                <h4 className="text-xs font-bold text-slate-800 mb-1">Tải lên file danh sách</h4>
                <p className="text-[10px] text-slate-500 mb-4">File định dạng .CSV. Cấu trúc cột: Tên học sinh, Email</p>
                <div className="relative">
                  <Input 
                    type="file" 
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" className="text-xs h-9 pointer-events-none">
                    {isAdding ? <Loader2 className="size-4 animate-spin mr-2" /> : "Chọn file CSV"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-2 border-t border-slate-50 pt-4">
            <Button variant="ghost" onClick={() => setIsAddStudentOpen(false)} className="text-xs font-bold h-9">Hủy</Button>
            {addMode === "manual" && (
              <Button onClick={handleAddStudentManual} disabled={isAdding} className="bg-indigo-600 text-white font-bold text-xs h-9">
                {isAdding ? <Loader2 className="size-4 animate-spin mr-1" /> : "Xác nhận thêm"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
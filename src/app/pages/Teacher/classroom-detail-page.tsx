// src/app/pages/Teacher/classroom-detail-screen.tsx
import { useState, useEffect, useRef } from "react";
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
  FileText,
  Wand2,
  CheckCircle2,
  AlertTriangle
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
import { documentEndpoints, gradingEndpoints, queueEndpoints } from "@/app/api/endpoints";

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

  // Bulk Grading State
  const [isBulkGradingOpen, setIsBulkGradingOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [bulkGradingStatus, setBulkGradingStatus] = useState<"idle" | "grading" | "success" | "error">("idle");
  const [bulkGradingProgress, setBulkGradingProgress] = useState({ total: 0, current: 0 });
  const [bulkGradingMessage, setBulkGradingMessage] = useState("");
  const [bulkSubmissions, setBulkSubmissions] = useState<any[]>([]);
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<string[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const [elapsedTime, setElapsedTime] = useState(0);

  const isBulkGradingOpenRef = useRef(isBulkGradingOpen);
  useEffect(() => {
    isBulkGradingOpenRef.current = isBulkGradingOpen;
  }, [isBulkGradingOpen]);

  useEffect(() => {
    let timerInterval: any = null;
    if (bulkGradingStatus === "grading") {
      setElapsedTime(0);
      timerInterval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [bulkGradingStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchBulkSubmissions = async (assignmentId: string) => {
    try {
      setLoadingSubmissions(true);
      const { data, error } = await supabaseClient
        .from('exam_result')
        .select('*')
        .eq('exam_id', assignmentId)
        .not('signed_url', 'is', null);

      if (error) throw error;

      const formatted = (data || []).map(r => {
        const studentInfo = students.find(s => s.id === r.student_id);
        let isGraded = false;
        try {
          const feedbackObj = typeof r.feedback === 'string' ? JSON.parse(r.feedback || '{}') : (r.feedback || {});
          isGraded = feedbackObj?.status === "graded";
        } catch {
          isGraded = false;
        }
        return {
          ...r,
          studentName: studentInfo?.name || "Học sinh ẩn danh",
          studentCode: studentInfo?.code || "---",
          isGraded,
        };
      });

      setBulkSubmissions(formatted);
      setSelectedSubmissionIds(formatted.map(f => f.exam_result_id));
    } catch (err) {
      console.error("Error loading submissions:", err);
      toast.error("Không thể tải danh sách bài nộp của học sinh.");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleOpenChangeBulkGrading = (open: boolean) => {
    if (bulkGradingStatus === "grading") {
      return;
    }
    setIsBulkGradingOpen(open);
    if (!open) {
      localStorage.removeItem("scorify_bulk_grading_state");
    }
  };

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

  const getRubricPathFromUrl = (url: string | null) => {
    if (!url) return null;
    if (url.includes('Scorify_rubrics/')) {
      return decodeURIComponent(url.split('Scorify_rubrics/')[1]);
    }
    return url;
  };

  const getSubmissionPathFromSignedUrl = (signedUrl: string) => {
    try {
      const { pathname } = new URL(signedUrl);
      const marker = '/object/sign/Scorify_storagedev/';
      const markerIndex = pathname.indexOf(marker);

      if (markerIndex === -1) return null;

      return decodeURIComponent(pathname.slice(markerIndex + marker.length));
    } catch {
      return null;
    }
  };

  const handleOpenBulkGrading = (e: React.MouseEvent, assignment: any) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedAssignment(assignment);
    setIsBulkGradingOpen(true);
    setBulkGradingStatus("idle");
    setBulkGradingMessage("");
    setBulkGradingProgress({ total: 0, current: 0 });
    setSelectedSubmissionIds([]);
    setBulkSubmissions([]);
    fetchBulkSubmissions(assignment.exam_id);
  };

  const pollTask = async (taskFn: () => Promise<any>) => {
    while (true) {
      try {
        return await taskFn();
      } catch (err: any) {
        if (err.response?.status === 401) {
          throw new Error("Định dạng file không hợp lệ.");
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  };

  const handleStartBulkGrading = async (
    assignmentToGrade = selectedAssignment,
    submissionIdsToGrade = selectedSubmissionIds
  ) => {
    if (!assignmentToGrade) return;
    const targetIds = submissionIdsToGrade.length > 0 ? submissionIdsToGrade : selectedSubmissionIds;
    if (targetIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một học sinh để chấm!");
      return;
    }

    setBulkGradingStatus("grading");
    setBulkGradingMessage("Đang lấy danh sách bài làm cần chấm...");

    // Store initial grading state
    localStorage.setItem("scorify_bulk_grading_state", JSON.stringify({
      classId,
      assignment: assignmentToGrade,
      status: "grading",
      progress: { total: 0, current: 0 },
      message: "Đang lấy danh sách bài làm cần chấm...",
      selectedSubmissionIds: targetIds
    }));

    try {
      const { data: resultsData, error: resultsError } = await supabaseClient
        .from('exam_result')
        .select('*')
        .eq('exam_id', assignmentToGrade.exam_id)
        .not('signed_url', 'is', null);

      if (resultsError) throw resultsError;

      const submissionsToGrade = resultsData?.filter(r => targetIds.includes(r.exam_result_id)) || [];

      if (submissionsToGrade.length === 0) {
        setBulkGradingStatus("success");
        setBulkGradingMessage("Không có bài làm nào được chọn để chấm!");
        localStorage.setItem("scorify_bulk_grading_state", JSON.stringify({
          classId,
          assignment: assignmentToGrade,
          status: "success",
          progress: { total: 0, current: 0 },
          message: "Không có bài làm nào được chọn để chấm!"
        }));
        return;
      }

      setBulkGradingProgress({ total: submissionsToGrade.length, current: 0 });
      setBulkGradingMessage("Đang chuẩn bị Rubric và Đề thi...");
      localStorage.setItem("scorify_bulk_grading_state", JSON.stringify({
        classId,
        assignment: assignmentToGrade,
        status: "grading",
        progress: { total: submissionsToGrade.length, current: 0 },
        message: "Đang chuẩn bị Rubric và Đề thi...",
        selectedSubmissionIds: targetIds
      }));

      let rubricPath: string | null = null;
      let examPath: string | null = null;
      try {
        const meta = JSON.parse(assignmentToGrade.description);
        rubricPath = getRubricPathFromUrl(meta.rubricUrl || null);
        examPath = getRubricPathFromUrl(meta.examUrl || null);
      } catch {}

      if (!rubricPath || !examPath) {
        throw new Error("Không tìm thấy Rubric hoặc Đề bài");
      }

      const { data: rubricSignedData } = await supabaseClient.storage.from('Scorify_rubrics').createSignedUrl(rubricPath, 3600);
      const { data: examSignedData } = await supabaseClient.storage.from('Scorify_rubrics').createSignedUrl(examPath, 3600);
      
      if (!rubricSignedData?.signedUrl || !examSignedData?.signedUrl) {
        throw new Error("Lỗi lấy signed url cho rubric/đề");
      }

      const rubricRes = await fetch(rubricSignedData.signedUrl);
      const rubricBlob = await rubricRes.blob();
      const rubricFile = new File([rubricBlob], 'rubric.pdf', { type: rubricBlob.type });

      const examRes = await fetch(examSignedData.signedUrl);
      const examBlob = await examRes.blob();
      const examFile = new File([examBlob], 'exam.pdf', { type: examBlob.type });

      setBulkGradingMessage("Bắt đầu chấm AI...");
      localStorage.setItem("scorify_bulk_grading_state", JSON.stringify({
        classId,
        assignment: assignmentToGrade,
        status: "grading",
        progress: { total: submissionsToGrade.length, current: 0 },
        message: "Bắt đầu chấm AI...",
        selectedSubmissionIds: targetIds
      }));
      let completedCount = 0;
      
      const getStudentName = (stuId: string) => {
        return students.find(s => s.id === stuId)?.name || "Học sinh ẩn danh";
      };

      const processSubmission = async (submission: any) => {
        const studentName = getStudentName(submission.student_id);
        try {
          setBulkGradingMessage(`Đang tải bài làm của ${studentName}...`);
          let signedUrl = submission.signed_url;
          const filePath = getSubmissionPathFromSignedUrl(signedUrl);
          if (filePath) {
            const { data } = await supabaseClient.storage.from('Scorify_storagedev').createSignedUrl(filePath, 3600);
            if (data?.signedUrl) signedUrl = data.signedUrl;
          }

          const response = await fetch(signedUrl);
          const blob = await response.blob();
          const fileExt = blob.type.split('/')[1] || 'jpg';
          const imageFile = new File([blob], `sub_${submission.student_id}.${fileExt}`, { type: blob.type });

          setBulkGradingMessage(`Đang phân tích bố cục bài làm của ${studentName}...`);
          const detectQueueRes = await queueEndpoints.registerQueue();
          const detectTaskId = detectQueueRes.data.task_id;
          const detectResponse = await pollTask(() => documentEndpoints.detectLayout(detectTaskId, imageFile));
          const documentJsonStr = JSON.stringify(detectResponse);

          setBulkGradingMessage(`Đang chấm điểm bài làm của ${studentName}...`);
          const gradingQueueRes = await queueEndpoints.registerQueue();
          const gradingTaskId = gradingQueueRes.data.task_id;
          const gradingResponse = await pollTask(() => gradingEndpoints.gradeByRubric(gradingTaskId, examFile, rubricFile, documentJsonStr));

          const newLines = gradingResponse.document_lines || [];
          const totalScore = newLines.reduce((sum: number, line: any) => sum + (line.score || 0), 0);
          
          const currentFeedbackObj = typeof submission.feedback === 'string' ? JSON.parse(submission.feedback || '{}') : (submission.feedback || {});
          const combinedFeedback = {
            ...currentFeedbackObj,
            document_lines: newLines,
            generalComment: "Đã chấm điểm hoàn tất bằng AI.",
            status: "graded"
          };

          await supabaseClient.from('exam_result').update({
            score: totalScore,
            feedback: JSON.stringify(combinedFeedback),
            graded_at: new Date().toISOString(),
            signed_url: signedUrl
          }).eq('exam_result_id', submission.exam_result_id);

        } catch (e) {
          console.error("Lỗi chấm submission", submission.exam_result_id, e);
        } finally {
          completedCount++;
          setBulkGradingProgress(prev => {
            const next = { ...prev, current: completedCount };
            localStorage.setItem("scorify_bulk_grading_state", JSON.stringify({
              classId,
              assignment: assignmentToGrade,
              status: "grading",
              progress: next,
              message: `Đang xử lý bài tiếp theo...`,
              selectedSubmissionIds: targetIds
            }));
            return next;
          });
        }
      };

      const concurrency = 5;
      const executing = new Set<Promise<any>>();
      for (const sub of submissionsToGrade) {
        if (!isBulkGradingOpenRef.current) break; // check ref to stop if closed
        const p = Promise.resolve().then(() => processSubmission(sub));
        executing.add(p);
        const clean = () => executing.delete(p);
        p.then(clean).catch(clean);
        if (executing.size >= concurrency) {
          await Promise.race(executing);
        }
      }
      await Promise.all(executing);

      setBulkGradingStatus("success");
      setBulkGradingMessage("Đã chấm xong hàng loạt!");
      localStorage.setItem("scorify_bulk_grading_state", JSON.stringify({
        classId,
        assignment: assignmentToGrade,
        status: "success",
        progress: { total: submissionsToGrade.length, current: submissionsToGrade.length },
        message: "Đã chấm xong hàng loạt!",
        selectedSubmissionIds: targetIds
      }));

    } catch (err: any) {
      console.error(err);
      setBulkGradingStatus("error");
      setBulkGradingMessage("Lỗi: " + err.message);
      localStorage.setItem("scorify_bulk_grading_state", JSON.stringify({
        classId,
        assignment: assignmentToGrade,
        status: "error",
        progress: bulkGradingProgress,
        message: "Lỗi: " + err.message,
        selectedSubmissionIds: targetIds
      }));
    }
  };

  // Resume bulk grading if page reload occurs during grading
  useEffect(() => {
    if (!loading && classId) {
      const savedStateStr = localStorage.getItem("scorify_bulk_grading_state");
      if (savedStateStr) {
        try {
          const savedState = JSON.parse(savedStateStr);
          if (savedState.classId === classId && savedState.assignment) {
            setSelectedAssignment(savedState.assignment);
            setIsBulkGradingOpen(true);
            setBulkGradingStatus(savedState.status);
            setBulkGradingProgress(savedState.progress || { total: 0, current: 0 });
            setBulkGradingMessage(savedState.message || "");
            
            if (savedState.selectedSubmissionIds) {
              setSelectedSubmissionIds(savedState.selectedSubmissionIds);
            }
            
            if (savedState.status === "grading") {
              handleStartBulkGrading(savedState.assignment, savedState.selectedSubmissionIds || []);
            }
          }
        } catch (e) {
          console.error("Error parsing saved bulk grading state:", e);
          localStorage.removeItem("scorify_bulk_grading_state");
        }
      }
    }
  }, [loading, classId]);

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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleOpenBulkGrading(e, assignment)}
                  className="h-7 text-[10px] font-bold text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 rounded-md px-2 flex items-center gap-1.5"
                >
                  <Wand2 className="size-3" />
                  Chấm hàng loạt
                </Button>
                <div className="flex items-center gap-2 text-slate-400 font-medium">
                  <span className="bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    Chi tiết <ArrowRight className="size-2.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
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

      {/* DIALOG BULK GRADING */}
      <Dialog open={isBulkGradingOpen} onOpenChange={handleOpenChangeBulkGrading}>
        <DialogContent className="rounded-2xl max-w-md p-6 bg-white max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Wand2 className="size-5 text-indigo-600" />
              Chấm bài hàng loạt
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4 flex-1 overflow-y-auto min-h-0">
            <h3 className="text-sm font-bold text-slate-800 text-center">{selectedAssignment?.exam_name}</h3>
            
            {bulkGradingStatus === "idle" && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 text-center">
                  Chọn học sinh bạn muốn thực hiện chấm bài (chỉ hiển thị những học sinh đã tải lên bài làm).
                </p>

                {loadingSubmissions ? (
                  <div className="flex flex-col items-center justify-center py-6 space-y-2">
                    <Loader2 className="size-6 text-indigo-600 animate-spin" />
                    <p className="text-[10px] text-slate-400 font-medium">Đang tải danh sách bài nộp...</p>
                  </div>
                ) : bulkSubmissions.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    Không có học sinh nào đã tải lên bài làm cho bài tập này.
                  </div>
                ) : (
                  <div className="space-y-3">
                     <div className="flex flex-col gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Lựa chọn nhanh:</span>
                        <span className="text-[10px] text-slate-400 font-medium font-mono">
                          Đã chọn: {selectedSubmissionIds.length} / {bulkSubmissions.length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => setSelectedSubmissionIds(bulkSubmissions.map(s => s.exam_result_id))}
                          className="h-7 text-[10px] px-2.5 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                        >
                          Chọn tất cả
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => setSelectedSubmissionIds(bulkSubmissions.filter(s => s.isGraded).map(s => s.exam_result_id))}
                          className="h-7 text-[10px] px-2.5 rounded-lg border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-bold"
                        >
                          Chấm xong
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => setSelectedSubmissionIds(bulkSubmissions.filter(s => !s.isGraded).map(s => s.exam_result_id))}
                          className="h-7 text-[10px] px-2.5 rounded-lg border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 font-bold"
                        >
                          Chưa chấm
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={() => setSelectedSubmissionIds([])}
                          className="h-7 text-[10px] px-2 text-rose-600 hover:bg-rose-50 font-bold ml-auto"
                        >
                          Bỏ chọn
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                      {bulkSubmissions.map((sub) => (
                        <label
                          key={sub.exam_result_id}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50/50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 size-3.5"
                              checked={selectedSubmissionIds.includes(sub.exam_result_id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSubmissionIds(prev => [...prev, sub.exam_result_id]);
                                } else {
                                  setSelectedSubmissionIds(prev => prev.filter(id => id !== sub.exam_result_id));
                                }
                              }}
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-800 leading-none">{sub.studentName}</p>
                              <span className="text-[10px] text-slate-400 font-mono mt-1 inline-block">Mã HS: {sub.studentCode}</span>
                            </div>
                          </div>

                          <div>
                            {sub.isGraded ? (
                              <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100 border text-[9px] font-bold">
                                Đã chấm
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-100 border text-[9px] font-bold">
                                Chưa chấm
                              </Badge>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {bulkGradingStatus === "grading" && (
              <div className="space-y-4 py-4 text-center">
                <Loader2 className="size-8 text-indigo-600 animate-spin mx-auto" />
                <div className="flex flex-col items-center gap-1">
                  <p className="text-xs font-bold text-indigo-600">{bulkGradingMessage}</p>
                  <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-1">
                    <Clock className="size-3" /> Thời gian đã trôi qua: {formatTime(elapsedTime)}
                  </p>
                </div>
                {bulkGradingProgress.total > 0 && (
                  <div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 mb-1 overflow-hidden">
                      <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${(bulkGradingProgress.current / bulkGradingProgress.total) * 100}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-400">{bulkGradingProgress.current} / {bulkGradingProgress.total} bài</p>
                  </div>
                )}
              </div>
            )}

            {bulkGradingStatus === "success" && (
              <div className="space-y-2 py-4 text-center">
                <CheckCircle2 className="size-10 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-emerald-600">{bulkGradingMessage}</p>
                <p className="text-[10px] text-slate-400 font-mono">Tổng thời gian: {formatTime(elapsedTime)}</p>
              </div>
            )}

            {bulkGradingStatus === "error" && (
              <div className="space-y-2 py-4 text-center">
                <AlertTriangle className="size-10 text-red-500 mx-auto" />
                <p className="text-xs text-red-600">{bulkGradingMessage}</p>
                <p className="text-[10px] text-slate-400 font-mono">Đã chạy được: {formatTime(elapsedTime)} trước khi lỗi</p>
              </div>
            )}
          </div>
          <DialogFooter className="mt-4 border-t border-slate-50 pt-4 flex sm:justify-end gap-2">
            <Button variant="ghost" onClick={() => handleOpenChangeBulkGrading(false)} className="text-xs font-bold h-9" disabled={bulkGradingStatus === "grading"}>
              Đóng
            </Button>
            {bulkGradingStatus === "idle" && (
              <Button
                onClick={() => handleStartBulkGrading()}
                disabled={bulkSubmissions.length === 0 || selectedSubmissionIds.length === 0 || loadingSubmissions}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 disabled:opacity-50"
              >
                Bắt đầu chấm
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
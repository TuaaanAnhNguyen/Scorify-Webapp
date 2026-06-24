// src/app/pages/Teacher/assignment-detail-page.tsx

import * as React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  FileText, 
  FileCheck, 
  User, 
  Download,
  ExternalLink,
  GraduationCap,
  Clock,
  CheckCircle2,
  Calendar,
  Loader2,
  Eye,
  Maximize2,
  UploadCloud,
  Camera,
  Layers,
  MoreVertical,
  X,
  Trash2,
  Wand2,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { supabaseClient } from "@/app/services/supabaseClient";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";
import { documentEndpoints, gradingEndpoints, queueEndpoints } from "@/app/api/endpoints";

export function AssignmentDetailPage() {
  const { classId, id: examId } = useParams<{ classId: string; id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [exam, setExam] = React.useState<any>(null);
  const [students, setStudents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  // PDF Viewer State
  const [viewerUrl, setViewerUrl] = React.useState<string | null>(null);
  const [viewerTitle, setViewerTitle] = React.useState("");
  const [isGeneratingUrl, setIsGeneratingUrl] = React.useState(false);

  // Individual Upload State
  const individualUploadRef = React.useRef<HTMLInputElement>(null);
  const [targetStudentId, setTargetStudentId] = React.useState<string | null>(null);

  // Bulk Grading State
  const [isBulkGradingOpen, setIsBulkGradingOpen] = React.useState(false);
  const [bulkGradingStatus, setBulkGradingStatus] = React.useState<"idle" | "grading" | "success" | "error">("idle");
  const [bulkGradingProgress, setBulkGradingProgress] = React.useState({ total: 0, current: 0 });
  const [bulkGradingMessage, setBulkGradingMessage] = React.useState("");
  const [bulkSubmissions, setBulkSubmissions] = React.useState<any[]>([]);
  const [selectedSubmissionIds, setSelectedSubmissionIds] = React.useState<string[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = React.useState(false);

  const [elapsedTime, setElapsedTime] = React.useState(0);

  // Delete Submission Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [studentToDelete, setStudentToDelete] = React.useState<{ id: string; name: string } | null>(null);

  React.useEffect(() => {
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
        const studentInfo = students.find(s => s.student_id === r.student_id);
        let isGraded = false;
        try {
          const feedbackObj = typeof r.feedback === 'string' ? JSON.parse(r.feedback || '{}') : (r.feedback || {});
          isGraded = feedbackObj?.status === "graded";
        } catch {
          isGraded = false;
        }
        return {
          ...r,
          studentName: studentInfo?.full_name || "Học sinh ẩn danh",
          studentCode: studentInfo?.student_code || "---",
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

  React.useEffect(() => {
    const fetchData = async () => {
      if (!examId || !classId || !user) return;

      try {
        setLoading(true);
        
        // 1. Fetch Exam Info
        const { data: examData, error: examError } = await supabaseClient
          .from('exam')
          .select('*, class(class_name, description)')
          .eq('exam_id', examId)
          .maybeSingle();

        if (examError) throw examError;
        
        if (examData) {
          let urls = { examPath: null, rubricPath: null };
          try {
            if (examData.description) {
              const meta = JSON.parse(examData.description);
              const getPathFromUrl = (url: string | null) => {
                if (!url) return null;
                if (url.includes('Scorify_rubrics/')) return url.split('Scorify_rubrics/')[1];
                return url;
              };
              urls.examPath = getPathFromUrl(meta.examUrl);
              urls.rubricPath = getPathFromUrl(meta.rubricUrl);
            }
          } catch (e) {
            console.warn("Could not parse exam description JSON:", e);
          }
          setExam({ ...examData, ...urls });
        }

        await refreshStudentData();

      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast.error("Không thể tải thông tin bài tập.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [examId, classId, user]);

  const refreshStudentData = async () => {
    // Fetch ALL students in class and their results for this exam
    const { data: classStudents, error: studentError } = await supabaseClient
      .from('class_student')
      .select(`
        student (
          student_id,
          student_code,
          full_name
        )
      `)
      .eq('class_id', classId);

    if (studentError) throw studentError;

    const { data: examResults, error: resultError } = await supabaseClient
      .from('exam_result')
      .select('*')
      .eq('exam_id', examId);

    if (resultError) throw resultError;

    // Merge student info with results
    const mergedStudents = (classStudents || []).map((cs: any) => {
      const result = examResults?.find(r => r.student_id === cs.student.student_id);
      return {
        ...cs.student,
        result: result || null
      };
    });

    setStudents(mergedStudents);
  }

  const openViewer = async (filePath: string | null, title: string) => {
    if (!filePath) {
      toast.error("Không tìm thấy đường dẫn tệp!");
      return;
    }

    try {
      setIsGeneratingUrl(true);
      const { data, error } = await supabaseClient.storage
        .from('Scorify_rubrics')
        .createSignedUrl(filePath, 3600);

      if (error) {
        const { data: publicData } = supabaseClient.storage.from('Scorify_rubrics').getPublicUrl(filePath);
        setViewerUrl(publicData.publicUrl);
      } else {
        setViewerUrl(data.signedUrl);
      }
      setViewerTitle(title);
    } catch (err) {
      toast.error("Lỗi khi mở trình xem tệp.");
    } finally {
      setIsGeneratingUrl(false);
    }
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

  const handleStartBulkGrading = async (submissionIdsToGrade = selectedSubmissionIds) => {
    if (!exam) return;
    const targetIds = submissionIdsToGrade.length > 0 ? submissionIdsToGrade : selectedSubmissionIds;
    if (targetIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một học sinh để chấm!");
      return;
    }

    setBulkGradingStatus("grading");
    setBulkGradingMessage("Đang lấy danh sách bài làm cần chấm...");

    try {
      const { data: resultsData, error: resultsError } = await supabaseClient
        .from('exam_result')
        .select('*')
        .eq('exam_id', exam.exam_id)
        .not('signed_url', 'is', null);

      if (resultsError) throw resultsError;

      const submissionsToGrade = resultsData?.filter(r => targetIds.includes(r.exam_result_id)) || [];

      if (submissionsToGrade.length === 0) {
        setBulkGradingStatus("success");
        setBulkGradingMessage("Không có bài làm nào được chọn để chấm!");
        return;
      }

      setBulkGradingProgress({ total: submissionsToGrade.length, current: 0 });
      setBulkGradingMessage("Đang chuẩn bị Rubric và Đề thi...");

      const rubricPath = exam.rubricPath;
      const examPath = exam.examPath;

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
      let completedCount = 0;
      
      const getStudentName = (stuId: string) => {
        return students.find(s => s.student_id === stuId)?.full_name || "Học sinh ẩn danh";
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
          setBulkGradingProgress(prev => ({ ...prev, current: completedCount }));
        }
      };

      const concurrency = 5;
      const executing = new Set<Promise<any>>();
      for (const sub of submissionsToGrade) {
        if (!isBulkGradingOpen) break;
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
      await refreshStudentData();

    } catch (err: any) {
      console.error(err);
      setBulkGradingStatus("error");
      setBulkGradingMessage("Lỗi: " + err.message);
    }
  };

  const handleDownload = async (filePath: string | null) => {
    if (!filePath) return;
    try {
      const { data, error } = await supabaseClient.storage.from('Scorify_rubrics').createSignedUrl(filePath, 60);
      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (e) {
      toast.error("Lỗi khi tải tệp.");
    }
  };

  const triggerIndividualUpload = (studentId: string) => {
    setTargetStudentId(studentId);
    if (individualUploadRef.current) {
      individualUploadRef.current.click();
    }
  };

  const handleIndividualUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetStudentId || !user) return;

    // Reset input
    if (individualUploadRef.current) individualUploadRef.current.value = '';

    toast.info("Đang tải bài làm lên...");

    try {
      // 1. Upload file
      const fileExt = file.name.split('.').pop();
      const fileName = `${targetStudentId}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/submissions/${examId}/${fileName}`;

      const { error: uploadError } = await supabaseClient.storage
        .from('Scorify_storagedev')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;

      // Get signed URL for the image we just uploaded
      const { data: signedData, error: signedError } = await supabaseClient.storage
        .from('Scorify_storagedev')
        .createSignedUrl(filePath, 3600); // 1 hour expiry
      
      if (signedError) throw signedError;
      
      const submissionImageUrl = signedData.signedUrl;

      // 2. Prepare empty JSON for feedback column (AI will fill this later)
      const initialFeedback = JSON.stringify({});
      
      // Check if result already exists to avoid duplicate constraint violations
      const { data: existingResult } = await supabaseClient
        .from('exam_result')
        .select('exam_result_id')
        .match({ exam_id: examId, student_id: targetStudentId })
        .maybeSingle();

      if (existingResult) {
         const { error: updateError } = await supabaseClient
          .from('exam_result')
          .update({
            signed_url: submissionImageUrl,
            feedback: initialFeedback,
            score: 0, // 0 denotes ungraded
          })
          .eq('exam_result_id', existingResult.exam_result_id);
          
         if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabaseClient
          .from('exam_result')
          .insert({
            exam_id: examId,
            student_id: targetStudentId,
            signed_url: submissionImageUrl,
            feedback: initialFeedback,
            score: 0, // 0 denotes ungraded
          });

        if (insertError) throw insertError;
      }

      toast.success("Đã tải bài làm lên thành công! (Chờ chấm điểm)");
      await refreshStudentData();

    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(`Có lỗi xảy ra khi tải bài lên: ${error.message}`);
    } finally {
      setTargetStudentId(null);
    }
  };

  const confirmDeleteSubmission = async () => {
    if (!studentToDelete) return;

    toast.loading("Đang hủy kết quả...", { id: "delete-submission" });
    try {
      const { error } = await supabaseClient
        .from('exam_result')
        .delete()
        .match({ exam_id: examId, student_id: studentToDelete.id });

      if (error) throw error;

      toast.success("Đã hủy kết quả bài làm thành công!", { id: "delete-submission" });
      await refreshStudentData();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(`Lỗi khi hủy kết quả: ${error.message}`, { id: "delete-submission" });
    } finally {
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="size-8 text-indigo-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Đang tải chi tiết bài tập...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="text-center py-20">
        <h2 className="text-sm font-bold text-slate-700">Không tìm thấy thông tin bài tập</h2>
        <Button onClick={() => navigate(`/classrooms/${classId}`)} className="mt-4 text-xs h-9 px-4 rounded-xl">Quay lại lớp học</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hidden file input for individual student upload */}
      <input 
        type="file" 
        ref={individualUploadRef}
        onChange={handleIndividualUploadChange}
        accept="image/*"
        className="hidden"
      />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(`/classrooms/${classId}`)} 
            className="rounded-xl border border-slate-200 bg-white size-9 text-slate-500"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{exam.exam_name}</h1>
              <Badge className="bg-amber-50 border border-amber-200 text-amber-700 font-bold text-[10px] rounded px-2 py-0.5">
                {exam.class?.description || "Chưa phân khối"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <GraduationCap className="size-3.5 text-indigo-400" />
              Lớp: <span className="font-bold text-slate-700">{exam.class?.class_name}</span>
              <span className="mx-1">•</span>
              <Calendar className="size-3.5 text-slate-400" />
              Tạo lúc: {new Date(exam.created_at).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <Button 
             className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-md"
             onClick={() => {
               setIsBulkGradingOpen(true);
               setBulkGradingStatus("idle");
               setBulkGradingMessage("");
               setBulkGradingProgress({ total: 0, current: 0 });
               setSelectedSubmissionIds([]);
               setBulkSubmissions([]);
               if (examId) fetchBulkSubmissions(examId);
             }}
           >
            <Wand2 className="size-4 mr-1.5" /> Chấm bài hàng loạt (AI)
          </Button>
        </div>
      </div>

      {/* Files Section - Same as Rubric Detail */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-slate-100 shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-slate-50">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileText className="size-4 text-indigo-500" />
              File PDF Đề thi
            </CardTitle>
            <div className="flex items-center gap-1">
              {exam.examPath && (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    disabled={isGeneratingUrl}
                    className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-[10px] font-bold"
                    onClick={() => openViewer(exam.examPath, "Tệp Đề thi")}
                  >
                    <Eye className="size-3.5 mr-1" /> Xem
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-slate-500 hover:text-slate-700 hover:bg-slate-50 text-[10px] font-bold"
                    onClick={() => handleDownload(exam.examPath)}
                  >
                    <Download className="size-3.5 mr-1" /> Tải về
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 bg-slate-50/50">
            <div 
              className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-300 transition-all group"
              onClick={() => exam.examPath && openViewer(exam.examPath, "Tệp Đề thi")}
            >
              <div className="size-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">{exam.exam_name}_De_Thi.pdf</p>
                <p className="text-[10px] text-slate-400">PDF Document • Bảo mật • Nhấp để xem</p>
              </div>
              <div className="p-1.5 rounded-full group-hover:bg-indigo-50 transition-colors">
                <Maximize2 className="size-4 text-slate-300 group-hover:text-indigo-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-slate-50">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileCheck className="size-4 text-emerald-500" />
              File PDF Đáp án & Rubric
            </CardTitle>
            <div className="flex items-center gap-1">
              {exam.rubricPath && (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    disabled={isGeneratingUrl}
                    className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-[10px] font-bold"
                    onClick={() => openViewer(exam.rubricPath, "Tệp Đáp án & Rubric")}
                  >
                    <Eye className="size-3.5 mr-1" /> Xem
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-slate-500 hover:text-slate-700 hover:bg-slate-50 text-[10px] font-bold"
                    onClick={() => handleDownload(exam.rubricPath)}
                  >
                    <Download className="size-3.5 mr-1" /> Tải về
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 bg-slate-50/50">
            <div 
              className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-emerald-300 transition-all group"
              onClick={() => exam.rubricPath && openViewer(exam.rubricPath, "Tệp Đáp án & Rubric")}
            >
              <div className="size-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-sm">
                <FileCheck className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">{exam.exam_name}_Rubric.pdf</p>
                <p className="text-[10px] text-slate-400">PDF Document • Bảo mật • Nhấp để xem</p>
              </div>
              <div className="p-1.5 rounded-full group-hover:bg-emerald-50 transition-colors">
                <Maximize2 className="size-4 text-slate-300 group-hover:text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students & Submissions Section */}
      <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="pb-0 border-b border-slate-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <User className="size-4 text-slate-400" />
              Danh sách bài làm học sinh lớp {exam.class?.class_name}
            </CardTitle>
            <div className="flex items-center gap-4">
               <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 font-bold text-[10px] rounded px-2 py-0.5">
                Đã chấm: {students.filter(s => s.result).length} / {students.length}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="text-[10px] font-bold text-slate-500 px-6 w-[30%]">Tên học sinh</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-500">Mã học sinh</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-500 text-center">Trạng thái</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-500 text-right">Điểm số</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-500 text-right px-6 w-[20%]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((stu) => (
                <TableRow 
                  key={stu.student_id} 
                  className="hover:bg-slate-50/40 text-xs group"
                >
                  <TableCell className="font-bold text-slate-800 px-6 flex items-center gap-2 py-4">
                    <div className="size-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                      <User className="size-3.5" />
                    </div>
                    {stu.full_name}
                  </TableCell>
                  <TableCell className="text-slate-500 font-medium font-mono text-[10px]">
                    {stu.student_code || "---"}
                  </TableCell>
                  <TableCell className="text-center">
                    {stu.result ? (
                      (() => {
                        let isGraded = false;
                        try {
                          const feedbackObj = typeof stu.result.feedback === 'string'
                            ? JSON.parse(stu.result.feedback || '{}')
                            : (stu.result.feedback || {});
                          isGraded = feedbackObj?.status === "graded";
                        } catch {
                          isGraded = false;
                        }
                        return isGraded ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="size-2.5" />
                            Đã chấm xong
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                            <Clock className="size-2.5" />
                            Đã nộp (Chờ chấm)
                          </span>
                        );
                      })()
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        Chưa có bài
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {stu.result && (() => {
                      let isGraded = false;
                      try {
                        const feedbackObj = typeof stu.result.feedback === 'string'
                          ? JSON.parse(stu.result.feedback || '{}')
                          : (stu.result.feedback || {});
                        isGraded = feedbackObj?.status === "graded";
                      } catch {
                        isGraded = false;
                      }
                      return isGraded;
                    })() ? (
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {stu.result.score?.toFixed(1)} / {exam.max_score}
                      </span>
                    ) : (
                      <span className="text-slate-300">--</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <div className="flex items-center justify-end gap-1">
                      {/* Xem chi tiết - only if there's a result */}
                      {stu.result && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="size-8 rounded-lg text-indigo-600 hover:bg-indigo-50"
                          onClick={() => navigate(`/classrooms/${classId}/assignments/${examId}/grading?studentId=${stu.student_id}`)}
                          title="Xem bài làm"
                        >
                          <Eye className="size-4" />
                        </Button>
                      )}

                      {/* Scan bài làm */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="size-8 rounded-lg text-indigo-500 hover:bg-indigo-50"
                        onClick={() => toast.info(`Chế độ scan cho học sinh ${stu.full_name} (Mobile) đang phát triển.`)}
                        title="Scan bài bằng điện thoại"
                      >
                        <Camera className="size-4" />
                      </Button>

                      {/* Tải lên ảnh */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="size-8 rounded-lg text-indigo-500 hover:bg-indigo-50"
                        onClick={() => triggerIndividualUpload(stu.student_id)}
                        title={stu.result ? "Tải lên lại bài làm (Ảnh)" : "Tải lên bài làm (Ảnh)"}
                      >
                        <UploadCloud className="size-4" />
                      </Button>
                      
                      {/* Xóa / Hủy bài - only if there's a result */}
                      {stu.result && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="size-8 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                          onClick={() => {
                            setStudentToDelete({ id: stu.student_id, name: stu.full_name });
                            setDeleteDialogOpen(true);
                          }}
                          title="Hủy kết quả / Xóa bài"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {students.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-slate-400 text-xs">
                    Chưa có học sinh nào trong danh sách lớp.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* PDF VIEWER DIALOG */}
      <Dialog open={!!viewerUrl} onOpenChange={(open) => !open && setViewerUrl(null)}>
        <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden bg-white flex flex-col border-none shadow-2xl">
          <DialogHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0 bg-white z-10">
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <FileText className="size-4" />
              </div>
              {viewerTitle}
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="size-8 rounded-full hover:bg-slate-100" 
              onClick={() => setViewerUrl(null)}
            >
              <X className="size-4 text-slate-500" />
            </Button>
          </DialogHeader>
          <div className="flex-1 bg-slate-500 relative flex items-center justify-center overflow-hidden">
            {viewerUrl ? (
              <iframe 
                src={`${viewerUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
                className="w-full h-full border-none bg-white"
                title="PDF Viewer"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-white">
                <Loader2 className="size-8 animate-spin opacity-50" />
                <p className="text-xs font-medium opacity-50">Đang tải tài liệu...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* DIALOG BULK GRADING */}
      <Dialog 
        open={isBulkGradingOpen} 
        onOpenChange={(open) => {
          if (!open && bulkGradingStatus === "grading") return;
          setIsBulkGradingOpen(open);
        }}
      >
        <DialogContent 
          className="rounded-2xl max-w-md p-6 bg-white max-h-[85vh] flex flex-col"
          onInteractOutside={(e) => {
            if (bulkGradingStatus === "grading") e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (bulkGradingStatus === "grading") e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Wand2 className="size-5 text-indigo-600" />
              Chấm bài hàng loạt
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4 flex-1 overflow-y-auto min-h-0">
            <h3 className="text-sm font-bold text-slate-800 text-center">{exam?.exam_name}</h3>
            
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
            {bulkGradingStatus !== "grading" && bulkGradingStatus !== "success" && (
              <Button variant="ghost" onClick={() => setIsBulkGradingOpen(false)} className="text-xs font-bold h-9">
                Đóng
              </Button>
            )}
            {bulkGradingStatus === "idle" && (
              <Button
                onClick={() => handleStartBulkGrading()}
                disabled={bulkSubmissions.length === 0 || selectedSubmissionIds.length === 0 || loadingSubmissions}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 disabled:opacity-50"
              >
                Bắt đầu chấm
              </Button>
            )}
            {bulkGradingStatus === "success" && (
              <Button onClick={() => setIsBulkGradingOpen(false)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 w-full">
                Hoàn tất
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CUSTOM CONFIRM DELETE DIALOG */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6 border-none shadow-2xl animate-in fade-in duration-200">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="size-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center shrink-0 shadow-sm animate-bounce">
              <Trash2 className="size-6" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-base font-bold text-slate-900">
                Hủy kết quả bài làm?
              </DialogTitle>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Bạn có chắc chắn muốn hủy kết quả và thu hồi bài làm của học sinh <span className="font-bold text-slate-850 text-indigo-600">{studentToDelete?.name}</span> không? Hành động này không thể hoàn tác.
              </p>
            </div>
          </div>
          <DialogFooter className="mt-6 flex sm:justify-center gap-2 border-t border-slate-100 pt-4">
            <Button 
              variant="ghost" 
              onClick={() => {
                setDeleteDialogOpen(false);
                setStudentToDelete(null);
              }} 
              className="text-xs font-bold h-10 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500"
            >
              Hủy
            </Button>
            <Button
              onClick={confirmDeleteSubmission}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-md"
            >
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
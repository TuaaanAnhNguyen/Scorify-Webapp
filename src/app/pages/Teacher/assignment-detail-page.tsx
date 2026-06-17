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
  ArrowUpRight,
  MoreVertical,
  X
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

    toast.info("Đang tải bài làm lên và phân tích AI...");

    try {
      // 1. Upload file
      const fileExt = file.name.split('.').pop();
      const fileName = `${targetStudentId}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/submissions/${examId}/${fileName}`;

      const { error: uploadError } = await supabaseClient.storage
        .from('Scorify_storagedev')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;

      // 2. Create mock exam_result to simulate AI grading completion
      const mockScore = parseFloat((Math.random() * (10 - 4) + 4).toFixed(1));
      
      const { error: insertError } = await supabaseClient
        .from('exam_result')
        .insert({
          exam_id: examId,
          student_id: targetStudentId,
          score: mockScore,
          ai_feedback: "Bài làm đã được AI chấm điểm thành công. " + (mockScore > 8 ? "Học sinh làm bài rất tốt." : "Cần cố gắng thêm ở phần tính toán."),
          graded_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      toast.success("Đã chấm xong bài làm!");
      await refreshStudentData();

    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(`Có lỗi xảy ra khi tải bài lên: ${error.message}`);
    } finally {
      setTargetStudentId(null);
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
           <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-md">
            <UploadCloud className="size-4 mr-1.5" /> Chấm bài hàng loạt (AI)
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
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="size-2.5" />
                        Đã chấm xong
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        Chưa có bài
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {stu.result ? (
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {stu.result.score?.toFixed(1)} / {exam.max_score}
                      </span>
                    ) : (
                      <span className="text-slate-300">--</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <div className="flex items-center justify-end gap-1">
                      {stu.result ? (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="size-8 rounded-lg text-indigo-600 hover:bg-indigo-50"
                          onClick={() => navigate(`/classrooms/${classId}/assignments/${examId}/grading?studentId=${stu.student_id}`)}
                        >
                          <Eye className="size-4" />
                        </Button>
                      ) : (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="size-8 rounded-lg text-indigo-500 hover:bg-indigo-50"
                            onClick={() => toast.info(`Chế độ scan cho học sinh ${stu.full_name} (Mobile) đang phát triển.`)}
                          >
                            <Camera className="size-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="size-8 rounded-lg text-indigo-500 hover:bg-indigo-50"
                            onClick={() => triggerIndividualUpload(stu.student_id)}
                            title="Tải lên bài làm (Ảnh)"
                          >
                            <UploadCloud className="size-4" />
                          </Button>
                        </>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8 text-slate-400 hover:text-slate-600 rounded-lg">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl text-xs font-medium text-slate-600">
                           <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => toast.info("Đang phát triển")}>
                            <X className="size-3.5 text-rose-500" /> Hủy kết quả bài này
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
    </div>
  );
}
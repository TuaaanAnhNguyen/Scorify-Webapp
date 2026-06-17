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
  X,
  Maximize2
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
import { supabaseClient } from "@/app/services/supabaseClient";
import { toast } from "sonner";

export function RubricDetailPage() {
  const { id: examId } = useParams();
  const navigate = useNavigate();
  
  const [exam, setExam] = React.useState<any>(null);
  const [results, setResults] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  // PDF Viewer State
  const [viewerUrl, setViewerUrl] = React.useState<string | null>(null);
  const [viewerTitle, setViewerTitle] = React.useState("");
  const [isGeneratingUrl, setIsGeneratingUrl] = React.useState(false);

  React.useEffect(() => {
    const fetchExamData = async () => {
      if (!examId) return;

      try {
        setLoading(true);
        
        // 1. Fetch Exam Info + Class Name
        const { data: examData, error: examError } = await supabaseClient
          .from('exam')
          .select('*, class(class_name)')
          .eq('exam_id', examId)
          .maybeSingle();

        if (examError) throw examError;
        
        if (examData) {
          let urls = { examPath: null, rubricPath: null };
          try {
            if (examData.description) {
              const meta = JSON.parse(examData.description);
              // Extract the path from the URL or store path directly
              // For Supabase Storage, the path is usually after 'public/Scorify_rubrics/' or just stored as path
              const getPathFromUrl = (url: string | null) => {
                if (!url) return null;
                try {
                  // Standard format: .../storage/v1/object/public/Scorify_rubrics/path/to/file
                  if (url.includes('Scorify_rubrics/')) {
                    return url.split('Scorify_rubrics/')[1];
                  }
                  return url;
                } catch (e) {
                  return url;
                }
              };

              urls.examPath = getPathFromUrl(meta.examUrl);
              urls.rubricPath = getPathFromUrl(meta.rubricUrl);
            }
          } catch (e) {
            console.warn("Could not parse exam description JSON:", e);
          }
          setExam({ ...examData, ...urls });
        }

        // 2. Fetch Student Results
        const { data: resultData, error: resultError } = await supabaseClient
          .from('exam_result')
          .select(`
            *,
            student (
              full_name,
              student_code
            )
          `)
          .eq('exam_id', examId);

        if (resultError) throw resultError;
        setResults(resultData || []);

      } catch (error: any) {
        console.error("Error fetching exam details:", error);
        toast.error("Không thể tải thông tin bài kiểm tra.");
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [examId]);

  const openViewer = async (filePath: string | null, title: string) => {
    if (!filePath) {
      toast.error("Không tìm thấy đường dẫn tệp!");
      return;
    }

    try {
      setIsGeneratingUrl(true);
      console.log("Generating signed URL for path:", filePath);

      // Create a signed URL valid for 1 hour (3600 seconds)
      const { data, error } = await supabaseClient.storage
        .from('Scorify_rubrics')
        .createSignedUrl(filePath, 3600);

      if (error) {
        console.error("Signed URL error:", error);
        // Fallback: try public URL if signed fails (for debugging)
        const { data: publicData } = supabaseClient.storage
          .from('Scorify_rubrics')
          .getPublicUrl(filePath);
        
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
      const { data, error } = await supabaseClient.storage
        .from('Scorify_rubrics')
        .createSignedUrl(filePath, 60); // short lived for download
      
      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (e) {
      toast.error("Lỗi khi tải tệp.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="size-8 text-indigo-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Đang tải chi tiết bài kiểm tra...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
        <h2 className="text-sm font-bold text-slate-700">Không tìm thấy thông tin bài kiểm tra</h2>
        <Button onClick={() => navigate("/rubrics")} className="mt-4 text-xs h-9 px-4 rounded-xl">Quay lại danh sách</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/rubrics")} 
            className="rounded-xl border border-slate-200 bg-white size-9 text-slate-500"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{exam.exam_name}</h1>
              <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 font-bold text-[10px] rounded px-2 py-0.5">
                {exam.class?.class_name || "Lớp học"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <Calendar className="size-3.5 text-slate-400" />
              Tạo lúc: {new Date(exam.created_at).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>

        <Link to={`/rubrics/${examId}/edit`}>
          <Button variant="outline" className="text-xs font-bold rounded-xl h-10 px-4 border-slate-200">
            Chỉnh sửa bài tập
          </Button>
        </Link>
      </div>

      {/* Files Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* EXAM FILE CARD */}
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
                    onClick={(e) => { e.stopPropagation(); openViewer(exam.examPath, "Tệp Đề thi"); }}
                  >
                    {isGeneratingUrl ? <Loader2 className="size-3.5 animate-spin mr-1" /> : <Eye className="size-3.5 mr-1" />} Xem
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
              onClick={() => openViewer(exam.examPath, "Tệp Đề thi")}
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

        {/* RUBRIC FILE CARD */}
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
                    onClick={(e) => { e.stopPropagation(); openViewer(exam.rubricPath, "Tệp Đáp án & Rubric"); }}
                  >
                    {isGeneratingUrl ? <Loader2 className="size-3.5 animate-spin mr-1" /> : <Eye className="size-3.5 mr-1" />} Xem
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
              onClick={() => openViewer(exam.rubricPath, "Tệp Đáp án & Rubric")}
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

      {/* Submissions Section */}
      <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="pb-0 border-b border-slate-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <User className="size-4 text-slate-400" />
              Danh sách bài làm của học sinh
            </CardTitle>
            <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 font-bold text-[10px] rounded px-2 py-0.5">
              Tổng số {results.length} bài nộp
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="text-[10px] font-bold text-slate-500 px-6">Tên học sinh</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-500">Mã học sinh</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-500">Thời gian chấm</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-500 text-center">Trạng thái</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-500 text-right px-6">Điểm số</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((res) => (
                <TableRow 
                  key={res.exam_result_id} 
                  className="hover:bg-slate-50/40 text-xs cursor-pointer group"
                  onClick={() => navigate(`/classrooms/${exam.class_id}/assignments/${examId}/grading?studentId=${res.student_id}`)}
                >
                  <TableCell className="font-bold text-slate-800 px-6 flex items-center gap-2 py-4">
                    <div className="size-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                      <User className="size-3.5" />
                    </div>
                    {res.student?.full_name || "Học sinh ẩn danh"}
                  </TableCell>
                  <TableCell className="text-slate-500 font-medium font-mono text-[10px]">
                    {res.student?.student_code || "---"}
                  </TableCell>
                  <TableCell className="text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3.5" />
                      {res.graded_at ? new Date(res.graded_at).toLocaleDateString('vi-VN') : "---"}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="size-2.5" />
                      Đã chấm xong
                    </span>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {res.score !== null ? res.score.toFixed(1) : "--"} / {exam.max_score}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {results.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-slate-400 text-xs">
                    Chưa có bài nộp nào cho bài kiểm tra này.
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
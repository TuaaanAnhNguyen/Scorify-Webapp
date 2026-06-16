// src/app/pages/Teacher/assignment-detail-page.tsx

import { useState, useEffect } from "react";
import { useParams as useReactRouterParams, useNavigate as useReactRouterNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  UploadCloud, 
  Binary, 
  CheckCircle2, 
  Loader2, 
  User, 
  ArrowUpRight, 
  Sparkles, 
  Layers,
  Clock
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { toast } from "sonner";

const INITIAL_SUBMISSIONS = [
  { id: "sub-1", studentId: "STU-001", studentName: "Nguyễn Văn An", score: 8.5, status: "completed", timestamp: "10 phút trước" },
  { id: "sub-2", studentId: "STU-002", studentName: "Lê Hoàng Minh", score: 6.0, status: "completed", timestamp: "12 phút trước" },
  { id: "sub-3", studentId: "STU-003", studentName: "Trần Thị Hồng", score: 9.2, status: "completed", timestamp: "15 phút trước" }
];

export function AssignmentDetailPage() {
  const { classId, id } = useReactRouterParams<{ classId: string; id: string }>();
  const navigate = useReactRouterNavigate();
  
  const [assignment, setAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    // Locate properties of this current assignment from the global mock storage if available
    const savedFolders = JSON.parse(localStorage.getItem("scorify_mock_folders") || "[]");
    const activeAssignment = savedFolders.find((f: any) => f.id === id);
    
    if (activeAssignment) {
      setAssignment(activeAssignment);
    } else {
      // Fallback domain-driven initialization data if routing directly
      setAssignment({
        id: id || "a-1",
        name: "Kiểm tra Tập hợp & Bất phương trình bậc nhất",
        grade: "Khối 10",
        rubricName: "Barem ma trận Đại Số Khối 10 Chuẩn"
      });
    }
  }, [id]);

  // Handle local mock batch image file drop actions
  const handleFileDropSimulation = () => {
    setIsUploading(true);
    setUploadProgress(10);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const nextIdNumber = submissions.length + 1;
            const mockIncoming = {
              id: `sub-${Date.now()}`,
              studentId: `STU-00${nextIdNumber}`,
              studentName: `Học sinh Khuyết Danh #${nextIdNumber}`,
              score: parseFloat((Math.random() * (10 - 4) + 4).toFixed(1)),
              status: "completed",
              timestamp: "Vừa xong"
            };

            setSubmissions([mockIncoming, ...submissions]);
            setIsUploading(false);
            setUploadProgress(0);
            toast.success("AI đã phân tích cấu trúc chữ viết và chấm xong bài kiểm tra mới!");
          }, 400);
          return 100;
        }
        return prev + 30;
      });
    }, 250);
  };

  if (!assignment) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 🧭 NAVIGATION BREADCRUMB STRIP */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(`/classrooms/${classId}`)} 
            className="rounded-xl border border-slate-100 bg-white shadow-sm size-9"
          >
            <ArrowLeft className="size-4 text-slate-600" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">{assignment.name}</h1>
              <Badge className="bg-amber-50 border border-amber-200 text-amber-700 font-bold text-[9px] px-1.5 rounded py-0 shrink-0">
                {assignment.grade}
              </Badge>
            </div>
            
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
              <Binary className="size-3.5 text-indigo-500" />
              Đề thi & Đáp án áp dụng cho bài tập này: <span className="text-slate-700 font-bold underline decoration-indigo-300">{assignment.rubricName}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        
        {/* 📥 DROPZONE INTERACTIVE CAROUSEL UPLOAD PANEL */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-dashed border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden p-6 text-center">
            <div className="border-2 border-dashed border-slate-100 rounded-xl p-8 bg-slate-50/50 flex flex-col items-center justify-center">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-3 shadow-inner">
                <UploadCloud className="size-6" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 mb-1">Tải lên bài thi của học sinh</h4>
              <p className="text-[10px] text-slate-400 max-w-[220px] mx-auto mb-4 leading-normal">
                Hỗ trợ tải lên hàng loạt ảnh chụp bài làm tự luận (`.jpg`, `.png`) hoặc tệp PDF bài thi.
              </p>

              {isUploading ? (
                <div className="w-full space-y-2 px-4">
                  <div className="flex items-center justify-between text-[10px] font-bold text-indigo-600">
                    <span className="flex items-center gap-1">
                      <Loader2 className="size-3 animate-spin" />
                      Scorify AI đang chấm...
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-1.5 bg-indigo-100" />
                </div>
              ) : (
                <Button 
                  onClick={handleFileDropSimulation}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-sm"
                >
                  Chọn ảnh / tệp bài làm
                </Button>
              )}
            </div>
          </Card>

          {/* Quick Informational Tooltip Box */}
          <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-3.5 text-[11px] text-indigo-950 flex gap-2.5">
            <Layers className="size-4 text-indigo-500 shrink-0 mt-0.5" />
            <p className="leading-normal">
              <strong>Mẹo chấm bài:</strong> Hệ thống tự động căn lề văn bản, nhận diện chữ viết viết tay tiếng Việt và tính điểm tự động dựa chính xác trên biểu điểm của <strong>{assignment.rubricName}</strong>.
            </p>
          </div>
        </div>

        {/* 📑 STREAMLINED SUBMISSIONS TRACKER LIST VIEW */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Danh sách bài nộp ({submissions.length})</h3>
            <span className="text-[10px] text-slate-400 font-medium">Bấm vào hàng để kiểm tra chi tiết lỗi sai</span>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100">
            {submissions.map((sub) => (
              <div 
                key={sub.id}
                onClick={() => navigate(`/classrooms/${classId}/assignments/${id}/grading`)}
                className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-slate-50 border border-slate-100 text-slate-500 rounded-xl shrink-0">
                    <User className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                      {sub.studentName}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5 flex items-center gap-1">
                      <Clock className="size-3 text-slate-300" />
                      {sub.timestamp}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {/* Dynamic Grading Badges */}
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900 block bg-slate-100 border px-2 py-0.5 rounded-lg text-center font-mono font-bold">
                      {sub.score.toFixed(1)} / 10
                    </span>
                    <span className="text-[9px] font-bold text-emerald-600 flex items-center justify-end gap-0.5 mt-0.5">
                      <CheckCircle2 className="size-2.5" /> Chấm xong
                    </span>
                  </div>

                  <Button variant="ghost" size="icon" className="size-7 rounded-lg border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                    <ArrowUpRight className="size-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
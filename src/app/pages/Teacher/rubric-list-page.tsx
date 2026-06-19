import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Binary, 
  Plus, 
  Search, 
  FileCheck, 
  MoreVertical, 
  Trash2, 
  Copy, 
  Edit3, 
  Calculator, 
  SlidersHorizontal,
  FolderOpen,
  Loader2,
  Calendar,
  FileText,
  ExternalLink
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { toast } from "sonner";
import { supabaseClient } from "@/app/services/supabaseClient";
import { useAuth } from "@/app/context/AuthContext";

export function RubricListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchExams = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from('exam')
        .select('*, class(class_name)')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExams(data || []);
    } catch (error: any) {
      console.error("Error fetching exams:", error);
      toast.error("Không thể tải danh sách bài tập. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [user]);

  // Handle Duplicate Feature for Exam
  const handleDuplicate = async (targetExam: any) => {
    try {
      const { data, error } = await supabaseClient
        .from('exam')
        .insert({
          class_id: targetExam.class_id,
          exam_name: `${targetExam.exam_name} (Bản sao)`,
          description: targetExam.description,
          max_score: targetExam.max_score,
          created_by: user?.id,
          created_at: new Date().toISOString()
        })
        .select('*, class(class_name)')
        .single();

      if (error) throw error;
      
      setExams([data, ...exams]);
      toast.success("Đã nhân bản bài tập thành công!");
    } catch (error: any) {
      toast.error("Không thể nhân bản bài tập.");
    }
  };

  // Handle Delete Function for Exam
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa bài tập này?");
    if (!confirmDelete) return;

    try {
      const { error } = await supabaseClient
        .from('exam')
        .delete()
        .eq('exam_id', id);

      if (error) throw error;
      
      setExams(exams.filter((e: any) => e.exam_id !== id));
      toast.success("Đã xóa bài tập thành công.");
    } catch (error: any) {
      toast.error("Không thể xóa bài tập.");
    }
  };

  const filteredExams = exams.filter((e: any) =>
    e.exam_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calculator className="size-5 text-indigo-600" />
            Danh sách Bài tập & Đề thi
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý cấu trúc đề thi, lời giải chi tiết và biểu điểm phân phối các bước để AI quét chấm.
          </p>
        </div>
        
        <Link to="/rubrics/create">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 h-10 px-4 rounded-xl shadow-md">
            <Plus className="size-4 stroke-[2.5]" />
            Thêm bài tập / Đề thi mới
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm bài tập, mã đề..." 
            className="pl-9 h-10 rounded-lg text-xs bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
          />
        </div>
        <Button variant="outline" className="h-10 text-xs gap-1.5 border-slate-200 text-slate-600 font-medium rounded-lg">
          <SlidersHorizontal className="size-3.5" />
          Lọc Khối Lớp
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="size-8 text-indigo-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Đang tải danh sách bài tập...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredExams.map((exam: any) => {
            // Parse description JSON safely
            const meta = (() => {
              try {
                return exam.description ? JSON.parse(exam.description) : {};
              } catch (e) {
                return {};
              }
            })();

            return (
              <div 
                key={exam.exam_id}
                onClick={() => navigate(`/rubrics/${exam.exam_id}`)}
                className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative group cursor-pointer"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl shrink-0">
                    <Binary className="size-5" />
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-800 text-sm truncate max-w-[320px] md:max-w-[480px]">
                        {exam.exam_name}
                      </h3>
                      <Badge className="bg-indigo-50 text-indigo-600 hover:bg-indigo-50 font-bold text-[10px] rounded px-2 py-0.5">
                        {exam.class?.class_name || "Chưa gán lớp"}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3.5 text-slate-300" />
                        Tạo lúc: {new Date(exam.created_at).toLocaleDateString('vi-VN')}
                      </span>
                      <span className="flex items-center gap-1">
                        <FolderOpen className="size-3.5 text-slate-300" />
                        Được giao cho lớp {exam.class?.class_name || "Chưa xác định"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      {meta.examUrl && (
                        <a 
                          href={meta.examUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md transition-colors"
                        >
                          <FileText className="size-3" /> Xem Đề thi
                        </a>
                      )}
                      {meta.rubricUrl && (
                        <a 
                          href={meta.rubricUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md transition-colors"
                        >
                          <FileCheck className="size-3" /> Xem Đáp án
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 border-t border-slate-50 pt-3 md:border-0 md:pt-0 shrink-0">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Trạng thái</p>
                    <p className="text-xs font-bold text-emerald-600">Đã sẵn sàng</p>
                  </div>

                  <div className="flex items-center gap-1.5 pl-2 md:border-l border-slate-100" onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => navigate(`/rubrics/${exam.exam_id}/edit`)}
                      className="size-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                    >
                      <Edit3 className="size-4" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8 text-slate-400 hover:text-slate-600 rounded-lg">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36 rounded-lg text-xs font-medium text-slate-600">
                        <DropdownMenuItem onClick={() => handleDuplicate(exam)} className="gap-2 cursor-pointer">
                          <Copy className="size-3.5 text-slate-400" /> Nhân bản mẫu
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(exam.exam_id)} className="gap-2 cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50 font-semibold">
                          <Trash2 className="size-3.5" /> Xóa bài tập
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filteredExams.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200 p-6">
          <h3 className="font-bold text-slate-700 text-sm mb-1">Không tìm thấy bài tập nào</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4">Hãy thử điều chỉnh lại từ khóa hoặc tạo mới một bài tập/đề thi mới.</p>
        </div>
      )}
    </div>
  );
}
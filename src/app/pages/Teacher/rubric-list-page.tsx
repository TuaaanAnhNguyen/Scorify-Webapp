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
  Calendar
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
  const [rubrics, setRubrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRubrics = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from('rubric')
        .select('*')
        .eq('creator_profile_id', user.id)
        .order('rubric_last_edit', { ascending: false });

      if (error) throw error;
      setRubrics(data || []);
    } catch (error: any) {
      console.error("Error fetching rubrics:", error);
      toast.error("Không thể tải danh sách bài tập. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRubrics();
  }, [user]);

  // Handle Mock Duplicate Feature (now can be implemented with Supabase if needed, but keeping it simple for now)
  const handleDuplicate = async (targetRubric: any) => {
    try {
      const { data, error } = await supabaseClient
        .from('rubric')
        .insert({
          creator_profile_id: user?.id,
          rubric_name: `${targetRubric.rubric_name} (Bản sao)`,
          rubric_description: targetRubric.rubric_description,
          rubric_create_time: new Date().toISOString(),
          rubric_last_edit: new Date().toISOString(),
          max_score: targetRubric.max_score
        })
        .select()
        .single();

      if (error) throw error;
      
      setRubrics([data, ...rubrics]);
      toast.success("Đã nhân bản bài tập thành công!");
    } catch (error: any) {
      toast.error("Không thể nhân bản bài tập.");
    }
  };

  // Handle Delete Function with Supabase
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa bài tập này?");
    if (!confirmDelete) return;

    try {
      const { error } = await supabaseClient
        .from('rubric')
        .delete()
        .eq('rubric_id', id);

      if (error) throw error;
      
      setRubrics(rubrics.filter((r: any) => r.rubric_id !== id));
      toast.success("Đã xóa bài tập thành công.");
    } catch (error: any) {
      toast.error("Không thể xóa bài tập.");
    }
  };

  const filteredRubrics = rubrics.filter((r: any) =>
    r.rubric_name.toLowerCase().includes(searchTerm.toLowerCase())
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
          {filteredRubrics.map((rubric: any) => (
            <div 
              key={rubric.rubric_id}
              onClick={() => navigate(`/rubrics/${rubric.rubric_id}`)}
              className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative group cursor-pointer"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl shrink-0">
                  <Binary className="size-5" />
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-800 text-sm truncate max-w-[320px] md:max-w-[480px]">
                      {rubric.rubric_name}
                    </h3>
                    <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 font-bold text-[10px] rounded px-2 py-0.5">
                      PDF Document
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5 text-slate-300" />
                      Tạo lúc: {new Date(rubric.rubric_create_time).toLocaleDateString('vi-VN')}
                    </span>
                    {rubric.max_score && (
                      <span className="flex items-center gap-1">
                        <Calculator className="size-3.5 text-slate-300" />
                        Điểm tối đa: {rubric.max_score}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 border-t border-slate-50 pt-3 md:border-0 md:pt-0 shrink-0">
                <div className="text-left md:text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Cập nhật lần cuối</p>
                  <p className="text-xs font-bold text-slate-600">
                    {new Date(rubric.rubric_last_edit).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 pl-2 md:border-l border-slate-100" onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => navigate(`/rubrics/${rubric.rubric_id}/edit`)}
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
                      <DropdownMenuItem onClick={() => handleDuplicate(rubric)} className="gap-2 cursor-pointer">
                        <Copy className="size-3.5 text-slate-400" /> Nhân bản mẫu
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(rubric.rubric_id)} className="gap-2 cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50 font-semibold">
                        <Trash2 className="size-3.5" /> Xóa bài tập
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredRubrics.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200 p-6">
          <h3 className="font-bold text-slate-700 text-sm mb-1">Không tìm thấy bài tập nào</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4">Hãy thử điều chỉnh lại từ khóa hoặc tạo mới một bài tập/đề thi mới.</p>
        </div>
      )}
    </div>
  );
}
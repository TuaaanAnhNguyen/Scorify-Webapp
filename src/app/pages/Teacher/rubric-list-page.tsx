// src/app/pages/Teacher/rubric-list-page.tsx
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
  FolderOpen
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
import { toast } from "sonner"; // Using your project's built-in sonner notification system

const INITIAL_MOCK_RUBRICS = [
  {
    id: "R-101",
    title: "Đề khảo sát Đột phá Hình học Giải tích Không gian",
    grade: "Lớp 12",
    type: "Trắc nghiệm + Tự luận",
    totalQuestions: 15,
    tuLuanCount: 3,
    lastUsed: "2 giờ trước",
    linkedFolders: 2,
  },
  {
    id: "R-102",
    title: "Kiểm tra Định kỳ Đại số & Giải tích - Chương Hàm Số",
    grade: "Lớp 11",
    type: "100% Tự luận",
    totalQuestions: 5,
    tuLuanCount: 5,
    lastUsed: "3 ngày trước",
    linkedFolders: 1,
  },
  {
    id: "R-103",
    title: "Đề luyện thi thử THPT Quốc Gia - Cấu trúc đề 2026",
    grade: "Lớp 12",
    type: "Trắc nghiệm nhiều lựa chọn",
    totalQuestions: 40,
    tuLuanCount: 0,
    lastUsed: "1 tuần trước",
    linkedFolders: 4,
  },
];

export function RubricListPage() {
  const navigate = useNavigate();
  const [rubrics, setRubrics] = useState(() => {
    const saved = localStorage.getItem("scorify_mock_rubrics");
    return saved ? JSON.parse(saved) : INITIAL_MOCK_RUBRICS;
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Sync back to local storage for realistic multi-page interaction persistence
  useEffect(() => {
    localStorage.setItem("scorify_mock_rubrics", JSON.stringify(rubrics));
  }, [rubrics]);

  // Handle Mock Duplicate Feature
  const handleDuplicate = (targetRubric: typeof INITIAL_MOCK_RUBRICS[0]) => {
    const newRubric = {
      ...targetRubric,
      id: `R-${Math.floor(100 + Math.random() * 900)}`,
      title: `${targetRubric.title} (Bản sao)`,
      lastUsed: "Vừa xong",
      linkedFolders: 0
    };
    setRubrics([newRubric, ...rubrics]);
    toast.success("Đã nhân bản bài tập thành công!");
  };

  // Handle Mock Delete Function
  const handleDelete = (id: string) => {
    setRubrics(rubrics.filter((r: any) => r.id !== id));
    toast.error("Đã gỡ bỏ bài tập.");
  };

  const filteredRubrics = rubrics.filter((r: any) =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
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

      <div className="grid gap-4">
        {filteredRubrics.map((rubric: any) => (
          <div 
            key={rubric.id}
            onClick={() => navigate(`/rubrics/${rubric.id}`)}
            className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative group cursor-pointer"
          >
            <div className="flex items-start gap-4 min-w-0">
              <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl shrink-0">
                <Binary className="size-5" />
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-slate-800 text-sm truncate max-w-[320px] md:max-w-[480px]">
                    {rubric.title}
                  </h3>
                  <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 font-bold text-[10px] rounded px-2 py-0.5">
                    {rubric.grade}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[11px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <FolderOpen className="size-3.5 text-slate-300" />
                    Được giao cho {rubric.linkedFolders} lớp học
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-4 border-t border-slate-50 pt-3 md:border-0 md:pt-0 shrink-0">
              <div className="text-left md:text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Sử dụng gần nhất</p>
                <p className="text-xs font-bold text-slate-600">{rubric.lastUsed}</p>
              </div>

              <div className="flex items-center gap-1.5 pl-2 md:border-l border-slate-100" onClick={(e) => e.stopPropagation()}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate(`/rubrics/${rubric.id}/edit`)}
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
                    <DropdownMenuItem onClick={() => handleDelete(rubric.id)} className="gap-2 cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50 font-semibold">
                      <Trash2 className="size-3.5" /> Xóa bài tập
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRubrics.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200 p-6">
          <h3 className="font-bold text-slate-700 text-sm mb-1">Không tìm thấy bài tập nào</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4">Hãy thử điều chỉnh lại từ khóa hoặc tạo mới một bài tập/đề thi mới.</p>
        </div>
      )}
    </div>
  );
}
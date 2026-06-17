// src/app/pages/Teacher/classroom-list-page.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  School, 
  FolderPlus, 
  Search, 
  MoreVertical, 
  Trash2, 
  LayoutGrid, 
  List, 
  ChevronRight,
  Users,
  Layers,
  Loader2
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/app/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { toast } from "sonner";
import { supabaseClient } from "@/app/services/supabaseClient";
import { useAuth } from "@/app/context/AuthContext";

export function ClassroomListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newClassName, setNewClassName] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("Khối 12");
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const [classes, setClasses] = useState<any[]>([]);

  const fetchClassrooms = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from('class')
        .select(`
          *,
          class_student(count),
          exam(count)
        `)
        .eq('teacher_profile_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedData = (data || []).map((c: any) => ({
        id: c.class_id,
        name: c.class_name,
        grade: c.description || "Chưa phân khối", 
        studentCount: c.class_student?.[0]?.count || 0,
        activeAssignments: c.exam?.[0]?.count || 0
      }));

      setClasses(formattedData);
    } catch (error: any) {
      console.error("Error fetching classrooms:", error);
      toast.error("Không thể tải danh sách lớp học.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, [user]);

  const handleCreateClass = async () => {
    if (!newClassName.trim()) {
      toast.error("Vui lòng nhập tên lớp học!");
      return;
    }

    if (!user) {
      toast.error("Bạn cần đăng nhập để thực hiện thao tác này.");
      return;
    }

    try {
      setIsCreating(true);
      const { data, error } = await supabaseClient
        .from('class')
        .insert({
          teacher_profile_id: user.id,
          class_name: newClassName,
          description: selectedGrade,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      const createdClass = {
        id: data.class_id,
        name: data.class_name,
        grade: data.description,
        studentCount: 0,
        activeAssignments: 0
      };

      setClasses([createdClass, ...classes]);
      setIsCreateOpen(false);
      setNewClassName("");
      toast.success(`Đã khởi tạo không gian lớp "${newClassName}"!`);
    } catch (error: any) {
      console.error("Error creating class:", error);
      toast.error("Không thể tạo lớp học mới.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteClass = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa lớp học này?");
    if (!confirmDelete) return;

    try {
      const { error } = await supabaseClient
        .from('class')
        .delete()
        .eq('class_id', id);

      if (error) throw error;

      setClasses(classes.filter((c: any) => c.id !== id));
      toast.success("Đã xóa dữ liệu lớp học.");
    } catch (error: any) {
      console.error("Error deleting class:", error);
      toast.error("Không thể xóa lớp học.");
    }
  };

  const filteredClasses = classes.filter((c: any) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <School className="size-5 text-indigo-600" />
            Quản lý Lớp học & Bài tập
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Chọn một lớp để xem danh sách học sinh và quản lý các đợt chấm bài tập, bài thi tương ứng.
          </p>
        </div>
        
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 h-10 px-4 rounded-xl shadow-md"
        >
          <FolderPlus className="size-4" />
          Thêm lớp học mới
        </Button>
      </div>

      {/* FILTER CONTROLS */}
      <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm nhanh tên lớp học..." 
            className="pl-9 h-9 rounded-lg text-xs bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-1 border-l border-slate-100 pl-3">
          <Button variant="ghost" size="icon" onClick={() => setViewMode("grid")} className={`size-8 rounded-md ${viewMode === "grid" ? "bg-slate-100 text-indigo-600" : "text-slate-400"}`}>
            <LayoutGrid className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setViewMode("list")} className={`size-8 rounded-md ${viewMode === "list" ? "bg-slate-100 text-indigo-600" : "text-slate-400"}`}>
            <List className="size-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="size-8 text-indigo-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Đang tải danh sách lớp học...</p>
        </div>
      ) : (
        <>
          {/* RENDER CANVAS GRID/LIST */}
          {viewMode === "grid" ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClasses.map((item: any) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/classrooms/${item.id}`)}
                  className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group flex flex-col justify-between min-h-[140px]"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl group-hover:scale-105 transition-transform">
                        <School className="size-5" />
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="size-7 text-slate-400 rounded-md">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-lg text-xs font-medium text-slate-600">
                          <DropdownMenuItem onClick={(e) => handleDeleteClass(item.id, e)} className="gap-2 text-rose-600 cursor-pointer focus:bg-rose-50 font-semibold">
                            <Trash2 className="size-3.5" /> Xóa lớp học
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-800 text-xs tracking-tight line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {item.name}
                      </h3>
                      <Badge className="bg-slate-100 text-slate-600 font-bold text-[9px] rounded px-1.5 py-0 mt-1">
                        {item.grade}
                      </Badge>
                    </div>
                  </div>

                  <div className="border-t border-slate-50 pt-3 mt-4 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Users className="size-3" />
                      {item.studentCount} Học sinh
                    </span>
                    <span className="flex items-center gap-1 text-indigo-600 bg-indigo-50/50 px-1.5 py-0.5 rounded font-bold">
                      <Layers className="size-3" />
                      {item.activeAssignments} Bài tập
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-100 min-w-full">
                <div className="grid grid-cols-12 bg-slate-50/75 px-5 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <div className="col-span-6">Tên lớp học</div>
                  <div className="col-span-3">Sĩ số học sinh</div>
                  <div className="col-span-3 text-right">Tổng số bài tập</div>
                </div>

                <div className="divide-y divide-slate-50">
                  {filteredClasses.map((item: any) => (
                    <div 
                      key={item.id}
                      onClick={() => navigate(`/classrooms/${item.id}`)}
                      className="grid grid-cols-12 px-5 py-3 items-center text-xs text-slate-600 hover:bg-slate-50/50 cursor-pointer transition-colors group"
                    >
                      <div className="col-span-6 flex items-center gap-3 min-w-0 pr-2">
                        <School className="size-4 text-indigo-500 shrink-0" />
                        <span className="font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{item.name}</span>
                        <Badge className="bg-slate-100 text-slate-500 text-[9px] font-bold shrink-0">{item.grade}</Badge>
                      </div>
                      <div className="col-span-3 font-medium text-slate-500 flex items-center gap-1">
                        <Users className="size-3.5 text-slate-400" />
                        {item.studentCount} học viên
                      </div>
                      <div className="col-span-3 text-right font-semibold text-slate-700 flex items-center justify-end gap-1.5">
                        <span>{item.activeAssignments} bài tập</span>
                        <ChevronRight className="size-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {filteredClasses.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200 p-6">
              <h3 className="font-bold text-slate-700 text-sm mb-1">Không tìm thấy lớp học nào</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4">Hãy thử điều chỉnh lại từ khóa hoặc khởi tạo một không gian lớp học mới.</p>
            </div>
          )}
        </>
      )}

      {/* DIALOG CREATION MODAL */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="rounded-2xl max-w-md p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <School className="size-5 text-indigo-600" />
              Khởi tạo không gian lớp học mới
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tên lớp học</label>
              <Input 
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="Ví dụ: Lớp 11A1 — Ban Tự Nhiên"
                className="h-10 text-xs rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phân cấp khối</label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200 bg-white">
                  <SelectValue placeholder="Chọn khối" />
                </SelectTrigger>
                <SelectContent className="rounded-xl text-xs">
                  <SelectItem value="Khối 6">Học sinh Khối Lớp 6</SelectItem>
                  <SelectItem value="Khối 7">Học sinh Khối Lớp 7</SelectItem>
                  <SelectItem value="Khối 8">Học sinh Khối Lớp 8</SelectItem>
                  <SelectItem value="Khối 9">Học sinh Khối Lớp 9</SelectItem>
                  <SelectItem value="Khối 10">Học sinh Khối Lớp 10</SelectItem>
                  <SelectItem value="Khối 11">Học sinh Khối Lớp 11</SelectItem>
                  <SelectItem value="Khối 12">Học sinh Khối Lớp 12</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 border-t border-slate-50 pt-3">
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)} className="text-xs font-bold rounded-xl h-10 px-4">Hủy</Button>
            <Button 
              onClick={handleCreateClass} 
              disabled={isCreating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-md min-w-[100px]"
            >
              {isCreating ? <Loader2 className="size-4 animate-spin" /> : "Xác nhận tạo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
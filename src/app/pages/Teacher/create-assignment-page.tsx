import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FolderPlus, ArrowLeft, Binary, FileSpreadsheet, Sparkles } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Card, CardContent } from "@/app/components/ui/card";
import { toast } from "sonner";

export function CreateAssignmentPage() {
  const navigate = useNavigate();
  const { classId } = useParams();
  const [folderName, setFolderName] = React.useState("");
  const [grade, setGrade] = React.useState("Lớp 12");
  const [selectedRubricId, setSelectedRubricId] = React.useState("");

  // Retrieve existing master rubrics
  const savedRubrics = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("scorify_mock_rubrics") || "[]");
    } catch (e) {
      return [];
    }
  }, []);

  const handleSave = () => {
    if (!folderName.trim()) {
      toast.error("Vui lòng nhập tên thư mục bài tập!");
      return;
    }
    if (!selectedRubricId) {
      toast.error("Vui lòng gán một đề thi/đáp án duy nhất cho thư mục này!");
      return;
    }

    // Resolve target rubric details
    const activeRubric = savedRubrics.find((r: any) => r.id === selectedRubricId) || {
      title: "Mẫu đề thi trắc nghiệm chuẩn tự luận"
    };

    const existingFolders = JSON.parse(localStorage.getItem("scorify_mock_folders") || "[]");
    
    const newFolder = {
      id: `f-${Date.now()}`,
      name: folderName,
      grade,
      rubricId: selectedRubricId,
      rubricName: activeRubric.title,
      totalSubmissions: 0,
      gradedCount: 0,
    };

    localStorage.setItem("scorify_mock_folders", JSON.stringify([newFolder, ...existingFolders]));
    toast.success(`Đã tạo thành công thư mục "${folderName}"!`);
    navigate(classId ? `/classrooms/${classId}` : "/classrooms");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Back button and title strip */}
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(classId ? `/classrooms/${classId}` : "/classrooms")} 
          className="rounded-xl border border-slate-100 bg-white shadow-sm size-9"
        >
          <ArrowLeft className="size-4 text-slate-600" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FolderPlus className="size-5 text-indigo-600" />
            Khởi tạo không gian chấm điểm mới
          </h1>
          <p className="text-xs text-slate-500">Mỗi thư mục lưu trữ sẽ xử lý một mã đề kiểm tra cố định.</p>
        </div>
      </div>

      <Card className="border-slate-100 shadow-md bg-white rounded-2xl overflow-hidden">
        <CardContent className="p-6 space-y-5">
          {/* Section 1: Meta configurations */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tên đợt thi / Thư mục bài tập</label>
            <Input 
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Ví dụ: Kiểm tra Giữa Học kỳ II - Khối 12A3"
              className="h-11 text-xs rounded-xl border-slate-200 focus-visible:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phân loại khối lớp</label>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger className="h-11 rounded-xl text-xs border-slate-200 bg-white">
                <SelectValue placeholder="Chọn khối lớp" />
              </SelectTrigger>
              <SelectContent className="rounded-xl text-xs">
                <SelectItem value="Lớp 10">Học sinh Khối Lớp 10</SelectItem>
                <SelectItem value="Lớp 11">Học sinh Khối Lớp 11</SelectItem>
                <SelectItem value="Lớp 12">Học sinh Khối Lớp 12</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Section 2: Strict 1-Rubric Boundary enforcement container */}
          <div className="p-4 bg-gradient-to-br from-indigo-50/40 to-slate-50 border border-indigo-100 rounded-xl space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg shrink-0 mt-0.5">
                <FileSpreadsheet className="size-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 tracking-tight">Gán Đề thi & Đáp án áp dụng</h4>
                <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                  Hệ thống AI Scorify yêu cầu cố định duy nhất một đề thi/đáp án cho toàn bộ các bài làm được đẩy vào thư mục này. Tránh gộp chung nhiều đề thi khác nhau.
                </p>
              </div>
            </div>

            <Select value={selectedRubricId} onValueChange={setSelectedRubricId}>
              <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200 bg-white shadow-sm">
                <SelectValue placeholder="-- Nhấp để chọn đề thi/đáp án --" />
              </SelectTrigger>
              <SelectContent className="rounded-xl text-xs">
                {savedRubrics.length > 0 ? (
                  savedRubrics.map((rubric: any) => (
                    <SelectItem key={rubric.id} value={rubric.id}>
                      {rubric.title} ({rubric.grade})
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="r-default-1">Đề Đại Số Chương 3 - Hệ Phương Trình (Lớp 10)</SelectItem>
                    <SelectItem value="r-default-2">Đề Khảo Sát Đạo Hàm & Đồ Thị Đợt I (Lớp 12)</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Action Footer Buttons inside form */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
            <Button variant="ghost" type="button" onClick={() => navigate(classId ? `/classrooms/${classId}` : "/classrooms")} className="text-xs font-bold rounded-xl h-10 px-4">
              Hủy bỏ
            </Button>
            <Button type="button" onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-md flex items-center gap-1.5">
              <Sparkles className="size-3.5" /> Khởi tạo & Lưu trữ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
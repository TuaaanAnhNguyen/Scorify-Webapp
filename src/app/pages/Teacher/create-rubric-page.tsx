import * as React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Trash2, 
  Save, 
  FileText,
  UploadCloud,
  FileCheck,
  Sparkles
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { toast } from "sonner";

export function CreateRubricPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [title, setTitle] = React.useState("");
  const [grade, setGrade] = React.useState("Lớp 12");
  
  const [examFile, setExamFile] = React.useState<File | null>(null);
  const [rubricFile, setRubricFile] = React.useState<File | null>(null);
  
  const examInputRef = React.useRef<HTMLInputElement>(null);
  const rubricInputRef = React.useRef<HTMLInputElement>(null);

  // Pull existing list array for modifications
  const getStoredRubrics = () => {
    const saved = localStorage.getItem("scorify_mock_rubrics");
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  };

  React.useEffect(() => {
    if (isEditMode) {
      const stored = getStoredRubrics();
      if (Array.isArray(stored)) {
        const activeRubric = stored.find((r: any) => r.id === id);
        if (activeRubric) {
          setTitle(activeRubric.title || "");
          setGrade(activeRubric.grade || "Lớp 12");
        }
      }
    }
  }, [id, isEditMode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "exam" | "rubric") => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Vui lòng chỉ tải lên tệp định dạng PDF!");
        return;
      }
      if (type === "exam") setExamFile(file);
      else setRubricFile(file);
      toast.success(`Đã chọn tệp: ${file.name}`);
    }
  };

  const removeFile = (type: "exam" | "rubric") => {
    if (type === "exam") setExamFile(null);
    else setRubricFile(null);
  };

  // Mock Save Flow updating local storage
  const handleSaveRubric = () => {
    if (!title.trim()) {
      toast.error("Vui lòng điền tên bài tập / đề thi!");
      return;
    }

    if (!isEditMode && (!examFile || !rubricFile)) {
      toast.error("Vui lòng tải lên đầy đủ file đề thi và file đáp án/rubric!");
      return;
    }

    const currentList = getStoredRubrics();
    const listToUpdate = Array.isArray(currentList) ? currentList : [];

    if (isEditMode) {
      const updatedList = listToUpdate.map((item: any) => {
        if (item.id === id) {
          return { ...item, title, grade };
        }
        return item;
      });
      localStorage.setItem("scorify_mock_rubrics", JSON.stringify(updatedList));
      toast.success("Cập nhật thông tin bài tập thành công!");
    } else {
      const newEntry = {
        id: `R-${Math.floor(100 + Math.random() * 900)}`,
        title,
        grade,
        type: "PDF Document",
        totalQuestions: "--",
        tuLuanCount: "--",
        lastUsed: "Vừa xong",
        linkedFolders: 0,
        examFileName: examFile?.name,
        rubricFileName: rubricFile?.name
      };
      localStorage.setItem("scorify_mock_rubrics", JSON.stringify([newEntry, ...listToUpdate]));
      toast.success("Đã tạo bài tập/đề thi mới từ tệp PDF thành công!");
    }

    navigate("/rubrics");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <Link to="/rubrics">
            <Button variant="ghost" size="icon" className="rounded-xl border border-slate-200 bg-white size-9 text-slate-500">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {isEditMode ? "Chi tiết & Cập nhật Bài tập" : "Tạo Bài tập & Đề thi mới"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSaveRubric} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-md">
            <Save className="size-4 mr-1.5" /> Lưu bài tập
          </Button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm grid md:grid-cols-3 gap-5">
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tên bài tập / Đề thi</label>
          <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Đề khảo sát Đại số Chương 1 - Mã đề 102"
            className="h-11 rounded-xl text-xs border-slate-200"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Khối lớp áp dụng</label>
          <Select value={grade} onValueChange={setGrade}>
            <SelectTrigger className="h-11 rounded-xl text-xs border-slate-200 bg-white">
              <SelectValue placeholder="Chọn khối lớp" />
            </SelectTrigger>
            <SelectContent className="rounded-xl text-xs">
              <SelectItem value="Lớp 10">Khối Lớp 10</SelectItem>
              <SelectItem value="Lớp 11">Khối Lớp 11</SelectItem>
              <SelectItem value="Lớp 12">Khối Lớp 12 / Ôn thi Quốc Gia</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* EXAM PDF UPLOAD */}
        <div className="space-y-3">
          <div className="px-1">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileText className="size-4 text-indigo-500" />
              File PDF Đề thi
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Tải lên bản thảo đề thi để AI tham chiếu nội dung.</p>
          </div>

          <div 
            onClick={() => !examFile && examInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
              examFile 
                ? "border-indigo-200 bg-indigo-50/30" 
                : "border-slate-100 bg-white hover:border-indigo-200 hover:bg-slate-50/50"
            }`}
          >
            <input 
              type="file" 
              ref={examInputRef}
              onChange={(e) => handleFileChange(e, "exam")}
              accept=".pdf"
              className="hidden"
            />
            
            {examFile ? (
              <div className="space-y-3 w-full">
                <div className="size-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mx-auto shadow-inner">
                  <FileText className="size-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800 truncate px-4">{examFile.name}</p>
                  <p className="text-[10px] text-slate-400">{(examFile.size / 1024 / 1024).toFixed(2)} MB • Định dạng PDF</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => { e.stopPropagation(); removeFile("exam"); }}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-[10px] font-bold h-7"
                >
                  <Trash2 className="size-3.5 mr-1" /> Gỡ bỏ tệp
                </Button>
              </div>
            ) : (
              <>
                <div className="size-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center mb-3 transition-transform">
                  <UploadCloud className="size-6" />
                </div>
                <p className="text-xs font-bold text-slate-600">Nhấp để tải lên file Đề thi</p>
                <p className="text-[10px] text-slate-400 mt-1">Hỗ trợ định dạng .PDF (Tối đa 20MB)</p>
              </>
            )}
          </div>
        </div>

        {/* RUBRIC PDF UPLOAD */}
        <div className="space-y-3">
          <div className="px-1">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="size-4 text-emerald-500" />
              File PDF Đáp án & Rubric
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Tải lên barem điểm chi tiết để AI học quy chuẩn chấm.</p>
          </div>

          <div 
            onClick={() => !rubricFile && rubricInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
              rubricFile 
                ? "border-emerald-200 bg-emerald-50/30" 
                : "border-slate-100 bg-white hover:border-emerald-200 hover:bg-slate-50/50"
            }`}
          >
            <input 
              type="file" 
              ref={rubricInputRef}
              onChange={(e) => handleFileChange(e, "rubric")}
              accept=".pdf"
              className="hidden"
            />
            
            {rubricFile ? (
              <div className="space-y-3 w-full">
                <div className="size-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto shadow-inner">
                  <FileCheck className="size-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800 truncate px-4">{rubricFile.name}</p>
                  <p className="text-[10px] text-slate-400">{(rubricFile.size / 1024 / 1024).toFixed(2)} MB • Định dạng PDF</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => { e.stopPropagation(); removeFile("rubric"); }}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-[10px] font-bold h-7"
                >
                  <Trash2 className="size-3.5 mr-1" /> Gỡ bỏ tệp
                </Button>
              </div>
            ) : (
              <>
                <div className="size-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center mb-3 transition-transform">
                  <UploadCloud className="size-6" />
                </div>
                <p className="text-xs font-bold text-slate-600">Nhấp để tải lên file Đáp án</p>
                <p className="text-[10px] text-slate-400 mt-1">Hỗ trợ định dạng .PDF (Tối đa 20MB)</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex gap-4">
        <div className="size-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
          <Sparkles className="size-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-amber-900 tracking-tight">Trí tuệ nhân tạo (AI) sẽ tự động phân tích</h4>
          <p className="text-[11px] text-amber-800/80 leading-relaxed mt-1">
            Sau khi bạn tải lên, hệ thống AI của Scorify sẽ đọc nội dung từ file đề thi và đối soát với barem đáp án để tự động nhận diện các tiêu chí chấm. Bạn không cần phải nhập liệu thủ công từng câu hỏi như trước nữa.
          </p>
        </div>
      </div>
    </div>
  );
}
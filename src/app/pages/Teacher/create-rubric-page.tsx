import * as React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Trash2, 
  Save, 
  FileText,
  UploadCloud,
  FileCheck,
  Sparkles,
  Loader2
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { toast } from "sonner";
import { supabaseClient } from "@/app/services/supabaseClient";
import { useAuth } from "@/app/context/AuthContext";

export function CreateRubricPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = !!id;

  const [title, setTitle] = React.useState("");
  const [grade, setGrade] = React.useState("Lớp 12");
  const [isUploading, setIsUploading] = React.useState(false);
  const [loading, setLoading] = React.useState(isEditMode);
  
  const [examFile, setExamFile] = React.useState<File | null>(null);
  const [rubricFile, setRubricFile] = React.useState<File | null>(null);
  const [existingFileUrl, setExistingFileUrl] = React.useState<string | null>(null);
  
  const examInputRef = React.useRef<HTMLInputElement>(null);
  const rubricInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const fetchRubric = async () => {
      if (isEditMode && id) {
        try {
          setLoading(true);
          const { data, error } = await supabaseClient
            .from('rubric')
            .select('*')
            .eq('rubric_id', id)
            .single();

          if (error) throw error;

          if (data) {
            // Clean title by removing prefix tags if they exist
            const cleanTitle = data.rubric_name.replace(/^\[(Đề thi|Đáp án)\] /, "");
            setTitle(cleanTitle);
            setExistingFileUrl(data.rubric_description);
          }
        } catch (error) {
          console.error("Error fetching rubric:", error);
          toast.error("Không thể tải thông tin bài tập.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchRubric();
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

  const uploadFileToSupabase = async (file: File, folder: string) => {
    if (!user) {
      throw new Error("Người dùng chưa đăng nhập!");
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${folder}/${fileName}`;

    const { data, error } = await supabaseClient.storage
      .from('Scorify_rubrics')
      .upload(filePath, file);

    if (error) {
      console.error("Storage upload error:", error);
      throw error;
    }

    const { data: { publicUrl } } = supabaseClient.storage
      .from('Scorify_rubrics')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  // Mock Save Flow updating local storage
  const handleSaveRubric = async () => {
    if (!title.trim()) {
      toast.error("Vui lòng điền tên bài tập / đề thi!");
      return;
    }

    if (!isEditMode && (!examFile || !rubricFile)) {
      toast.error("Vui lòng tải lên đầy đủ file đề thi và file đáp án/rubric!");
      return;
    }

    const confirmSave = window.confirm("Bạn có chắc chắn muốn lưu bài tập này và tải các tệp lên hệ thống?");
    if (!confirmSave) return;

    setIsUploading(true);

    try {
      if (isEditMode) {
        // Handle Update logic
        let newUrl = existingFileUrl;
        
        // If user uploaded a new file in edit mode, upload it first
        // In edit mode, we only handle one file (the one that matches the row)
        // For simplicity, we'll check both but typically only one row is edited at a time
        const fileToUpload = examFile || rubricFile;
        if (fileToUpload) {
          newUrl = await uploadFileToSupabase(fileToUpload, "updates");
        }

        const { error: updateError } = await supabaseClient
          .from('rubric')
          .update({
            rubric_name: title, // Keeping it simple for update
            rubric_description: newUrl,
            rubric_last_edit: new Date().toISOString()
          })
          .eq('rubric_id', id);

        if (updateError) throw updateError;
        toast.success("Cập nhật bài tập thành công!");
      } else {
        // Handle Creation logic (2 rows)
        if (examFile) {
          const examUrl = await uploadFileToSupabase(examFile, "exams");
          const { error: examDbError } = await supabaseClient
            .from('rubric')
            .insert({
              creator_profile_id: user?.id,
              rubric_name: `[Đề thi] ${title}`,
              rubric_description: examUrl,
              rubric_create_time: new Date().toISOString(),
              rubric_last_edit: new Date().toISOString()
            });
          if (examDbError) throw examDbError;
        }

        if (rubricFile) {
          const rubricUrl = await uploadFileToSupabase(rubricFile, "rubrics");
          const { error: rubricDbError } = await supabaseClient
            .from('rubric')
            .insert({
              creator_profile_id: user?.id,
              rubric_name: `[Đáp án] ${title}`,
              rubric_description: rubricUrl,
              rubric_create_time: new Date().toISOString(),
              rubric_last_edit: new Date().toISOString()
            });
          if (rubricDbError) throw rubricDbError;
        }
        toast.success("Đã tạo bài tập/đề thi mới thành công!");
      }

      navigate("/rubrics");
    } catch (error: any) {
      toast.error(`Lỗi khi lưu bài tập: ${error.message || "Vui lòng thử lại sau."}`);
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="size-8 text-indigo-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Đang tải thông tin bài tập...</p>
      </div>
    );
  }

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
          <Button 
            onClick={handleSaveRubric} 
            disabled={isUploading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-md min-w-[120px]"
          >
            {isUploading ? (
              <>
                <Loader2 className="size-4 mr-1.5 animate-spin" /> Đang tải lên...
              </>
            ) : (
              <>
                <Save className="size-4 mr-1.5" /> Lưu bài tập
              </>
            )}
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
              <SelectItem value="Lớp 6">Khối Lớp 6</SelectItem>
              <SelectItem value="Lớp 7">Khối Lớp 7</SelectItem>
              <SelectItem value="Lớp 8">Khối Lớp 8</SelectItem>
              <SelectItem value="Lớp 9">Khối Lớp 9</SelectItem>
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
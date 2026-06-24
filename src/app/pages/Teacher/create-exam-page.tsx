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
  Loader2,
  Check,
  ChevronsUpDown,
  Search
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { cn } from "@/app/components/ui/utils";
import { toast } from "sonner";
import { supabaseClient } from "@/app/services/supabaseClient";
import { useAuth } from "@/app/context/AuthContext";

export function CreateExamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const isEditMode = !!id;

  const [title, setTitle] = React.useState("");
  const [selectedClasses, setSelectedClasses] = React.useState<string[]>([]);
  const [classes, setClasses] = React.useState<any[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [openClassPopover, setOpenClassPopover] = React.useState(false);
  const [classSearchTerm, setClassSearchTerm] = React.useState("");

  const [examFile, setExamFile] = React.useState<File | null>(null);
  const [rubricFile, setRubricFile] = React.useState<File | null>(null);
  
  // States for existing data in edit mode
  const [existingExamUrl, setExistingExamUrl] = React.useState<string | null>(null);
  const [existingRubricUrl, setExistingRubricUrl] = React.useState<string | null>(null);
  const [originalClassId, setOriginalClassId] = React.useState<string | null>(null);

  const examInputRef = React.useRef<HTMLInputElement>(null);
  const rubricInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch available classes for the teacher
  React.useEffect(() => {
    const fetchData = async () => {
      const targetUserId = user?.id || profile?.id;
      
      if (authLoading) return;
      if (!targetUserId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // 1. Fetch Classes
        const { data: classData, error: classError } = await supabaseClient
          .from('class')
          .select('*')
          .eq('teacher_profile_id', targetUserId);

        if (classError) throw classError;
        setClasses(classData || []);

        // 2. Fetch Exam Data if in Edit Mode
        if (isEditMode && id) {
          const { data: examData, error: examError } = await supabaseClient
            .from('exam')
            .select('*')
            .eq('exam_id', id)
            .maybeSingle();

          if (examError) throw examError;
          if (examData) {
            setTitle(examData.exam_name);
            setSelectedClasses([examData.class_id]);
            setOriginalClassId(examData.class_id);

            // Parse description JSON
            try {
              if (examData.description) {
                const meta = JSON.parse(examData.description);
                setExistingExamUrl(meta.examUrl || null);
                setExistingRubricUrl(meta.rubricUrl || null);
              }
            } catch (e) {
              console.warn("Could not parse exam description JSON:", e);
            }
          }
        }
      } catch (error: any) {
        console.error("Fetch operation failed:", error);
        toast.error(`Lỗi: ${error.message || "Không thể tải dữ liệu"}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, profile?.id, authLoading, id, isEditMode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "exam" | "rubric") => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Vui lòng chỉ tải lên tệp định dạng PDF!");
        return;
      }
      if (type === "exam") setExamFile(file);
      else setRubricFile(file);
      toast.success(`Đã chọn tệp mới: ${file.name}`);
    }
  };

  const removeFile = (type: "exam" | "rubric") => {
    if (type === "exam") {
      setExamFile(null);
      setExistingExamUrl(null);
    } else {
      setRubricFile(null);
      setExistingRubricUrl(null);
    }
  };

  const uploadFileToSupabase = async (file: File, folder: string) => {
    if (!user) throw new Error("Người dùng chưa đăng nhập!");

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${folder}/${fileName}`;

    const { error } = await supabaseClient.storage
      .from('Scorify_rubrics')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabaseClient.storage
      .from('Scorify_rubrics')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const toggleClass = (classId: string) => {
    setSelectedClasses(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId) 
        : [...prev, classId]
    );
  };

  const handleSaveRubric = async () => {
    if (!title.trim()) {
      toast.error("Vui lòng điền tên bài tập / đề thi!");
      return;
    }

    if (selectedClasses.length === 0) {
      toast.error("Vui lòng chọn ít nhất một lớp học!");
      return;
    }

    // Validation for new creation
    if (!isEditMode && (!examFile || !rubricFile)) {
      toast.error("Vui lòng tải lên đầy đủ file đề thi và file đáp án/rubric!");
      return;
    }

    const confirmSave = window.confirm(
      isEditMode 
        ? "Bạn có chắc chắn muốn cập nhật bài tập này?" 
        : `Bạn có chắc chắn muốn giao bài tập này cho ${selectedClasses.length} lớp học đã chọn?`
    );
    if (!confirmSave) return;

    setIsUploading(true);

    try {
      let examUrl = existingExamUrl;
      let rubricUrl = existingRubricUrl;

      // Upload new files if provided
      if (examFile) examUrl = await uploadFileToSupabase(examFile, "exams");
      if (rubricFile) rubricUrl = await uploadFileToSupabase(rubricFile, "rubrics");

      const description = JSON.stringify({
        examUrl: examUrl || null,
        rubricUrl: rubricUrl || null,
        updatedAt: new Date().toISOString(),
        createdAt: isEditMode ? undefined : new Date().toISOString()
      });

      if (isEditMode) {
        // UPDATE existing row
        const { error: updateError } = await supabaseClient
          .from('exam')
          .update({
            exam_name: title,
            class_id: selectedClasses[0],
            description: description,
          })
          .eq('exam_id', id);

        if (updateError) throw updateError;
        
        const additionalClasses = selectedClasses.slice(1);
        if (additionalClasses.length > 0) {
          const extraData = additionalClasses.map(classId => ({
            class_id: classId,
            exam_name: title,
            description: description,
            max_score: 10,
            created_by: user?.id,
            created_at: new Date().toISOString()
          }));
          await supabaseClient.from('exam').insert(extraData);
        }

        toast.success("Cập nhật bài thi thành công!");
      } else {
        // CREATE new rows (one per class)
        const insertData = selectedClasses.map(classId => ({
          class_id: classId,
          exam_name: title,
          description: description,
          max_score: 10,
          created_by: user?.id,
          created_at: new Date().toISOString()
        }));

        const { error: insertError } = await supabaseClient
          .from('exam')
          .insert(insertData);

        if (insertError) throw insertError;
        toast.success(`Đã giao bài tập mới cho ${selectedClasses.length} lớp thành công!`);
      }

      navigate("/rubrics");
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(`Lỗi khi lưu bài tập: ${error.message || "Vui lòng thử lại sau."}`);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredClasses = classes.filter(cls => 
    (cls.class_name || "").toLowerCase().includes(classSearchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="size-8 text-indigo-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Đang tải thông tin...</p>
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
                <Loader2 className="size-4 mr-1.5 animate-spin" /> Đang xử lý...
              </>
            ) : (
              <>
                <Save className="size-4 mr-1.5" /> {isEditMode ? "Lưu thay đổi" : "Giao bài tập"}
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
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Giao cho lớp học</label>
          <Popover open={openClassPopover} onOpenChange={setOpenClassPopover}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full h-11 justify-between text-xs rounded-xl border-slate-200 font-medium bg-white hover:bg-slate-50"
              >
                <span className="truncate">
                  {selectedClasses.length === 0 
                    ? "Chọn lớp học..." 
                    : `Đã chọn ${selectedClasses.length} lớp`}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 rounded-xl shadow-xl border-slate-100" align="start">
              <div className="flex items-center border-b px-3 py-2.5 bg-slate-50/50">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-slate-400" />
                <input
                  className="flex h-6 w-full rounded-md bg-transparent text-xs outline-none placeholder:text-slate-400"
                  placeholder="Tìm lớp học..."
                  value={classSearchTerm}
                  onChange={(e) => setClassSearchTerm(e.target.value)}
                />
              </div>

              <div className="max-h-[300px] overflow-y-auto p-1.5 custom-scrollbar">
                {classes.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Bạn chưa có lớp học nào.
                  </div>
                ) : filteredClasses.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Không tìm thấy lớp học phù hợp.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredClasses.map((cls) => (
                      <button
                        key={cls.class_id}
                        type="button"
                        onClick={() => toggleClass(cls.class_id)}
                        className={cn(
                          "flex w-full items-center rounded-lg px-2.5 py-2.5 text-left text-xs transition-colors",
                          selectedClasses.includes(cls.class_id) 
                            ? "bg-indigo-50/50 text-indigo-700" 
                            : "hover:bg-slate-50 text-slate-600"
                        )}
                      >
                        <div className={cn(
                          "mr-3 flex h-4 w-4 items-center justify-center rounded border transition-all",
                          selectedClasses.includes(cls.class_id)
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                            : "bg-white border-slate-200"
                        )}>
                          {selectedClasses.includes(cls.class_id) && <Check className="h-3 w-3" strokeWidth={3} />}
                        </div>
                        <span className="font-semibold">{cls.class_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {selectedClasses.length > 0 && (
        <div className="flex flex-wrap gap-2 px-1">
          {selectedClasses.map(id => {
            const cls = classes.find(c => c.class_id === id);
            return (
              <Badge key={id} variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100 py-1 px-3 rounded-full text-[10px] font-bold flex items-center gap-1 group">
                {cls?.class_name || "Lớp học"}
                <Trash2 
                  className="size-3 cursor-pointer text-slate-300 group-hover:text-rose-500 transition-colors ml-1" 
                  onClick={() => toggleClass(id)}
                />
              </Badge>
            );
          })}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* EXAM PDF SECTION */}
        <div className="space-y-3">
          <div className="px-1">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileText className="size-4 text-indigo-500" />
              File PDF Đề thi
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Tải lên bản thảo đề thi để AI tham chiếu nội dung.</p>
          </div>

          <div 
            onClick={() => !examFile && !existingExamUrl && examInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
              examFile || existingExamUrl
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
                  <p className="text-[10px] text-slate-400">{(examFile.size / 1024 / 1024).toFixed(2)} MB • Mới tải lên</p>
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
            ) : existingExamUrl ? (
              <div className="space-y-3 w-full">
                <div className="size-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mx-auto shadow-inner">
                  <FileText className="size-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800 truncate px-4">Tệp đề thi hiện tại</p>
                  <p className="text-[10px] text-indigo-500 font-bold flex items-center justify-center gap-1">
                    <a href={existingExamUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                      <ExternalLink className="size-3" /> Xem tệp cũ
                    </a>
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => { e.stopPropagation(); removeFile("exam"); }}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-[10px] font-bold h-7"
                >
                  <Trash2 className="size-3.5 mr-1" /> Thay đổi tệp
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

        {/* RUBRIC PDF SECTION */}
        <div className="space-y-3">
          <div className="px-1">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="size-4 text-emerald-500" />
              File PDF Đáp án & Rubric
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Tải lên barem điểm chi tiết để AI học quy chuẩn chấm.</p>
          </div>

          <div 
            onClick={() => !rubricFile && !existingRubricUrl && rubricInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
              rubricFile || existingRubricUrl
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
                  <p className="text-[10px] text-slate-400">{(rubricFile.size / 1024 / 1024).toFixed(2)} MB • Mới tải lên</p>
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
            ) : existingRubricUrl ? (
              <div className="space-y-3 w-full">
                <div className="size-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto shadow-inner">
                  <FileCheck className="size-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800 truncate px-4">Tệp đáp án hiện tại</p>
                  <p className="text-[10px] text-emerald-500 font-bold flex items-center justify-center gap-1">
                    <a href={existingRubricUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                      <ExternalLink className="size-3" /> Xem tệp cũ
                    </a>
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => { e.stopPropagation(); removeFile("rubric"); }}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-[10px] font-bold h-7"
                >
                  <Trash2 className="size-3.5 mr-1" /> Thay đổi tệp
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

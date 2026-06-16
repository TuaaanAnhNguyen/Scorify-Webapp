// src/app/pages/Teacher/ai-grading-page.tsx

import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Undo2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Edit3,
  Save,
  Cpu,
  Eye,
  Plus,
  Minus,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { toast } from "sonner";

const MOCK_AI_GRADES = {
  studentName: "Nguyễn Văn An",
  studentId: "STU-001",
  assignmentName: "Kiểm tra Tập hợp & Bất phương trình bậc nhất",
  totalScore: 7.5,
  aiConfidence: "94%",
  // Bounding box coordinates normalized to percentages for scaling over any container size
  anomalies: [
    {
      id: "err-1",
      x: 15,
      y: 32,
      width: 70,
      height: 12,
      label: "Sai dấu bất đẳng thức (Dòng 3)",
    },
    {
      id: "err-2",
      x: 40,
      y: 68,
      width: 45,
      height: 10,
      label: "Nhầm điều kiện xác định x ≠ 2",
    },
  ],
  criteria: [
    {
      id: "crit-1",
      name: "1. Trình bày lý thuyết & Điều kiện xác định",
      aiScore: 1.5,
      maxScore: 2.0,
      aiFeedback:
        "Xác định tập nghiệm cơ bản đúng, nhưng thiếu điều kiện mẫu thức ở câu mẫu số phụ.",
      isOverridden: false,
    },
    {
      id: "crit-2",
      name: "2. Các bước biến đổi & Biện luận toán học",
      aiScore: 4.0,
      maxScore: 5.0,
      aiFeedback:
        "Biến đổi tương đương chính xác cho đến bước quy đồng. Bị sai dấu ở bước chuyển vế bất phương trình câu 2b.",
      isOverridden: false,
    },
    {
      id: "crit-3",
      name: "3. Đáp số & Kết luận tập nghiệm",
      aiScore: 2.0,
      maxScore: 3.0,
      aiFeedback:
        "Do sai hệ quả dấu ở phần biến đổi dẫn đến tập nghiệm cuối cùng bị lệch khoảng.",
      isOverridden: false,
    },
  ],
  generalComment:
    "Học sinh hiểu cách giải bài toán bất phương trình. Tuy nhiên kỹ năng tính toán biến đổi dấu còn cẩu thả. Cần rèn luyện thêm bài tập chuyển vế đổi dấu.",
};

export function AIGradingPage() {
  const { classId, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Local state holding the evaluation data to allow manual override editing
  const [evaluation, setEvaluation] = useState(MOCK_AI_GRADES);
  const [hoveredAnomalyId, setHoveredAnomalyId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleBack = () => {
    // Luôn quay trở lại trang trước đó trong lịch sử trình duyệt
    // Điều này đảm bảo nếu user đến từ trang Chi tiết Bài tập thì sẽ về trang đó,
    // còn nếu đến từ trang Lớp học thì sẽ về trang Lớp học.
    navigate(-1);
  };

  // Core function handling teacher's numeric score modification
  const handleScoreChange = (criterionId: string, newScoreStr: string) => {
    const updatedCriteria = evaluation.criteria.map((crit) => {
      if (crit.id === criterionId) {
        let val = parseFloat(newScoreStr) || 0;
        if (val > crit.maxScore) val = crit.maxScore;
        if (val < 0) val = 0;
        return { ...crit, aiScore: val, isOverridden: true };
      }
      return crit;
    });

    // Recalculate total score dynamically on the fly
    const nextTotalScore = updatedCriteria.reduce(
      (sum, c) => sum + c.aiScore,
      0,
    );

    setEvaluation({
      ...evaluation,
      criteria: updatedCriteria,
      totalScore: parseFloat(nextTotalScore.toFixed(1)),
    });
  };

  // Handler for teacher editing written feedback segments
  const handleFeedbackChange = (criterionId: string, txt: string) => {
    setEvaluation({
      ...evaluation,
      criteria: evaluation.criteria.map((c) =>
        c.id === criterionId
          ? { ...c, aiFeedback: txt, isOverridden: true }
          : c,
      ),
    });
  };

  const handleSaveEvaluation = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Đã phê duyệt và lưu bảng điểm chỉnh sửa thành công!");
      handleBack();
    }, 800);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Action Ribbon Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="rounded-xl border border-slate-100 bg-white size-9 shadow-sm"
          >
            <ArrowLeft className="size-4 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
              Chấm điểm AI: {evaluation.studentName}
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              Mã học sinh: {evaluation.studentId} • {evaluation.assignmentName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEvaluation(MOCK_AI_GRADES)}
            className="text-xs font-bold gap-1.5 border-slate-200 h-9 rounded-xl text-slate-600 bg-white"
          >
            <RotateCcw className="size-3.5" /> Khôi phục gốc AI
          </Button>
          <Button
            size="sm"
            disabled={isSaving}
            onClick={handleSaveEvaluation}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1.5 h-9 rounded-xl shadow-md"
          >
            <Save className="size-3.5" />{" "}
            {isSaving ? "Đang lưu..." : "Phê duyệt & Lưu điểm"}
          </Button>
        </div>
      </div>

      {/* Main Split Screen Interface Frame */}
      <div className="grid lg:grid-cols-2 gap-5 h-[calc(100vh-180px)] min-h-[550px]">
        {/* ==================== LEFT HALF: SPATIAL CANVAS COMPONENT ==================== */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden group/canvas shadow-inner">
          {/* Diagnostic Overlay HUD Header Info */}
          <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
            <Badge className="bg-slate-950/80 backdrop-blur text-indigo-400 border border-slate-800 font-mono text-[10px] gap-1 px-2 py-1">
              <Eye className="size-3" /> CANVAS_VIEWER_MODE // MATH_OCR
            </Badge>
            <div className="flex items-center gap-1.5">
              {evaluation.anomalies.map((anom) => (
                <Badge
                  key={anom.id}
                  className={`transition-all border font-bold text-[10px] uppercase duration-200 ${
                    hoveredAnomalyId === anom.id
                      ? "bg-rose-500 text-white border-rose-400 scale-105"
                      : "bg-slate-950/80 backdrop-blur text-rose-400 border-rose-900/50"
                  }`}
                >
                  {anom.id}
                </Badge>
              ))}
            </div>
          </div>

          {/* Core Image Wrapping Canvas Area */}
          <div className="relative w-full max-w-[420px] aspect-[3/4] bg-white rounded-lg shadow-2xl overflow-hidden border border-white/10 m-6">
            {/* Mock Handwriting Exam sheet background graphic simulation layout */}
            <div className="absolute inset-0 p-8 text-slate-700 font-serif space-y-6 select-none bg-amber-50/20 opacity-90 pattern-grid relative z-10 pointer-events-none">
              <div className="border-b-2 border-dashed border-indigo-100 pb-2">
                <span className="font-bold text-xs font-sans text-slate-400 block mb-4">
                  BÀI LÀM TỰ LUẬN TOÁN
                </span>
                <p className="text-sm italic font-semibold text-indigo-950">
                  Bài 1: Giải bất phương trình (2x - 4)/(x - 1) ≤ 1
                </p>
                <p className="text-xs mt-2 text-slate-600 font-mono">
                  Điều kiện xác định: x ≥ 0{" "}
                  <span className="text-rose-500 font-bold font-sans">
                    ← (!)
                  </span>
                </p>
              </div>

              <div className="space-y-2 text-xs font-mono leading-relaxed text-slate-600">
                <p>⇔ 2x - 4 ≤ 1 · (x - 1)</p>
                <p>⇔ 2x - 4 ≤ x - 1</p>
                <p>
                  ⇔ 2x + x ≤ 4 - 1{" "}
                  <span className="text-rose-500 font-bold font-sans">
                    ← (!)
                  </span>
                </p>
                <p>⇔ 3x ≤ 3 ⇒ x ≤ 1</p>
                <p className="text-slate-700 font-medium">
                  Vậy tập nghiệm là S = (-∞; 1]
                </p>
              </div>
            </div>

            {/* Dynamic Absolute Mapping Layer via Bounding Boxes Coordinates */}
            {evaluation.anomalies.map((box) => (
              <div
                key={box.id}
                onMouseEnter={() => setHoveredAnomalyId(box.id)}
                onMouseLeave={() => setHoveredAnomalyId(null)}
                style={{
                  left: `${box.x}%`,
                  top: `${box.y}%`,
                  width: `${box.width}%`,
                  height: `${box.height}%`,
                }}
                className={`absolute rounded border-2 transition-all duration-200 cursor-crosshair ${
                  hoveredAnomalyId === box.id
                    ? "bg-rose-500/15 border-rose-500 shadow-lg shadow-rose-500/20 ring-1 ring-rose-400"
                    : "bg-rose-500/5 border-rose-500/40"
                }`}
              >
                {/* Visual Index Pin indicator badge */}
                <span
                  className={`absolute -top-4 -left-1 px-1 rounded font-sans text-[8px] font-black transition-colors ${
                    hoveredAnomalyId === box.id
                      ? "bg-rose-500 text-white"
                      : "bg-rose-900/80 text-rose-200"
                  }`}
                >
                  {box.id.toUpperCase()}
                </span>
              </div>
            ))}
          </div>

          {/* Floating Context Label Info Bar footer */}
          <div className="absolute bottom-3 left-3 right-3 bg-slate-950/70 border border-slate-800/80 backdrop-blur rounded-xl p-2.5 text-center min-h-[40px] flex items-center justify-center">
            {hoveredAnomalyId ? (
              <p className="text-xs text-rose-300 font-medium flex items-center gap-1.5 animate-pulse">
                <AlertTriangle className="size-3.5 text-rose-400 shrink-0" />
                {
                  evaluation.anomalies.find((a) => a.id === hoveredAnomalyId)
                    ?.label
                }
              </p>
            ) : (
              <p className="text-[11px] text-slate-500 italic">
                Rê chuột vào các vùng viền khung đỏ để xem nhanh ghi chú lỗi
                toán học
              </p>
            )}
          </div>
        </div>

        {/* ==================== RIGHT HALF: EVALUATION CONTROL SHEET ==================== */}
        <div className="bg-white rounded-2xl border border-slate-100 flex flex-col overflow-hidden shadow-sm">
          {/* Metrics Telemetry HUD Block */}
          <div className="bg-slate-50/70 border-b border-slate-100 p-4 grid grid-cols-3 gap-4 text-center">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Điểm Tổng Kết
              </span>
              <div className="text-xl font-black text-indigo-600 tracking-tight">
                {evaluation.totalScore}{" "}
                <span className="text-xs text-slate-400 font-normal">/ 10</span>
              </div>
            </div>
            <div className="space-y-0.5 border-x border-slate-200/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Độ Tin Cậy AI
              </span>
              <div className="text-xl font-black text-emerald-600 tracking-tight flex items-center justify-center gap-1">
                <Cpu className="size-4 text-emerald-500" />{" "}
                {evaluation.aiConfidence}
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Lỗi Phát Hiện
              </span>
              <div className="text-xl font-black text-rose-600 tracking-tight">
                {evaluation.anomalies.length} vùng
              </div>
            </div>
          </div>

          {/* Scrollable Criteria Scoring Checklist Container */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {evaluation.criteria.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  item.isOverridden
                    ? "bg-amber-50/30 border-amber-200/70 shadow-sm"
                    : "bg-white border-slate-100 hover:border-slate-200"
                }`}
              >
                {/* Criteria Segment Header Block */}
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h4 className="font-bold text-slate-800 text-xs tracking-tight pt-1">
                    {item.name}
                  </h4>

                  {/* Dynamic Override Numeric Input Node */}
                  <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 p-1 rounded-lg border border-slate-200/40">
                    <Input
                      type="number"
                      step="0.25"
                      min="0"
                      max={item.maxScore}
                      value={item.aiScore}
                      onChange={(e) =>
                        handleScoreChange(item.id, e.target.value)
                      }
                      className="w-12 h-7 px-1 text-center text-xs font-black text-indigo-600 bg-white rounded shadow-sm border-0 focus-visible:ring-1 focus-visible:ring-indigo-500"
                    />
                    <span className="text-[10px] text-slate-400 font-bold pr-1">
                      / {item.maxScore}
                    </span>
                  </div>
                </div>

                {/* Feedback Input Node */}
                <div className="relative mt-2">
                  <Textarea
                    value={item.aiFeedback}
                    onChange={(e) =>
                      handleFeedbackChange(item.id, e.target.value)
                    }
                    className="text-[11px] leading-relaxed text-slate-600 pr-7 py-2 min-h-[50px] rounded-lg border-slate-200/70 focus-visible:ring-indigo-500/50 bg-white"
                  />
                  <div className="absolute right-2 bottom-2 text-slate-300 pointer-events-none">
                    {item.isOverridden ? (
                      <Edit3 className="size-3 text-amber-500" />
                    ) : (
                      <Cpu className="size-3 text-slate-300" />
                    )}
                  </div>
                </div>

                {/* Status Notice Indicator */}
                {item.isOverridden && (
                  <div className="text-[9px] text-amber-600 font-bold mt-1 flex items-center gap-0.5">
                    * Đã điều chỉnh thủ công bởi giáo viên
                  </div>
                )}
              </div>
            ))}

            {/* Global General Summary Evaluation Field */}
            <div className="pt-2 border-t border-slate-100">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-1">
                <MessageSquare className="size-3 text-indigo-500" /> Đánh giá
                tổng quát toàn bài viết
              </label>
              <Textarea
                value={evaluation.generalComment}
                onChange={(e) =>
                  setEvaluation({
                    ...evaluation,
                    generalComment: e.target.value,
                  })
                }
                className="text-xs leading-relaxed text-slate-600 p-3 min-h-[80px] rounded-xl border-slate-200"
                placeholder="Nhập nhận xét chung..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

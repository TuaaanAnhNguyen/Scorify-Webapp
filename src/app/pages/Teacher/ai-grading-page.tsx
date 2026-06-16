// src/app/pages/Teacher/ai-grading-page.tsx

import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Edit3,
  Save,
  Cpu,
  Eye,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { toast } from "sonner";

// --- NEW IMPORTS FOR LATEX RENDERING ---
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css"; // Ensure math styles render perfectly

const MOCK_AI_GRADES = {
  studentName: "Nguyễn Văn An",
  studentId: "STU-001",
  assignmentName: "Kiểm tra Tập hợp & Bất phương trình bậc nhất",
  totalScore: 7.5,
  aiConfidence: "94%",
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
      // Added sample markdown math block below
      aiFeedback:
        "Xác định tập nghiệm cơ bản đúng, nhưng thiếu điều kiện mẫu thức ở câu mẫu số phụ. Cần bổ sung điều kiện $x \\neq 2$.",
      isOverridden: false,
    },
    {
      id: "crit-2",
      name: "2. Các bước biến đổi & Biện luận toán học",
      aiScore: 4.0,
      maxScore: 5.0,
      aiFeedback:
        "Biến đổi tương đương chính xác cho đến bước quy đồng. Bị sai dấu ở bước chuyển vế bất phương trình câu 2b:\n\n$$\\frac{x+2}{2-x} \\leq 1$$",
      isOverridden: false,
    },
    {
      id: "crit-3",
      name: "3. Đáp số & Kết luận tập nghiệm",
      aiScore: 2.0,
      maxScore: 3.0,
      aiFeedback:
        "Do sai hệ quả dấu ở phần biến đổi dẫn đến tập nghiệm cuối cùng bị lệch khoảng. Kết quả đúng phải là $S = (-1; 2]$.",
      isOverridden: false,
    },
  ],
  generalComment:
    "Học sinh hiểu cách giải bài toán bất phương trình. Tuy nhiên kỹ năng tính toán biến đổi dấu còn cẩu thả. Cần rèn luyện thêm bài tập hệ thức $$ax^2 + bx + c = 0$$.",
};

export function AIGradingPage() {
  // const { classId, id } = useParams();
  const navigate = useNavigate();

  const [evaluation, setEvaluation] = useState(MOCK_AI_GRADES);
  const [hoveredAnomalyId, setHoveredAnomalyId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // --- NEW STATE: Tracks which comment fields are currently in text edit mode ---
  const [editingCriterionId, setEditingCriterionId] = useState<string | null>(
    null,
  );
  const [editingGeneral, setEditingGeneral] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

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
    <div className="space-y-4 animate-in fade-in duration-300 p-4">
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
          <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
            <Badge className="bg-slate-950/80 backdrop-blur text-indigo-400 border border-slate-800 font-mono text-[10px] gap-1 px-2 py-1">
              <Eye className="size-3" /> CANVAS_VIEWER_MODE // MATH_OCR
            </Badge>
          </div>

          <div className="relative w-full max-w-[420px] aspect-[3/4] bg-white rounded-lg shadow-2xl overflow-hidden border border-white/10 m-6 p-8 text-slate-700">
            <div className="border-b-2 border-dashed border-indigo-100 pb-2">
              <span className="font-bold text-xs text-slate-400 block mb-2">
                BÀI LÀM TỰ LUẬN TOÁN
              </span>
              <p className="text-sm font-semibold text-indigo-950">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {
                    "Bài 1: Giải bất phương trình $\\frac{2x - 4}{x - 1} \\leq 1$"
                  }
                </ReactMarkdown>
              </p>
            </div>
            <p className="text-xs mt-4 font-mono">
              Tính toán nháp giả lập hiển thị phía Canvas...
            </p>
          </div>
        </div>

        {/* ==================== RIGHT HALF: EVALUATION CONTROL SHEET ==================== */}
        <div className="bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden shadow-md">
          {/* Metrics Telemetry HUD Block - Slightly larger for readability */}
          <div className="bg-slate-50/80 border-b border-slate-200 p-6 flex items-center justify-evenly">
            {/* Điểm Tổng Kết */}
            <div className="flex flex-col items-center flex-1">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wide block mb-1">
                Điểm Tổng Kết
              </span>
              <div className="text-3xl font-black text-indigo-600">
                {evaluation.totalScore}{" "}
                <span className="text-sm text-slate-400 font-medium">/ 10</span>
              </div>
            </div>

            {/* Divider Line (Optional, looks better with 2 items) */}
            <div className="w-[1px] h-10 bg-slate-200" />

            {/* Lỗi Phát Hiện */}
            <div className="flex flex-col items-center flex-1">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wide block mb-1">
                Lỗi Phát Hiện
              </span>
              <div className="text-3xl font-black text-rose-600">
                {evaluation.anomalies.length}{" "}
                <span className="text-sm">Vùng</span>
              </div>
            </div>
          </div>

          {/* Scrollable Criteria Scoring Checklist Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {evaluation.criteria.map((item) => (
              <div
                key={item.id}
                className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
                  item.isOverridden
                    ? "bg-amber-50/40 border-amber-200 shadow-sm"
                    : "bg-white border-slate-100 hover:border-slate-200"
                }`}
              >
                {/* Criteria Segment Header - Made font larger (text-sm -> text-base) */}
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h4 className="font-bold text-slate-800 text-base">
                    {item.name}
                  </h4>

                  <div className="flex items-center gap-2 shrink-0 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                    <Input
                      type="number"
                      step="0.25"
                      value={item.aiScore}
                      onChange={(e) =>
                        handleScoreChange(item.id, e.target.value)
                      }
                      className="w-16 h-9 px-2 text-center text-lg font-black text-indigo-600 bg-white rounded-lg border-0 shadow-inner"
                    />
                    <span className="text-xs text-slate-500 font-bold pr-2">
                      / {item.maxScore}
                    </span>
                  </div>
                </div>

                {/* Feedback Input Node - ENLARGED FONT SIZE */}
                <div className="relative mt-2">
                  {editingCriterionId === item.id ? (
                    <Textarea
                      autoFocus
                      value={item.aiFeedback}
                      onChange={(e) =>
                        handleFeedbackChange(item.id, e.target.value)
                      }
                      onBlur={() => setEditingCriterionId(null)}
                      className="text-base leading-relaxed text-slate-700 p-4 min-h-[120px] rounded-xl border-2 border-indigo-500 bg-white shadow-lg"
                    />
                  ) : (
                    <div
                      onClick={() => setEditingCriterionId(item.id)}
                      className="text-base leading-relaxed text-slate-700 p-4 min-h-[100px] rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/30 cursor-pointer hover:bg-slate-50 hover:border-indigo-200 transition-all prose prose-slate max-w-none"
                    >
                      {/* ReactMarkdown now renders with 'text-base' (16px) instead of 11px */}
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {item.aiFeedback || "*Nhấp để thêm nhận xét...*"}
                      </ReactMarkdown>
                    </div>
                  )}

                  <div className="absolute right-3 bottom-3 text-slate-300">
                    {item.isOverridden ? (
                      <Edit3 className="size-4 text-amber-500" />
                    ) : (
                      <Cpu className="size-4" />
                    )}
                  </div>
                </div>

                {item.isOverridden && (
                  <div className="text-xs text-amber-600 font-bold mt-2 flex items-center gap-1">
                    <div className="size-1.5 bg-amber-500 rounded-full" /> Giáo
                    viên đã chỉnh sửa
                  </div>
                )}
              </div>
            ))}

            {/* Global General Summary - LARGE View */}
            <div className="pt-6 border-t-2 border-slate-100">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MessageSquare className="size-4 text-indigo-500" /> Nhận xét
                tổng quát
              </label>

              <div className="relative">
                {editingGeneral ? (
                  <Textarea
                    autoFocus
                    value={evaluation.generalComment}
                    onChange={(e) =>
                      setEvaluation({
                        ...evaluation,
                        generalComment: e.target.value,
                      })
                    }
                    onBlur={() => setEditingGeneral(false)}
                    className="text-base leading-relaxed text-slate-700 p-5 min-h-[150px] rounded-2xl border-2 border-indigo-500"
                  />
                ) : (
                  <div
                    onClick={() => setEditingGeneral(true)}
                    className="text-base leading-relaxed text-slate-700 p-5 min-h-[120px] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/30 cursor-pointer hover:bg-white transition-all prose prose-indigo max-w-none"
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {evaluation.generalComment}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

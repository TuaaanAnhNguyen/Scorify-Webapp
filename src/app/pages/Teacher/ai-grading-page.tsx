// src/app/pages/Teacher/ai-grading-page.tsx

import { useState, useEffect, type MouseEvent, type WheelEvent } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Save,
  Cpu,
  MessageSquare,
  Loader2,
  Image as ImageIcon,
  Wand2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronDown,
  Move
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/app/components/ui/collapsible";
import { toast } from "sonner";
import { supabaseClient } from "@/app/services/supabaseClient";
import { documentEndpoints, gradingEndpoints } from "@/app/api/endpoints";

// --- IMPORTS FOR LATEX RENDERING ---
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export function AIGradingPage() {
  const { classId, id: examId } = useParams<{ classId: string; id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const studentId = new URLSearchParams(location.search).get("studentId");

  const [loading, setLoading] = useState(true);
  const [examInfo, setExamInfo] = useState<any>(null);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [resultInfo, setResultInfo] = useState<any>(null);

  const [evaluation, setEvaluation] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGrading, setIsGrading] = useState(false);

  // --- STATE: Tracks which comment fields are currently in text edit mode ---
  const [editingLineIndex, setEditingLineIndex] = useState<number | null>(null);
  const [editingGeneral, setEditingGeneral] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  const getSubmissionPathFromSignedUrl = (signedUrl: string) => {
    try {
      const { pathname } = new URL(signedUrl);
      const marker = '/object/sign/Scorify_storagedev/';
      const markerIndex = pathname.indexOf(marker);

      if (markerIndex === -1) return null;

      return decodeURIComponent(pathname.slice(markerIndex + marker.length));
    } catch {
      return null;
    }
  };

  const refreshSubmissionSignedUrl = async (resultRecord: any) => {
    if (!resultRecord?.signed_url) return resultRecord;

    const filePath = getSubmissionPathFromSignedUrl(resultRecord.signed_url);
    if (!filePath) return resultRecord;

    const { data, error } = await supabaseClient.storage
      .from('Scorify_storagedev')
      .createSignedUrl(filePath, 3600);

    if (error) throw error;

    if (!data?.signedUrl || data.signedUrl === resultRecord.signed_url) {
      return resultRecord;
    }

    const updatedResult = {
      ...resultRecord,
      signed_url: data.signedUrl
    };

    setResultInfo(updatedResult);

    const { error: updateError } = await supabaseClient
      .from('exam_result')
      .update({ signed_url: data.signedUrl })
      .eq('exam_result_id', resultRecord.exam_result_id);

    if (updateError) {
      console.warn('Failed to persist refreshed submission signed URL', updateError);
    }

    return updatedResult;
  };

  const getRubricPathFromUrl = (url: string | null) => {
    if (!url) return null;
    if (url.includes('Scorify_rubrics/')) {
      return decodeURIComponent(url.split('Scorify_rubrics/')[1]);
    }
    return url;
  };

  const getRubricPathFromExam = (examData: any) => {
    if (examData?.rubricPath) return examData.rubricPath;

    try {
      if (!examData?.description) return null;
      const meta = JSON.parse(examData.description);
      return getRubricPathFromUrl(meta.rubricUrl || null);
    } catch (error) {
      console.warn('Could not parse exam description JSON for rubric path', error);
      return null;
    }
  };

  useEffect(() => {
    if (resultInfo?.signed_url) {
      resetImageView();
    }
  }, [resultInfo?.signed_url]);

  useEffect(() => {
    const fetchGradingData = async () => {
      if (!examId || !studentId) {
        toast.error("Thiếu thông tin bài kiểm tra hoặc học sinh.");
        navigate(-1);
        return;
      }

      try {
        setLoading(true);

        // Fetch Exam
        const { data: examData, error: examError } = await supabaseClient
          .from('exam')
          .select('*')
          .eq('exam_id', examId)
          .maybeSingle();

        if (examError) throw examError;

        const rubricPath = getRubricPathFromExam(examData);
        setExamInfo({
          ...examData,
          rubricPath
        });

        // Fetch Student
        const { data: studentData, error: studentError } = await supabaseClient
          .from('student')
          .select('*')
          .eq('student_id', studentId)
          .maybeSingle();

        if (studentError) throw studentError;
        setStudentInfo(studentData);

        // Fetch Result
        const { data: resultData, error: resultError } = await supabaseClient
          .from('exam_result')
          .select('*')
          .match({ exam_id: examId, student_id: studentId })
          .maybeSingle();

        if (resultError) throw resultError;

        let latestResultData = resultData;
        if (resultData?.signed_url) {
          try {
            latestResultData = await refreshSubmissionSignedUrl(resultData);
          } catch (refreshError) {
            console.warn('Failed to refresh submission signed URL on load', refreshError);
          }
        }

        setResultInfo(latestResultData);

        if (latestResultData) {
          let parsedFeedback: any = {};
          try {
            if (resultData.feedback && typeof resultData.feedback === 'string') {
              parsedFeedback = JSON.parse(resultData.feedback);
            } else if (resultData.feedback && typeof resultData.feedback === 'object') {
              parsedFeedback = resultData.feedback;
            }
          } catch (e) {
            console.error("Failed to parse feedback JSON", e);
          }

          setEvaluation({
            totalScore: resultData.score || 0,
            document_lines: parsedFeedback.document_lines || parsedFeedback.aiGradingResult?.criteria || [],
            generalComment: parsedFeedback.generalComment || ""
          });
        }

      } catch (err: any) {
        console.error("Error fetching grading data:", err);
        toast.error("Không thể tải thông tin chấm điểm.");
      } finally {
        setLoading(false);
      }
    };

    fetchGradingData();
  }, [examId, studentId, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const resetImageView = () => {
    setImageScale(1);
    setImageOffset({ x: 0, y: 0 });
    setDragStart(null);
  };

  const updateImageScale = (nextScale: number) => {
    const clampedScale = Math.min(4, Math.max(1, Number(nextScale.toFixed(2))));
    setImageScale(clampedScale);

    if (clampedScale === 1) {
      setImageOffset({ x: 0, y: 0 });
      setDragStart(null);
    }
  };

  const handleImageWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const delta = event.deltaY < 0 ? 0.2 : -0.2;
    updateImageScale(imageScale + delta);
  };

  const handleImageMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (imageScale <= 1) return;

    event.preventDefault();
    setDragStart({
      x: event.clientX - imageOffset.x,
      y: event.clientY - imageOffset.y
    });
  };

  const handleImageMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!dragStart || imageScale <= 1) return;

    setImageOffset({
      x: event.clientX - dragStart.x,
      y: event.clientY - dragStart.y
    });
  };

  const handleImageMouseUp = () => {
    setDragStart(null);
  };

  const handleScoreChange = (index: number, newScoreStr: string) => {
    if (!evaluation || !evaluation.document_lines) return;

    const updatedLines = [...evaluation.document_lines];
    const val = parseFloat(newScoreStr) || 0;

    updatedLines[index] = {
      ...updatedLines[index],
      score: val,
      isOverridden: true
    };

    // Calculate new total score
    const newTotal = updatedLines.reduce((sum, line) => sum + (line.score || 0), 0);

    setEvaluation({
      ...evaluation,
      document_lines: updatedLines,
      totalScore: parseFloat(newTotal.toFixed(1))
    });
  };

  const handleFeedbackChange = (index: number, txt: string) => {
    if (!evaluation || !evaluation.document_lines) return;

    const updatedLines = [...evaluation.document_lines];
    updatedLines[index] = {
      ...updatedLines[index],
      feedback: txt,
      isOverridden: true
    };

    setEvaluation({
      ...evaluation,
      document_lines: updatedLines
    });
  };

  const handleSaveEvaluation = async () => {
    if (!resultInfo) return;

    setIsSaving(true);
    try {
      // Re-construct the feedback payload
      const currentFeedbackStr = resultInfo.feedback || '{}';
      let currentFeedbackObj = typeof currentFeedbackStr === 'string' ? JSON.parse(currentFeedbackStr) : currentFeedbackStr;

      const newFeedbackObj = {
        ...currentFeedbackObj,
        document_lines: evaluation.document_lines,
        generalComment: evaluation.generalComment
      };

      const { error } = await supabaseClient
        .from('exam_result')
        .update({
          score: evaluation.totalScore,
          feedback: JSON.stringify(newFeedbackObj),
          graded_at: new Date().toISOString()
        })
        .eq('exam_result_id', resultInfo.exam_result_id);

      if (error) throw error;

      toast.success("Đã phê duyệt và lưu bảng điểm thành công!");
      handleBack();
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(`Lỗi khi lưu điểm: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAIGrading = async () => {
    let latestResultInfo = resultInfo;

    if (resultInfo?.signed_url) {
      try {
        latestResultInfo = await refreshSubmissionSignedUrl(resultInfo);
      } catch (refreshError: any) {
        console.error("Failed to refresh submission signed URL before grading:", refreshError);
      }
    }

    if (!latestResultInfo?.signed_url) {
      toast.error("Không có ảnh bài làm để AI phân tích.");
      return;
    }

    const rubricPath = getRubricPathFromExam(examInfo);

    if (!rubricPath) {
      toast.error("Không tìm thấy rubric/đáp án để chấm điểm.");
      return;
    }

    setIsGrading(true);
    toast.info("AI đang phân tích bố cục...", { id: "ai-grading" });

    try {
      // 1. Fetch the image file from the signed URL
      const response = await fetch(latestResultInfo.signed_url);
      const blob = await response.blob();
      const fileExt = blob.type.split('/')[1] || 'jpg';
      const imageFile = new File([blob], `submission_${studentId}.${fileExt}`, { type: blob.type });

      // 2. Call /documents/detect to get LayoutDectectResponse
      const detectResponse = await documentEndpoints.detectLayout(imageFile);
      const documentJsonStr = JSON.stringify(detectResponse);
      
      // Update UI with the intermediate detect layout if needed, though we immediately proceed to grading
      setEvaluation({
        totalScore: 0,
        document_lines: detectResponse.document_lines,
        generalComment: "Đang chờ chấm điểm..."
      });
      
      toast.info("AI đang đối chiếu Rubric & chấm điểm...", { id: "ai-grading" });

      // 3. Fetch Rubric File from Supabase to send to the grading API
      let rubricFile: File;
      try {
        const { data: rubricSignedData, error: rubricSignedError } = await supabaseClient.storage
          .from('Scorify_rubrics')
          .createSignedUrl(rubricPath, 3600);

        if (rubricSignedError) throw rubricSignedError;
        if (!rubricSignedData?.signedUrl) throw new Error('Missing signed URL for rubric file.');

        const rubricRes = await fetch(rubricSignedData.signedUrl);
        if (!rubricRes.ok) throw new Error(`Rubric fetch failed with status ${rubricRes.status}`);
        const rubricBlob = await rubricRes.blob();
        rubricFile = new File([rubricBlob], 'rubric.pdf', { type: rubricBlob.type });
      } catch (err) {
        throw new Error("Không thể tải file rubric (đáp án) để chấm bài.");
      }

      // 4. Call /gradings/rubrics with Rubric file & Document JSON
      const gradingResponse = await gradingEndpoints.gradeByRubric(rubricFile, documentJsonStr);

      // The response is GradingAnalysisResponse which contains document_lines with scores and feedback
      const newLines = gradingResponse.document_lines || [];
      
      // Calculate total score from the graded lines
      const totalScore = newLines.reduce((sum: number, line: any) => sum + (line.score || 0), 0);

      // 5. Prepare combined feedback to save to DB
      const currentFeedbackStr = resultInfo.feedback || '{}';
      let currentFeedbackObj = typeof currentFeedbackStr === 'string' ? JSON.parse(currentFeedbackStr) : currentFeedbackStr;
      
      const combinedFeedback = {
        ...currentFeedbackObj,
        document_lines: newLines,
        generalComment: "Đã chấm điểm hoàn tất bằng AI.",
        status: "graded"
      };

      const { error } = await supabaseClient
        .from('exam_result')
        .update({
          score: totalScore,
          feedback: JSON.stringify(combinedFeedback),
          graded_at: new Date().toISOString()
        })
        .eq('exam_result_id', resultInfo.exam_result_id);

      if (error) throw error;

      toast.success("AI đã chấm xong!", { id: "ai-grading" });

      // 5. Update UI
      setEvaluation({
        totalScore: totalScore,
        document_lines: newLines,
        generalComment: combinedFeedback.generalComment
      });
      setResultInfo({
        ...resultInfo,
        score: totalScore,
        feedback: JSON.stringify(combinedFeedback)
      });

    } catch (err: any) {
      console.error("AI Grading error:", err);
      toast.error(`Lỗi khi AI chấm điểm: ${err.message || 'Lỗi không xác định'}`, { id: "ai-grading" });
    } finally {
      setIsGrading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="size-8 text-indigo-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Đang tải dữ liệu bài làm...</p>
      </div>
    );
  }

  if (!resultInfo) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <AlertTriangle className="size-12 text-amber-500" />
        <p className="text-sm font-bold text-slate-700">Học sinh chưa tải bài làm lên hệ thống.</p>
        <Button onClick={handleBack} variant="outline" className="mt-4">Quay lại</Button>
      </div>
    );
  }

  const hasAIFeedback = evaluation?.document_lines && evaluation.document_lines.length > 0;

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
              Chi tiết bài làm: {studentInfo?.full_name || "Học sinh ẩn danh"}
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              Mã: {studentInfo?.student_code || "---"} • {examInfo?.exam_name || "Bài kiểm tra"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAIGrading}
            disabled={isGrading || isSaving}
            className="text-xs font-bold gap-1.5 border-indigo-200 h-9 rounded-xl text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
          >
            {isGrading ? <Loader2 className="size-3.5 animate-spin" /> : <Wand2 className="size-3.5" />} 
            {hasAIFeedback ? "Chấm lại (AI)" : "Chấm bài bằng AI"}
          </Button>

          {hasAIFeedback && (
            <Button
              size="sm"
              disabled={isSaving || isGrading}
              onClick={handleSaveEvaluation}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1.5 h-9 rounded-xl shadow-md transition-colors"
            >
              {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              Phê duyệt & Lưu điểm
            </Button>
          )}
        </div>
      </div>

      {/* Main Split Screen Interface Frame */}
      <div className="grid lg:grid-cols-2 gap-5 h-[calc(100vh-140px)] min-h-[550px]">

        {/* ==================== LEFT HALF: ACTUAL IMAGE VIEWER ==================== */}
        <div className="bg-slate-100 rounded-2xl border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden shadow-inner p-2">
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2 pointer-events-none">
            <Badge className="bg-white/90 backdrop-blur text-slate-700 border border-slate-200 shadow-sm font-bold text-[10px] gap-1 px-2 py-1">
              <ImageIcon className="size-3 text-indigo-500" /> BẢN GỐC BÀI LÀM
            </Badge>
          </div>

          {resultInfo.signed_url ? (
            <>
              <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                <Badge className="bg-white/90 backdrop-blur text-slate-600 border border-slate-200 shadow-sm font-bold text-[10px] px-2 py-1">
                  {Math.round(imageScale * 100)}%
                </Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => updateImageScale(imageScale - 0.2)}
                  className="size-8 rounded-lg bg-white/90 backdrop-blur border-slate-200 shadow-sm"
                >
                  <ZoomOut className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => updateImageScale(imageScale + 0.2)}
                  className="size-8 rounded-lg bg-white/90 backdrop-blur border-slate-200 shadow-sm"
                >
                  <ZoomIn className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={resetImageView}
                  className="size-8 rounded-lg bg-white/90 backdrop-blur border-slate-200 shadow-sm"
                >
                  <RotateCcw className="size-3.5" />
                </Button>
              </div>

              <div
                onWheel={handleImageWheel}
                onMouseDown={handleImageMouseDown}
                onMouseMove={handleImageMouseMove}
                onMouseUp={handleImageMouseUp}
                onMouseLeave={handleImageMouseUp}
                className={`flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-slate-50 ${
                  imageScale > 1 ? (dragStart ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"
                }`}
              >
                <img
                  src={resultInfo.signed_url}
                  alt="Bài làm học sinh"
                  onError={() => {
                    void refreshSubmissionSignedUrl(resultInfo).catch((err) => {
                      console.error("Failed to refresh submission signed URL after image load error:", err);
                    });
                  }}
                  draggable={false}
                  className="max-h-full max-w-full select-none rounded-xl object-contain transition-transform duration-100 ease-out"
                  style={{
                    transform: `translate(${imageOffset.x}px, ${imageOffset.y}px) scale(${imageScale})`
                  }}
                />
              </div>

              <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 rounded-lg bg-white/85 px-3 py-1.5 text-[11px] font-medium text-slate-500 shadow-sm backdrop-blur">
                <Move className="size-3.5 text-indigo-500" />
                Cuộn để zoom, kéo để di chuyển
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center text-slate-400">
              <ImageIcon className="size-12 opacity-50 mb-2" />
              <p className="text-sm font-medium">Không tìm thấy ảnh bài làm gốc.</p>
            </div>
          )}
        </div>

        {/* ==================== RIGHT HALF: EVALUATION CONTROL SHEET ==================== */}
        <div className="bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden shadow-md relative">
          
          {/* Overlay loading spinner when grading */}
          {isGrading && (
            <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center border border-indigo-100">
                <Loader2 className="size-10 text-indigo-600 animate-spin mb-4" />
                <h3 className="font-bold text-slate-800 mb-1">AI đang phân tích</h3>
                <p className="text-xs text-slate-500">Quá trình này có thể mất vài giây...</p>
              </div>
            </div>
          )}

          {/* Metrics Telemetry HUD Block */}
          <Collapsible open={isSummaryExpanded} onOpenChange={setIsSummaryExpanded}>
            <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-3">
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition-colors hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Tổng quan chấm</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-xl font-black text-indigo-600 leading-none">
                        {evaluation?.totalScore || 0}
                        <span className="ml-1 text-xs font-medium text-slate-400">/ {examInfo?.max_score || 10}</span>
                      </span>
                      {hasAIFeedback ? (
                        <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold text-[10px] gap-1">
                          <CheckCircle2 className="size-3.5" /> Đã phân tích
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-50 text-amber-600 border border-amber-200 font-bold text-[10px] gap-1">
                          <AlertTriangle className="size-3.5" /> Chưa chấm
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ChevronDown className={`size-4 shrink-0 text-slate-400 transition-transform ${isSummaryExpanded ? "rotate-180" : ""}`} />
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent className="pt-3">
                <div className="flex items-center justify-evenly rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wide block mb-1">
                      Điểm Tổng Kết
                    </span>
                    <div className="text-2xl font-black text-indigo-600">
                      {evaluation?.totalScore || 0}{" "}
                      <span className="text-xs text-slate-400 font-medium">/ {examInfo?.max_score || 10}</span>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wide block mb-1">
                      Trạng thái AI
                    </span>
                    <div className="text-xs font-bold mt-1">
                      {hasAIFeedback ? (
                        <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="size-3.5" /> Đã phân tích</span>
                      ) : (
                        <span className="text-amber-500 flex items-center gap-1"><AlertTriangle className="size-3.5" /> Chưa chấm</span>
                      )}
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Scrollable Criteria Scoring Checklist Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {!hasAIFeedback ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-20">
                <Cpu className="size-12 opacity-20" />
                <p className="text-sm font-medium text-center px-8">
                  Hệ thống AI chưa trả về kết quả chấm điểm cho bài làm này.
                </p>
                <Button 
                  onClick={handleAIGrading}
                  className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 font-bold text-xs shadow-none border border-indigo-200"
                >
                  <Wand2 className="size-3.5 mr-1.5" />
                  Bắt đầu chấm AI
                </Button>
              </div>
            ) : (
              <>
                {evaluation.document_lines.map((item: any, index: number) => (
                  <div
                    key={index}
                    className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
                      item.isOverridden
                        ? "bg-amber-50/40 border-amber-200 shadow-sm"
                        : "bg-white border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-500 text-xs uppercase tracking-wider mb-2">
                          Dòng {item.line_index !== undefined ? item.line_index + 1 : index + 1}
                        </h4>
                        <div className="text-sm font-semibold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {item.content || `Tiêu chí ${index + 1}`}
                          </ReactMarkdown>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 bg-slate-100 p-1.5 rounded-xl border border-slate-200 mt-6">
                        <Input
                          type="number"
                          step="0.25"
                          value={item.score || 0}
                          onChange={(e) => handleScoreChange(index, e.target.value)}
                          className="w-16 h-9 px-2 text-center text-lg font-black text-indigo-600 bg-white rounded-lg border-0 shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="relative mt-2">
                      {editingLineIndex === index ? (
                        <Textarea
                          autoFocus
                          value={item.feedback || ""}
                          onChange={(e) => handleFeedbackChange(index, e.target.value)}
                          onBlur={() => setEditingLineIndex(null)}
                          className="text-base leading-relaxed text-slate-700 p-4 min-h-[120px] rounded-xl border-2 border-indigo-500 bg-white shadow-lg"
                        />
                      ) : (
                        <div
                          onClick={() => setEditingLineIndex(index)}
                          className="text-base leading-relaxed text-slate-700 p-4 min-h-[100px] rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/30 cursor-pointer hover:bg-slate-50 hover:border-indigo-200 transition-all prose prose-slate max-w-none"       
                        >
                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {item.feedback || "*Nhấp để thêm nhận xét...*"}
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
                  </div>
                ))}

                {/* Global General Summary */}
                <div className="pt-6 border-t-2 border-slate-100 mt-8">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <MessageSquare className="size-4 text-indigo-500" /> Nhận xét
                    tổng quát
                  </label>

                  <div className="relative">
                    {editingGeneral ? (
                      <Textarea
                        autoFocus
                        value={evaluation.generalComment || ""}
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
                          {evaluation.generalComment || "*Chưa có nhận xét tổng quát*"}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

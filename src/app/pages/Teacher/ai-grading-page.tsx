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
import { documentEndpoints, gradingEndpoints, queueEndpoints } from "@/app/api/endpoints";

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

  const getExamUrls = (examData: any) => {
    try {
      if (!examData?.description) return { rubricPath: null, examPath: null };
      const meta = JSON.parse(examData.description);
      return {
        rubricPath: getRubricPathFromUrl(meta.rubricUrl || null),
        examPath: getRubricPathFromUrl(meta.examUrl || null)
      };
    } catch (error) {
      console.warn('Could not parse exam description JSON for paths', error);
      return { rubricPath: null, examPath: null };
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

        const { rubricPath, examPath } = getExamUrls(examData);
        setExamInfo({
          ...examData,
          rubricPath,
          examPath
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

    const rubricPath = examInfo?.rubricPath;
    const examPath = examInfo?.examPath;

    if (!rubricPath || !examPath) {
      toast.error("Không tìm thấy rubric hoặc đề bài để chấm điểm.");
      return;
    }

    setIsGrading(true);
    toast.info("AI đang phân tích bố cục...", { id: "ai-grading" });

    try {
      // Helper function for polling queue tasks
      const pollTask = async (taskFn: () => Promise<any>, waitingMessage: string) => {
        while (true) {
          try {
            return await taskFn();
          } catch (err: any) {
            if (err.response?.status === 401) {
              throw new Error("Định dạng file không hợp lệ.");
            }
            toast.info(waitingMessage, { id: "ai-grading" });
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        }
      };

      // 1. Fetch the image file from the signed URL
      const response = await fetch(latestResultInfo.signed_url);
      const blob = await response.blob();
      const fileExt = blob.type.split('/')[1] || 'jpg';
      const imageFile = new File([blob], `submission_${studentId}.${fileExt}`, { type: blob.type });

      // 2. Call /documents/detect to get LayoutDectectResponse
      toast.info("Đang đăng ký vào hàng đợi hệ thống (phân tích bố cục)...", { id: "ai-grading" });
      const detectQueueRes = await queueEndpoints.registerQueue();
      const detectTaskId = detectQueueRes.data.task_id;

      toast.info("AI đang phân tích bố cục...", { id: "ai-grading" });
      const detectResponse = await pollTask(
        () => documentEndpoints.detectLayout(detectTaskId, imageFile),
        "Đang trong hàng đợi phân tích bố cục, vui lòng chờ..."
      );
      const documentJsonStr = JSON.stringify(detectResponse);
      
      // Update UI with the intermediate detect layout if needed, though we immediately proceed to grading
      setEvaluation({
        totalScore: 0,
        document_lines: detectResponse.document_lines,
        generalComment: "Đang chờ chấm điểm..."
      });
      
      toast.info("AI đang đối chiếu Rubric & chấm điểm...", { id: "ai-grading" });

      // 3. Fetch Rubric File and Exam File from Supabase to send to the grading API
      let rubricFile: File;
      let examFile: File;
      try {
        // Fetch Rubric
        const { data: rubricSignedData, error: rubricSignedError } = await supabaseClient.storage
          .from('Scorify_rubrics')
          .createSignedUrl(rubricPath, 3600);

        if (rubricSignedError) throw rubricSignedError;
        if (!rubricSignedData?.signedUrl) throw new Error('Missing signed URL for rubric file.');

        const rubricRes = await fetch(rubricSignedData.signedUrl);
        if (!rubricRes.ok) throw new Error(`Rubric fetch failed with status ${rubricRes.status}`);
        const rubricBlob = await rubricRes.blob();
        rubricFile = new File([rubricBlob], 'rubric.pdf', { type: rubricBlob.type });

        // Fetch Exam
        const { data: examSignedData, error: examSignedError } = await supabaseClient.storage
          .from('Scorify_rubrics')
          .createSignedUrl(examPath, 3600);

        if (examSignedError) throw examSignedError;
        if (!examSignedData?.signedUrl) throw new Error('Missing signed URL for exam file.');

        const examRes = await fetch(examSignedData.signedUrl);
        if (!examRes.ok) throw new Error(`Exam fetch failed with status ${examRes.status}`);
        const examBlob = await examRes.blob();
        examFile = new File([examBlob], 'exam.pdf', { type: examBlob.type });

      } catch (err) {
        throw new Error("Không thể tải file rubric hoặc đề bài để chấm bài.");
      }

      // 4. Call /gradings/rubrics with Exam file, Rubric file & Document JSON
      toast.info("Đang đăng ký vào hàng đợi hệ thống (chấm điểm)...", { id: "ai-grading" });
      const gradingQueueRes = await queueEndpoints.registerQueue();
      const gradingTaskId = gradingQueueRes.data.task_id;

      const gradingResponse = await pollTask(
        () => gradingEndpoints.gradeByRubric(gradingTaskId, examFile, rubricFile, documentJsonStr),
        "Đang trong hàng đợi chấm điểm, vui lòng chờ..."
      );

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
          
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <span className="text-[13px] font-bold text-slate-600 flex items-center gap-2 uppercase">
              <Cpu className="size-4" /> Phân Tích Chi Tiết
            </span>
          </div>

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

          {/* Scrollable Criteria Scoring Checklist Container */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
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
                {/* Summary Score Bar */}
                <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-center shadow-sm">
                  <div>
                    <div className="text-[12px] text-slate-500 font-bold uppercase tracking-wide mb-1">Điểm Tổng Kết</div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[28px] font-black text-indigo-500 leading-none">{evaluation?.totalScore || 0}</span>
                      <span className="text-[15px] font-medium text-slate-500">/ {examInfo?.max_score || 10}</span>
                    </div>
                  </div>
                  <div className="bg-sky-50 text-sky-700 px-3.5 py-1.5 rounded-full text-[13px] font-bold flex items-center gap-1.5 border border-sky-100">
                    <CheckCircle2 className="size-4" /> Đã phân tích
                  </div>
                </div>

                {evaluation.document_lines.map((item: any, index: number) => {
                  // Determine card status color based on score
                  const isWarning = item.score === 0;
                  const isSuccess = item.score > 0;

                  return (
                    <div
                      key={index}
                      className={`rounded-[10px] border overflow-hidden shrink-0 transition-all duration-200 ${
                        isSuccess
                          ? "border-emerald-200"
                          : item.isOverridden || isWarning
                            ? "border-amber-200"
                            : "border-slate-200"
                      }`}
                    >
                      {/* Card header: "Dòng N" label + score badge */}
                      <div className={`px-4 py-2.5 flex items-center justify-between gap-3 border-b ${
                        isWarning
                          ? "bg-amber-50 border-amber-200"
                          : isSuccess
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-slate-50 border-slate-200"
                      }`}>
                        <div className="flex items-center gap-2.5">
                          <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${
                            isWarning
                              ? "bg-amber-200 text-amber-800"
                              : isSuccess
                                ? "bg-emerald-200 text-emerald-800"
                                : "bg-slate-200 text-slate-600"
                          }`}>
                            Dòng {item.line_index !== undefined ? item.line_index + 1 : index + 1}
                          </span>
                          {item.isOverridden && (
                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                              Đã chỉnh sửa
                            </span>
                          )}
                        </div>

                        {/* Stepper score control: − | value | + (reference: scores-button.html) */}
                        <div className={`flex items-center bg-white rounded-lg p-1 shadow-sm transition-all ${
                          isSuccess
                            ? "border border-indigo-200"
                            : "border border-slate-200"
                        }`}>
                          {/* Decrement button */}
                          <button
                            type="button"
                            onClick={() => handleScoreChange(index, String(Math.max(0, (item.score ?? 0) - 0.25)))}
                            className={`w-7 h-7 flex items-center justify-center rounded-md text-base font-bold transition-all active:scale-95 ${
                              isSuccess
                                ? "text-indigo-600 hover:bg-indigo-50"
                                : "text-slate-400 hover:bg-slate-100"
                            }`}
                          >
                            &minus;
                          </button>
                          {/* Score number input */}
                          <input
                            type="number"
                            step="0.25"
                            min={0}
                            value={item.score ?? 0}
                            onChange={(e) => handleScoreChange(index, e.target.value)}
                            className={`w-12 text-center font-bold text-sm focus:outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                              isSuccess ? "text-indigo-700" : "text-slate-500"
                            }`}
                          />
                          {/* Increment button */}
                          <button
                            type="button"
                            onClick={() => handleScoreChange(index, String((item.score ?? 0) + 0.25))}
                            className={`w-7 h-7 flex items-center justify-center rounded-md text-base font-bold transition-all active:scale-95 ${
                              isSuccess
                                ? "text-indigo-600 hover:bg-indigo-50"
                                : "text-slate-400 hover:bg-slate-100"
                            }`}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Content (step title rendered as markdown) */}
                      <div className="px-4 pt-3 pb-2 text-sm font-semibold text-slate-800 prose prose-sm max-w-none border-b border-slate-100">
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {item.content || `Tiêu chí ${index + 1}`}
                        </ReactMarkdown>
                      </div>

                      {/* Feedback body (editable markdown) */}
                      <div className="relative px-4 py-3 bg-white">
                        {editingLineIndex === index ? (
                          <Textarea
                            autoFocus
                            value={item.feedback || ""}
                            onChange={(e) => handleFeedbackChange(index, e.target.value)}
                            onBlur={() => setEditingLineIndex(null)}
                            className="text-sm leading-relaxed p-3 min-h-[90px] w-full rounded-lg border border-indigo-300 bg-white shadow-sm focus-visible:ring-1 focus-visible:ring-indigo-500"
                          />
                        ) : (
                          <div
                            onClick={() => setEditingLineIndex(index)}
                            className="cursor-pointer prose prose-sm max-w-none min-h-[48px] hover:opacity-70 transition-opacity"
                          >
                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                              {item.feedback || "*Nhấp để thêm nhận xét...*"}
                            </ReactMarkdown>
                          </div>
                        )}

                        {/* Source indicator */}
                        <div className="absolute right-2 bottom-2 pointer-events-none">
                          {item.isOverridden
                            ? <Edit3 className="size-3.5 text-amber-400" />
                            : <Cpu className="size-3.5 text-slate-300" />
                          }
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Global General Summary */}
                <div className="pt-6 border-t border-slate-200 mt-4">
                  <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <MessageSquare className="size-3.5 text-indigo-500" /> Nhận xét tổng quát
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
                        className="text-[14px] leading-relaxed text-slate-700 p-4 min-h-[120px] rounded-xl border border-indigo-300 bg-white shadow-sm focus-visible:ring-1 focus-visible:ring-indigo-500"    
                      />
                    ) : (
                      <div
                        onClick={() => setEditingGeneral(true)}
                        className="text-[14px] leading-relaxed text-slate-700 p-4 min-h-[100px] rounded-xl border border-dashed border-slate-300 bg-slate-50/50 cursor-pointer hover:bg-slate-50 hover:border-indigo-300 transition-all prose prose-sm max-w-none"
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
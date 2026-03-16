import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Download,
  Calculator,
  MessageSquare,
  Award,
  Calendar,
  ChevronRight,
  FileText,
  AlertCircle,
  Maximize2,
} from "lucide-react";

export function StudentGradingDetailPage() {
  const { id, assignmentId, submissionId } = useParams();
  const navigate = useNavigate();

  // Mock data for a specific student's math test
  const studentData = {
    name: "Nguyễn Minh Anh",
    studentId: "HS001",
    score: 9.5,
    totalPoints: 10,
    submittedAt: "2026-03-08 14:30",
    subject: "Toán học",
    assignment: "Kiểm tra Giải tích - Đạo hàm",
  };

  const detailedSteps = [
    {
      id: 1,
      question: "Tính đạo hàm g(x) = (2x + 1)⁵",
      studentWork: "g'(x) = 5(2x + 1)⁴",
      correctAnswer: "g'(x) = 10(2x + 1)⁴",
      points: 1.5,
      maxPoints: 2.0,
      aiFeedback:
        "Em xác định đúng quy tắc hàm hợp (dây chuyền) nhưng quên nhân với đạo hàm của biểu thức bên trong (2x + 1).",
      isCorrect: false,
      steps: [
        {
          label: "Xác định hàm ngoài u⁵",
          status: "pass",
          detail: "Đúng: u = 2x + 1",
        },
        { label: "Đạo hàm hàm ngoài", status: "pass", detail: "Đúng: 5u⁴" },
        {
          label: "Đạo hàm hàm trong",
          status: "fail",
          detail: "Thiếu: d/dx(2x + 1) = 2",
        },
      ],
    },
    // Add more questions here...
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="size-5 text-gray-600" />
            </button>
            <div className="h-6 w-px bg-gray-200" />
            <div>
              <h1 className="text-sm font-bold text-gray-900">
                {studentData.name}
              </h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                {studentData.assignment}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
              <Download className="size-4" /> Xuất PDF
            </button>
            <button className="bg-[#F05123] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#D9471E] shadow-sm">
              Lưu thay đổi
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-12 gap-8">
        {/* Left Column: Result Summary */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="size-16 bg-orange-50 rounded-2xl flex items-center justify-center">
                <Award className="size-8 text-[#F05123]" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-gray-900">
                  {studentData.score}
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  /{studentData.totalPoints} điểm
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t pt-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 italic">Mã học sinh:</span>
                <span className="font-semibold text-gray-900">
                  {studentData.studentId}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 italic">Thời gian nộp:</span>
                <span className="font-semibold text-gray-900">
                  {studentData.submittedAt}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#1e293b] rounded-2xl p-6 text-white shadow-lg">
            <h3 className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-widest mb-4">
              <MessageSquare className="size-4" /> AI Tổng kết
            </h3>
            <p className="text-sm leading-relaxed text-slate-300 italic">
              "Học sinh nắm vững các công thức đạo hàm cơ bản. Tuy nhiên, cần
              chú trọng hơn vào các bài toán hàm hợp và đạo hàm của hàm lượng
              giác để tránh mất điểm đáng tiếc."
            </p>
          </div>
        </div>

        {/* Right Column: Detailed Questions */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-900">
              Chi tiết bài làm
            </h2>
            <span className="text-sm text-gray-500">Tổng cộng 5 câu hỏi</span>
          </div>

          {detailedSteps.map((item, idx) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
            >
              <div className="flex">
                {/* Status Bar */}
                <div
                  className={`w-1.5 ${item.isCorrect ? "bg-green-500" : "bg-orange-500"}`}
                />

                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Câu hỏi {idx + 1}
                      </span>
                      <h3 className="text-lg font-bold text-gray-800 mt-1">
                        {item.question}
                      </h3>
                    </div>
                    <div className="bg-gray-50 px-3 py-1 rounded-full border border-gray-100 text-sm font-bold text-gray-600">
                      {item.points} / {item.maxPoints} đ
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                        Bài làm của học sinh
                      </p>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono text-sm text-slate-700 relative group">
                        {item.studentWork}
                        <button className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 className="size-4 text-slate-400" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 text-green-600">
                        Đáp án đúng
                      </p>
                      <div className="bg-green-50/50 p-4 rounded-xl border border-green-100 font-mono text-sm text-green-700">
                        {item.correctAnswer}
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3 mb-6">
                    <AlertCircle className="size-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800 italic leading-relaxed">
                      <strong>AI Phân tích:</strong> {item.aiFeedback}
                    </p>
                  </div>

                  {/* Logical Steps breakdown */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Phân tích logic từng bước
                    </p>
                    {item.steps.map((step, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-50 bg-white hover:border-gray-200 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {step.status === "pass" ? (
                            <CheckCircle2 className="size-4 text-green-500" />
                          ) : (
                            <XCircle className="size-4 text-orange-500" />
                          )}
                          <span className="text-sm font-medium text-gray-700">
                            {step.label}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-medium ${step.status === "pass" ? "text-green-600" : "text-orange-600"}`}
                        >
                          {step.detail}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

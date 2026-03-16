import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { GraduationCap, Settings, LogOut, ArrowLeft, FileText, Upload, X, Plus, AlertCircle } from "lucide-react";

export function CreateExamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    instructions: "",
    dueDate: "",
    dueTime: "23:59",
    status: "scheduled" as "draft" | "scheduled" | "active",
    durationMinutes: 90,
    maxScore: 10,
    aiGradingEnabled: true,
    questions: [] as { id: number; text: string; file: File | null }[],
  });
  const [nextQuestionId, setNextQuestionId] = useState(1);
  const [showPublishModal, setShowPublishModal] = useState(false);

  const classes = [
    { id: 1, name: "Toán 10A1" },
    { id: 2, name: "Ngữ văn 10A1" },
    { id: 3, name: "Tiếng Anh 10A1" },
    { id: 4, name: "Vật lí 10A2" },
    { id: 5, name: "Hóa học 10A2" },
    { id: 6, name: "Sinh học 10A2" },
    { id: 7, name: "Lịch sử 11A1" },
    { id: 8, name: "Địa lí 11A1" },
    { id: 9, name: "Giáo dục công dân 12A1" },
    { id: 10, name: "Tin học 12A1" },
  ];

  const classData = classes.find((c) => c.id === Number(id)) ?? classes[0];

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { id: nextQuestionId, text: "", file: null }],
    });
    setNextQuestionId(nextQuestionId + 1);
  };

  const removeQuestion = (questionId: number) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter(q => q.id !== questionId),
    });
  };

  const updateQuestion = (questionId: number, text: string) => {
    setFormData({
      ...formData,
      questions: formData.questions.map(q => 
        q.id === questionId ? { ...q, text } : q
      ),
    });
  };

  const updateQuestionFile = (questionId: number, file: File | null) => {
    setFormData({
      ...formData,
      questions: formData.questions.map(q => 
        q.id === questionId ? { ...q, file } : q
      ),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPublishModal(true);
  };

  const handlePublish = () => {
    console.log("Publishing exam:", formData);
    navigate(`/classes/${id}`);
  };

  const canPublish =
    formData.title.trim().length > 0 &&
    formData.instructions.trim().length > 0 &&
    formData.dueDate.length > 0 &&
    formData.questions.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <GraduationCap className="size-8 text-[#F05123]" />
              <span className="font-semibold text-xl">Scorify</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                Bảng điều khiển
              </Link>
              <Link to="/classes" className="text-gray-600 hover:text-gray-900">
                Lớp học
              </Link>
              <button className="text-gray-600 hover:text-gray-900">
                <Settings className="size-6" />
              </button>
              <div className="flex items-center gap-3 border-l pl-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">Cô Nguyễn Thu Hà</div>
                  <div className="text-xs text-gray-500">Giáo viên</div>
                </div>
                <div className="size-10 bg-[#F05123] rounded-full flex items-center justify-center text-white font-medium">
                  SJ
                </div>
              </div>
              <button className="text-gray-600 hover:text-red-600">
                <LogOut className="size-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link 
          to={`/classes/${id}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="size-5" />
          Quay lại {classData.name}
        </Link>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-orange-100 p-4 rounded-xl">
              <FileText className="size-8 text-[#F05123]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tạo bài kiểm tra mới</h1>
              <p className="text-gray-600">Thiết kế bài kiểm tra cho {classData.name}</p>
            </div>
          </div>
        </div>

        {/* Exam Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Thông tin cơ bản</h2>
            
            <div className="space-y-6">
              {/* Exam Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Tên bài kiểm tra <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F05123] focus:border-transparent"
                  placeholder="Ví dụ: Bài viết giữa kỳ về truyện ngắn hiện đại"
                />
              </div>

              {/* Instructions */}
              <div>
                <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
                  Hướng dẫn <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="instructions"
                  required
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F05123] focus:border-transparent"
                  placeholder="Nhập hướng dẫn chi tiết cho học sinh: yêu cầu trình bày, số chữ, cách trích dẫn..."
                />
                <p className="text-sm text-gray-500 mt-2">
                  Viết rõ ràng và cụ thể để học sinh dễ thực hiện
                </p>
              </div>
            </div>
          </div>

          {/* Exam Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Thiết lập bài kiểm tra</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày hết hạn <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="dueDate"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F05123] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="dueTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Giờ hết hạn
                </label>
                <input
                  type="time"
                  id="dueTime"
                  value={formData.dueTime}
                  onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F05123] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái phát hành
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "draft" | "scheduled" | "active" })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F05123] focus:border-transparent"
                >
                  <option value="draft">Lưu nháp</option>
                  <option value="scheduled">Lên lịch</option>
                  <option value="active">Mở ngay</option>
                </select>
              </div>

              <div>
                <label htmlFor="durationMinutes" className="block text-sm font-medium text-gray-700 mb-2">
                  Thời lượng làm bài (phút)
                </label>
                <input
                  type="number"
                  id="durationMinutes"
                  min={15}
                  step={5}
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F05123] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="maxScore" className="block text-sm font-medium text-gray-700 mb-2">
                  Thang điểm tối đa
                </label>
                <input
                  type="number"
                  id="maxScore"
                  min={1}
                  max={100}
                  value={formData.maxScore}
                  onChange={(e) => setFormData({ ...formData, maxScore: Number(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F05123] focus:border-transparent"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.aiGradingEnabled}
                    onChange={(e) => setFormData({ ...formData, aiGradingEnabled: e.target.checked })}
                    className="size-4 text-[#F05123] border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Bật chấm điểm tự động bằng AI</span>
                </label>
              </div>
            </div>
          </div>

          {/* Essay Questions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Câu hỏi tự luận</h2>
                <p className="text-sm text-gray-600 mt-1">Thêm câu hỏi dạng văn bản hoặc tải tệp lên (PDF, DOCX, LaTeX)</p>
              </div>
              <button
                type="button"
                onClick={addQuestion}
                className="bg-[#F05123] text-white px-4 py-2 rounded-lg hover:bg-[#D9471E] transition-colors flex items-center gap-2"
              >
                <Plus className="size-5" />
                Thêm câu hỏi
              </button>
            </div>

            {formData.questions.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <FileText className="size-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Chưa có câu hỏi nào</p>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="text-[#F05123] hover:text-[#D9471E] font-medium"
                >
                  Thêm câu hỏi đầu tiên
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.questions.map((question, index) => (
                  <div key={question.id} className="p-6 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className="bg-orange-100 text-[#D9471E] size-10 rounded-lg flex items-center justify-center font-semibold flex-shrink-0">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        {/* Question Text */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nội dung câu hỏi
                          </label>
                          <textarea
                            value={question.text}
                            onChange={(e) => updateQuestion(question.id, e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F05123] focus:border-transparent"
                            placeholder="Nhập câu hỏi tại đây..."
                          />
                        </div>

                        {/* File Upload */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hoặc tải tệp câu hỏi (Tùy chọn)
                          </label>
                          <div className="flex items-center gap-4">
                            <label className="flex-1 cursor-pointer">
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#F27A59] transition-colors">
                                <div className="flex items-center justify-center gap-3">
                                  <Upload className="size-6 text-gray-400" />
                                  <div className="text-center">
                                    <p className="text-sm text-gray-600">
                                      {question.file ? (
                                        <span className="text-[#F05123] font-medium">{question.file.name}</span>
                                      ) : (
                                        <>
                                          <span className="text-[#F05123] font-medium">Nhấp để tải lên</span>
                                          <span className="text-gray-500"> hoặc kéo thả tệp</span>
                                        </>
                                      )}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">PDF, DOCX, LaTeX (MAX. 10MB)</p>
                                  </div>
                                </div>
                              </div>
                              <input
                                type="file"
                                accept=".pdf,.docx,.tex"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  updateQuestionFile(question.id, file);
                                }}
                              />
                            </label>
                            {question.file && (
                              <button
                                type="button"
                                onClick={() => updateQuestionFile(question.id, null)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="size-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeQuestion(question.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <X className="size-6" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <Link
                to={`/classes/${id}`}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Hủy
              </Link>
              <div className="flex gap-4">
                <button
                  type="button"
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Lưu nháp
                </button>
                <button
                  type="submit"
                  disabled={!canPublish}
                  className="bg-[#F05123] text-white px-8 py-3 rounded-lg hover:bg-[#D9471E] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Xuất bản bài kiểm tra
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Publish Confirmation Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-orange-100 p-4 rounded-full">
                <AlertCircle className="size-12 text-[#F05123]" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Xuất bản bài kiểm tra?</h2>
            <p className="text-gray-600 mb-6 text-center">
              Sau khi xuất bản, học sinh sẽ nhìn thấy và nộp bài cho bài kiểm tra này. Bạn vẫn có thể chỉnh sửa sau nếu cần.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Tóm tắt bài kiểm tra:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Tiêu đề: {formData.title}</li>
                <li>• Số câu hỏi: {formData.questions.length}</li>
                <li>• Lớp: {classData.name}</li>
                <li>• Hết hạn: {formData.dueDate || "Chưa đặt"} {formData.dueTime}</li>
                <li>• Trạng thái: {formData.status === "draft" ? "Lưu nháp" : formData.status === "scheduled" ? "Lên lịch" : "Mở ngay"}</li>
                <li>• Thời lượng: {formData.durationMinutes} phút</li>
                <li>• Thang điểm: {formData.maxScore}</li>
                <li>• Chấm AI: {formData.aiGradingEnabled ? "Bật" : "Tắt"}</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowPublishModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handlePublish}
                className="flex-1 bg-[#F05123] text-white px-6 py-3 rounded-lg hover:bg-[#D9471E] transition-colors font-medium"
              >
                Xác nhận và xuất bản
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

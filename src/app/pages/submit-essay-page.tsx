import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { GraduationCap, Settings, LogOut, ArrowLeft, Upload, X, FileText, Image as ImageIcon, CheckCircle } from "lucide-react";

export function SubmitEssayPage() {
  const { id, assignmentId } = useParams();
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Mock data
  const classData = {
    name: "Ngữ văn 10A1",
  };

  const assignmentData = {
    id: assignmentId,
    title: "Phân tích nhân vật",
    dueDate: "2026-03-20",
    instructions: "Viết bài văn từ 1500-2000 chữ phân tích sự phát triển của nhân vật chính trong tác phẩm. Tập trung vào các chi tiết then chốt làm thay đổi suy nghĩ và hành động của nhân vật. Trích dẫn đúng quy cách và sử dụng ít nhất 3 dẫn chứng trực tiếp từ văn bản để làm rõ lập luận.",
    requirements: [
      "Độ dài: 1500-2000 chữ",
      "Định dạng tệp: PDF hoặc DOCX",
      "Trích dẫn theo chuẩn MLA",
      "Có trang tài liệu tham khảo",
      "Cỡ chữ 12, giãn dòng 1.5",
      "Nộp trước 23:59 ngày hết hạn"
    ]
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSubmitting(false);
    setShowSuccessModal(true);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate(`/student/classes/${id}`);
  };

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
              <Link to="/student/dashboard" className="text-gray-600 hover:text-gray-900">
                Bảng điều khiển
              </Link>
              <Link to="/student/classes" className="text-gray-600 hover:text-gray-900">
                Lớp học của tôi
              </Link>
              <button className="text-gray-600 hover:text-gray-900">
                <Settings className="size-6" />
              </button>
              <div className="flex items-center gap-3 border-l pl-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">Nguyễn Minh Anh</div>
                  <div className="text-xs text-gray-500">Học sinh</div>
                </div>
                <div className="size-10 bg-[#D9471E] rounded-full flex items-center justify-center text-white font-medium">
                  AT
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link 
          to={`/student/classes/${id}`}
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
              <h1 className="text-3xl font-bold text-gray-900">{assignmentData.title}</h1>
              <p className="text-gray-600">Hạn nộp: {new Date(assignmentData.dueDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Hướng dẫn bài tập</h2>
          <p className="text-gray-700 mb-6">{assignmentData.instructions}</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Yêu cầu:</h3>
            <ul className="space-y-2">
              {assignmentData.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <CheckCircle className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Nộp bài của bạn</h2>
            
            {/* File Upload Area */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tải tệp lên
              </label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#F27A59] transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept=".pdf,.docx,.doc,image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="size-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    <span className="text-[#F05123] font-medium">Nhấp để tải lên</span> hoặc kéo thả tệp
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF, DOCX hoặc hình ảnh (Tối đa 25MB mỗi tệp)
                  </p>
                </label>
              </div>

              {/* Uploaded Files List */}
              {files.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h3 className="font-medium text-gray-900">Tệp đã tải lên:</h3>
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-lg">
                          {file.type.startsWith('image/') ? (
                            <ImageIcon className="size-5 text-[#F05123]" />
                          ) : (
                            <FileText className="size-5 text-[#F05123]" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-600">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="size-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú thêm (Tùy chọn)
              </label>
              <textarea
                id="notes"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F05123] focus:border-transparent"
                placeholder="Thêm ghi chú hoặc nhận xét cho giáo viên..."
              />
            </div>

            {/* Warning */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                ⚠️ <strong>Lưu ý:</strong> Sau khi nộp, bài của bạn sẽ được gửi đến AI để chấm tự động. Hãy kiểm tra kỹ trước khi nộp.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <Link
                to={`/student/classes/${id}`}
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
                  disabled={files.length === 0 || submitting}
                  className="bg-[#F05123] text-white px-8 py-3 rounded-lg hover:bg-[#D9471E] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      Đang nộp...
                    </>
                  ) : (
                    <>
                      <Upload className="size-5" />
                      Nộp bài
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="size-12 text-green-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Nộp bài thành công!</h2>
            <p className="text-gray-600 mb-6 text-center">
              Bài của bạn đã được nộp và gửi đến AI để chấm. Bạn sẽ nhận kết quả sau khi hoàn tất.
            </p>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Tiếp theo là gì?</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• AI sẽ phân tích bài viết của bạn</li>
                <li>• Bạn sẽ nhận điểm và phản hồi chi tiết</li>
                <li>• Giáo viên sẽ rà soát lại kết quả</li>
                <li>• Vui lòng kiểm tra lại sau 24-48 giờ</li>
              </ul>
            </div>

            <button
              onClick={handleSuccessClose}
              className="w-full bg-[#F05123] text-white px-6 py-3 rounded-lg hover:bg-[#D9471E] transition-colors font-medium"
            >
              Quay lại lớp học
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

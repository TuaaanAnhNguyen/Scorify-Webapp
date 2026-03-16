import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { GraduationCap, BookOpen, Settings, LogOut, Calendar, CheckCircle, Clock, AlertCircle, Upload, FileText, Award, User, Bell } from "lucide-react";

type Subject = "Toán" | "Sinh học" | "Vật lí";
type AssignmentStatus = "graded" | "submitted" | "pending" | "late";

type StudentClass = {
  id: number;
  name: string;
  subject: Subject;
  teacher: string;
  description: string;
  students: number;
};

type Assignment = {
  id: number;
  title: string;
  dueDate: string;
  status: AssignmentStatus;
  submittedAt: string | null;
  grade: string | null;
  feedback: string | null;
  points: string | null;
};

type Material = {
  id: number;
  title: string;
  type: string;
  uploadedAt: string;
  size: string;
};

type Announcement = {
  id: number;
  title: string;
  content: string;
  postedAt: string;
  author: string;
};

export function StudentClassDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<"assignments" | "materials" | "announcements">("assignments");

  const studentClasses: StudentClass[] = [
    {
      id: 1,
      name: "Toán 10A1",
      subject: "Toán",
      teacher: "Cô Nguyễn Thu Hà",
      description: "Rèn luyện tư duy giải toán, đại số và hình học nền tảng",
      students: 32,
    },
    {
      id: 2,
      name: "Sinh học 10A2",
      subject: "Sinh học",
      teacher: "Thầy Trần Đức Minh",
      description: "Học về tế bào, di truyền và hệ sinh thái qua bài tập thực hành",
      students: 28,
    },
    {
      id: 3,
      name: "Vật lí 10A2",
      subject: "Vật lí",
      teacher: "Cô Lê Phương Anh",
      description: "Nắm vững cơ học, nhiệt học và vận dụng công thức vào bài toán thực tế",
      students: 30,
    },
  ];

  const classId = Number(id);
  const classData = studentClasses.find((item) => item.id === classId) ?? studentClasses[0];

  const assignmentsBySubject: Record<Subject, Assignment[]> = {
    "Toán": [
      {
        id: 1,
        title: "Bài tập đạo hàm cơ bản",
        dueDate: "2026-03-15",
        status: "submitted",
        submittedAt: "2026-03-08 14:30",
        grade: "9.0",
        feedback: "Nắm chắc quy tắc đạo hàm, cần trình bày rõ hơn ở câu vận dụng.",
        points: "9.0/10"
      },
      {
        id: 2,
        title: "Kiểm tra hình học không gian",
        dueDate: "2026-03-20",
        status: "pending",
        submittedAt: null,
        grade: null,
        feedback: null,
        points: null
      },
      {
        id: 3,
        title: "Phiếu luyện tập hàm số",
        dueDate: "2026-03-25",
        status: "pending",
        submittedAt: null,
        grade: null,
        feedback: null,
        points: null
      },
      {
        id: 4,
        title: "Bài kiểm tra giữa kỳ Toán",
        dueDate: "2026-04-01",
        status: "graded",
        submittedAt: "2026-03-01 16:20",
        grade: "8.6",
        feedback: "Hiểu đề tốt, còn mất điểm ở phần chứng minh hình học.",
        points: "8.6/10"
      },
      {
        id: 5,
        title: "Bài tập xác suất",
        dueDate: "2026-04-10",
        status: "late",
        submittedAt: null,
        grade: null,
        feedback: null,
        points: null
      },
      {
        id: 6,
        title: "Ôn tập tổ hợp",
        dueDate: "2026-04-18",
        status: "pending",
        submittedAt: null,
        grade: null,
        feedback: null,
        points: null
      },
    ],
    "Sinh học": [
      {
        id: 1,
        title: "Báo cáo cấu trúc tế bào",
        dueDate: "2026-03-15",
        status: "submitted",
        submittedAt: "2026-03-08 11:10",
        grade: "8.8",
        feedback: "Mô tả đúng thành phần tế bào, cần bổ sung vai trò của bào quan.",
        points: "8.8/10"
      },
      {
        id: 2,
        title: "Bài tập di truyền Mendel",
        dueDate: "2026-03-20",
        status: "pending",
        submittedAt: null,
        grade: null,
        feedback: null,
        points: null
      },
      {
        id: 3,
        title: "Phân tích hệ sinh thái địa phương",
        dueDate: "2026-03-25",
        status: "pending",
        submittedAt: null,
        grade: null,
        feedback: null,
        points: null
      },
      {
        id: 4,
        title: "Bài kiểm tra giữa kỳ Sinh học",
        dueDate: "2026-04-01",
        status: "graded",
        submittedAt: "2026-03-02 09:40",
        grade: "9.4",
        feedback: "Hiểu rõ cơ chế di truyền, trả lời chính xác phần vận dụng.",
        points: "9.4/10"
      },
      {
        id: 5,
        title: "Nhật ký quan sát thực vật",
        dueDate: "2026-04-10",
        status: "late",
        submittedAt: null,
        grade: null,
        feedback: null,
        points: null
      },
      {
        id: 6,
        title: "Ôn tập enzyme và chuyển hóa",
        dueDate: "2026-04-18",
        status: "pending",
        submittedAt: null,
        grade: null,
        feedback: null,
        points: null
      },
    ],
    "Vật lí": [
      {
        id: 1,
        title: "Bài tập định luật Newton",
        dueDate: "2026-03-15",
        status: "submitted",
        submittedAt: "2026-03-08 19:10",
        grade: "8.4",
        feedback: "Lập luận đúng hướng, cần chú ý đơn vị và dấu của lực.",
        points: "8.4/10"
      },
      {
        id: 2,
        title: "Thực hành đo gia tốc",
        dueDate: "2026-03-20",
        status: "pending",
        submittedAt: null,
        grade: null,
        feedback: null,
        points: null
      },
      {
        id: 3,
        title: "Bài tập công và công suất",
        dueDate: "2026-03-25",
        status: "pending",
        submittedAt: null,
        grade: null,
        feedback: null,
        points: null
      },
      {
        id: 4,
        title: "Bài kiểm tra giữa kỳ Vật lí",
        dueDate: "2026-04-01",
        status: "graded",
        submittedAt: "2026-03-03 15:00",
        grade: "8.7",
        feedback: "Nắm công thức tốt, cần trình bày rõ các bước biến đổi.",
        points: "8.7/10"
      },
      {
        id: 5,
        title: "Bài tập động lượng",
        dueDate: "2026-04-10",
        status: "late",
        submittedAt: null,
        grade: null,
        feedback: null,
        points: null
      },
      {
        id: 6,
        title: "Ôn tập dao động cơ",
        dueDate: "2026-04-18",
        status: "pending",
        submittedAt: null,
        grade: null,
        feedback: null,
        points: null
      },
    ],
  };

  const assignments = assignmentsBySubject[classData.subject];

  const materialsBySubject: Record<Subject, Material[]> = {
    "Toán": [
      { id: 1, title: "Đề cương Toán học kỳ II", type: "PDF", uploadedAt: "2025-09-01", size: "2.3 MB" },
      { id: 2, title: "Chuyên đề đạo hàm", type: "PDF", uploadedAt: "2025-09-05", size: "1.8 MB" },
      { id: 3, title: "Bộ bài tập hàm số", type: "DOCX", uploadedAt: "2025-09-08", size: "920 KB" },
      { id: 4, title: "Tóm tắt công thức hình học", type: "PDF", uploadedAt: "2025-09-10", size: "1.1 MB" },
      { id: 5, title: "Đề ôn tập giữa kỳ Toán", type: "PDF", uploadedAt: "2025-09-15", size: "3.0 MB" },
      { id: 6, title: "Mẹo giải nhanh trắc nghiệm", type: "PDF", uploadedAt: "2025-09-18", size: "1.0 MB" },
    ],
    "Sinh học": [
      { id: 1, title: "Đề cương Sinh học kỳ II", type: "PDF", uploadedAt: "2025-09-01", size: "2.1 MB" },
      { id: 2, title: "Bài giảng tế bào học", type: "PDF", uploadedAt: "2025-09-05", size: "1.7 MB" },
      { id: 3, title: "Bài tập di truyền cơ bản", type: "DOCX", uploadedAt: "2025-09-08", size: "880 KB" },
      { id: 4, title: "Sổ tay thực hành sinh học", type: "PDF", uploadedAt: "2025-09-10", size: "1.4 MB" },
      { id: 5, title: "Phiếu quan sát hệ sinh thái", type: "PDF", uploadedAt: "2025-09-15", size: "2.8 MB" },
      { id: 6, title: "Tổng hợp thuật ngữ Sinh học", type: "PDF", uploadedAt: "2025-09-18", size: "1.2 MB" },
    ],
    "Vật lí": [
      { id: 1, title: "Đề cương Vật lí kỳ II", type: "PDF", uploadedAt: "2025-09-01", size: "2.4 MB" },
      { id: 2, title: "Chuyên đề cơ học", type: "PDF", uploadedAt: "2025-09-05", size: "1.9 MB" },
      { id: 3, title: "Bài tập định luật Newton", type: "DOCX", uploadedAt: "2025-09-08", size: "910 KB" },
      { id: 4, title: "Công thức nhiệt học", type: "PDF", uploadedAt: "2025-09-10", size: "1.3 MB" },
      { id: 5, title: "Đề luyện tập chương động lực học", type: "PDF", uploadedAt: "2025-09-15", size: "3.1 MB" },
      { id: 6, title: "Tài liệu bài tập vận dụng", type: "PDF", uploadedAt: "2025-09-18", size: "1.1 MB" },
    ],
  };

  const announcementsBySubject: Record<Subject, Announcement[]> = {
    "Toán": [
      {
        id: 1,
        title: "Gia hạn bài tập đạo hàm",
        content: "Hạn nộp bài tập đạo hàm được dời đến 16/03 để các em có thêm thời gian hoàn thiện các câu vận dụng.",
        postedAt: "2026-03-08 10:00",
        author: classData.teacher
      },
      {
        id: 2,
        title: "Lịch phụ đạo tuần này",
        content: "Cô mở buổi phụ đạo vào thứ Năm 14:00-16:00 cho phần hình học không gian.",
        postedAt: "2026-03-05 14:30",
        author: classData.teacher
      },
      {
        id: 3,
        title: "Đã cập nhật bộ đề ôn tập",
        content: "Cô đã đăng thêm 2 đề ôn tập giữa kỳ, các em tải về làm thử trước buổi chữa đề.",
        postedAt: "2026-03-01 09:15",
        author: classData.teacher
      },
      {
        id: 4,
        title: "Thông báo kiểm tra 15 phút",
        content: "Tiết học ngày 12/03 có kiểm tra ngắn phần hàm số, các em ôn kỹ dạng bài cơ bản.",
        postedAt: "2026-03-09 08:10",
        author: classData.teacher
      },
    ],
    "Sinh học": [
      {
        id: 1,
        title: "Gia hạn báo cáo tế bào",
        content: "Hạn nộp báo cáo cấu trúc tế bào được dời đến 16/03 để hoàn thiện phần mô tả bào quan.",
        postedAt: "2026-03-08 10:00",
        author: classData.teacher
      },
      {
        id: 2,
        title: "Lịch tư vấn chuyên đề di truyền",
        content: "Thầy hỗ trợ thêm vào thứ Năm 14:00-16:00 cho phần bài tập quy luật Mendel.",
        postedAt: "2026-03-05 14:30",
        author: classData.teacher
      },
      {
        id: 3,
        title: "Đã cập nhật tài liệu đọc mới",
        content: "Tài liệu về hệ sinh thái đã được bổ sung trong mục Tài liệu, các em đọc trước buổi thảo luận.",
        postedAt: "2026-03-01 09:15",
        author: classData.teacher
      },
      {
        id: 4,
        title: "Thông báo kiểm tra 15 phút",
        content: "Tiết ngày 12/03 có kiểm tra ngắn phần tế bào nhân thực và nhân sơ.",
        postedAt: "2026-03-09 08:10",
        author: classData.teacher
      },
    ],
    "Vật lí": [
      {
        id: 1,
        title: "Gia hạn bài tập Newton",
        content: "Hạn nộp bài tập định luật Newton dời đến 16/03, các em chú ý trình bày rõ lực tác dụng.",
        postedAt: "2026-03-08 10:00",
        author: classData.teacher
      },
      {
        id: 2,
        title: "Lịch chữa bài tuần này",
        content: "Cô tổ chức buổi chữa bài vào thứ Năm 14:00-16:00 cho chuyên đề cơ học.",
        postedAt: "2026-03-05 14:30",
        author: classData.teacher
      },
      {
        id: 3,
        title: "Đã cập nhật tài liệu thí nghiệm",
        content: "Tài liệu thí nghiệm đo gia tốc đã được đăng, các em đọc trước buổi thực hành.",
        postedAt: "2026-03-01 09:15",
        author: classData.teacher
      },
      {
        id: 4,
        title: "Thông báo kiểm tra 15 phút",
        content: "Tiết ngày 12/03 có kiểm tra ngắn phần chuyển động thẳng biến đổi đều.",
        postedAt: "2026-03-09 08:10",
        author: classData.teacher
      },
    ],
  };

  const materials = materialsBySubject[classData.subject];
  const announcements = announcementsBySubject[classData.subject];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "graded": return "bg-green-100 text-green-700";
      case "submitted": return "bg-blue-100 text-blue-700";
      case "pending": return "bg-orange-100 text-orange-700";
      case "late": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "graded": return <CheckCircle className="size-4" />;
      case "submitted": return <Clock className="size-4" />;
      case "pending": return <AlertCircle className="size-4" />;
      case "late": return <AlertCircle className="size-4" />;
      default: return <Clock className="size-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "graded": return "Đã chấm";
      case "submitted": return "Đã nộp";
      case "pending": return "Chưa nộp";
      case "late": return "Trễ hạn";
      default: return status;
    }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/student/classes" className="hover:text-[#F05123]">Lớp học của tôi</Link>
            <span>/</span>
            <span className="text-gray-900">{classData.name}</span>
          </div>
        </div>

        {/* Class Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-orange-100 p-4 rounded-xl">
                  <BookOpen className="size-8 text-[#D9471E]" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{classData.name}</h1>
                  <p className="text-gray-600">{classData.subject}</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">{classData.description}</p>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <User className="size-5 text-gray-400" />
                  <span className="text-gray-900 font-medium">Giáo viên: {classData.teacher}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="size-5 text-gray-400" />
                  <span className="text-gray-900 font-medium">{classData.students} học sinh</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex gap-8 px-8">
              <button
                onClick={() => setActiveTab("assignments")}
                className={`py-4 border-b-2 transition-colors ${
                  activeTab === "assignments"
                    ? "border-[#F05123] text-[#F05123] font-medium"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Bài tập ({assignments.length})
              </button>
              <button
                onClick={() => setActiveTab("materials")}
                className={`py-4 border-b-2 transition-colors ${
                  activeTab === "materials"
                    ? "border-[#F05123] text-[#F05123] font-medium"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Tài liệu ({materials.length})
              </button>
              <button
                onClick={() => setActiveTab("announcements")}
                className={`py-4 border-b-2 transition-colors ${
                  activeTab === "announcements"
                    ? "border-[#F05123] text-[#F05123] font-medium"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Thông báo ({announcements.length})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Assignments Tab */}
            {activeTab === "assignments" && (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="p-6 rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(assignment.status)}`}>
                              {getStatusIcon(assignment.status)}
                              {getStatusLabel(assignment.status)}
                            </span>
                          </div>

                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="size-4" />
                              Hạn nộp: {new Date(assignment.dueDate).toLocaleDateString()}
                            </span>
                            {assignment.submittedAt && (
                              <span className="flex items-center gap-1">
                                <Clock className="size-4" />
                                Đã nộp: {new Date(assignment.submittedAt).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0">
                          {assignment.status === "pending" || assignment.status === "late" ? (
                            <Link
                              to={`/student/classes/${id}/submit/${assignment.id}`}
                              className="bg-[#F05123] text-white px-6 py-2 rounded-lg hover:bg-[#D9471E] transition-colors flex items-center gap-2 font-medium"
                            >
                              <Upload className="size-4" />
                              Nộp bài
                            </Link>
                          ) : assignment.status === "submitted" || assignment.status === "graded" ? (
                            <Link
                              to={`/student/classes/${id}/essay/${assignment.id}/submission-${assignment.id}`}
                              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                              Xem chi tiết
                            </Link>
                          ) : (
                            <button className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                              Xem chi tiết
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Grade and Feedback */}
                      {assignment.status === "graded" && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <Award className="size-6 text-green-600" />
                            <div>
                                <div className="font-semibold text-green-900">Điểm: {assignment.grade}/10</div>
                              <div className="text-sm text-green-700">{assignment.points}</div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700">{assignment.feedback}</p>
                        </div>
                      )}

                      {assignment.status === "submitted" && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-800">Bài của bạn đã được nộp và đang chờ chấm.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Materials Tab */}
            {activeTab === "materials" && (
              <div className="space-y-3">
                {materials.map((material) => (
                  <div key={material.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <FileText className="size-6 text-[#F05123]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{material.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span>{material.type}</span>
                          <span>•</span>
                          <span>{material.size}</span>
                          <span>•</span>
                          <span>Tải lên {new Date(material.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <button className="bg-[#F05123] text-white px-4 py-2 rounded-lg hover:bg-[#D9471E] transition-colors text-sm font-medium">
                      Tải xuống
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Announcements Tab */}
            {activeTab === "announcements" && (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="p-6 rounded-lg border border-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Bell className="size-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{announcement.title}</h3>
                        <p className="text-gray-700 mb-3">{announcement.content}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>{announcement.author}</span>
                          <span>•</span>
                          <span>Đăng lúc {new Date(announcement.postedAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
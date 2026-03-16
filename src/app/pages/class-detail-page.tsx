import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  GraduationCap,
  BookOpen,
  Users,
  Plus,
  Settings,
  LogOut,
  Edit,
  Trash2,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Calendar,
  Upload,
} from "lucide-react";

export function ClassDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<
    "exams" | "students" | "submissions"
  >("exams");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Mock data synchronized with classes-page.tsx
  const classes = [
    {
      id: 1,
      name: "Toán 10A1",
      subject: "Toán",
      students: 42,
      exams: 6,
      createdDate: "2025-09-01",
      description:
        "Đại số, hình học và luyện tập tư duy giải toán theo chuyên đề",
    },
    {
      id: 2,
      name: "Ngữ văn 10A1",
      subject: "Ngữ văn",
      students: 40,
      exams: 5,
      createdDate: "2025-09-03",
      description: "Đọc hiểu văn bản, nghị luận xã hội và nghị luận văn học",
    },
    {
      id: 3,
      name: "Tiếng Anh 10A1",
      subject: "Tiếng Anh",
      students: 41,
      exams: 6,
      createdDate: "2025-09-05",
      description:
        "Phát triển 4 kỹ năng nghe, nói, đọc, viết và ngữ pháp nền tảng",
    },
    {
      id: 4,
      name: "Vật lí 10A2",
      subject: "Vật lí",
      students: 38,
      exams: 5,
      createdDate: "2025-09-07",
      description: "Cơ học, nhiệt học và bài tập vận dụng thực tiễn",
    },
    {
      id: 5,
      name: "Hóa học 10A2",
      subject: "Hóa học",
      students: 37,
      exams: 5,
      createdDate: "2025-09-09",
      description:
        "Cấu tạo chất, phản ứng hóa học và bài tập định lượng cơ bản",
    },
    {
      id: 6,
      name: "Sinh học 10A2",
      subject: "Sinh học",
      students: 36,
      exams: 4,
      createdDate: "2025-09-11",
      description: "Tế bào học, vi sinh vật và các quá trình sinh học nền tảng",
    },
    {
      id: 7,
      name: "Lịch sử 11A1",
      subject: "Lịch sử",
      students: 35,
      exams: 4,
      createdDate: "2025-09-13",
      description: "Lịch sử Việt Nam và thế giới giai đoạn cận đại - hiện đại",
    },
    {
      id: 8,
      name: "Địa lí 11A1",
      subject: "Địa lí",
      students: 34,
      exams: 4,
      createdDate: "2025-09-15",
      description:
        "Địa lí tự nhiên, kinh tế - xã hội Việt Nam và kỹ năng Atlat",
    },
    {
      id: 9,
      name: "Giáo dục công dân 12A1",
      subject: "GDCD",
      students: 39,
      exams: 3,
      createdDate: "2025-09-17",
      description: "Pháp luật, quyền và nghĩa vụ công dân, tình huống thực tế",
    },
    {
      id: 10,
      name: "Tin học 12A1",
      subject: "Tin học",
      students: 33,
      exams: 4,
      createdDate: "2025-09-19",
      description:
        "Thuật toán, lập trình cơ bản và ứng dụng công nghệ thông tin",
    },
  ];

  const classId = Number(id);
  const selectedClass = classes.find((c) => c.id === classId) ?? classes[0];

  const classData = {
    id: selectedClass.id,
    name: selectedClass.name,
    subject: selectedClass.subject,
    description: selectedClass.description,
    academicYear: "2025-2026",
    studentsCount: selectedClass.students,
    examsCount: selectedClass.exams,
    createdDate: selectedClass.createdDate,
  };

  const examTitleBySubject: Record<string, string[]> = {
    Toán: [
      "Kiểm tra Đại số",
      "Kiểm tra Hình học",
      "Bài luyện tập hàm số",
      "Bài kiểm tra giữa kỳ",
      "Đề ôn tập cuối kỳ",
    ],
    "Ngữ văn": [
      "Bài nghị luận xã hội",
      "Phân tích tác phẩm",
      "Cảm nhận thơ",
      "Bài viết giữa kỳ",
      "Bài viết cuối kỳ",
    ],
    "Tiếng Anh": [
      "Reading Comprehension",
      "Grammar Test",
      "Writing Task",
      "Mid-term Test",
      "Final Practice",
    ],
    "Vật lí": [
      "Bài tập Cơ học",
      "Kiểm tra Nhiệt học",
      "Bài tập Điện học",
      "Kiểm tra giữa kỳ",
      "Đề tổng hợp",
    ],
    "Hóa học": [
      "Kiểm tra phản ứng hóa học",
      "Bài tập định lượng",
      "Bài tập dung dịch",
      "Kiểm tra giữa kỳ",
      "Đề tổng hợp cuối kỳ",
    ],
    "Sinh học": [
      "Kiểm tra tế bào học",
      "Bài tập di truyền",
      "Phân tích hệ sinh thái",
      "Đề ôn tập học kỳ",
    ],
    "Lịch sử": [
      "Kiểm tra lịch sử Việt Nam",
      "Bài phân tích sự kiện",
      "Kiểm tra giữa kỳ",
      "Đề tổng hợp học kỳ",
    ],
    "Địa lí": [
      "Kiểm tra Atlat",
      "Bài tập địa lí kinh tế",
      "Kiểm tra giữa kỳ",
      "Đề tổng hợp học kỳ",
    ],
    GDCD: [
      "Tình huống pháp luật",
      "Kiểm tra quyền công dân",
      "Bài kiểm tra học kỳ",
    ],
    "Tin học": [
      "Bài tập thuật toán",
      "Kiểm tra lập trình",
      "Bài thực hành dữ liệu",
      "Đề ôn tập học kỳ",
    ],
  };

  const titles = examTitleBySubject[classData.subject] ?? [
    "Bài kiểm tra chuyên đề",
  ];
  const exams = Array.from({ length: classData.examsCount }, (_, idx) => {
    const status = idx < 2 ? "active" : idx === 2 ? "draft" : "scheduled";
    const submissions =
      status === "active" ? Math.max(classData.studentsCount - 4 + idx, 0) : 0;
    const graded = status === "active" ? Math.max(submissions - 8, 0) : 0;
    return {
      id: idx + 1,
      title: titles[idx % titles.length],
      dueDate: `2026-03-${String(15 + idx * 4).padStart(2, "0")}`,
      submissions,
      total: classData.studentsCount,
      status,
      graded,
    };
  });

  const firstNames = [
    "Nguyễn",
    "Trần",
    "Lê",
    "Phạm",
    "Hoàng",
    "Vũ",
    "Đặng",
    "Bùi",
    "Đỗ",
    "Võ",
  ];
  const middleNames = [
    "Minh",
    "Khánh",
    "Gia",
    "Quang",
    "Thu",
    "Hoài",
    "Anh",
    "Ngọc",
    "Thanh",
    "Hải",
  ];
  const lastNames = [
    "Anh",
    "Linh",
    "Nam",
    "Hân",
    "Huy",
    "Mai",
    "Trang",
    "Phúc",
    "Khang",
    "Vy",
  ];
  const grades = ["9.8", "9.4", "9.0", "8.7", "8.4"];

  const students = Array.from({ length: classData.studentsCount }, (_, idx) => {
    const fullName = `${firstNames[idx % firstNames.length]} ${middleNames[idx % middleNames.length]} ${lastNames[idx % lastNames.length]} ${idx + 1}`;
    return {
      id: idx + 1,
      name: fullName,
      email: `hs${String(idx + 1).padStart(2, "0")}@school.edu.vn`,
      joined: "2025-09-01",
      submissions: Math.min(
        exams.filter((e) => e.status !== "scheduled").length,
        1 + (idx % Math.max(classData.examsCount, 1)),
      ),
      avgGrade: grades[idx % grades.length],
    };
  });

  const recentSubmissions = students.slice(0, 6).map((student, idx) => {
    const assignmentIndex = idx % exams.length;
    const isGraded = idx % 2 === 0;
    return {
      id: idx + 1,
      assignmentId: assignmentIndex + 1,
      student: student.name,
      exam: exams[assignmentIndex]?.title ?? "Bài kiểm tra",
      submittedAt: `2026-03-0${7 + (idx % 3)} ${String(14 - idx).padStart(2, "0")}:20`,
      status: isGraded ? "graded" : "pending",
      grade: isGraded ? grades[idx % grades.length] : null,
      aiGraded: isGraded,
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "draft":
        return "bg-gray-100 text-gray-700";
      case "scheduled":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getSubmissionStatusColor = (status: string) => {
    switch (status) {
      case "graded":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getExamStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Đang mở";
      case "draft":
        return "Nháp";
      case "scheduled":
        return "Đã lên lịch";
      default:
        return status;
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
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
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
                  <div className="text-sm font-medium text-gray-900">
                    Cô Nguyễn Thu Hà
                  </div>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/classes" className="hover:text-[#F05123]">
              Lớp học
            </Link>
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
                  <BookOpen className="size-8 text-[#F05123]" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {classData.name}
                  </h1>
                  <p className="text-gray-600">
                    {classData.subject} • Năm học {classData.academicYear}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">{classData.description}</p>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Users className="size-5 text-gray-400" />
                  <span className="text-gray-900 font-medium">
                    {classData.studentsCount} học sinh
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="size-5 text-gray-400" />
                  <span className="text-gray-900 font-medium">
                    {classData.examsCount} bài kiểm tra
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="size-5 text-gray-400" />
                  <span className="text-gray-600">
                    Tạo lúc{" "}
                    {new Date(classData.createdDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                to={`/classes/${id}/create-exam`}
                className="bg-[#F05123] text-white px-6 py-3 rounded-lg hover:bg-[#D9471E] transition-colors flex items-center gap-2 font-medium"
              >
                <Plus className="size-5" />
                Tạo bài kiểm tra
              </Link>
              <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Edit className="size-5 text-gray-600" />
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-3 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="size-5 text-red-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex gap-8 px-8">
              <button
                onClick={() => setActiveTab("exams")}
                className={`py-4 border-b-2 transition-colors ${
                  activeTab === "exams"
                    ? "border-[#F05123] text-[#F05123] font-medium"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Bài kiểm tra ({exams.length})
              </button>
              <button
                onClick={() => setActiveTab("students")}
                className={`py-4 border-b-2 transition-colors ${
                  activeTab === "students"
                    ? "border-[#F05123] text-[#F05123] font-medium"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Học sinh ({students.length})
              </button>
              <button
                onClick={() => setActiveTab("submissions")}
                className={`py-4 border-b-2 transition-colors ${
                  activeTab === "submissions"
                    ? "border-[#F05123] text-[#F05123] font-medium"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Bài nộp gần đây
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Exams Tab */}
            {activeTab === "exams" && (
              <div className="space-y-4">
                {exams.map((exam) => (
                  <div
                    key={exam.id}
                    className="p-6 rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {exam.title}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}
                          >
                            {getExamStatusLabel(exam.status)}
                          </span>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-4" />
                            Hạn nộp:{" "}
                            {new Date(exam.dueDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Upload className="size-4" />
                            {exam.submissions}/{exam.total} đã nộp
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="size-4" />
                            {exam.graded} đã chấm
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                          <div
                            className="bg-[#F05123] h-2 rounded-full transition-all"
                            style={{
                              width: `${(exam.submissions / exam.total) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 ml-6">
                        {exam.status === "active" &&
                          exam.submissions > exam.graded && (
                            <button className="bg-orange-100 text-[#B63A18] px-4 py-2 rounded-lg hover:bg-orange-200 transition-colors flex items-center gap-2 font-medium">
                              <Sparkles className="size-4" />
                              Chấm bằng AI
                            </button>
                          )}
                        <Link
                          to={`/classes/${id}/essay/${exam.id}/submission-1`}
                          className="bg-[#F05123] text-white px-4 py-2 rounded-lg hover:bg-[#D9471E] transition-colors"
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Students Tab */}
            {activeTab === "students" && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Họ tên
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Ngày tham gia
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Bài đã nộp
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Điểm TB (/10)
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr
                        key={student.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="size-10 bg-orange-100 rounded-full flex items-center justify-center text-[#D9471E] font-medium">
                              {student.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <span className="font-medium text-gray-900">
                              {student.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {student.email}
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {new Date(student.joined).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-gray-900">
                          {student.submissions}
                        </td>
                        <td className="py-4 px-4">
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                            {student.avgGrade}/10
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <button className="text-[#F05123] hover:text-[#D9471E] text-sm font-medium">
                            Xem hồ sơ
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Submissions Tab */}
            {activeTab === "submissions" && (
              <div className="space-y-4">
                {recentSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="p-6 rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="size-12 bg-orange-100 rounded-full flex items-center justify-center text-[#D9471E] font-medium">
                          {submission.student
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {submission.student}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {submission.exam}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <Clock className="size-3" />
                            {submission.submittedAt}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {submission.aiGraded && (
                          <div className="flex items-center gap-1 text-[#D9471E] text-sm">
                            <Sparkles className="size-4" />
                            <span>AI đã chấm</span>
                          </div>
                        )}

                        <span
                          className={`px-4 py-2 rounded-lg text-sm font-medium ${getSubmissionStatusColor(submission.status)}`}
                        >
                          {submission.status === "graded"
                            ? `Điểm: ${submission.grade}/10`
                            : "Chờ chấm"}
                        </span>

                        <Link
                          to={`/classes/${id}/essay/${submission.assignmentId}/submission-${submission.id}`}
                          className="bg-[#F05123] text-white px-4 py-2 rounded-lg hover:bg-[#D9471E] transition-colors text-sm"
                        >
                          Xem bài
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-red-100 p-4 rounded-full">
                <AlertCircle className="size-12 text-red-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Xóa lớp học?
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Bạn có chắc muốn xóa "{classData.name}"? Hành động này không thể
              hoàn tác và sẽ xóa toàn bộ bài kiểm tra cùng bài nộp liên quan.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Hủy
              </button>
              <Link
                to="/classes"
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium text-center"
              >
                Xác nhận xóa
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

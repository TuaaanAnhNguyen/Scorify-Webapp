import { ReactNode, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import {
  GraduationCap,
  Settings,
  LogOut,
  ArrowLeft,
  Award,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BookOpen,
  FileText,
  Download,
  MessageSquare,
  TrendingUp,
  Calculator,
} from "lucide-react";

type EssayDetailLayoutProps = {
  classId?: string;
  studentName: string;
  children: ReactNode;
};

function TeacherEssayDetailLayout({
  classId,
  children,
}: EssayDetailLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
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
                <div className="size-10 bg-[#D9471E] rounded-full flex items-center justify-center text-white font-medium">
                  TH
                </div>
              </div>
              <button className="text-gray-600 hover:text-red-600">
                <LogOut className="size-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to={`/classes/${classId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="size-5" />
          Quay lại chi tiết lớp
        </Link>
        {children}
      </div>
    </div>
  );
}

function StudentEssayDetailLayout({
  classId,
  studentName,
  children,
}: EssayDetailLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <GraduationCap className="size-8 text-[#F05123]" />
              <span className="font-semibold text-xl">Scorify</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/student/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                Bảng điều khiển
              </Link>
              <Link
                to="/student/classes"
                className="text-gray-600 hover:text-gray-900"
              >
                Lớp học của tôi
              </Link>
              <button className="text-gray-600 hover:text-gray-900">
                <Settings className="size-6" />
              </button>
              <div className="flex items-center gap-3 border-l pl-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {studentName}
                  </div>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to={`/student/classes/${classId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="size-5" />
          Quay lại lớp học
        </Link>
        {children}
      </div>
    </div>
  );
}

export function ViewEssayDetailPage() {
  const { id, assignmentId, submissionId } = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<
    "feedback" | "original" | "solution"
  >("feedback");
  const isTeacherView = location.pathname.startsWith("/classes/");

  const classes = [
    { id: 1, name: "Toán 10A1", subject: "Toán" },
    { id: 2, name: "Ngữ văn 10A1", subject: "Ngữ văn" },
    { id: 3, name: "Tiếng Anh 10A1", subject: "Tiếng Anh" },
    { id: 4, name: "Vật lí 10A2", subject: "Vật lí" },
    { id: 5, name: "Hóa học 10A2", subject: "Hóa học" },
    { id: 6, name: "Sinh học 10A2", subject: "Sinh học" },
    { id: 7, name: "Lịch sử 11A1", subject: "Lịch sử" },
    { id: 8, name: "Địa lí 11A1", subject: "Địa lí" },
    { id: 9, name: "Giáo dục công dân 12A1", subject: "GDCD" },
    { id: 10, name: "Tin học 12A1", subject: "Tin học" },
  ];

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

  const classId = Number(id);
  const assignmentNo = Number(assignmentId) || 1;
  const selectedClass = classes.find((c) => c.id === classId) ?? classes[0];
  const subjectExamTitles = examTitleBySubject[selectedClass.subject] ?? [
    "Bài kiểm tra chuyên đề",
  ];
  const assignmentTitle =
    subjectExamTitles[(assignmentNo - 1) % subjectExamTitles.length];

  const submissionData = {
    id: submissionId,
    studentName: "Nguyễn Minh Anh",
    assignmentTitle,
    subject: selectedClass.subject,
    submittedAt: "2026-03-08 14:30",
    gradedAt: "2026-03-09 10:15",
    score:
      selectedClass.subject === "Ngữ văn" || selectedClass.subject === "Lịch sử"
        ? 8.9
        : 8.7,
    totalPoints: 10,
    status: "graded",
  };

  const isEssaySubject = [
    "Ngữ văn",
    "Lịch sử",
    "Địa lí",
    "GDCD",
    "Tiếng Anh",
  ].includes(selectedClass.subject);

  const overallFeedback = isEssaySubject
    ? {
        strengths: [
          "Lập luận rõ ràng, có trọng tâm",
          "Dẫn chứng phù hợp với yêu cầu đề bài",
          "Bố cục bài viết mạch lạc",
          "Diễn đạt tương đối tự nhiên và chính xác",
        ],
        weaknesses: [
          "Một số luận điểm chưa được đào sâu",
          "Chuyển ý giữa các đoạn còn đột ngột",
          "Có chỗ dùng từ chưa thật chính xác",
          "Kết luận chưa nhấn mạnh thông điệp chính",
        ],
        suggestions: [
          "Tăng số lượng dẫn chứng cụ thể cho luận điểm chính",
          "Dùng câu nối để liên kết đoạn tốt hơn",
          "Rà soát lỗi diễn đạt trước khi nộp bài",
          "Viết phần kết luận theo hướng khái quát và mở rộng",
        ],
      }
    : {
        strengths: [
          "Nắm chắc kiến thức nền tảng của chuyên đề",
          "Trình bày lời giải theo từng bước rõ ràng",
          "Biết áp dụng công thức vào bài tập tương đối tốt",
          "Kết quả nhiều câu đạt độ chính xác cao",
        ],
        weaknesses: [
          "Một số câu còn thiếu bước trung gian",
          "Nhầm lẫn nhỏ ở phép biến đổi cuối",
          "Có câu chưa ghi rõ đơn vị/kết luận",
          "Kiểm tra lại tính hợp lý của đáp án chưa kỹ",
        ],
        suggestions: [
          "Giữ thói quen kiểm tra lại kết quả sau khi giải",
          "Ghi đầy đủ các bước để tránh mất điểm thành phần",
          "Đối chiếu công thức trước khi áp dụng",
          "Rà soát đơn vị và kết luận ở câu vận dụng",
        ],
      };

  const detailedFeedback = isEssaySubject
    ? [
        {
          id: 1,
          problemNumber: "Câu 1",
          question: `Xác định luận điểm chính của đề "${assignmentTitle}" và trình bày mở bài.`,
          studentAnswer:
            "Mở bài nêu vấn đề đúng trọng tâm nhưng chuyển ý còn ngắn.",
          isCorrect: true,
          correctAnswer:
            "Mở bài cần nêu rõ vấn đề, phạm vi phân tích và định hướng lập luận.",
          points: 2.8,
          maxPoints: 3,
          feedback:
            "✓ Em bám đề tốt, phần mở bài đúng định hướng nhưng có thể tăng độ hấp dẫn bằng một câu dẫn tự nhiên hơn.",
          steps: [
            {
              step: "Nêu vấn đề",
              studentWork: "Đã nêu rõ",
              isCorrect: true,
              explanation: "Đúng trọng tâm đề",
            },
            {
              step: "Giới hạn phạm vi",
              studentWork: "Nêu tương đối",
              isCorrect: true,
              explanation: "Có phạm vi nhưng cần cụ thể hơn",
            },
            {
              step: "Định hướng lập luận",
              studentWork: "Chưa liền mạch",
              isCorrect: false,
              explanation: "Nên thêm câu nối sang thân bài",
            },
          ],
        },
        {
          id: 2,
          problemNumber: "Câu 2",
          question: "Triển khai 2 luận điểm chính kèm dẫn chứng.",
          studentAnswer: "Luận điểm đầy đủ nhưng dẫn chứng chưa đa dạng.",
          isCorrect: false,
          correctAnswer:
            "Mỗi luận điểm cần tối thiểu 1 dẫn chứng cụ thể và phân tích ngắn.",
          points: 3.1,
          maxPoints: 4,
          feedback:
            "⚠️ Đúng hướng nhưng phần chứng minh còn mỏng. Cần tăng chất lượng dẫn chứng để thuyết phục hơn.",
          steps: [
            {
              step: "Xây dựng luận điểm",
              studentWork: "Đúng",
              isCorrect: true,
              explanation: "Luận điểm hợp lý",
            },
            {
              step: "Dẫn chứng",
              studentWork: "Ít dẫn chứng",
              isCorrect: false,
              explanation: "Cần thêm ví dụ cụ thể",
            },
            {
              step: "Phân tích dẫn chứng",
              studentWork: "Ngắn",
              isCorrect: false,
              explanation: "Nên liên hệ rõ với luận điểm",
            },
          ],
        },
        {
          id: 3,
          problemNumber: "Câu 3",
          question: "Kết luận và mở rộng vấn đề.",
          studentAnswer: "Kết bài gọn nhưng chưa mở rộng.",
          isCorrect: false,
          correctAnswer:
            "Kết luận cần chốt luận điểm và mở rộng ý nghĩa thực tiễn.",
          points: 3,
          maxPoints: 3,
          feedback:
            "⚠️ Kết luận đúng ý chính nhưng phần mở rộng còn ngắn. Em có thể liên hệ thực tiễn để bài viết trọn vẹn hơn.",
          steps: [
            {
              step: "Chốt luận điểm",
              studentWork: "Đã có",
              isCorrect: true,
              explanation: "Tóm tắt đúng",
            },
            {
              step: "Mở rộng",
              studentWork: "Chưa rõ",
              isCorrect: false,
              explanation: "Nên thêm 1-2 câu liên hệ",
            },
          ],
        },
      ]
    : [
        {
          id: 1,
          problemNumber: "Câu 1",
          question: "Tính đạo hàm của f(x) = 3x⁴ - 2x² + 5x - 7",
          studentAnswer: "f'(x) = 12x³ - 4x + 5",
          isCorrect: true,
          correctAnswer: "f'(x) = 12x³ - 4x + 5",
          points: 2,
          maxPoints: 2,
          feedback:
            "✓ Chính xác hoàn toàn. Em áp dụng đúng quy tắc lũy thừa cho từng hạng tử và kết quả cuối đúng.",
          steps: [
            {
              step: "Áp dụng quy tắc lũy thừa cho 3x⁴",
              studentWork: "12x³",
              isCorrect: true,
              explanation: "Đúng: d/dx(3x⁴) = 3·4x³ = 12x³",
            },
            {
              step: "Áp dụng quy tắc lũy thừa cho -2x²",
              studentWork: "-4x",
              isCorrect: true,
              explanation: "Đúng: d/dx(-2x²) = -2·2x = -4x",
            },
            {
              step: "Đạo hàm của 5x",
              studentWork: "5",
              isCorrect: true,
              explanation: "Đúng: d/dx(5x) = 5",
            },
            {
              step: "Đạo hàm hằng số",
              studentWork: "0",
              isCorrect: true,
              explanation: "Đúng: d/dx(-7) = 0",
            },
          ],
        },
        {
          id: 2,
          problemNumber: "Câu 2",
          question: "Tính đạo hàm g(x) = (2x + 1)⁵ bằng quy tắc dây chuyền",
          studentAnswer: "g'(x) = 5(2x + 1)⁴",
          isCorrect: false,
          correctAnswer: "g'(x) = 10(2x + 1)⁴",
          points: 1.6,
          maxPoints: 2,
          feedback:
            "⚠️ Đúng một phần. Em xác định đúng quy tắc dây chuyền nhưng quên nhân với đạo hàm của biểu thức bên trong (2x + 1).",
          steps: [
            {
              step: "Xác định hàm ngoài u⁵",
              studentWork: "u = 2x + 1",
              isCorrect: true,
              explanation: "Xác định đúng hàm hợp",
            },
            {
              step: "Đạo hàm hàm ngoài",
              studentWork: "5(2x + 1)⁴",
              isCorrect: true,
              explanation: "Đúng: d/du(u⁵) = 5u⁴",
            },
            {
              step: "Tính đạo hàm hàm trong",
              studentWork: "Thiếu",
              isCorrect: false,
              explanation: "❌ Cần nhân thêm với d/dx(2x + 1) = 2",
            },
            {
              step: "Nhân với đạo hàm hàm trong",
              studentWork: "Chưa thể hiện",
              isCorrect: false,
              explanation:
                "❌ Thiếu bước: Kết quả phải là 5(2x + 1)⁴ · 2 = 10(2x + 1)⁴",
            },
          ],
        },
        {
          id: 3,
          problemNumber: "Câu 3",
          question: "Tính đạo hàm h(x) = x² · sin(x) bằng quy tắc tích",
          studentAnswer: "h'(x) = 2x · cos(x)",
          isCorrect: false,
          correctAnswer: "h'(x) = 2x·sin(x) + x²·cos(x)",
          points: 1.1,
          maxPoints: 2,
          feedback:
            "❌ Áp dụng sai quy tắc tích. Công thức đúng là (uv)' = u'v + uv'. Em mới tính một hạng tử.",
          steps: [
            {
              step: "Xác định u và v",
              studentWork: "u = x², v = sin(x)",
              isCorrect: true,
              explanation: "Xác định đúng",
            },
            {
              step: "Tính u'",
              studentWork: "u' = 2x",
              isCorrect: true,
              explanation: "Đúng: d/dx(x²) = 2x",
            },
            {
              step: "Tính v'",
              studentWork: "v' = cos(x)",
              isCorrect: true,
              explanation: "Đúng: d/dx(sin(x)) = cos(x)",
            },
            {
              step: "Áp dụng u'v + uv'",
              studentWork: "Chỉ ghi 2x·cos(x)",
              isCorrect: false,
              explanation:
                "❌ Thiếu hạng tử uv'. Đáp án đầy đủ: 2x·sin(x) + x²·cos(x)",
            },
          ],
        },
        {
          id: 4,
          problemNumber: "Câu 4",
          question: "Tính đạo hàm k(x) = eˣ · ln(x)",
          studentAnswer: "k'(x) = eˣ · ln(x) + eˣ/x",
          isCorrect: true,
          correctAnswer: "k'(x) = eˣ·ln(x) + eˣ/x",
          points: 2,
          maxPoints: 2,
          feedback:
            "✓ Rất tốt! Em áp dụng chính xác quy tắc tích cho hàm mũ và logarit.",
          steps: [
            {
              step: "Xác định u và v",
              studentWork: "u = eˣ, v = ln(x)",
              isCorrect: true,
              explanation: "Xác định đúng",
            },
            {
              step: "Tính u'",
              studentWork: "u' = eˣ",
              isCorrect: true,
              explanation: "Đúng: d/dx(eˣ) = eˣ",
            },
            {
              step: "Tính v'",
              studentWork: "v' = 1/x",
              isCorrect: true,
              explanation: "Đúng: d/dx(ln(x)) = 1/x",
            },
            {
              step: "Áp dụng quy tắc tích",
              studentWork: "eˣ·ln(x) + eˣ·(1/x)",
              isCorrect: true,
              explanation: "Áp dụng chuẩn công thức (uv)' = u'v + uv'",
            },
          ],
        },
        {
          id: 5,
          problemNumber: "Câu 5",
          question:
            "Một vật được ném thẳng đứng với vận tốc đầu 20 m/s. Độ cao h(t) = 20t - 5t². Tính vận tốc tại t = 2 giây.",
          studentAnswer: "v(2) = 10",
          isCorrect: false,
          correctAnswer: "v(2) = 0 m/s",
          points: 2,
          maxPoints: 2,
          feedback:
            "⚠️ Em làm đúng phép tính nhưng thiếu đơn vị. Với bài toán vật lý, cần ghi đơn vị ở kết quả cuối. Tại t=2, vận tốc là 0 m/s (vật đạt độ cao cực đại).",
          steps: [
            {
              step: "Tìm hàm vận tốc v(t) = h'(t)",
              studentWork: "v(t) = 20 - 10t",
              isCorrect: true,
              explanation: "Đạo hàm đúng",
            },
            {
              step: "Thay t = 2",
              studentWork: "v(2) = 20 - 10(2) = 0",
              isCorrect: true,
              explanation: "Tính đúng",
            },
            {
              step: "Ghi đơn vị",
              studentWork: "Thiếu đơn vị",
              isCorrect: false,
              explanation: "❌ Cần ghi rõ: v(2) = 0 m/s",
            },
            {
              step: "Diễn giải ý nghĩa vật lý",
              studentWork: "Chưa nêu",
              isCorrect: false,
              explanation: "💡 Ở t=2s vận tốc bằng 0, vật ở vị trí cao nhất",
            },
          ],
        },
      ];

  const performanceMetrics = isEssaySubject
    ? {
        "Mạch lạc lập luận": 86,
        "Độ chính xác nội dung": 84,
        "Sử dụng dẫn chứng": 78,
        "Diễn đạt": 88,
        "Bố cục": 82,
      }
    : {
        "Độ chính xác": 74,
        "Hiểu khái niệm": 85,
        "Trình bày lời giải": 70,
        "Ký hiệu": 90,
        "Giải quyết vấn đề": 80,
      };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-orange-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return "bg-green-50 border-green-200";
    if (score >= 80) return "bg-blue-50 border-blue-200";
    if (score >= 70) return "bg-yellow-50 border-yellow-200";
    return "bg-orange-50 border-orange-200";
  };

  const getGradeColor = (score: number) => {
    if (score >= 9) return "text-green-600";
    if (score >= 8) return "text-blue-600";
    if (score >= 7) return "text-yellow-600";
    return "text-orange-600";
  };

  const getGradeBgColor = (score: number) => {
    if (score >= 9) return "bg-green-50 border-green-200";
    if (score >= 8) return "bg-blue-50 border-blue-200";
    if (score >= 7) return "bg-yellow-50 border-yellow-200";
    return "bg-orange-50 border-orange-200";
  };

  const roleLayout = isTeacherView ? (
    <TeacherEssayDetailLayout
      classId={id}
      studentName={submissionData.studentName}
    >
      {renderPageContent()}
    </TeacherEssayDetailLayout>
  ) : (
    <StudentEssayDetailLayout
      classId={id}
      studentName={submissionData.studentName}
    >
      {renderPageContent()}
    </StudentEssayDetailLayout>
  );

  return roleLayout;

  function renderPageContent() {
    return (
      <>
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-orange-100 p-4 rounded-xl">
                  <Calculator className="size-8 text-[#D9471E]" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {submissionData.assignmentTitle}
                  </h1>
                  <p className="text-gray-600">{submissionData.subject}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span>
                  Nộp lúc:{" "}
                  {new Date(submissionData.submittedAt).toLocaleString()}
                </span>
                <span>•</span>
                <span>
                  Chấm lúc: {new Date(submissionData.gradedAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Score Card */}
            <div
              className={`p-6 rounded-xl border-2 ${getGradeBgColor(submissionData.score)} text-center min-w-[200px]`}
            >
              <Award
                className={`size-12 ${getGradeColor(submissionData.score)} mx-auto mb-2`}
              />
              <div
                className={`text-4xl font-bold ${getGradeColor(submissionData.score)} mb-1`}
              >
                {submissionData.score.toFixed(1)}
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-1">
                {submissionData.score}/{submissionData.totalPoints}
              </div>
              <div className="text-sm text-gray-600">AI đã chấm</div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="size-6 text-[#F05123]" />
            Phân tích hiệu suất
          </h2>
          <div className="grid md:grid-cols-5 gap-6">
            {Object.entries(performanceMetrics).map(([key, value]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{key}</span>
                  <span className={`text-lg font-bold ${getScoreColor(value)}`}>
                    {value}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${value >= 80 ? "bg-green-500" : value >= 70 ? "bg-yellow-500" : "bg-orange-500"}`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overall Feedback */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MessageSquare className="size-6 text-[#F05123]" />
            Tổng quan nhận xét từ AI
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Strengths */}
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="size-6 text-green-600" />
                <h3 className="font-semibold text-gray-900">Điểm mạnh</h3>
              </div>
              <ul className="space-y-2">
                {overallFeedback.strengths.map((strength, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-700 flex items-start gap-2"
                  >
                    <span className="text-green-600 mt-1">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="size-6 text-orange-600" />
                <h3 className="font-semibold text-gray-900">
                  Điểm cần cải thiện
                </h3>
              </div>
              <ul className="space-y-2">
                {overallFeedback.weaknesses.map((weakness, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-700 flex items-start gap-2"
                  >
                    <span className="text-orange-600 mt-1">•</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggestions */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="size-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Gợi ý</h3>
              </div>
              <ul className="space-y-2">
                {overallFeedback.suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-700 flex items-start gap-2"
                  >
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Detailed Problem-by-Problem Feedback */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="size-6 text-[#F05123]" />
              Nhận xét chi tiết theo từng câu
            </h2>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {detailedFeedback.map((problem) => (
                <div
                  key={problem.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  {/* Problem Header */}
                  <div
                    className={`p-4 ${problem.isCorrect ? "bg-green-50" : problem.points >= problem.maxPoints * 0.5 ? "bg-yellow-50" : "bg-red-50"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {problem.isCorrect ? (
                          <CheckCircle className="size-6 text-green-600" />
                        ) : problem.points >= problem.maxPoints * 0.5 ? (
                          <AlertTriangle className="size-6 text-yellow-600" />
                        ) : (
                          <XCircle className="size-6 text-red-600" />
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {problem.problemNumber}
                          </h3>
                          <p className="text-sm text-gray-700">
                            {problem.question}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-2xl font-bold ${problem.isCorrect ? "text-green-600" : problem.points >= problem.maxPoints * 0.5 ? "text-yellow-600" : "text-red-600"}`}
                        >
                          {problem.points}/{problem.maxPoints}
                        </div>
                        <div className="text-xs text-gray-600">điểm</div>
                      </div>
                    </div>
                  </div>

                  {/* Problem Content */}
                  <div className="p-6">
                    {/* Your Answer */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Bài làm của bạn:
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4 font-mono text-gray-900 border border-gray-200">
                        {problem.studentAnswer}
                      </div>
                    </div>

                    {/* Correct Answer */}
                    {!problem.isCorrect && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Đáp án đúng:
                        </h4>
                        <div className="bg-green-50 rounded-lg p-4 font-mono text-green-900 border border-green-200">
                          {problem.correctAnswer}
                        </div>
                      </div>
                    )}

                    {/* AI Feedback */}
                    <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-blue-900 mb-2">
                        Nhận xét từ AI:
                      </h4>
                      <p className="text-sm text-gray-700">
                        {problem.feedback}
                      </p>
                    </div>

                    {/* Step-by-Step Analysis */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Phân tích từng bước:
                      </h4>
                      <div className="space-y-3">
                        {problem.steps.map((step, index) => (
                          <div
                            key={index}
                            className={`flex items-start gap-3 p-3 rounded-lg border ${step.isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                          >
                            <div className="flex-shrink-0 mt-1">
                              {step.isCorrect ? (
                                <CheckCircle className="size-5 text-green-600" />
                              ) : (
                                <XCircle className="size-5 text-red-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm mb-1">
                                Bước {index + 1}: {step.step}
                              </div>
                              <div className="text-sm text-gray-700 mb-1">
                                Bài làm:{" "}
                                <span className="font-mono bg-white px-2 py-0.5 rounded">
                                  {step.studentWork}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                {step.explanation}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
          <div className="flex items-center justify-between">
            <button className="flex items-center gap-2 text-[#F05123] hover:text-[#D9471E] font-medium">
              <Download className="size-5" />
              Tải báo cáo đầy đủ
            </button>
            <div className="flex gap-4">
              <Link
                to={isTeacherView ? `/classes/${id}` : `/student/classes/${id}`}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                {isTeacherView ? "Quay lại lớp học" : "Quay lại lớp"}
              </Link>
              <button className="bg-[#F05123] text-white px-6 py-3 rounded-lg hover:bg-[#D9471E] transition-colors font-medium">
                Xem lời giải
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
}

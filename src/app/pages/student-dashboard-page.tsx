import { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, BookOpen, FileText, TrendingUp, Settings, LogOut, Plus, Calendar, Clock, CheckCircle, AlertCircle, Award } from "lucide-react";

export function StudentDashboardPage() {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classCode, setClassCode] = useState("");

  const stats = [
    { label: "Lớp đang học", value: "3", icon: BookOpen, color: "bg-blue-100 text-blue-600" },
    { label: "Bài chờ nộp", value: "5", icon: AlertCircle, color: "bg-orange-100 text-orange-600" },
    { label: "Đã hoàn thành", value: "10", icon: CheckCircle, color: "bg-green-100 text-green-600" },
    { label: "Điểm TB", value: "8.7/10", icon: Award, color: "bg-orange-100 text-[#D9471E]" },
  ];

  const enrolledClasses = [
    { id: 1, name: "Toán 10A1", subject: "Toán", teacher: "Cô Nguyễn Thu Hà", pendingAssignments: 2, nextDue: "2026-03-15" },
    { id: 2, name: "Sinh học 10A2", subject: "Sinh học", teacher: "Thầy Trần Đức Minh", pendingAssignments: 1, nextDue: "2026-03-18" },
    { id: 3, name: "Vật lí 10A2", subject: "Vật lí", teacher: "Cô Lê Phương Anh", pendingAssignments: 2, nextDue: "2026-03-20" },
  ];

  const upcomingDeadlines = [
    { id: 1, title: "Bài tập đạo hàm", class: "Toán 10A1", dueDate: "2026-03-15", status: "pending" },
    { id: 2, title: "Báo cáo cấu trúc tế bào", class: "Sinh học 10A2", dueDate: "2026-03-18", status: "pending" },
    { id: 3, title: "Bài tập định luật Newton", class: "Vật lí 10A2", dueDate: "2026-03-20", status: "pending" },
    { id: 4, title: "Phiếu ôn tập chuyển động", class: "Vật lí 10A2", dueDate: "2026-03-22", status: "pending" },
  ];

  const recentGrades = [
    { id: 1, title: "Kiểm tra hàm số", class: "Toán 10A1", grade: "9.0/10", submittedAt: "2026-03-08", feedback: "Nắm công thức tốt, trình bày rõ ràng" },
    { id: 2, title: "Bài thực hành hiển vi", class: "Sinh học 10A2", grade: "8.8/10", submittedAt: "2026-03-05", feedback: "Quan sát tốt, cần bổ sung phần kết luận" },
    { id: 3, title: "Bài tập động học", class: "Vật lí 10A2", grade: "8.4/10", submittedAt: "2026-03-01", feedback: "Lập phương trình đúng, còn sai số ở phép tính cuối" },
    { id: 4, title: "Trắc nghiệm di truyền", class: "Sinh học 10A2", grade: "9.4/10", submittedAt: "2026-02-27", feedback: "Hiểu bản chất bài tốt, tốc độ làm bài ổn định" },
  ];

  const handleJoinClass = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Joining class with code:", classCode);
    setShowJoinModal(false);
    setClassCode("");
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
              <Link to="/student/dashboard" className="text-[#F05123] font-medium">
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng quay lại, Minh Anh! 👋</h1>
          <p className="text-gray-600">Bạn có 5 bài đang đến hạn trong tuần này. Bắt đầu thôi!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="size-6" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-[#D9471E] to-[#F05123] rounded-xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Tham gia lớp mới</h2>
              <p className="text-orange-100">Nhập mã lớp để bắt đầu</p>
            </div>
            <button
              onClick={() => setShowJoinModal(true)}
              className="bg-white text-[#F05123] px-6 py-3 rounded-lg hover:bg-orange-50 transition-colors flex items-center gap-2 font-medium"
            >
              <Plus className="size-5" />
              Tham gia lớp
            </button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* My Classes */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Lớp học của tôi</h2>
                <Link to="/student/classes" className="text-[#F05123] hover:text-[#D9471E] text-sm font-medium">
                  Xem tất cả →
                </Link>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {enrolledClasses.map((classItem) => (
                    <Link
                      key={classItem.id}
                      to={`/student/classes/${classItem.id}`}
                      className="block p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{classItem.name}</h3>
                          <p className="text-sm text-gray-600">{classItem.subject} • {classItem.teacher}</p>
                        </div>
                        {classItem.pendingAssignments > 0 && (
                          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">
                            {classItem.pendingAssignments} chưa nộp
                          </span>
                        )}
                      </div>
                      {classItem.nextDue && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="size-4" />
                          Hạn gần nhất: {new Date(classItem.nextDue).toLocaleDateString()}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Grades */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Điểm gần đây</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentGrades.map((grade) => (
                    <div key={grade.id} className="p-4 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{grade.title}</h3>
                          <p className="text-sm text-gray-600">{grade.class}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="size-5 text-yellow-500" />
                          <span className="text-2xl font-bold text-gray-900">{grade.grade}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{grade.feedback}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="size-3" />
                        Nộp lúc: {new Date(grade.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Hạn nộp sắp tới</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {upcomingDeadlines.map((deadline) => (
                    <div key={deadline.id} className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                      <div className="flex items-start gap-3">
                        <div className="bg-orange-100 p-2 rounded-lg">
                          <Calendar className="size-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm mb-1">{deadline.title}</h3>
                          <p className="text-xs text-gray-600 mb-2">{deadline.class}</p>
                          <div className="flex items-center gap-1 text-xs text-orange-700 font-medium">
                            <Clock className="size-3" />
                            Hạn nộp: {new Date(deadline.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Học kỳ này</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Bài đã nộp</span>
                    <span className="text-lg font-semibold text-gray-900">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Bài đã chấm</span>
                    <span className="text-lg font-semibold text-gray-900">9</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Chờ chấm</span>
                    <span className="text-lg font-semibold text-orange-600">3</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Hiệu suất tổng thể</span>
                      <span className="text-lg font-semibold text-green-600">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Join Class Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tham gia lớp học</h2>
            
            <form onSubmit={handleJoinClass} className="space-y-4">
              <div>
                <label htmlFor="classCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Mã lớp
                </label>
                <input
                  type="text"
                  id="classCode"
                  required
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F05123] focus:border-transparent text-lg tracking-wider text-center uppercase"
                  placeholder="ABC123"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Nhập mã 6 ký tự do giáo viên cung cấp
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#F05123] text-white px-6 py-3 rounded-lg hover:bg-[#D9471E] transition-colors font-medium"
                >
                  Tham gia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

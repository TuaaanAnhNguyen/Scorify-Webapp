import { Link } from "react-router-dom";
import { GraduationCap, BookOpen, Users, BarChart3, Settings, LogOut, Plus, TrendingUp, Calendar, FileText } from "lucide-react";

export function DashboardPage() {
  const stats = [
    { label: "Tổng số lớp", value: "10", icon: BookOpen, color: "bg-blue-100 text-blue-600" },
    { label: "Tổng học sinh", value: "312", icon: Users, color: "bg-green-100 text-green-600" },
    { label: "Bài đã chấm", value: "1,846", icon: FileText, color: "bg-orange-100 text-[#D9471E]" },
    { label: "Điểm TB", value: "8.6/10", icon: TrendingUp, color: "bg-orange-100 text-orange-600" },
  ];

  const recentClasses = [
    { id: 1, name: "Ngữ văn 10A1", subject: "Ngữ văn", students: 32, exams: 5, createdDate: "2025-09-01" },
    { id: 2, name: "Viết học thuật nâng cao", subject: "Kỹ năng viết", students: 28, exams: 4, createdDate: "2025-09-05" },
    { id: 3, name: "Viết sáng tạo", subject: "Ngữ văn", students: 25, exams: 3, createdDate: "2025-09-10" },
    { id: 4, name: "Ôn tập thi THPT Quốc gia", subject: "Ngữ văn", students: 40, exams: 8, createdDate: "2025-09-28" },
  ];

  const upcomingExams = [
    { id: 1, title: "Bài viết giữa kỳ", class: "Ngữ văn 10A1", dueDate: "2026-03-15" },
    { id: 2, title: "Phân tích thơ", class: "Viết học thuật nâng cao", dueDate: "2026-03-18" },
    { id: 3, title: "Bài tập truyện ngắn", class: "Viết sáng tạo", dueDate: "2026-03-20" },
    { id: 4, title: "Đề luyện nghị luận xã hội", class: "Ôn tập thi THPT Quốc gia", dueDate: "2026-03-25" },
  ];

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng quay lại, cô Hà! 👋</h1>
          <p className="text-gray-600">Đây là tình hình lớp học của bạn hôm nay.</p>
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
        <div className="bg-gradient-to-r from-[#F05123] to-[#D9471E] rounded-xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Thao tác nhanh</h2>
              <p className="text-orange-100">Bắt đầu với các tác vụ thường dùng</p>
            </div>
            <div className="flex gap-4">
              <Link
                to="/classes?action=create"
                className="bg-white text-[#F05123] px-6 py-3 rounded-lg hover:bg-orange-50 transition-colors flex items-center gap-2 font-medium"
              >
                <Plus className="size-5" />
                Tạo lớp học
              </Link>
              <Link
                to="/classes"
                className="bg-white/10 backdrop-blur-sm text-white border border-white/20 px-6 py-3 rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2 font-medium"
              >
                <BookOpen className="size-5" />
                Xem tất cả lớp
              </Link>
              <Link
                to="/payment"
                className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 font-medium"
              >
                <TrendingUp className="size-5" />
                Nâng cấp Pro
              </Link>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Classes */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Lớp học của bạn</h2>
                <Link to="/classes" className="text-[#F05123] hover:text-[#D9471E] text-sm font-medium">
                  Xem tất cả →
                </Link>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentClasses.map((classItem) => (
                    <Link
                      key={classItem.id}
                      to={`/classes/${classItem.id}`}
                      className="block p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{classItem.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <BookOpen className="size-4" />
                              {classItem.subject}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="size-4" />
                              {classItem.students} học sinh
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="size-4" />
                              {classItem.exams} bài kiểm tra
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Tạo lúc {new Date(classItem.createdDate).toLocaleDateString()}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Exams */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Bài kiểm tra sắp tới</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {upcomingExams.map((exam) => (
                    <div key={exam.id} className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                      <div className="flex items-start gap-3">
                        <div className="bg-orange-100 p-2 rounded-lg">
                          <Calendar className="size-5 text-[#F05123]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm mb-1">{exam.title}</h3>
                          <p className="text-xs text-gray-600 mb-2">{exam.class}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="size-3" />
                            Hạn nộp: {new Date(exam.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Tuần này</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Bài đã nộp</span>
                    <span className="text-lg font-semibold text-gray-900">127</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Bài đã chấm</span>
                    <span className="text-lg font-semibold text-gray-900">98</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Chờ xử lý</span>
                    <span className="text-lg font-semibold text-orange-600">29</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <button className="w-full bg-[#F05123] text-white py-2 rounded-lg hover:bg-[#D9471E] transition-colors text-sm font-medium">
                      <BarChart3 className="inline-block size-4 mr-2" />
                      Xem phân tích
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

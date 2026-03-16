import { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, BookOpen, Search, Plus, Settings, LogOut, Users, FileText, Clock } from "lucide-react";

export function StudentClassesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classCode, setClassCode] = useState("");

  const classes = [
    { 
      id: 1, 
      name: "Toán 10A1", 
      subject: "Toán", 
      teacher: "Cô Nguyễn Thu Hà",
      students: 32,
      pendingAssignments: 2,
      completedAssignments: 3,
      totalAssignments: 5,
      nextDeadline: "2026-03-15"
    },
    { 
      id: 2, 
      name: "Sinh học 10A2", 
      subject: "Sinh học", 
      teacher: "Thầy Trần Đức Minh",
      students: 28,
      pendingAssignments: 1,
      completedAssignments: 4,
      totalAssignments: 5,
      nextDeadline: "2026-03-18"
    },
    { 
      id: 3, 
      name: "Vật lí 10A2", 
      subject: "Vật lí", 
      teacher: "Cô Lê Phương Anh",
      students: 25,
      pendingAssignments: 2,
      completedAssignments: 2,
      totalAssignments: 4,
      nextDeadline: "2026-03-20"
    },
  ];

  const handleJoinClass = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Joining class with code:", classCode);
    setShowJoinModal(false);
    setClassCode("");
  };

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.teacher.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <Link to="/student/classes" className="text-[#F05123] font-medium">
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Lớp học của tôi</h1>
            <p className="text-gray-600">Tất cả lớp bạn đã tham gia</p>
          </div>
          <button
            onClick={() => setShowJoinModal(true)}
            className="bg-[#F05123] text-white px-6 py-3 rounded-lg hover:bg-[#D9471E] transition-colors flex items-center gap-2 font-medium"
          >
            <Plus className="size-5" />
            Tham gia lớp
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên lớp, môn học hoặc giáo viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F05123] focus:border-transparent"
            />
          </div>
        </div>

        {/* Classes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classItem) => (
            <div key={classItem.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <BookOpen className="size-6 text-[#D9471E]" />
                  </div>
                  {classItem.pendingAssignments > 0 && (
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">
                      {classItem.pendingAssignments} chưa nộp
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-1">{classItem.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{classItem.subject} • {classItem.teacher}</p>
                
                <div className="space-y-3 mb-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Tiến độ</span>
                      <span className="font-medium">{classItem.completedAssignments}/{classItem.totalAssignments} đã hoàn thành</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#F05123] h-2 rounded-full transition-all"
                        style={{ width: `${(classItem.completedAssignments / classItem.totalAssignments) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Next Deadline */}
                  {classItem.nextDeadline && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="size-4" />
                      <span>Hạn tới: {new Date(classItem.nextDeadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <Link
                  to={`/student/classes/${classItem.id}`}
                  className="w-full bg-[#F05123] text-white py-2 rounded-lg hover:bg-[#D9471E] transition-colors text-center text-sm font-medium block"
                >
                  Xem lớp
                </Link>
              </div>
              
              <div className="bg-gray-50 px-6 py-3 flex items-center gap-4 text-xs text-gray-600 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <Users className="size-4" />
                  <span>{classItem.students} học sinh</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="size-4" />
                  <span>{classItem.totalAssignments} bài tập</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredClasses.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <BookOpen className="size-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy lớp học</h3>
            <p className="text-gray-600 mb-6">Thử đổi từ khóa tìm kiếm hoặc tham gia lớp mới</p>
            <button
              onClick={() => setShowJoinModal(true)}
              className="bg-[#F05123] text-white px-6 py-3 rounded-lg hover:bg-[#D9471E] transition-colors inline-flex items-center gap-2"
            >
              <Plus className="size-5" />
              Tham gia lớp đầu tiên
            </button>
          </div>
        )}
      </div>

      {/* Join Class Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tham gia lớp học</h2>
            <p className="text-gray-600 mb-6">Nhập mã lớp do giáo viên cung cấp để tham gia</p>
            
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
                  maxLength={6}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Nhập mã 6 ký tự (ví dụ: ABC123)
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>Mẹo:</strong> Hãy hỏi giáo viên để lấy mã lớp. Bạn cũng có thể tìm mã trong đề cương hoặc tài liệu lớp học.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinModal(false);
                    setClassCode("");
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#F05123] text-white px-6 py-3 rounded-lg hover:bg-[#D9471E] transition-colors font-medium"
                >
                  Tham gia lớp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

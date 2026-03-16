import { useState } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  BookOpen,
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Settings,
  LogOut,
  MoreVertical,
} from "lucide-react";

export function ClassesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    className: "",
    subject: "",
    description: "",
    academicYear: "2025-2026",
  });

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

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating class:", formData);
    setShowCreateModal(false);
    // Reset form
    setFormData({
      className: "",
      subject: "",
      description: "",
      academicYear: "2025-2026",
    });
  };

  const filteredClasses = classes.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase()),
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
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                Bảng điều khiển
              </Link>
              <Link to="/classes" className="text-[#F05123] font-medium">
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Lớp học của tôi
            </h1>
            <p className="text-gray-600">Quản lý tất cả lớp học và học sinh</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#F05123] text-white px-6 py-3 rounded-lg hover:bg-[#D9471E] transition-colors flex items-center gap-2 font-medium"
          >
            <Plus className="size-5" />
            Tạo lớp học
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên lớp hoặc môn học..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F05123] focus:border-transparent"
              />
            </div>
            <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Filter className="size-5" />
              Lọc
            </button>
          </div>
        </div>

        {/* Classes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classItem) => (
            <div
              key={classItem.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <BookOpen className="size-6 text-[#F05123]" />
                  </div>
                  <div className="relative">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="size-5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {classItem.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {classItem.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="flex items-center gap-1">
                    <Users className="size-4" />
                    {classItem.students}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="size-4" />
                    {classItem.exams} bài kiểm tra
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <Link
                    to={`/classes/${classItem.id}`}
                    className="flex-1 bg-[#F05123] text-white py-2 rounded-lg hover:bg-[#D9471E] transition-colors text-center text-sm font-medium"
                  >
                    Xem chi tiết
                  </Link>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Edit className="size-4 text-gray-600" />
                  </button>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors">
                    <Trash2 className="size-4 text-red-600" />
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-3 text-xs text-gray-500">
                Tạo lúc: {new Date(classItem.createdDate).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredClasses.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <BookOpen className="size-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy lớp học
            </h3>
            <p className="text-gray-600 mb-6">
              Hãy thử đổi từ khóa tìm kiếm hoặc tạo lớp mới
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#F05123] text-white px-6 py-3 rounded-lg hover:bg-[#D9471E] transition-colors inline-flex items-center gap-2"
            >
              <Plus className="size-5" />
              Tạo lớp đầu tiên
            </button>
          </div>
        )}
      </div>

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Tạo lớp học mới
            </h2>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label
                  htmlFor="className"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Tên lớp
                </label>
                <input
                  type="text"
                  id="className"
                  required
                  value={formData.className}
                  onChange={(e) =>
                    setFormData({ ...formData, className: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F05123] focus:border-transparent"
                  placeholder="Ví dụ: Ngữ văn 10A1"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Môn học
                </label>
                <input
                  type="text"
                  id="subject"
                  required
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F05123] focus:border-transparent"
                  placeholder="Ví dụ: Ngữ văn"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Mô tả
                </label>
                <textarea
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F05123] focus:border-transparent"
                  placeholder="Mô tả ngắn về lớp học..."
                />
              </div>

              <div>
                <label
                  htmlFor="academicYear"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Năm học
                </label>
                <select
                  id="academicYear"
                  value={formData.academicYear}
                  onChange={(e) =>
                    setFormData({ ...formData, academicYear: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F05123] focus:border-transparent"
                >
                  <option value="2024-2025">2024-2025</option>
                  <option value="2025-2026">2025-2026</option>
                  <option value="2026-2027">2026-2027</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#F05123] text-white px-6 py-3 rounded-lg hover:bg-[#D9471E] transition-colors font-medium"
                >
                  Tạo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

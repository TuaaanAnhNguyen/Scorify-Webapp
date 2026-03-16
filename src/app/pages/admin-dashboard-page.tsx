import { BarChart3, Users, FileText, Clock } from "lucide-react";
import { getAdminStats, ensureAdminData } from "../utils/admin";

export function AdminDashboardPage() {
  ensureAdminData();
  const { totalUsers, markedTests, pendingTests } = getAdminStats();

  return (
    <div>
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển quản trị</h1>
          <p className="text-gray-600">Tổng quan nhanh về trạng thái hệ thống.</p>
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium text-gray-500">Tổng số người dùng</div>
              <div className="text-3xl font-bold text-gray-900">{totalUsers}</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="size-6 text-blue-600" />
            </div>
          </div>
          <div className="text-xs text-gray-500">Số tài khoản giáo viên đã đăng ký</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium text-gray-500">Bài đã chấm</div>
              <div className="text-3xl font-bold text-gray-900">{markedTests}</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <FileText className="size-6 text-green-600" />
            </div>
          </div>
          <div className="text-xs text-gray-500">Tổng số bài đã chấm bởi tất cả giáo viên</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium text-gray-500">Bài chờ xử lý</div>
              <div className="text-3xl font-bold text-gray-900">{pendingTests}</div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Clock className="size-6 text-orange-600" />
            </div>
          </div>
          <div className="text-xs text-gray-500">Số lượng bài đang chờ giáo viên chấm</div>
        </div>
      </div>

      <section className="mt-10 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Gợi ý hành động</h2>
        <p className="text-gray-600">Bạn có thể quản lý giáo viên, tạo tài khoản mới, hoặc xem chi tiết lớp học để theo dõi tiến độ.</p>
      </section>
    </div>
  );
}

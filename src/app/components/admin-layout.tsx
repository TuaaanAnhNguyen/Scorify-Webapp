import { Link, Outlet, useNavigate } from "react-router-dom";
import { Home, Users, Book, LogOut } from "lucide-react";

export function AdminLayout() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white shadow-sm border-r border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-10 h-10 rounded-lg bg-[#F05123] flex items-center justify-center text-white font-bold">A</div>
          <div>
            <div className="text-lg font-semibold text-gray-900">Quản trị</div>
            <div className="text-xs text-gray-500">Scorify Admin</div>
          </div>
        </div>

        <nav className="space-y-2">
          <Link
            to="/admin"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-[#F05123]"
          >
            <Home className="size-5" />
            Bảng điều khiển
          </Link>
          <Link
            to="/admin/teachers"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-[#F05123]"
          >
            <Users className="size-5" />
            Quản lý giáo viên
          </Link>
          <Link
            to="/admin/teachers/create"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-[#F05123]"
          >
            <Book className="size-5" />
            Thêm giáo viên
          </Link>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-[#F05123]"
          >
            <LogOut className="size-5" />
            Đăng xuất
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}

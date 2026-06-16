// src/app/layouts/teacherLayout.tsx

import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Binary,
  Wallet,
  Settings,
  Bell,
  GraduationCap,
  School,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function TeacherLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const authPayload = useAuth();

  console.log("Live Dynamic Context Pipeline:", authPayload);
  const { profile, subscription, loading, logout } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, path: "/workspace", label: "Tổng quan" },
    { icon: Binary, path: "/rubrics", label: "Quản lý bài tập" },
    { icon: School, path: "/classrooms", label: "Lớp học & Bài tập" },
    { icon: Wallet, path: "/workspace/pricing", label: "Gói dịch vụ" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#111A2E] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-[#111A2E] overflow-hidden font-sans antialiased selection:bg-indigo-500/30">
      <aside className="w-[92px] flex flex-col items-center py-6 justify-between shrink-0 z-20">
        <div className="flex flex-col items-center w-full">
          <Link
            to="/workspace"
            className="relative flex items-center justify-center w-12 h-12 mb-8 group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-md shadow-orange-950/40" />
            <div className="relative text-white">
              <GraduationCap className="size-6 stroke-[2.5]" />
            </div>
            <span className="absolute -bottom-3 w-6 h-[2px] bg-slate-700 rounded-full" />
          </Link>

          <nav className="flex flex-col items-end w-full pl-3 gap-1.5">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive =
                item.path === "/workspace"
                  ? location.pathname === "/workspace"
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={idx}
                  to={item.path}
                  className={`w-full h-14 relative flex items-center justify-center rounded-l-2xl transition-all duration-200 group ${
                    isActive
                      ? "bg-[#F8FAFC] text-indigo-600 shadow-[-4px_4px_12px_rgba(0,0,0,0.08)]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  {isActive && (
                    <>
                      <div className="absolute right-0 -top-4 w-4 h-4 bg-[#F8FAFC] pointer-events-none z-10 before:content-[''] before:absolute before:inset-0 before:bg-[#111A2E] before:rounded-br-xl" />
                      <div className="absolute right-0 -bottom-4 w-4 h-4 bg-[#F8FAFC] pointer-events-none z-10 before:content-[''] before:absolute before:inset-0 before:bg-[#111A2E] before:rounded-tr-xl" />
                    </>
                  )}
                  <div
                    className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${isActive ? "bg-indigo-50 text-indigo-600 scale-105" : "group-hover:scale-105"}`}
                  >
                    <Icon className="size-5 stroke-[2]" />
                  </div>
                  <span className="absolute left-24 bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all z-30 whitespace-nowrap border border-white/5">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col items-center gap-4 w-full px-3">
          <Link
            to="/settings"
            className={`w-full h-14 relative flex items-center justify-center rounded-l-2xl transition-all duration-200 group ${
              location.pathname === "/settings"
                ? "bg-[#F8FAFC] text-indigo-600"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            {location.pathname === "/settings" && (
              <>
                <div className="absolute right-0 -top-4 w-4 h-4 bg-[#F8FAFC] pointer-events-none z-10 before:content-[''] before:absolute before:inset-0 before:bg-[#111A2E] before:rounded-br-xl" />
                <div className="absolute right-0 -bottom-4 w-4 h-4 bg-[#F8FAFC] pointer-events-none z-10 before:content-[''] before:absolute before:inset-0 before:bg-[#111A2E] before:rounded-tr-xl" />
              </>
            )}
            <div
              className={`p-2.5 rounded-xl flex items-center justify-center ${location.pathname === "/settings" ? "bg-indigo-50" : ""}`}
            >
              <Settings className="size-5 group-hover:rotate-45 transition-transform duration-300" />
            </div>
          </Link>

          {/* Explicit log-out utility trigger button */}
          <button
            onClick={handleLogout}
            className="w-full h-12 flex items-center justify-center text-slate-500 hover:text-rose-400 transition-colors rounded-xl"
            title="Đăng xuất"
          >
            <LogOut className="size-5" />
          </button>
        </div>
      </aside>

      <div className="flex flex-col flex-1 bg-[#F8FAFC] my-3 mr-3 rounded-2xl overflow-hidden shadow-2xl relative border border-white/[0.03]">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {/* 🎯 Dynamic subscription tier fallback rendering naming */}
              Scorify AI — Gói {subscription?.name || "Cơ Bản (Free)"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl relative transition-colors">
              <Bell className="size-5" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-600 rounded-full ring-2 ring-white"></span>
            </button>

            <Link
              to="/profile/edit"
              className="flex items-center gap-3 border-l border-slate-100 pl-4 group"
            >
              <div className="text-right hidden sm:block">
                {/* 🎯 Pull profile name values from global data stream */}
                <p className="text-sm font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
                  {profile?.name || "Người dùng Scorify"}
                </p>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  Hồ sơ của tôi
                </p>
              </div>
              
              {profile?.profile_picture ? (
                <img 
                  src={profile.profile_picture} 
                  alt="Avatar" 
                  className="w-9 h-9 rounded-lg object-cover border border-slate-100 shadow-sm"
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#111A2E] to-[#22314E] text-white flex items-center justify-center font-bold text-sm shadow-inner group-hover:scale-105 transition-transform">
                  {profile?.name ? profile.name.substring(0, 2).toUpperCase() : "SC"}
                </div>
              )}
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 max-w-[1500px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
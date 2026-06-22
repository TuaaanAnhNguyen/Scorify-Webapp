// src/app/pages/Teacher/profile-edit-page.tsx

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { profileService } from "../../services/profileService";
import {
  subscriptionService,
  BillingHistoryRecord,
} from "../../services/subscriptionService";
import { Button } from "@/app/components/ui/button";
import {
  User,
  Lock,
  History,
  Loader2,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  KeyRound,
  Camera,
} from "lucide-react";

type ActiveTab = "general" | "password" | "history";

export function ProfileEditPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>("general");

  // State: Thông báo chung (Success / Error)
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // State: Tab Thông tin chung (General)
  const [name, setName] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // State: Tab Đổi mật khẩu (Password)
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // State: Tab Lịch sử mua gói (History)
  const [history, setHistory] = useState<BillingHistoryRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Đồng bộ họ tên hiển thị từ AuthContext lên Form khi tải trang hoặc dữ liệu thay đổi
  useEffect(() => {
    if (profile?.name) {
      setName(profile.name);
    }
  }, [profile]);

  // Dọn dẹp thông báo cũ và dữ liệu rác khi đổi tab
  useEffect(() => {
    setNotification(null);
    setNewPassword("");
    setConfirmPassword("");

    if (activeTab === "history" && user?.id) {
      fetchBillingTransactionLogs();
    }
  }, [activeTab, user?.id]);

  // ACTION: Lấy lịch sử hóa đơn qua subscriptionService
  async function fetchBillingTransactionLogs() {
    if (!user?.id) return;
    try {
      setLoadingHistory(true);
      const logs = await subscriptionService.getBillingHistory(user.id);
      setHistory(logs);
    } catch (err: any) {
      console.error("Failed fetching subscription billing logs:", err);
      setNotification({
        type: "error",
        text: "Không thể tải dữ liệu lịch sử mua gói.",
      });
    } finally {
      setLoadingHistory(false);
    }
  }

  // ACTION: Lưu thông tin tên hiển thị qua profileService
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user?.id) return;

    try {
      setUpdatingProfile(true);
      setNotification(null);

      await profileService.updateProfile(user.id, { name: name.trim() });
      await refreshProfile(); // Đồng bộ lại dữ liệu Context toàn hệ thống (Avatar & Name trên Header)

      setNotification({
        type: "success",
        text: "Cập nhật họ và tên hiển thị thành công.",
      });
    } catch (err: any) {
      setNotification({
        type: "error",
        text: err.message || "Không thể lưu cập nhật hồ sơ.",
      });
    } finally {
      setUpdatingProfile(false);
    }
  };

  // ACTION: Tải và đổi ảnh đại diện (Avatar) qua profileService
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user?.id) return;
    const file = e.target.files[0];

    try {
      setUploadingAvatar(true);
      setNotification(null);

      await profileService.uploadProfilePicture(user.id, file);
      await refreshProfile(); // Kích hoạt đổi ảnh ngay lập tức trên thanh Sidebar/Header

      setNotification({
        type: "success",
        text: "Cập nhật ảnh đại diện mới thành công!",
      });
    } catch (err: any) {
      setNotification({
        type: "error",
        text: err.message || "Lỗi khi tải ảnh đại diện lên hệ thống.",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // ACTION: Đổi mật khẩu qua profileService (sử dụng auth core)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setNotification({
        type: "error",
        text: "Vui lòng nhập đầy đủ các trường mật khẩu.",
      });
      return;
    }
    if (newPassword.length < 6) {
      setNotification({
        type: "error",
        text: "Mật khẩu mới phải có độ dài tối thiểu từ 6 ký tự trở lên.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setNotification({
        type: "error",
        text: "Xác nhận mật khẩu mới không trùng khớp với mật khẩu đã nhập.",
      });
      return;
    }

    try {
      setUpdatingPassword(true);
      setNotification(null);

      await profileService.updatePassword(newPassword);

      setNewPassword("");
      setConfirmPassword("");
      setNotification({
        type: "success",
        text: "Thay đổi mật khẩu tài khoản thành công!",
      });
    } catch (err: any) {
      setNotification({
        type: "error",
        text: err.message || "Xảy ra sự cố khi cập nhật mật khẩu.",
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const tabsConfig = [
    { id: "general", label: "Thông tin chung", icon: User },
    { id: "password", label: "Đổi mật khẩu", icon: Lock },
    { id: "history", label: "Lịch sử mua gói", icon: History },
  ] as const;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* SECTION HEADER BANNER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Cài đặt tài khoản
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Cập nhật thông tin cá nhân, sửa đổi mật khẩu và quản lý thời hạn các
          gói dịch vụ AI trợ lý.
        </p>
      </div>

      {/* COMPONENT BODY SPLITTER WRAPPER */}
      <div className="grid md:grid-cols-4 gap-6 items-start">
        {/* SIDE TABS CONTROLS NAVIGATION SYSTEM */}
        <aside className="md:col-span-1 bg-white border border-slate-100 rounded-2xl p-2.5 shadow-sm space-y-1">
          {tabsConfig.map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  isCurrent
                    ? "bg-indigo-50 text-indigo-600 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/70"
                }`}
              >
                <Icon
                  className={`size-4 ${isCurrent ? "text-indigo-600" : "text-slate-400"}`}
                />
                {tab.label}
              </button>
            );
          })}
        </aside>

        {/* WORKSPACE OPERATIONS RENDER VIEWPORT */}
        <main className="md:col-span-3 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm min-h-[400px] relative">
          {/* Universal Notification Alerts */}
          {notification && (
            <div
              className={`mb-5 p-4 rounded-xl flex items-start gap-3 border text-xs leading-relaxed font-medium ${
                notification.type === "success"
                  ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                  : "bg-rose-50 border-rose-100 text-rose-800"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle2 className="size-4 text-emerald-600 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="size-4 text-rose-600 mt-0.5 shrink-0" />
              )}
              <span>{notification.text}</span>
            </div>
          )}

          {/* TAB 1: GENERAL INFO OPTION BLOCK */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-2">
                Hồ sơ cá nhân
              </h2>

              {/* INTERACTIVE AVATAR MANAGEMENT COMPONENT */}
              <div className="flex items-center gap-5 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 w-fit">
                <div className="relative size-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center group shadow-2xs">
                  {profile?.profile_picture ? (
                    <img
                      src={profile.profile_picture}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="size-6 text-slate-400" />
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                      <Loader2 className="size-4 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="avatar-file-input"
                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
                  >
                    <Camera className="size-3.5 text-slate-500" />
                    Thay ảnh đại diện
                  </label>
                  <input
                    id="avatar-file-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                  />
                  <p className="text-[10px] text-slate-400 font-medium">
                    Hỗ trợ định dạng PNG, JPG. Dung lượng file tối đa 2MB.
                  </p>
                </div>
              </div>

              {/* FORM DETAILS DATA */}
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Email tài khoản
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.email || ""}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-xs cursor-not-allowed font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Họ và Tên giáo viên
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nhập tên của bạn..."
                      className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-50 flex justify-end">
                  <Button
                    type="submit"
                    disabled={updatingProfile || !name.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-5 rounded-xl gap-1.5 shadow-md shadow-indigo-950/10"
                  >
                    {updatingProfile && (
                      <Loader2 className="size-3.5 animate-spin" />
                    )}
                    Lưu thông tin thay đổi
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: PASSWORD CONFIGURATION ROTATOR VIEW */}
          {activeTab === "password" && (
            <form onSubmit={handleUpdatePassword} className="space-y-5">
              <h2 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-2">
                Thay đổi mật khẩu đăng nhập
              </h2>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự bảo mật..."
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại chuỗi ký tự mật khẩu..."
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-50 flex justify-end">
                <Button
                  type="submit"
                  disabled={updatingPassword}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-5 rounded-xl gap-1.5 shadow-md shadow-indigo-950/10"
                >
                  {updatingPassword && (
                    <Loader2 className="size-3.5 animate-spin" />
                  )}
                  Cập nhật mật khẩu mới
                </Button>
              </div>
            </form>
          )}

          {/* TAB 3: TRANSACTIONAL SUBSCRIPTION HISTORY LEDGER BOARD */}
          {activeTab === "history" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-2">
                Lịch sử thanh toán & Kích hoạt gói
              </h2>

              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
                  <Loader2 className="size-6 text-indigo-500 animate-spin" />
                  <span className="text-xs font-medium">
                    Đang truy vấn dữ liệu hóa đơn...
                  </span>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                  <CreditCard className="size-7 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-medium">
                    Bạn chưa thực hiện giao dịch mua gói trả phí nào.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-100 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-3 pl-4">Gói dịch vụ</th>
                        <th className="p-3">Chu kỳ</th>
                        <th className="p-3">Giá tiền</th>
                        <th className="p-3">Thời gian hạn dùng</th>
                        <th className="p-3 pr-4 text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium text-slate-600">
                      {history.map((record) => {
                        const plan = record.subscription_plan || {
                          name: "Gói không rõ",
                          price: 0,
                          billing_period: "—",
                        };
                        const isActive = record.status === "active";

                        return (
                          <tr
                            key={record.user_subscription_id}
                            className="hover:bg-slate-50/60 transition-colors"
                          >
                            <td className="p-3 pl-4 font-bold text-slate-800">
                              {plan.name}
                            </td>
                            <td className="p-3 text-slate-500">
                              {plan.billing_period}
                            </td>
                            <td className="p-3 font-mono text-slate-700 font-semibold">
                              {plan.price > 0
                                ? `${plan.price.toLocaleString("vi-VN")}đ`
                                : "Miễn phí"}
                            </td>
                            <td className="p-3 text-[11px] text-slate-400">
                              {record.start_date} → {record.end_date}
                            </td>
                            <td className="p-3 pr-4 text-center">
                              <span
                                className={`inline-block text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                                  isActive
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100/50"
                                    : "bg-slate-100 text-slate-400"
                                }`}
                              >
                                {isActive ? "Đang chạy" : "Hết hạn"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

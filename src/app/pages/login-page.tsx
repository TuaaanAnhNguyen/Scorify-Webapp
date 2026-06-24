// src/app/pages/login-page.tsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { authService } from "@/app/services/authService";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

interface LoginErrors {
  emailOrPhone?: string;
  password?: string;
  global?: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { refreshSession } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<LoginErrors>({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (field: "email" | "password", value: string) => {
    setFormData({ ...formData, [field]: value });
    if (fieldErrors[field === "email" ? "emailOrPhone" : "password"]) {
      setFieldErrors({
        ...fieldErrors,
        [field === "email" ? "emailOrPhone" : "password"]: undefined,
      });
    }
    if (fieldErrors.global) {
      setFieldErrors({ ...fieldErrors, global: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const input = formData.email.trim();

    if (
      !input.includes("@") &&
      !/^\+?[0-9]{9,15}$/.test(input.replace(/\s/g, ""))
    ) {
      setFieldErrors({
        emailOrPhone: "Vui lòng nhập email hoặc số điện thoại hợp lệ.",
      });
      return;
    }

    // setIsLoading(true);

    try {
      setIsLoading(true);

      await authService.login({
        emailOrPhone: input,
        password: formData.password,
      });

      // 1. Force the auth context to pull down the database profile immediately
      const freshContext = await refreshSession();

      toast.success("Đăng nhập thành công! Chuyển hướng...");

      // 2. Fetch the true loaded profile instead of guessing
      // We add a tiny delay to let the state fully hydrate or we read directly from what refreshSession updates
      setTimeout(() => {
        // We can read local storage safely here if context profile state update is scheduled
        const localUserStr = localStorage.getItem("scorify_user");
        let detectedRole = "teacher";

        try {
          if (localUserStr) {
            const parsed = JSON.parse(localUserStr);
            detectedRole =
              parsed.user_metadata?.role || parsed.role || "teacher";
          }
        } catch (e) {}

        // Redirect to the exact home base matching their role
        if (detectedRole === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/workspace", { replace: true });
        }
      }, 100);
    } catch (err: any) {
      setIsLoading(false);
      console.error("Raw login block error:", err);

      let serverErrorMessage = "";
      if (err.context && typeof err.context.json === "function") {
        try {
          const responseBody = await err.context.json();
          if (responseBody && responseBody.error) {
            serverErrorMessage = responseBody.error;
          }
        } catch (jsonErr) {
          console.error("Failed to parse error context stream:", jsonErr);
        }
      }

      if (!serverErrorMessage) {
        serverErrorMessage =
          err.message || "Tên đăng nhập hoặc mật khẩu không chính xác.";
      }

      const lowerMessage = serverErrorMessage.toLowerCase();

      if (
        lowerMessage.includes("password") ||
        lowerMessage.includes("mật khẩu")
      ) {
        setFieldErrors({ password: serverErrorMessage });
      } else if (
        lowerMessage.includes("user") ||
        lowerMessage.includes("email") ||
        lowerMessage.includes("phone") ||
        lowerMessage.includes("tìm thấy")
      ) {
        setFieldErrors({ emailOrPhone: serverErrorMessage });
      } else {
        setFieldErrors({ global: serverErrorMessage });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 max-w-md w-full p-10">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-3 justify-center"
          >
            <img src="/scorify-logo-colored.png" alt="Scorify Logo" className="h-7 w-auto" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Mừng bạn trở lại
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fieldErrors.global && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-medium">
              {fieldErrors.global}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-gray-700 mb-1.5"
            >
              Email hoặc số di động
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                id="email"
                disabled={isLoading}
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 bg-white border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 transition-all disabled:opacity-60 ${
                  fieldErrors.emailOrPhone
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                }`}
                placeholder="mailcuatoi@gmail.com hoặc 09xxxxxxx"
                required
              />
            </div>
            {fieldErrors.emailOrPhone && (
              <p className="mt-1.5 text-xs text-red-500 font-medium pl-1">
                {fieldErrors.emailOrPhone}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-gray-700 mb-1.5"
            >
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                disabled={isLoading}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`w-full pl-9 pr-10 py-2.5 bg-white border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 transition-all disabled:opacity-60 ${
                  fieldErrors.password
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                }`}
                placeholder="Nhập mật khẩu"
                required
              />
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1.5 text-xs text-red-500 font-medium pl-1">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                className="size-3.5 text-blue-600 border-gray-300 rounded focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className="ml-2 text-xs font-medium text-gray-700">
                Ghi nhớ đăng nhập
              </span>
            </label>
            <a
              href="#"
              className="text-xs font-medium text-blue-500 hover:underline"
            >
              Quên mật khẩu?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#344464] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#28354f] transition-colors shadow-sm mt-2 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-xs font-medium text-gray-600">
            Chưa có tài khoản?{" "}
            <Link to="/signup" className="text-blue-500 hover:underline">
              Đăng ký tại đây
            </Link>
          </p>
        </div>

        <div className="mt-5 flex items-center">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-3 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
            Hoặc đăng nhập với
          </span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        <div className="mt-5 flex justify-center">
          <button className="flex items-center justify-center gap-2 border border-gray-200 py-2 px-6 w-full rounded-lg bg-white hover:bg-gray-50 transition-colors shadow-sm">
            <svg className="size-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-xs font-semibold text-gray-700">Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  User,
  Mail,
  Lock,
  Calendar,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { authService } from "@/app/services/authService";
import { toast } from "sonner";

interface FormErrors {
  fullname?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  birthday?: string;
  global?: string;
}

export function SignUpPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthday: "",
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (fieldErrors[field as keyof FormErrors]) {
      setFieldErrors({ ...fieldErrors, [field]: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    // 1️⃣ Layer 1: Front-end checking for password requirements (min 6 characters)
    if (formData.password.length < 6) {
      setFieldErrors({ password: "Mật khẩu phải chứa ít nhất 6 ký tự." });
      return;
    }

    // 2️⃣ Layer 2: Front-end checking for password retype match
    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: "Mật khẩu nhập lại không khớp!" });
      return;
    }

    setIsLoading(true);
    try {
      await authService.register({
        fullName: formData.fullname,
        email: formData.email,
        password: formData.password,
        retypePassword: formData.confirmPassword,
        birthday: formData.birthday,
      });

      toast.success("Đăng ký tài khoản thành công!");
      navigate("/login");
    } catch (err: any) {
      console.error("Raw catch block error:", err);

      let serverErrorMessage = "";

      // Safe stream parsing fallback for other unforeseen backend constraints (e.g., Email already exists)
      if (err.context && typeof err.context.json === "function") {
        try {
          const responseBody = await err.context.json();
          if (responseBody && responseBody.error) {
            serverErrorMessage = responseBody.error;
          }
        } catch (jsonErr) {
          console.error("Failed to parse err.context stream:", jsonErr);
        }
      }

      if (!serverErrorMessage) {
        serverErrorMessage = err.message || "Đã xảy ra lỗi hệ thống.";
      }

      const lowerMessage = serverErrorMessage.toLowerCase();

      if (lowerMessage.includes("email")) {
        setFieldErrors({ email: serverErrorMessage });
      } else if (
        lowerMessage.includes("ngày sinh") ||
        lowerMessage.includes("birthday")
      ) {
        setFieldErrors({ birthday: serverErrorMessage });
      } else if (
        lowerMessage.includes("họ tên") ||
        lowerMessage.includes("name")
      ) {
        setFieldErrors({ fullname: serverErrorMessage });
      } else {
        setFieldErrors({ global: serverErrorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 max-w-md w-full p-10">
        {/* Brand Logo & Header */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-3 justify-center"
          >
            <img src="/scorify-logo-colored.png" alt="Scorify Logo" className="h-7 w-auto" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Tạo tài khoản
          </h1>
        </div>

        {/* Form Layout */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {fieldErrors.global && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-medium">
              {fieldErrors.global}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label
              htmlFor="fullname"
              className="block text-xs font-semibold text-gray-700 mb-1.5"
            >
              Họ tên đầy đủ
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                id="fullname"
                disabled={isLoading}
                value={formData.fullname}
                onChange={(e) => handleInputChange("fullname", e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 bg-white border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 transition-all disabled:opacity-60 ${
                  fieldErrors.fullname
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                }`}
                placeholder="Nhập họ và tên"
                required
              />
            </div>
            {fieldErrors.fullname && (
              <p className="mt-1.5 text-xs text-red-500 font-medium pl-1">
                {fieldErrors.fullname}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-gray-700 mb-1.5"
            >
              Địa chỉ Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="email"
                id="email"
                disabled={isLoading}
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 bg-white border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 transition-all disabled:opacity-60 ${
                  fieldErrors.email
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                }`}
                placeholder="mailcuatoi@gmail.com"
                required
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1.5 text-xs text-red-500 font-medium pl-1">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
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
                placeholder="Tạo mật khẩu mạnh"
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
            {/* 🔴 This renders the real response from the backend underneath your input field */}
            {fieldErrors.password && (
              <p className="mt-1.5 text-xs text-red-500 font-medium pl-1">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-semibold text-gray-700 mb-1.5"
            >
              Nhập lại mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                disabled={isLoading}
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                className={`w-full pl-9 pr-10 py-2.5 bg-white border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 transition-all disabled:opacity-60 ${
                  fieldErrors.confirmPassword
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                }`}
                placeholder="Nhập lại mật khẩu"
                required
              />
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="mt-1.5 text-xs text-red-500 font-medium pl-1">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Birthday */}
          <div>
            <label
              htmlFor="birthday"
              className="block text-xs font-semibold text-gray-700 mb-1.5"
            >
              Ngày sinh
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="date"
                id="birthday"
                disabled={isLoading}
                value={formData.birthday}
                onChange={(e) => handleInputChange("birthday", e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 bg-white border rounded-lg text-sm text-gray-400 focus:outline-none focus:ring-1 transition-all disabled:opacity-60 ${
                  fieldErrors.birthday
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                }`}
                required
              />
            </div>
            {fieldErrors.birthday && (
              <p className="mt-1.5 text-xs text-red-500 font-medium pl-1">
                {fieldErrors.birthday}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#344464] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#28354f] transition-colors shadow-sm mt-4 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Đang tạo tài khoản...
              </>
            ) : (
              "Đăng ký"
            )}
          </button>
        </form>

        {/* Link back to Login */}
        <div className="mt-5 text-center">
          <p className="text-xs font-medium text-gray-600">
            Đã có tài khoản?{" "}
            <Link to="/login" className="text-blue-500 hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

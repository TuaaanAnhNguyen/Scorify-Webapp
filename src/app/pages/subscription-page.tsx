// src/app/pages/subscription-page.tsx

import { useEffect, useState } from "react";
import { Check, ShieldCheck, Zap, Award, Sparkles } from "lucide-react";
import {
  subscriptionService,
  SubscriptionPlan,
} from "../services/subscriptionService";

export function SubscriptionPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentSubPlanId, setCurrentSubPlanId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await subscriptionService.getSubscriptionPlans();

        if (data && data.length > 0) {
          const sortedPlans = [...data].sort((a, b) => a.price - b.price);
          setPlans(sortedPlans);
        }
      } catch (error) {
        console.error(
          "Failed to load live database subscription plans:",
          error,
        );
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    alert(
      `Bắt đầu xử lý thanh toán cho ${plan.name} với giá ${plan.price.toLocaleString("vi-VN")} VND / ${plan.billing_period}`,
    );
  };

  const formatMB = (bytes: number) => {
    if (!bytes) return "Không giới hạn";
    return `${Math.floor(bytes / (1024 * 1024))} MB`;
  };

  const getPlanPresentation = (plan: SubscriptionPlan) => {
    const period = plan.billing_period?.toLowerCase() || "";
    const baseMonthlyPrice = 149000;

    if (period.includes("12") || period.includes("năm")) {
      const originalPrice = baseMonthlyPrice * 12;
      const savingsPercent = Math.round(
        ((originalPrice - plan.price) / originalPrice) * 100,
      );

      return {
        icon: <Award className="size-6 text-purple-500" />,
        badge: "Tiết kiệm lớn nhất",
        badgeStyle: "bg-purple-100 text-purple-700",
        buttonStyle:
          "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200",
        cardBorder: "border-2 border-purple-500 transform lg:scale-105 z-10",
        originalPrice,
        savingsText: `Tiết kiệm ${savingsPercent}%`,
      };
    }

    if (period.includes("3") || period.includes("quý")) {
      const originalPrice = baseMonthlyPrice * 3;
      const savingsPercent = Math.round(
        ((originalPrice - plan.price) / originalPrice) * 100,
      );

      return {
        icon: <Zap className="size-6 text-blue-500" />,
        badge: "Khuyên dùng",
        badgeStyle: "bg-blue-100 text-blue-700",
        buttonStyle: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200",
        cardBorder: "border border-blue-200",
        originalPrice,
        savingsText: `Tiết kiệm ${savingsPercent}%`,
      };
    }

    return {
      icon: <ShieldCheck className="size-6 text-gray-500" />,
      badge: "Cơ bản",
      badgeStyle: "bg-gray-100 text-gray-600",
      buttonStyle: "bg-[#344464] hover:bg-[#28354f] text-white shadow-gray-100",
      cardBorder: "border border-gray-200",
      originalPrice: plan.price,
      savingsText: "",
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-sm font-medium text-gray-500">
          Đang tải cấu hình gói dịch vụ Scorify...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 font-sans selection:bg-blue-500 selection:text-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 text-blue-600 rounded-full text-xs font-semibold mb-3 tracking-wide uppercase">
            <Sparkles className="size-3.5 fill-blue-100" /> Nâng cấp hội viên
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Bảng giá gia hạn tài khoản Scorify
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Chọn khoảng thời gian cam kết phù hợp để mở khóa toàn bộ tính năng
            và gia tăng hiệu suất chấm điểm bài thi tự động bằng công nghệ AI.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto pt-4">
          {plans.map((plan) => {
            const meta = getPlanPresentation(plan);
            const isCurrent = currentSubPlanId === plan.plan_id;

            return (
              <div
                key={plan.plan_id}
                className={`bg-white rounded-2xl p-8 relative flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 ${meta.cardBorder}`}
              >
                <div className="absolute top-4 right-4">
                  <span
                    className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${meta.badgeStyle}`}
                  >
                    {meta.badge}
                  </span>
                </div>

                <div>
                  <div className="mb-4 p-2 bg-gray-50 rounded-xl inline-block">
                    {meta.icon}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {plan.name}
                  </h3>

                  <p className="text-xs font-medium text-gray-400 capitalize mb-4">
                    Thời hạn: {plan.billing_period}
                  </p>

                  <div className="my-4">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        {plan.price.toLocaleString("vi-VN")}
                      </span>
                      <span className="text-xs font-semibold text-gray-400">
                        VND
                      </span>
                    </div>

                    {meta.savingsText && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400 line-through">
                          {meta.originalPrice.toLocaleString("vi-VN")} VND
                        </span>
                        <span className="text-[11px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                          {meta.savingsText}
                        </span>
                      </div>
                    )}
                  </div>

                  <hr className="my-6 border-gray-100" />

                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3 text-sm text-gray-600">
                      <Check className="size-4.5 text-green-500 shrink-0 mt-0.5" />
                      <span>
                        Dung lượng tải lên:{" "}
                        <strong>{formatMB(plan.file_size_limit)}</strong> mỗi
                        file bài viết
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-gray-600">
                      <Check className="size-4.5 text-green-500 shrink-0 mt-0.5" />
                      <span>
                        Lượt chấm thi AI:{" "}
                        <strong>
                          {plan.submission_limit || "Không giới hạn"} bài
                        </strong>{" "}
                        / tháng
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-gray-600">
                      <Check className="size-4.5 text-green-500 shrink-0 mt-0.5" />
                      <span>
                        Truy xuất dữ liệu, chấm nhận diện chữ viết tay bằng OCR
                      </span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={isCurrent}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm ${
                    isCurrent
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none"
                      : meta.buttonStyle
                  }`}
                >
                  {isCurrent ? "Gói hiện tại của bạn" : "Đăng ký mua ngay"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

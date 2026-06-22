// src/app/pages/subscription-page.tsx
import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import {
  Check,
  ShieldCheck,
  Zap,
  Award,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  subscriptionService,
  SubscriptionPlan,
} from "../services/subscriptionService";
import { momoService } from "../services/momoService";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext"; // 🎯 BỔ SUNG: Import hook Auth

export function SubscriptionPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  // 🎯 BỔ SUNG: Lấy dữ liệu live user và hàm làm mới session từ Global Context
  const { user, subscription, refreshSession } = useAuth();
  const currentSubPlanId = subscription?.plan_id || null;

  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams(); // Thêm setSearchParams để dọn URL sau khi xử lý

  const isTeacherWorkspace = location.pathname.includes("/workspace");

  // 1. Tải danh sách gói từ Database
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

  // 2. Handle MoMo Redirect Callback
useEffect(() => {
  const resultCode = searchParams.get("resultCode");
  const extraData = searchParams.get("extraData");
  const orderId = searchParams.get("orderId");
  const message = searchParams.get("message");

  // Prevent running multiple times
  if (!resultCode) return;

  async function handleSuccessPayment() {
    if (!user?.id) {
      toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      const loadingToast = toast.loading(
        "Đang xác nhận thanh toán và cập nhật tài khoản..."
      );

      // Parse planId from extraData (sent from momo-create-order)
      let planId = "864a1a95-1945-4533-bf10-47b9ae67abe0"; // fallback

      if (extraData) {
        try {
          const decoded = JSON.parse(atob(extraData));
          if (decoded.subscriptionType) {
            planId = decoded.subscriptionType;
          }
        } catch (e) {
          console.warn("Không parse được extraData:", e);
        }
      }

      // Calculate dates
      const startDate = new Date();
      const endDate = new Date(startDate);

      if (planId === "864a1a95-1945-4533-bf10-47b9ae67abe0") {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (planId === "b2ad771c-bd2a-465a-9ebc-af8040958e8d") {
        endDate.setMonth(endDate.getMonth() + 3);
      } else if (planId === "1facbe75-4a9a-457d-9675-0b2695c220b0") {
        endDate.setMonth(endDate.getMonth() + 12);
      } else {
        endDate.setMonth(endDate.getMonth() + 1); // safe fallback
      }

      // Call upsert
      await subscriptionService.upsertUserSubscription({
        p_profile_id: user.id,
        p_plan_id: planId,
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString(),
      });

      toast.dismiss(loadingToast);
      toast.success("🎉 Tài khoản của bạn đã được nâng cấp thành công!");

      refreshSession();

    } catch (err: any) {
      console.error("handleSuccessPayment error:", err);
      toast.error(`Không thể kích hoạt gói: ${err.message || "Lỗi không xác định"}`);
    }
  }

  // ==================== MAIN LOGIC ====================
  if (resultCode === "0") {
    handleSuccessPayment();
  } 
  else if (resultCode) {
    // Any other resultCode means failure or user cancelled
    const errorMsg = message || "Giao dịch không thành công hoặc đã bị hủy.";
    toast.error(`❌ ${errorMsg} (Mã: ${resultCode})`);
  }

  // Always clean URL after processing
  const newParams = new URLSearchParams(searchParams);
  [
    "resultCode",
    "status",
    "amount",
    "orderId",
    "transId",
    "extraData",
    "signature",
    "message",
  ].forEach((p) => newParams.delete(p));

  setSearchParams(newParams, { replace: true });

}, [searchParams, user, refreshSession, setSearchParams]);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!user?.id) {
      toast.error("Vui lòng đăng nhập hệ thống để thực hiện mua gói dịch vụ!");
      return;
    }

    // Nếu bấm vào gói hiện tại đang dùng thì chặn không xử lý gửi đi
    if (currentSubPlanId === plan.plan_id) return;

    try {
      setProcessingPlanId(plan.plan_id);

      const res = await momoService.requestPaymentLink(
        user.id,
        plan.price,
        plan.plan_id,
        isTeacherWorkspace,
      );

      if (res && res.resultCode === 0 && res.payUrl) {
        window.location.href = res.payUrl;
      } else {
        throw new Error(
          res.message || "Không thể khởi tạo link thanh toán từ cổng MoMo.",
        );
      }
    } catch (error: any) {
      toast.error(
        `Lỗi xử lý giao dịch: ${error.message || "Vui lòng kiểm tra lại kết nối Edge Function."}`,
      );
    } finally {
      setProcessingPlanId(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const planMetaMap: Record<
    string,
    { badge?: string; icon: any; buttonStyle: string; cardStyle: string }
  > = {
    "864a1a95-1945-4533-bf10-47b9ae67abe0": {
      icon: Zap,
      buttonStyle: "bg-gray-900 hover:bg-gray-800 text-white",
      cardStyle: "border-gray-200 shadow-sm",
    },
    "b2ad771c-bd2a-465a-9ebc-af8040958e8d": {
      badge: "Phổ biến",
      icon: Award,
      buttonStyle: "bg-indigo-600 hover:bg-indigo-700 text-white",
      cardStyle: "border-indigo-200 shadow-md ring-1 ring-indigo-500/10",
    },
    "1facbe75-4a9a-457d-9675-0b2695c220b0": {
      badge: "Tiết kiệm nhất",
      icon: Sparkles,
      buttonStyle:
        "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-orange-500/10",
      cardStyle:
        "border-amber-200 shadow-md ring-1 ring-amber-500/20 bg-amber-50/10",
    },
  };

  return (
    <div
      className={`w-full font-sans mx-auto ${
        isTeacherWorkspace
          ? "max-w-5xl px-2 py-6"
          : "max-w-7xl px-6 py-16 sm:py-24 lg:px-8 bg-white"
      }`}
    >
      <div className="flex flex-col items-center text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-4 border border-indigo-100">
          <ShieldCheck className="size-3.5" /> An toàn & Bảo mật qua MoMo
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          Nâng cấp tài khoản Scorify Premium
        </h2>
        <p className="mt-4 text-base text-gray-600 max-w-2xl">
          Tăng tốc quy trình chấm điểm, không giới hạn tiêu chí và mở khóa toàn
          bộ sức mạnh AI để quản lý lớp học toàn diện hơn.
        </p>
      </div>

      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          {plans.map((plan) => {
            const meta = planMetaMap[plan.plan_id] || {
              icon: Zap,
              buttonStyle: "bg-indigo-600 hover:bg-indigo-700 text-white",
              cardStyle: "border-gray-200 shadow-sm",
            };
            const IconComponent = meta.icon;
            const isCurrent = currentSubPlanId === plan.plan_id;
            const isProcessing = processingPlanId === plan.plan_id;

            return (
              <div
                key={plan.plan_id}
                className={`relative flex flex-col justify-between p-8 rounded-2xl border transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg ${
                  isCurrent
                    ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/10 bg-emerald-50/5"
                    : meta.cardStyle
                }`}
              >
                {meta.badge && !isCurrent && (
                  <span className="absolute top-0 right-6 translate-y-[-50%] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200">
                    {meta.badge}
                  </span>
                )}
                {isCurrent && (
                  <span className="absolute top-0 right-6 translate-y-[-50%] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    ✓ Đang kích hoạt
                  </span>
                )}

                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`p-2.5 rounded-xl border shrink-0 ${isCurrent ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-gray-50 border-gray-100 text-indigo-600"}`}
                    >
                      <IconComponent className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {plan.plan_name}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">
                        Kỳ hạn {plan.billing_period}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-baseline text-gray-950 mb-6">
                    <span className="text-3xl font-extrabold tracking-tight">
                      {plan.price.toLocaleString("vi-VN")}
                    </span>
                    <span className="text-sm font-semibold text-gray-500 ml-1">
                      VND
                    </span>
                  </div>

                  <div className="w-full border-t border-gray-100 my-4" />

                  <ul className="space-y-3.5 mb-8">
                    <li className="flex items-start gap-3 text-sm text-gray-600">
                      <Check
                        className={`size-4.5 shrink-0 mt-0.5 ${isCurrent ? "text-emerald-500" : "text-green-500"}`}
                      />
                      <span>
                        Dung lượng file tối đa:{" "}
                        <strong>
                          {(
                            Number(plan.file_size_limit) /
                            (1024 * 1024)
                          ).toFixed(0)}{" "}
                          MB
                        </strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-gray-600">
                      <Check
                        className={`size-4.5 shrink-0 mt-0.5 ${isCurrent ? "text-emerald-500" : "text-green-500"}`}
                      />
                      <span>
                        Lượt chấm thi AI:
                        <strong>
                          {plan.submission_limit || "Không giới hạn"} bài
                        </strong>{" "}
                        / tháng
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-gray-600">
                      <Check
                        className={`size-4.5 shrink-0 mt-0.5 ${isCurrent ? "text-emerald-500" : "text-green-500"}`}
                      />
                      <span>
                        Truy xuất dữ liệu, chấm nhận diện chữ viết tay bằng OCR
                      </span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={isCurrent || processingPlanId !== null}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm flex items-center justify-center gap-2 ${
                    isCurrent
                      ? "bg-emerald-500 text-white cursor-not-allowed border border-emerald-600 shadow-none opacity-80"
                      : meta.buttonStyle
                  }`}
                >
                  {isProcessing && (
                    <Loader2 className="size-3.5 animate-spin mr-1" />
                  )}
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

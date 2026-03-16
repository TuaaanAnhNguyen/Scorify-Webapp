import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, QrCode } from "lucide-react";
import { getAdminTeachers, saveAdminTeachers } from "../utils/admin";

const plans = [
  {
    duration: "1 tháng",
    price: 149000,
    originalPrice: 149000,
    savings: 0,
    savingsText: "",
  },
  {
    duration: "3 tháng",
    price: 297000,
    originalPrice: 447000,
    savings: 34,
    savingsText: "Tiết kiệm 34%",
  },
  {
    duration: "12 tháng",
    price: 828000,
    originalPrice: 1788000,
    savings: 54,
    savingsText: "Tiết kiệm 54%",
  },
];

export function PaymentPage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<(typeof plans)[0] | null>(
    null,
  );
  const [isPaying, setIsPaying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (isPaying && secondsLeft > 0) {
      const timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isPaying && secondsLeft === 0) {
      setPaymentSuccess(true);
      const teachers = getAdminTeachers();
      if (teachers.length > 0) {
        teachers[0].subscription = "pro";
        saveAdminTeachers(teachers);
      }
      setTimeout(() => navigate("/dashboard"), 2000);
    }
  }, [isPaying, secondsLeft, navigate]);

  const handlePay = (plan: (typeof plans)[0]) => {
    setSelectedPlan(plan);
    setIsPaying(true);
    setSecondsLeft(5);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " VND";
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <CheckCircle className="size-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Thanh toán thành công!
          </h1>
          <p className="text-gray-600 mb-4">
            Bạn đã nâng cấp lên gói Pro thành công.
          </p>
          <p className="text-sm text-gray-500">
            Đang chuyển hướng về trang chủ...
          </p>
        </div>
      </div>
    );
  }

  if (isPaying && selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <QrCode className="size-16 text-[#F05123] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Quét mã QR để thanh toán
          </h1>
          <p className="text-gray-600 mb-4">
            Số tiền: {formatPrice(selectedPlan.price)}
            <br />
            Thời hạn: {selectedPlan.duration}
          </p>
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <div className="mx-auto flex items-center justify-center">
              <img
                src="/qr-code.png"
                alt="Payment QR Code"
                className="w-48 h-48 object-contain shadow-sm rounded-md"
              />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Đang xử lý thanh toán... {secondsLeft} giây còn lại
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#F05123] h-2 rounded-full transition-all duration-1000"
              style={{ width: `${((5 - secondsLeft) / 5) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#F05123] flex items-center justify-center text-white font-bold">
                S
              </div>
              <span className="font-semibold text-xl">Scorify</span>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Quay lại
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Nâng cấp lên gói Pro
          </h1>
          <p className="text-gray-600">Chọn gói phù hợp với nhu cầu của bạn</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {plan.duration}
                </h3>
                <div className="text-3xl font-bold text-[#F05123] mt-2">
                  {formatPrice(plan.price)}
                </div>

                {plan.savings > 0 ? (
                  <div className="text-sm text-green-600 font-medium mt-1">
                    {plan.savingsText}
                  </div>
                ) : (
                  <div className="text-sm mt-1 invisible">Spacer</div>
                )}
              </div>

              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="size-4 text-green-500" />
                  60 lượt chấm bài/ngày
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="size-4 text-green-500" />
                  Phân tích chi tiết
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="size-4 text-green-500" />
                  Hỗ trợ 24/7
                </li>
              </ul>

              <button
                onClick={() => handlePay(plan)}
                className="mt-auto w-full bg-[#F05123] text-white py-3 rounded-lg hover:bg-[#D9471E] transition-colors font-medium"
              >
                Chọn gói này
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Lưu ý thanh toán
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Thanh toán qua chuyển khoản ngân hàng</li>
            <li>• Quét mã QR để thực hiện thanh toán nhanh</li>
            <li>
              • Sau khi thanh toán, tài khoản sẽ được nâng cấp ngay lập tức
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import {
  GraduationCap,
  Sparkles,
  CheckCircle,
  ArrowRight,
  FileSpreadsheet,
  UploadCloud,
} from "lucide-react";
import { ImageWithFallback } from "../components/ImageWithFallback";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation Bar */}
      <nav className="bg-[#112240] text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <img src="/scorify-logo.png" alt="Scorify Logo" className="h-7 w-auto" />
            </div>

            {/* Top Menu Links with exact weights and colors */}
            <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-300">
              <a
                href="#"
                className="hover:text-white transition-colors duration-200"
              >
                Báo giá
              </a>
              <a
                href="#"
                className="hover:text-white transition-colors duration-200"
              >
                Hướng dẫn
              </a>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-300 hover:text-white px-4 py-2 text-sm font-semibold transition-colors duration-200"
              >
                Đăng nhập
              </Link>
              <Link
                to="/signup"
                className="bg-[#3B82F6] text-white px-5 py-2 rounded text-sm font-bold hover:bg-blue-600 transition-colors duration-200 shadow-sm"
              >
                Đăng ký
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 via-white to-blue-50/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 px-4 py-1.5 rounded-full mb-6">
                <Sparkles className="size-4 text-blue-500" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Trợ lý chấm bài bằng AI
                </span>
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Chấm bài nhanh hơn với trợ lý AI
              </h1>
              <p className="text-base text-gray-500 mb-8 leading-relaxed">
                Bạn đã bao giờ phải ngồi một chỗ vừa mệt, vừa chán, vừa đau mắt
                để chấm hàng xấp bài tập tự luận của học sinh? Scorify mang tới
                giải pháp tối ưu: tự động hóa quy trình chấm điểm qua hình ảnh,
                chính xác, nhanh gọn và chi phí phải chăng.
              </p>
              <div className="flex gap-4">
                <Link
                  to="/signup"
                  className="bg-[#3B82F6] text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 font-bold shadow-md shadow-blue-200"
                >
                  Dùng thử miễn phí
                  <ArrowRight className="size-4" />
                </Link>
                <button className="border border-gray-300 bg-white text-gray-700 px-6 py-3 rounded-lg hover:border-gray-400 font-semibold transition-colors">
                  Xem hướng dẫn
                </button>
              </div>
            </div>

            {/* Hero Image Block */}
            <div className="relative justify-self-center lg:justify-self-end">
              <div className="rounded-2xl overflow-hidden shadow-2xl max-w-md border border-gray-100">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1771765764892-91f2ed4ddbf4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFjaGVyJTIwY2xhc3Nyb29tJTIwZWR1Y2F0aW9uJTIwbW9kZXJufGVufDF8fHx8MTc3MzAwNjI1NXww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Giáo viên trợ giúp học sinh sử dụng kính VR"
                  className="w-full h-[400px] object-cover"
                />
              </div>
              {/* Floating Badge */}
              <div className="absolute -bottom-6 left-6 bg-white p-4 rounded-xl shadow-xl border border-gray-50 flex items-center gap-3">
                <div className="bg-green-50 p-2 rounded-lg border border-green-100">
                  <CheckCircle className="size-6 text-green-500" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">95%</div>
                  <div className="text-xs text-gray-500 font-medium">
                    Thời gian được tiết kiệm
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Chúng tôi có mọi thứ bạn cần để hỗ trợ công việc của bạn
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm font-medium">
              Công cụ mạnh mẽ mà giảng viên và gia sư nào cũng cần để tiết kiệm
              thời gian & sức lực
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 - AI Grading */}
            <div className="p-8 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all">
              <div className="bg-indigo-50 p-3 rounded-xl inline-block mb-6 text-indigo-600">
                <Sparkles className="size-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Chấm bài dễ dàng với AI
              </h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                Các bài viết tay, tự luận sẽ được quét và chấm bằng trợ lý AI
                siêu tốc. Hệ thống tự động xuất báo cáo điểm số kèm nhận xét chi
                tiết cho từng bài làm dựa theo đúng barem của bạn.
              </p>
              <ul className="space-y-3 text-xs font-medium">
                <li className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="size-4 text-green-500" /> Nhận kết quả
                  chấm tức thì
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="size-4 text-green-500" /> Nhận xét
                  ưu/nhược điểm chi tiết
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="size-4 text-green-500" /> Giảm thiểu
                  tối đa sai sót cảm tính
                </li>
              </ul>
            </div>

            {/* Feature 2 - Rubric Builder */}
            <div className="p-8 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all">
              <div className="bg-purple-50 p-3 rounded-xl inline-block mb-6 text-purple-600">
                <FileSpreadsheet className="size-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Thiết lập thang điểm (Rubric)
              </h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                Bạn hoàn toàn làm chủ quy chuẩn chấm điểm. Tự do tạo, điều chỉnh
                tiêu chí chấm bài (Rubrics) chi tiết hoặc đăng tải barem sẵn có
                để AI tuân thủ nghiêm ngặt theo ý bạn.
              </p>
              <ul className="space-y-3 text-xs font-medium">
                <li className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="size-4 text-green-500" /> Tùy biến
                  tiêu chí theo từng dạng đề
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="size-4 text-green-500" /> Phân bổ trọng số điểm linh hoạt
                </li>

                <li className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="size-4 text-green-500" /> Lưu và tái
                  sử dụng barem dễ dàng
                </li>
              </ul>
            </div>

            {/* Feature 3 - Image Upload */}
            <div className="p-8 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all">
              <div className="bg-teal-50 p-3 rounded-xl inline-block mb-6 text-teal-600">
                <UploadCloud className="size-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Tải ảnh bài làm lên hệ thống
              </h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                Không cần nhập liệu phức tạp hay bắt học sinh làm bài trên web.
                Chỉ cần chụp ảnh bài làm giấy của học sinh và tải hàng loạt lên
                hệ thống để xử lý ngay lập tức.
              </p>
              <ul className="space-y-3 text-xs font-medium">
                <li className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="size-4 text-green-500" /> Hỗ trợ định
                  dạng ảnh chụp, file PDF
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="size-4 text-green-500" /> Nhận diện
                  chữ viết tay thông minh
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="size-4 text-green-500" /> Tải lên hàng
                  loạt tiết kiệm công sức
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Cách thức hoạt động
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              Bắt tay vào ngay với quy trình chấm điểm tinh gọn qua 3 bước đơn
              giản!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="text-center">
              <div className="bg-[#4F81BD] text-white size-12 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4 shadow-md">
                1
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">
                Tạo tiêu chí chấm (Rubric)
              </h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                Thiết lập barem điểm, các yêu cầu cần đạt hoặc các tiêu chí chấm
                bài cụ thể cho bài kiểm tra của bạn.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#4F81BD] text-white size-12 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4 shadow-md">
                2
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">
                Tải ảnh bài làm lên hệ thống
              </h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                Chụp ảnh bài làm bằng giấy của học sinh/học viên rồi tải trực
                tiếp tệp ảnh lên giao diện Scorify.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#4F81BD] text-white size-12 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4 shadow-md">
                3
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">
                Để việc chấm chúng tôi lo
              </h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                Hệ thống AI tự động quét bài, đối chiếu với Rubric của bạn để
                chấm điểm chuẩn xác kèm nhận xét chi tiết.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Navy Background */}
      <section className="py-16 bg-[#162E5B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-1">20+</div>
              <div className="text-xs text-blue-200 font-medium">
                Giảng Viên & Gia Sư
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-1">50+</div>
              <div className="text-xs text-blue-200 font-medium">
                Học sinh được đánh giá
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-1">200+</div>
              <div className="text-xs text-blue-200 font-medium">
                Bài làm đã xử lý
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-1">80%</div>
              <div className="text-xs text-blue-200 font-medium">
                Mức độ hài lòng
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Bạn đã sẵn sàng nâng cấp trải nghiệm chấm bài của mình chưa?
          </h2>
          <p className="text-sm text-gray-500 mb-8 font-medium">
            Tham gia cùng những thầy cô đang tối ưu hóa quy trình chấm điểm và
            giải phóng thời gian cùng Scorify ngay hôm nay.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-[#162E5B] text-white px-8 py-3.5 rounded-lg hover:bg-[#0f2142] transition-colors font-bold text-sm shadow-md"
          >
            Dùng thử miễn phí
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#222222] text-gray-400 py-12 text-xs border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/scorify-logo.png" alt="Scorify Logo" className="h-6 w-auto" />
              </div>
              <p className="leading-relaxed font-medium">
                Giải pháp trợ lý AI chấm điểm bài tự luận qua hình ảnh hiệu quả
                cho giáo viên và gia sư.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm">Sản phẩm</h4>
              <ul className="space-y-2 font-medium">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Tính năng chấm điểm
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Bảng giá gói
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Bản thử nghiệm
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm">Công ty</h4>
              <ul className="space-y-2 font-medium">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Về chúng tôi
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Liên lạc hỗ trợ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm">Pháp lý</h4>
              <ul className="space-y-2 font-medium">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Quyền riêng tư
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Điều khoản dịch vụ
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 font-medium">
            <p>&copy; 2026 Scorify. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

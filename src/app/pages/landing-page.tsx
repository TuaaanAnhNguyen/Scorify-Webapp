import { Link } from "react-router";
import {
  GraduationCap,
  BookOpen,
  Users,
  Sparkles,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <GraduationCap className="size-8 text-[#F05123]" />
              <span className="font-semibold text-xl">Scorify</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-[#F05123] px-4 py-2"
              >
                Đăng nhập
              </Link>
              <Link
                to="/signup"
                className="bg-[#F05123] text-white px-6 py-2 rounded-lg hover:bg-[#D9471E] transition-colors"
              >
                Đăng ký
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 via-white to-orange-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-100 text-[#D9471E] px-4 py-2 rounded-full mb-6">
                <Sparkles className="size-4" />
                <span className="text-sm font-medium">
                  Chấm bài tự động bằng AI
                </span>
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Chấm bài nhanh hơn với trợ lý AI
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Nâng cấp trải nghiệm giảng dạy với hệ thống chấm bài thông minh.
                Tiết kiệm thời gian, phản hồi tốt hơn và tập trung vào điều quan
                trọng nhất: học sinh của bạn.
              </p>
              <div className="flex gap-4">
                <Link
                  to="/signup"
                  className="bg-[#F05123] text-white px-8 py-3 rounded-lg hover:bg-[#D9471E] transition-colors flex items-center gap-2 font-medium"
                >
                  Bắt đầu miễn phí
                  <ArrowRight className="size-5" />
                </Link>
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:border-[#F05123] hover:text-[#F05123] transition-colors font-medium">
                  Xem demo
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1771765764892-91f2ed4ddbf4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFjaGVyJTIwY2xhc3Nyb29tJTIwZWR1Y2F0aW9uJTIwbW9kZXJufGVufDF8fHx8MTc3MzAwNjI1NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Giáo viên trong lớp học hiện đại"
                  className="w-full h-[500px] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <CheckCircle className="size-8 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">95%</div>
                    <div className="text-sm text-gray-600">
                      Thời gian tiết kiệm
                    </div>
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Mọi thứ bạn cần để quản lý lớp học
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Bộ công cụ mạnh mẽ dành cho giáo viên hiện đại, giúp đơn giản hóa
              việc chấm bài và quản lý lớp.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl border-2 border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all">
              <div className="bg-orange-100 p-4 rounded-xl inline-block mb-4">
                <Sparkles className="size-8 text-[#F05123]" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Chấm bài bằng AI
              </h3>
              <p className="text-gray-600 mb-4">
                Tự động chấm bài với phân tích AI. Nhận điểm nhanh, phản hồi chi
                tiết và gợi ý cải thiện cho từng bài nộp.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="size-5 text-green-500" />
                  Chấm điểm tức thì
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="size-5 text-green-500" />
                  Phản hồi chi tiết
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="size-5 text-green-500" />
                  Tùy chỉnh thang điểm
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl border-2 border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all">
              <div className="bg-orange-100 p-4 rounded-xl inline-block mb-4">
                <Users className="size-8 text-[#D9471E]" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Quản lý lớp học
              </h3>
              <p className="text-gray-600 mb-4">
                Tạo và quản lý nhiều lớp dễ dàng. Theo dõi tiến độ học sinh, sắp
                xếp bài tập và theo dõi hiệu quả lớp trong một nơi duy nhất.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="size-5 text-green-500" />
                  Nhiều lớp học
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="size-5 text-green-500" />
                  Theo dõi học sinh
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="size-5 text-green-500" />
                  Phân tích hiệu suất
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl border-2 border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all">
              <div className="bg-blue-100 p-4 rounded-xl inline-block mb-4">
                <BookOpen className="size-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Tạo bài kiểm tra
              </h3>
              <p className="text-gray-600 mb-4">
                Thiết kế bài kiểm tra tùy chỉnh với nhiều định dạng câu hỏi. Hỗ
                trợ PDF, DOCX và LaTeX. Xuất bản ngay đến học sinh.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="size-5 text-green-500" />
                  Nhiều định dạng
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="size-5 text-green-500" />
                  Xuất bản dễ dàng
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="size-5 text-green-500" />
                  Phân phối tức thì
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Cách hoạt động
            </h2>
            <p className="text-xl text-gray-600">
              Bắt đầu chỉ trong vài phút với quy trình 3 bước đơn giản
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-[#F05123] text-white size-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Tạo tài khoản
              </h3>
              <p className="text-gray-600">
                Đăng ký tài khoản giáo viên và thiết lập hồ sơ cùng thông tin
                trường
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#F05123] text-white size-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Tạo lớp và bài kiểm tra
              </h3>
              <p className="text-gray-600">
                Thiết lập lớp học, thêm học sinh và tạo bài kiểm tra theo nhu
                cầu
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#F05123] text-white size-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Để AI chấm bài
              </h3>
              <p className="text-gray-600">
                Học sinh nộp bài và AI sẽ chấm nhanh kèm phản hồi chi tiết
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-[#F05123] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">10K+</div>
              <div className="text-orange-200">Giáo viên</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">250K+</div>
              <div className="text-orange-200">Học sinh</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">1M+</div>
              <div className="text-orange-200">Bài đã chấm</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">95%</div>
              <div className="text-orange-200">Tỷ lệ hài lòng</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Sẵn sàng nâng cấp trải nghiệm chấm bài?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Hàng nghìn giáo viên đang tiết kiệm thời gian và phản hồi tốt hơn
            cùng Scorify
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-[#F05123] text-white px-8 py-4 rounded-lg hover:bg-[#D9471E] transition-colors font-medium text-lg"
          >
            Bắt đầu dùng thử miễn phí
            <ArrowRight className="size-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="size-8 text-[#F27A59]" />
                <span className="font-semibold text-xl text-white">
                  Scorify
                </span>
              </div>
              <p className="text-sm">
                Trao quyền cho giáo viên với công cụ chấm điểm và quản lý lớp
                bằng AI.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Sản phẩm</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Tính năng
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Bảng giá
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Demo
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Công ty</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Giới thiệu
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Liên hệ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Hỗ trợ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Pháp lý</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Quyền riêng tư
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Điều khoản
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Bảo mật
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2026 Scorify. Bảo lưu mọi quyền.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

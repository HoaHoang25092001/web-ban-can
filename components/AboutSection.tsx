import Link from 'next/link';
import { BUSINESS } from '@/lib/site';

// Server Component – nội dung tĩnh, không cần JS phía trình duyệt.

const features = [
  {
    icon: 'ri-shield-check-line',
    title: 'Sản phẩm chính hãng',
    description: 'Đầy đủ giấy tờ nhập khẩu và tem kiểm định của cơ quan đo lường',
  },
  {
    icon: 'ri-tools-line',
    title: 'Lắp đặt tận nơi',
    description: 'Kỹ thuật viên giao, lắp và hiệu chuẩn tại địa chỉ của khách hàng',
  },
  {
    icon: 'ri-customer-service-2-line',
    title: 'Hỗ trợ kỹ thuật',
    description: 'Tư vấn chọn cân và xử lý sự cố qua điện thoại trong ngày làm việc',
  },
  {
    icon: 'ri-award-line',
    title: 'Bảo hành 12 tháng',
    description: 'Sửa chữa miễn phí lỗi kỹ thuật trong thời gian bảo hành',
  },
];

/**
 * Chỉ nêu số liệu kiểm chứng được.
 * Bản trước ghi "10+ năm kinh nghiệm" và "2.000+ khách hàng" — cả hai đều không
 * khớp với thông tin công ty công bố (hơn 4 năm hoạt động) và không có căn cứ.
 * Số liệu phóng đại làm mất niềm tin khi khách đối chiếu (tiêu chí 9).
 */
const stats = [
  { value: `${BUSINESS.yearsInBusiness}+`, label: 'Năm hoạt động' },
  { value: '12', label: 'Tháng bảo hành' },
  { value: 'VAT', label: 'Xuất hóa đơn đầy đủ' },
];

export default function AboutSection() {
  return (
    <section className="py-12" aria-labelledby="about-heading">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <h2 id="about-heading" className="section-title">
            Về Cân Vạn Thịnh Phát
          </h2>
          {/* max-w-prose giữ độ dài dòng 50–75 ký tự (tiêu chí 2) */}
          <p className="mt-4 text-lg text-slate-600 leading-relaxed max-w-prose">
            Chúng tôi sản xuất, nhập khẩu và sửa chữa cân điện tử cùng thiết bị đo lường,
            phục vụ nhà máy, xí nghiệp và cửa hàng trên toàn quốc. Mỗi sản phẩm đều có tem
            kiểm định, được lắp đặt tận nơi và bảo hành 12 tháng.
          </p>

          {/* Số liệu cụ thể tăng độ tin cậy (tiêu chí 9) */}
          <dl className="mt-8 grid grid-cols-3 gap-4 border-y border-surface-border py-5">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only-text">{stat.label}</dt>
                <dd>
                  <span className="block text-2xl font-bold text-brand-700">{stat.value}</span>
                  <span className="block text-xs text-slate-500 mt-0.5 leading-snug">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>

          <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map((feature) => (
              <li key={feature.title} className="flex items-start gap-3">
                <span className="bg-brand-600 text-white w-9 h-9 rounded-control flex items-center justify-center flex-shrink-0">
                  <i className={feature.icon} aria-hidden="true"></i>
                </span>
                <span>
                  <span className="block font-semibold text-slate-900 mb-0.5">
                    {feature.title}
                  </span>
                  <span className="block text-sm text-slate-600 leading-relaxed">
                    {feature.description}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          {/* Một CTA chính cho khối này (tiêu chí 8) */}
          <div className="mt-8">
            <Link href="/contact" className="btn-primary">
              <i className="ri-phone-line" aria-hidden="true"></i>
              Nhận tư vấn chọn cân
            </Link>
          </div>
        </div>

        {/* Khối cam kết thay cho ảnh stock sinh từ API bên thứ ba:
            không phụ thuộc mạng ngoài, tải tức thì và không gây CLS. */}
        <div className="relative">
          <div className="rounded-card bg-brand-700 text-white p-8 shadow-card-hover">
            <p className="text-sm uppercase tracking-wide text-brand-200 font-semibold">
              Cam kết với khách hàng
            </p>
            <ul className="mt-6 space-y-4">
              {[
                'Báo giá rõ ràng, không phát sinh chi phí ẩn',
                'Giao và lắp đặt trong 24–48 giờ tại TP. Hồ Chí Minh',
                'Hướng dẫn sử dụng và hiệu chuẩn trực tiếp khi bàn giao',
                'Hỗ trợ kiểm định lại định kỳ theo quy định',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  {/* Cam đậm trên nền xanh đậm chỉ đạt 2,4:1 nên dùng tông sáng
                      để icon vẫn rõ với người thị lực kém (tiêu chí 5). */}
                  <i
                    className="ri-checkbox-circle-fill text-brand-200 text-xl flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  ></i>
                  <span className="text-brand-50 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

import Link from 'next/link';
// Server Component – nội dung tĩnh, không cần gửi JS xuống trình duyệt.

const features = [
  {
    id: 1,
    icon: 'ri-truck-line',
    title: 'Miễn phí vận chuyển',
    subtitle: 'Đơn hàng từ 3.000.000đ',
    href: '/chinh-sach',
  },
  {
    id: 2,
    icon: 'ri-shield-check-line',
    title: 'Hàng chính hãng',
    subtitle: 'Có tem kiểm định',
    href: '/introduce',
  },
  {
    id: 3,
    icon: 'ri-refresh-line',
    title: 'Đổi trả 15 ngày',
    subtitle: 'Miễn phí nếu lỗi kỹ thuật',
    href: '/chinh-sach',
  },
  {
    id: 4,
    icon: 'ri-customer-service-2-line',
    title: 'Tư vấn miễn phí',
    subtitle: 'Gọi ngay để được tư vấn',
    href: '/cau-hoi-thuong-gap',
  },
];

export default function FeatureBadges() {
  return (
    <section className="w-full bg-brand-600" aria-label="Cam kết dịch vụ">
      <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/15">
          {features.map((feature) => (
            <li key={feature.id} className="bg-brand-600">
              <Link
                href={feature.href}
                className="flex items-center gap-3 px-4 py-4 min-h-touch hover:bg-brand-700 transition-colors h-full"
              >
              <span className="flex-shrink-0 w-11 h-11 rounded-full bg-white/20 flex items-center justify-center">
                <i className={`${feature.icon} text-2xl text-white`} aria-hidden="true"></i>
              </span>
              <span className="min-w-0">
                {/* Không dùng truncate: tiêu đề được phép xuống dòng để không mất chữ */}
                <span className="block text-white font-semibold text-sm leading-tight">
                  {feature.title}
                </span>
                {/* brand-100 trên nền brand-600 đạt tương phản > 4.5:1 (tiêu chí 5) */}
                <span className="block text-brand-100 text-xs mt-0.5 leading-tight">
                  {feature.subtitle}
                </span>
              </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

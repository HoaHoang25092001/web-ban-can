'use client';

const features = [
  {
    id: 1,
    icon: 'ri-truck-line',
    title: 'Vận Chuyển Miễn Phí',
    subtitle: 'với đơn hàng > 3.000.000đ',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 2,
    icon: 'ri-shield-check-line',
    title: 'Chất Lượng Đảm Bảo',
    subtitle: 'hàng chính hãng',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    id: 3,
    icon: 'ri-refresh-line',
    title: 'Đổi Trả Miễn Phí',
    subtitle: 'trong vòng 15 ngày',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  {
    id: 4,
    icon: 'ri-customer-service-2-line',
    title: 'Hỗ Trợ Miễn Phí',
    subtitle: 'Từ: 8:00 – 22:00',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
];

export default function FeatureBadges() {
  return (
    <section className="w-full bg-[#1565C0] py-0">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-blue-400/40">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="flex items-center gap-3 px-5 py-4 group hover:bg-[#1976D2] transition-colors cursor-default"
            >
              {/* Icon circle */}
              <div className="flex-shrink-0 w-11 h-11 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <i className={`${feature.icon} text-2xl text-white`}></i>
              </div>
              {/* Text */}
              <div className="min-w-0">
                <p className="text-white font-bold text-sm uppercase leading-tight truncate">
                  {feature.title}
                </p>
                <p className="text-blue-200 text-xs mt-0.5 leading-tight">
                  {feature.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

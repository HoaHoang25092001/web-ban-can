interface LogoProps {
  /** Kích thước hiển thị. */
  size?: 'sm' | 'md' | 'lg';
  /** Tông màu: dùng trên nền sáng hay nền tối. */
  tone?: 'brand' | 'light';
  /** Hiện dòng mô tả dưới tên thương hiệu. */
  withTagline?: boolean;
  className?: string;
}

const SIZES = {
  sm: { name: 'text-lg', icon: 'w-7 h-7 text-base', tagline: 'text-[10px]' },
  md: { name: 'text-xl lg:text-2xl', icon: 'w-9 h-9 text-lg', tagline: 'text-xs' },
  lg: { name: 'text-2xl', icon: 'w-10 h-10 text-xl', tagline: 'text-xs' },
};

/**
 * Logo thương hiệu.
 *
 * Gom vào một component vì trước đây style logo được chép tay ở Header (bản
 * desktop và mobile) lẫn Footer — sửa font một lần phải nhớ sửa đủ ba chỗ.
 *
 * Thiết kế: biểu tượng cân + tên công ty đặt bằng chính font thân trang với độ
 * đậm 800 và giãn chữ âm nhẹ. Cách này cho cảm giác chắc chắn, chính xác — phù
 * hợp ngành thiết bị đo lường hơn kiểu chữ viết tay dùng trước đây.
 */
export default function Logo({
  size = 'md',
  tone = 'brand',
  withTagline = false,
  className = '',
}: LogoProps) {
  const s = SIZES[size];
  const isLight = tone === 'light';

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Biểu tượng cân: nhận diện ngay ngành hàng mà không cần đọc chữ */}
      <span
        className={`${s.icon} flex-shrink-0 rounded-lg flex items-center justify-center ${
          isLight ? 'bg-white/15 text-white' : 'bg-brand-700 text-white'
        }`}
        aria-hidden="true"
      >
        <i className="ri-scales-3-line"></i>
      </span>

      <span className="flex flex-col min-w-0">
        <span
          className={`font-display font-extrabold leading-none tracking-tight whitespace-nowrap ${s.name} ${
            isLight ? 'text-white' : 'text-brand-700'
          }`}
        >
          Cân Vạn Thịnh Phát
        </span>

        {withTagline && (
          <span
            className={`${s.tagline} mt-1 tracking-wide whitespace-nowrap ${
              isLight ? 'text-brand-200' : 'text-brand-600'
            }`}
          >
            Cân điện tử chính hãng · Bảo hành 12 tháng
          </span>
        )}
      </span>
    </span>
  );
}

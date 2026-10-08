import Image from 'next/image';

interface LogoProps {
  /** Kích thước hiển thị. */
  size?: 'sm' | 'md' | 'lg';
  /** Tông màu: dùng trên nền sáng hay nền tối. */
  tone?: 'brand' | 'light';
  /** Hiện dòng mô tả dưới tên thương hiệu. */
  withTagline?: boolean;
  className?: string;
}

/*
 * Khung logo rộng gấp ~2,9 lần chiều cao, theo đúng tỷ lệ ảnh gốc (1737×607).
 * Đặt khung vuông như biểu tượng cũ sẽ làm logo bị bóp méo hoặc thừa nền.
 */
const SIZES = {
  sm: { name: 'text-lg', logo: 'w-[72px] p-0.5', tagline: 'text-[10px]' },
  md: { name: 'text-xl lg:text-2xl', logo: 'w-[92px] p-1', tagline: 'text-xs' },
  lg: { name: 'text-2xl', logo: 'w-[104px] p-1', tagline: 'text-xs' },
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
      {/* Logo VTP thật của công ty.
          Trước đây dùng biểu tượng cân chung chung — khách không nhận ra đây
          là thương hiệu nào. Logo thật giúp nhớ mặt doanh nghiệp (tiêu chí 1).

          Nền trắng bo góc cả khi đặt trên thanh xanh đậm: logo đỏ-vàng trên
          nền xanh bị chìm và lem màu. */}
      <span
        className={`${s.logo} flex-shrink-0 rounded-md bg-white flex items-center justify-center overflow-hidden ${
          isLight ? '' : 'ring-1 ring-brand-100'
        }`}
      >
        <Image
          src="/logo-vtp.png"
          alt="Logo Cân Vạn Thịnh Phát"
          width={458}
          height={160}
          priority
          className="w-full h-auto"
        />
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

import { BUSINESS, PRIMARY_PHONE } from '@/lib/site';

const ZALO_PHONE = PRIMARY_PHONE.replace(/\./g, '');
const EMAIL = BUSINESS.email;
const MAP_URL = BUSINESS.maps.directions;

const CHANNELS = [
  {
    key: 'zalo',
    href: `https://zalo.me/${ZALO_PHONE}`,
    label: 'Chat Zalo',
    aria: 'Liên hệ qua Zalo',
    bg: '#0068FF',
    external: true,
    icon: (
      <svg viewBox="0 0 50 50" className="w-7 h-7 fill-white" aria-hidden="true">
        <path d="M25 3C12.85 3 3 12.85 3 25c0 4.07 1.11 7.88 3.05 11.14L3 47l11.22-3.01A21.93 21.93 0 0025 47c12.15 0 22-9.85 22-22S37.15 3 25 3zm-7.4 14.5h9.1c.55 0 1 .45 1 1s-.45 1-1 1h-6.58l7.98 9.4c.24.28.28.68.1 1s-.54.52-.92.48H17.6c-.55 0-1-.45-1-1s.45-1 1-1h6.8l-7.97-9.38a.998.998 0 01.17-1.5zm16.8 12.5c-.28 0-.56-.12-.76-.34l-3-3.5c-.36-.42-.31-1.05.11-1.41.42-.36 1.05-.31 1.41.11l2.24 2.61 2.24-2.61c.36-.42.99-.47 1.41-.11.42.36.47.99.11 1.41l-3 3.5c-.2.22-.48.34-.76.34z" />
      </svg>
    ),
  },
  {
    key: 'map',
    href: MAP_URL,
    label: 'Xem bản đồ',
    aria: 'Xem bản đồ đường đi tới cửa hàng',
    bg: '#137333',
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" aria-hidden="true">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      </svg>
    ),
  },
  {
    key: 'mail',
    href: `mailto:${EMAIL}`,
    label: 'Gửi email',
    aria: `Gửi email tới ${EMAIL}`,
    bg: '#C5221F',
    external: false,
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" aria-hidden="true">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      </svg>
    ),
  },
] as const;

/**
 * Nút liên hệ nổi.
 *
 * Trên điện thoại, bản trước xếp 3 nút 52px thành cột dọc cao ~180px nằm đè
 * vĩnh viễn lên nội dung — đo được nó che mất chữ ở khối "Tư vấn miễn phí" và
 * tiêu đề "Sản phẩm bán chạy", khách không đọc được mà cũng không tắt đi được
 * (tiêu chí 1 & 6).
 *
 * Nay trên màn hình nhỏ chỉ hiện MỘT nút; bấm vào mới mở ra ba kênh, bấm lại
 * (hoặc bấm ra ngoài, hoặc Esc) thì đóng. Màn hình lớn vẫn hiện cả ba như cũ
 * vì ở đó có thừa chỗ trống hai bên.
 */
export default function FloatingContactIcons() {
  return (
    <div
      className="hidden sm:flex fixed right-4 bottom-5 z-40 flex-col items-end gap-3"
    >
      {/* ── Các kênh liên hệ ──
          Màn hình nhỏ: chỉ hiện khi đã bấm mở. Từ sm trở lên: luôn hiện. */}
      <ul
        id="floating-contact-list"
        className="flex flex-col items-end gap-3"
      >
        {CHANNELS.map((c) => (
          <li key={c.key}>
            <a
              href={c.href}
              {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              aria-label={c.aria}
              className="group flex items-center gap-2"
            >
              {/* Nhãn chữ giúp nhận ra kênh mà không phải đoán qua biểu tượng.
                  Trên điện thoại hiện sẵn khi mở; máy tính hiện khi rê chuột. */}
              <span
                className="hidden text-xs font-semibold text-white bg-slate-800/90 px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-md group-hover:inline-block group-focus-within:inline-block"
              >
                {c.label}
              </span>
              <span
                className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform duration-200 hover:scale-110"
                style={{ backgroundColor: c.bg }}
              >
                {c.icon}
              </span>
            </a>
          </li>
        ))}
      </ul>

    </div>
  );
}

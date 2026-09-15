import Link from 'next/link';
import { BUSINESS, telHref } from '@/lib/site';
import Logo from './Logo';
import LazyMap from './LazyMap';

// Server Component – nội dung tĩnh, không cần JS phía trình duyệt.

const PHONES = BUSINESS.phones;
const EMAIL = BUSINESS.email;
const ADDRESS = BUSINESS.address.full;
const MAP_EMBED = BUSINESS.maps.embed;

const quickLinks = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Giới thiệu', href: '/introduce' },
  { label: 'Hướng dẫn mua hàng', href: '/huong-dan-mua-hang' },
  { label: 'Bảo hành & đổi trả', href: '/chinh-sach' },
  { label: 'Câu hỏi thường gặp', href: '/cau-hoi-thuong-gap' },
  { label: 'Tin tức', href: '/news' },
  { label: 'Liên hệ', href: '/contact' },
];

const socials = [
  { icon: 'ri-phone-line', href: telHref(PHONES[0]), label: `Gọi hotline ${PHONES[0]}` },
  { icon: 'ri-mail-line', href: `mailto:${EMAIL}`, label: `Gửi email tới ${EMAIL}` },
  {
    icon: 'ri-facebook-fill',
    href: BUSINESS.social.facebook,
    label: 'Trang Facebook của Cân Vạn Thịnh Phát',
    external: true,
  },
];

/**
 * Chân trang.
 *
 * Chia cột theo TỶ LỆ nội dung thay vì 4 phần bằng nhau: bản trước dùng
 * `lg:grid-cols-4` nên cột giới thiệu (3 dòng chữ) và cột liên kết (7 dòng) cao
 * chênh nhau gấp ba, để lại mảng trống lớn bên trái trông như lỗi hiển thị.
 * Khối "Thông tin doanh nghiệp" cũng bị nhồi nhầm vào cột liên kết — nay chuyển
 * về cùng chỗ với phần giới thiệu vì cả hai đều nói về doanh nghiệp (tiêu chí 3).
 */
export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-10">

          {/* ── Cột 1: Thương hiệu + thông tin pháp lý ── */}
          <div className="lg:col-span-4">
            <Logo size="lg" tone="light" className="mb-4" />
            <p className="text-sm leading-relaxed text-slate-400">
              Cung cấp cân điện tử chính hãng cho nhà xưởng, cửa hàng và phòng thí nghiệm.
              Có kiểm định, lắp đặt tận nơi, bảo hành 12 tháng.
            </p>

            <dl className="mt-5 pt-5 border-t border-slate-800 space-y-1.5 text-sm">
              <div>
                <dt className="sr-only-text">Tên công ty</dt>
                <dd className="text-slate-300 leading-relaxed">{BUSINESS.legalName}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-slate-500">Mã số thuế:</dt>
                <dd className="font-mono tabular-nums text-slate-300">{BUSINESS.taxCode}</dd>
              </div>
            </dl>

            <ul className="flex gap-2 mt-5">
              {socials.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    {...(social.external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    /* Icon đơn lẻ luôn kèm nhãn cho screen reader (tiêu chí 5) */
                    aria-label={social.label}
                    className="w-11 h-11 rounded-control bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center transition-colors"
                  >
                    <i className={`${social.icon} text-lg`} aria-hidden="true"></i>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Cột 2: Thông tin liên hệ ── */}
          <div className="lg:col-span-3">
            <h2 className="text-base font-bold text-white mb-4">Thông tin liên hệ</h2>
            <dl className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <i className="ri-map-pin-2-line text-brand-400 text-lg flex-shrink-0 mt-0.5" aria-hidden="true"></i>
                <div>
                  <dt className="sr-only-text">Địa chỉ</dt>
                  <dd className="text-slate-300 leading-relaxed">{ADDRESS}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="ri-phone-line text-brand-400 text-lg flex-shrink-0 mt-0.5" aria-hidden="true"></i>
                <div>
                  <dt className="sr-only-text">Điện thoại</dt>
                  {/* 34px mỗi dòng: vẫn đủ để bấm trúng trên điện thoại nhưng ba
                      số không bị kéo giãn rời rạc như khi dùng 44px. */}
                  <dd className="flex flex-col">
                    {PHONES.map((phone) => (
                      <a
                        key={phone}
                        href={telHref(phone)}
                        className="inline-flex items-center min-h-[34px] text-slate-300 hover:text-white hover:underline w-fit"
                      >
                        {phone}
                      </a>
                    ))}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="ri-mail-line text-brand-400 text-lg flex-shrink-0 mt-0.5" aria-hidden="true"></i>
                <div className="min-w-0">
                  <dt className="sr-only-text">Email</dt>
                  <dd>
                    <a
                      href={`mailto:${EMAIL}`}
                      className="inline-flex items-center min-h-[34px] text-slate-300 hover:text-white hover:underline break-all"
                    >
                      {EMAIL}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="ri-time-line text-brand-400 text-lg flex-shrink-0 mt-0.5" aria-hidden="true"></i>
                <div>
                  <dt className="sr-only-text">Giờ làm việc</dt>
                  <dd className="text-slate-300 leading-relaxed">
                    {BUSINESS.openingHours.map((h) => (
                      <span key={h.label} className="block">
                        {h.label}: {h.time}
                      </span>
                    ))}
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          {/* ── Cột 3: Liên kết nhanh ── */}
          <nav aria-label="Liên kết chân trang" className="lg:col-span-2">
            <h2 className="text-base font-bold text-white mb-4">Liên kết nhanh</h2>
            <ul>
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center min-h-[34px] text-sm text-slate-300 hover:text-white hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Cột 4: Bản đồ ── */}
          <div className="lg:col-span-3">
            <h2 className="text-base font-bold text-white mb-4">Bản đồ đường đi</h2>
            {/* Cột rộng 3/12 cho bản đồ đủ lớn để nhận ra vị trí; bản trước cột
                quá hẹp khiến bản đồ chỉ còn ~160px, gần như không đọc được. */}
            <LazyMap aspect="4/3" />
            <a
              href={BUSINESS.maps.directions}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 min-h-touch mt-1 text-sm text-brand-400 hover:text-brand-300 hover:underline"
            >
              <i className="ri-navigation-line" aria-hidden="true"></i>
              Chỉ đường tới cửa hàng
            </a>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} {BUSINESS.name}. Tất cả quyền được bảo lưu.
          </p>
          <p className="text-sm text-slate-500">
            <Link href="/huong-dan-mua-hang" className="hover:text-slate-300 hover:underline">
              Hướng dẫn mua hàng
            </Link>
            <span className="mx-2" aria-hidden="true">·</span>
            <Link href="/chinh-sach" className="hover:text-slate-300 hover:underline">
              Chính sách
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

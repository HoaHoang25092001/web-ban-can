'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchProduct from './SearchProduct';
import Logo from './Logo';
import { PRIMARY_PHONE, telHref } from '@/lib/site';

const PHONE_DISPLAY = PRIMARY_PHONE;
const PHONE_HREF = telHref(PRIMARY_PHONE);

const navLinks = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Giới thiệu', href: '/introduce' },
  { label: 'Hướng dẫn mua hàng', href: '/huong-dan-mua-hang' },
  { label: 'Bảo hành & đổi trả', href: '/chinh-sach' },
  { label: 'Câu hỏi thường gặp', href: '/cau-hoi-thuong-gap' },
  { label: 'Tin tức', href: '/news' },
  { label: 'Liên hệ', href: '/contact' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hideOnScroll, setHideOnScroll] = useState(false);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const lastScrollY = useRef(0);

  // Đóng menu khi chuyển trang – tránh menu treo lơ lửng sau khi điều hướng
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  /*
   * Ẩn header khi cuộn XUỐNG, hiện lại khi cuộn LÊN (chỉ trên điện thoại).
   *
   * Header dính cao 125px, cộng hai thanh điều hướng bên dưới là 229px —
   * chiếm 27% màn hình 852px một cách thường trực. Khách đang đọc sản phẩm
   * thì phần đó chỉ là vật cản; khi cần tìm kiếm hay đổi danh mục thì vuốt
   * nhẹ lên là header trở lại ngay, không phải cuộn về đầu trang (tiêu chí 3 & 6).
   *
   * Không ẩn khi menu đang mở, và luôn hiện lại khi về gần đầu trang.
   */
  useEffect(() => {
    // Người dùng đã bật "giảm chuyển động" thì giữ header cố định.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const diff = y - lastScrollY.current;
        // Bỏ qua rung lắc nhỏ để header không chớp tắt liên tục.
        if (Math.abs(diff) > 6) {
          setHideOnScroll(y > 240 && diff > 0);
          lastScrollY.current = y;
        }
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Mở menu thì luôn phải thấy header.
  useEffect(() => {
    if (isMenuOpen) setHideOnScroll(false);
  }, [isMenuOpen]);

  // Đóng menu bằng phím Esc (tiêu chí 5: điều hướng bàn phím)
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen]);

  return (
    <header
      className={`bg-white border-b border-surface-border sticky top-0 z-50 transition-transform duration-300 will-change-transform
        ${hideOnScroll ? '-translate-y-full lg:translate-y-0' : 'translate-y-0'}`}
    >
      <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Desktop: Tìm kiếm | Logo | Hotline ── */}
        {/* Bố cục 3 cột (tìm kiếm | logo | hotline) cần ~792px. Trước đây bật từ
            `md` (768px) nên ở đúng khổ tablet 768px nút hotline bị đẩy tràn ra
            ngoài mép phải 24px. Nay bật từ `lg` (1024px); khổ tablet dùng bố
            cục mobile vốn đã xếp gọn (tiêu chí 6). */}
        <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-center gap-6 h-20">
          <div className="flex items-center">
            <div className="w-full max-w-sm">
              <SearchProduct compact />
            </div>
          </div>

          <Link
            href="/"
            className="flex flex-col items-center justify-center text-center rounded-control px-2 py-1"
            aria-label="Cân Vạn Thịnh Phát – về trang chủ"
          >
            {/* Tiêu chí 1: tên kèm dòng mô tả nói rõ bán gì */}
            <Logo size="md" withTagline />
          </Link>

          <div className="flex justify-end items-center">
            {/* Hotline là hành động chính của site → dùng màu nhấn (10%) */}
            <a
              href={PHONE_HREF}
              className="btn-primary"
            >
              <i className="ri-phone-fill text-base" aria-hidden="true"></i>
              <span>
                <span className="sr-only-text">Gọi hotline </span>
                {PHONE_DISPLAY}
              </span>
            </a>
          </div>
        </div>

        {/* ── Mobile ── */}
        <div className="lg:hidden flex justify-between items-center gap-2 h-16">
          <Link
            href="/"
            className="flex items-center min-h-touch min-w-0 pr-2"
            aria-label="Cân Vạn Thịnh Phát – về trang chủ"
          >
            <Logo size="sm" />
          </Link>

          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={PHONE_HREF}
              className="inline-flex items-center justify-center gap-1.5 min-h-touch px-3 rounded-control bg-accent-600 text-white font-semibold text-sm"
            >
              <i className="ri-phone-fill" aria-hidden="true"></i>
              <span className="sr-only-text">Gọi hotline {PHONE_DISPLAY}</span>
              <span aria-hidden="true">Gọi</span>
            </a>
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              /* Vùng chạm 44×44px + trạng thái được công bố cho screen reader */
              className="inline-flex items-center justify-center min-w-touch min-h-touch rounded-control text-slate-700 hover:bg-surface-sunken transition-colors"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav"
              aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
            >
              <i
                className={`ri-${isMenuOpen ? 'close' : 'menu'}-line text-2xl`}
                aria-hidden="true"
              ></i>
            </button>
          </div>
        </div>

        {/* Thanh tìm kiếm mobile – luôn hiện, vì tìm kiếm là tác vụ chính */}
        <div className="md:hidden pb-3">
          <SearchProduct compact />
        </div>

        {/* ── Mobile navigation ── */}
        {isMenuOpen && (
          <nav
            id="mobile-nav"
            aria-label="Điều hướng chính"
            className="md:hidden border-t border-surface-border py-2 animate-fade-up"
          >
            <ul className="flex flex-col">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex items-center min-h-touch px-2 rounded-control font-medium transition-colors ${
                        isActive
                          ? 'text-brand-700 bg-brand-50'
                          : 'text-slate-700 hover:bg-surface-sunken'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}

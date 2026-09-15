'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
}

const navLinks = [
  { label: 'Giới thiệu', href: '/introduce' },
  { label: 'Hướng dẫn mua hàng', href: '/huong-dan-mua-hang' },
  { label: 'Chính sách', href: '/chinh-sach' },
  { label: 'Tin tức', href: '/news' },
  { label: 'Liên hệ', href: '/contact' },
];

interface CategoryNavBarProps {
  initialCategories?: Category[];
}

/**
 * Thanh điều hướng chính: nút "Danh mục sản phẩm" + các link phụ.
 *
 * Trên TRANG CHỦ, danh sách danh mục không nằm ở đây mà được render thành cột
 * trái ngay trong HomeHero, để danh mục và slide nằm cùng một lưới. Bản trước
 * dùng `position: absolute` cho danh sách rồi chừa chỗ bằng một div rỗng bên
 * hero — hai phần tử độc lập nên không bao giờ khớp nhau, gây ra khoảng trắng
 * lớn bên trái và danh mục đè lên khối nội dung phía dưới.
 */
export default function CategoryNavBar({ initialCategories }: CategoryNavBarProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [loadingCats, setLoadingCats] = useState(!initialCategories);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const isHome = pathname === '/';

  useEffect(() => {
    if (initialCategories) return;

    const controller = new AbortController();
    const fetchCategories = async () => {
      try {
        setLoadingCats(true);
        const res = await fetch('/api/categories', { signal: controller.signal });
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
        setCategories([]);
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCategories();
    return () => controller.abort();
  }, [initialCategories]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Đóng khi bấm ra ngoài hoặc nhấn Esc (tiêu chí 5)
  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={`w-full bg-brand-600 relative ${isOpen ? 'z-50' : 'z-40'}`}>
      {/* Lớp phủ mờ khi menu danh mục đang mở: tách bảng danh mục trắng khỏi
          nội dung trang phía sau, và bấm vào đâu cũng đóng được. Bản trước
          bảng trắng nổi thẳng trên nội dung nên nhìn như dính vào trang. */}
      {isOpen && (
        <div
          className="absolute inset-x-0 top-full h-screen bg-slate-900/40 z-30 hidden lg:block"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-8 flex items-stretch">

        {/* ── Nút mở danh mục (ẩn trên trang chủ vì danh mục đã là cột trái) ── */}
        {!isHome && (
          <div
            ref={wrapperRef}
            className="flex-shrink-0 relative hidden lg:block w-[264px]"
          >
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setIsOpen((open) => !open)}
              aria-expanded={isOpen}
              aria-controls="category-dropdown"
              className="w-full flex items-center gap-2 bg-brand-700 text-white font-bold uppercase text-sm px-5 min-h-touch py-3 h-full text-left hover:bg-brand-800 transition-colors"
            >
              <i className="ri-menu-line text-lg flex-shrink-0" aria-hidden="true"></i>
              <span className="flex-1">Danh mục sản phẩm</span>
              <i
                className={`ri-arrow-down-s-line text-base flex-shrink-0 transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              ></i>
            </button>

            <div
              id="category-dropdown"
              className="absolute top-full left-0 w-[264px] z-40"
              hidden={!isOpen}
            >
              <nav aria-label="Danh mục sản phẩm">
                <ul className="bg-white border border-surface-border shadow-2xl rounded-b-card overflow-hidden max-h-[70vh] overflow-y-auto scrollable-content">
                  {loadingCats
                    ? [...Array(8)].map((_, i) => (
                        <li key={i} className="h-11 border-b border-slate-100 px-4 flex items-center">
                          <span className="h-3 w-3/4 bg-slate-200 rounded animate-pulse" />
                        </li>
                      ))
                    : categories.map((cat) => {
                        const isActive = pathname === `/category/${cat.id}`;
                        return (
                          <li key={cat.id}>
                            <Link
                              href={`/category/${cat.id}`}
                              aria-current={isActive ? 'page' : undefined}
                              className={`flex items-center gap-2 min-h-touch px-4 py-2.5 text-sm border-b border-slate-100 transition-colors
                                ${isActive
                                  ? 'bg-brand-50 text-brand-700 font-semibold'
                                  : 'text-slate-700 font-medium hover:bg-brand-50 hover:text-brand-700'
                                }`}
                            >
                              <i className="ri-arrow-right-s-line text-slate-400 flex-shrink-0" aria-hidden="true"></i>
                              <span className="leading-snug">{cat.name}</span>
                            </Link>
                          </li>
                        );
                      })}
                </ul>
              </nav>
            </div>
          </div>
        )}

        {/* ── Nav links ── */}
        {/* Lớp phủ mờ dần ở mép phải: báo cho khách biết menu còn cuộn tiếp.
            Bản trước cắt cụt giữa chữ ("CH...") mà không có dấu hiệu nào, nên
            khách tưởng chỉ có bấy nhiêu mục (tiêu chí 4). */}
        <div className="relative flex-1 min-w-0">
          <nav aria-label="Điều hướng chính" className="flex items-center overflow-x-auto no-scrollbar scroll-smooth">
            <ul className="flex items-stretch">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href} className="flex">
                  <Link
                    href={link.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`text-white text-sm font-semibold uppercase px-5 min-h-touch flex items-center whitespace-nowrap transition-colors
                      ${isActive ? 'bg-brand-700' : 'hover:bg-brand-700'}`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            </ul>
          </nav>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-brand-600 to-transparent lg:hidden" />
        </div>
      </div>

      {/* ── Mobile + tablet: danh mục cuộn ngang (không ẩn sau hover) ── */}
      <div className="border-t border-white/15 lg:hidden">
        <div className="relative">
        <nav aria-label="Danh mục sản phẩm" className="overflow-x-auto no-scrollbar scroll-smooth">
          <ul className="flex items-center gap-2 px-4 sm:px-6 py-2">
            {loadingCats
              ? [...Array(5)].map((_, i) => (
                  <li key={i} className="h-11 w-28 bg-white/20 rounded-full animate-pulse flex-shrink-0" />
                ))
              : categories.map((cat) => {
                  const isActive = pathname === `/category/${cat.id}`;
                  return (
                    <li key={cat.id} className="flex-shrink-0">
                      <Link
                        href={`/category/${cat.id}`}
                        aria-current={isActive ? 'page' : undefined}
                        className={`inline-flex items-center min-h-touch px-4 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                          isActive ? 'bg-white text-brand-700' : 'bg-white/15 text-white hover:bg-white/25'
                        }`}
                      >
                        {cat.name}
                      </Link>
                    </li>
                  );
                })}
          </ul>
        </nav>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-brand-600 to-transparent" />
        </div>
      </div>
    </div>
  );
}

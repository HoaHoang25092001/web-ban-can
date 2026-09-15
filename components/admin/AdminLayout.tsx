'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Package,
  Tags,
  Newspaper,
  MessageSquare,
  LogOut,
  Star,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

const menuItems = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/admin/categories', label: 'Danh mục sản phẩm', icon: Tags },
  { href: '/admin/products', label: 'Sản phẩm', icon: Package },
  { href: '/admin/news', label: 'Tin tức', icon: Newspaper },
  { href: '/admin/reviews', label: 'Đánh giá khách hàng', icon: Star },
  { href: '/admin/contacts', label: 'Liên hệ', icon: MessageSquare },
];

/**
 * Khung trang quản trị.
 *
 * Bản trước dùng sidebar `fixed w-64` cộng `ml-64` cố định ở phần nội dung: dưới
 * 1024px sidebar đè kín toàn bộ nội dung và không có cách nào đóng lại, nên trang
 * quản trị gần như không dùng được trên điện thoại hay tablet (tiêu chí 6).
 * Nay sidebar cố định từ lg trở lên, còn dưới đó trượt ra như ngăn kéo có nút
 * đóng, lớp phủ và hỗ trợ phím Esc.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Đóng ngăn kéo khi chuyển trang
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Đóng bằng Esc và khóa cuộn nền khi ngăn kéo đang mở
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const sidebarNav = (
    <nav aria-label="Điều hướng quản trị" className="flex-1 overflow-y-auto px-3 py-4">
      <ul className="space-y-1">
        {menuItems.map((item) => {
          // Dùng so khớp tiền tố để trang con (ví dụ /admin/products/new) vẫn
          // sáng đúng mục cha; riêng /admin phải khớp tuyệt đối vì là tiền tố
          // của mọi đường dẫn khác.
          const isActive =
            item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 min-h-touch px-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 min-h-touch px-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          <ExternalLink className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <span>Xem website</span>
        </a>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Sidebar cố định (desktop) ── */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex-col">
        <div className="flex h-16 items-center px-5 border-b border-gray-200 flex-shrink-0">
          <span className="text-lg font-bold text-gray-900">Trang quản trị</span>
        </div>
        {sidebarNav}
      </aside>

      {/* ── Ngăn kéo (mobile / tablet) ── */}
      {sidebarOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Menu quản trị"
            className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white flex flex-col shadow-xl animate-fade-up"
          >
            <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 flex-shrink-0">
              <span className="text-lg font-bold text-gray-900">Trang quản trị</span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Đóng menu"
                className="w-11 h-11 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            {sidebarNav}
          </aside>
        </>
      )}

      {/* ── Nội dung ── */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Mở menu quản trị"
                aria-expanded={sidebarOpen}
                className="lg:hidden w-11 h-11 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 flex-shrink-0"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
              <span className="text-base font-semibold text-gray-900 truncate">
                Quản lý website
              </span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {session?.user?.name && (
                <span className="hidden sm:inline text-sm text-gray-600 truncate max-w-[180px]">
                  {session.user.name}
                </span>
              )}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/admin/login' })}
                className="inline-flex items-center justify-center gap-2 min-h-touch min-w-touch px-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Đăng xuất</span>
                <span className="sm:hidden sr-only-text">Đăng xuất</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

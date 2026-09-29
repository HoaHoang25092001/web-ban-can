'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Scale, ClipboardList, Package, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const NAV = [
  { href: '/can-dien-tu', label: 'Màn hình cân', icon: Scale },
  { href: '/can-dien-tu/ban-ghi', label: 'Bản ghi cân', icon: ClipboardList },
  { href: '/can-dien-tu/mat-hang', label: 'Mặt hàng', icon: Package },
];

/**
 * Khung trang cho khu cân điện tử.
 *
 * Tách hẳn khỏi giao diện bán hàng: khách vào đây để làm việc, không phải để
 * xem hàng — thanh điều hướng của website (danh mục, tin tức, nút gọi) chỉ
 * làm rối và chiếm chỗ (tiêu chí 1 & 3).
 */
export default function ScaleShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName: string;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/can-dien-tu' ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-shell mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-3">
            <Link
              href="/can-dien-tu"
              /* min-w-touch: trên điện thoại chữ "Cân điện tử" bị ẩn, chỉ còn
                 biểu tượng nên liên kết co lại 36px — hụt vùng chạm 44px. */
              className="flex items-center gap-2 font-bold text-slate-900 min-h-touch min-w-touch"
            >
              <span className="w-9 h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center flex-shrink-0">
                <Scale className="w-5 h-5" aria-hidden="true" />
              </span>
              <span className="hidden sm:inline">Cân điện tử</span>
            </Link>

            {/* Điều hướng trên máy tính */}
            <nav aria-label="Điều hướng phần cân" className="hidden md:flex items-center gap-1">
              {NAV.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive(href) ? 'page' : undefined}
                  className={`inline-flex items-center gap-2 min-h-touch px-4 rounded-lg text-sm font-medium transition-colors ${
                    isActive(href)
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <span className="hidden lg:block text-sm text-slate-600 truncate max-w-[180px]">
                {userName}
              </span>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/can-dien-tu/dang-nhap' })}
                /* Tương tự nút đăng xuất: chữ ẩn trên điện thoại, còn lại
                   biểu tượng 16px nên phải ép đủ bề ngang 44px. */
                className="inline-flex items-center justify-center gap-1.5 min-h-touch min-w-touch px-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
                className="md:hidden inline-flex items-center justify-center min-w-touch min-h-touch rounded-lg text-slate-700 hover:bg-slate-100"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Điều hướng trên điện thoại */}
          {menuOpen && (
            <nav aria-label="Điều hướng phần cân" className="md:hidden border-t border-slate-200 py-2">
              <ul className="flex flex-col">
                {NAV.map(({ href, label, icon: Icon }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={isActive(href) ? 'page' : undefined}
                      className={`flex items-center gap-3 min-h-touch px-2 rounded-lg font-medium ${
                        isActive(href) ? 'text-brand-700 bg-brand-50' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-shell w-full mx-auto px-4 sm:px-6 py-6">{children}</main>
    </div>
  );
}

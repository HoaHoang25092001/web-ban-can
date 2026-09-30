'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Scale, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from '@/components/scale/ThemeToggle';

/**
 * Năm mục đúng theo dự án digital-scale gốc.
 *
 * "Màn hình cân" và "Hướng dẫn" không cần đăng nhập: khách mới mua cân có thể
 * xem số cân và đọc hướng dẫn ngay, chỉ khi muốn LƯU lại mới phải đăng nhập.
 */
const NAV = [
  { href: '/can-dien-tu', label: 'Màn hình cân', requiresAuth: false },
  { href: '/can-dien-tu/ban-ghi', label: 'Bản ghi cân', requiresAuth: true },
  { href: '/can-dien-tu/mat-hang', label: 'Sản phẩm', requiresAuth: true },
  { href: '/can-dien-tu/nhan-vien', label: 'Nhân viên', requiresAuth: true },
  { href: '/can-dien-tu/huong-dan', label: 'Hướng dẫn', requiresAuth: false },
];

/**
 * Khung trang cho khu cân điện tử.
 *
 * Giao diện chép từ dự án digital-scale: thanh trên gọn, menu ngang, nút đổi
 * sáng/tối. Tách hẳn khỏi giao diện bán hàng — khách vào đây để làm việc,
 * không phải để xem hàng.
 */
export default function ScaleShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  /** Bỏ trống khi chưa đăng nhập: các trang công khai vẫn dùng chung khung này. */
  userName?: string | null;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/can-dien-tu' ? pathname === href : pathname.startsWith(href);

  // Chưa đăng nhập thì ẩn các mục cần đăng nhập, thay vì cho bấm rồi mới báo lỗi.
  const visible = NAV.filter((n) => !n.requiresAuth || userName);

  return (
    <div className="min-h-screen bg-scale-bg text-scale-fg flex flex-col">
      <header className="bg-scale-card border-b border-scale-border sticky top-0 z-40">
        <div className="max-w-shell mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-3">
            <div className="flex items-center gap-1 min-w-0">
              <Link
                href="/can-dien-tu"
                className="flex items-center gap-2 font-bold text-scale-fg min-h-touch min-w-touch pr-2"
              >
                <Scale className="w-6 h-6 text-scale-primary flex-shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline whitespace-nowrap">Cân điện tử</span>
              </Link>

              <nav aria-label="Điều hướng phần cân" className="hidden md:flex items-center gap-0.5">
                {visible.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    aria-current={isActive(href) ? 'page' : undefined}
                    className={`inline-flex items-center min-h-touch px-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive(href)
                        ? 'bg-scale-accent text-scale-accent-fg'
                        : 'text-scale-muted-fg hover:bg-scale-muted hover:text-scale-fg'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <ThemeToggle />

              {userName ? (
                <>
                  <span className="hidden lg:block text-sm text-scale-muted-fg truncate max-w-[160px] px-2">
                    {userName}
                  </span>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: '/dang-nhap' })}
                    className="inline-flex items-center justify-center gap-1.5 min-h-touch min-w-touch px-3 rounded-lg text-sm font-medium text-scale-muted-fg hover:bg-scale-muted hover:text-scale-fg transition-colors"
                  >
                    <LogOut className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    <span className="hidden sm:inline">Đăng xuất</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/dang-nhap"
                  className="inline-flex items-center min-h-touch px-4 rounded-lg bg-scale-primary text-scale-primary-fg text-sm font-semibold hover:bg-scale-primary-hover transition-colors"
                >
                  Đăng nhập
                </Link>
              )}

              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
                className="md:hidden inline-flex items-center justify-center min-w-touch min-h-touch rounded-lg text-scale-fg hover:bg-scale-muted transition-colors"
              >
                {menuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <nav aria-label="Điều hướng phần cân" className="md:hidden border-t border-scale-border py-2">
              <ul className="flex flex-col">
                {visible.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={isActive(href) ? 'page' : undefined}
                      className={`flex items-center min-h-touch px-3 rounded-lg font-medium transition-colors ${
                        isActive(href)
                          ? 'bg-scale-accent text-scale-accent-fg'
                          : 'text-scale-fg hover:bg-scale-muted'
                      }`}
                    >
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

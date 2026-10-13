'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Scale, LogOut, Menu, X, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import ThemeToggle from '@/components/scale/ThemeToggle';
import { ConfirmProvider } from '@/components/scale/confirm';
import { FOCUS_RING, buttonClass, cx } from '@/components/scale/ui';

/**
 * "Phiếu cân" là chỗ cân duy nhất (đã gộp "Màn hình cân" cũ vào), "Bản ghi
 * cân" là lịch sử mọi lượt cân trong các phiếu.
 *
 * "Phiếu cân" và "Hướng dẫn" không cần đăng nhập: khách mới mua cân có thể
 * xem số cân và đọc hướng dẫn ngay, chỉ khi muốn lập phiếu mới phải đăng nhập.
 */
const NAV = [
  { href: '/can-dien-tu', label: 'Phiếu cân', requiresAuth: false },
  { href: '/can-dien-tu/ban-ghi', label: 'Bản ghi cân', requiresAuth: true },
  { href: '/can-dien-tu/khach-hang', label: 'Khách hàng', requiresAuth: true },
  { href: '/can-dien-tu/mat-hang', label: 'Sản phẩm', requiresAuth: true },
  { href: '/can-dien-tu/nhan-vien', label: 'Nhân viên', requiresAuth: true },
  { href: '/can-dien-tu/huong-dan', label: 'Hướng dẫn', requiresAuth: false },
];

/**
 * Khung trang cho khu cân điện tử.
 *
 * Thanh trên gọn, menu ngang, nút đổi sáng/tối. Tách hẳn khỏi giao diện bán
 * hàng — khách vào đây để làm việc, không phải để xem hàng.
 *
 * Bọc ConfirmProvider ở đây để mọi màn hình bên trong dùng chung một kiểu hộp
 * xác nhận (components/scale/confirm.tsx).
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

  const isActive = (href: string) => (href === '/can-dien-tu' ? pathname === href : pathname.startsWith(href));

  // Chưa đăng nhập thì ẩn các mục cần đăng nhập, thay vì cho bấm rồi mới báo lỗi.
  const visible = NAV.filter((n) => !n.requiresAuth || userName);

  // Esc đóng menu điện thoại, như mọi menu bật ra khác.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const navLink = (href: string, label: string, mobile = false) => (
    <Link
      key={href}
      href={href}
      onClick={() => setMenuOpen(false)}
      aria-current={isActive(href) ? 'page' : undefined}
      className={cx(
        'inline-flex items-center min-h-touch rounded-lg font-medium transition-colors',
        FOCUS_RING,
        mobile ? 'w-full px-3 text-base' : 'px-3 text-sm',
        isActive(href)
          ? 'bg-scale-accent text-scale-accent-fg font-semibold'
          : mobile
            ? 'text-scale-fg hover:bg-scale-muted'
            : 'text-scale-muted-fg hover:bg-scale-muted hover:text-scale-fg'
      )}
    >
      {label}
    </Link>
  );

  return (
    <ConfirmProvider>
      <div className="min-h-screen bg-scale-bg text-scale-fg flex flex-col">
        {/* Bỏ qua thanh menu, tới thẳng nội dung — cho người dùng bàn phím (WCAG 2.4.1). */}
        <a
          href="#scale-main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-scale-primary focus:px-4 focus:py-3 focus:text-scale-primary-fg focus:font-semibold"
        >
          Bỏ qua tới nội dung chính
        </a>

        <header className="bg-scale-card border-b border-scale-border sticky top-0 z-40">
          <div className="max-w-shell mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16 gap-3">
              <div className="flex items-center gap-1 min-w-0">
                <Link
                  href="/can-dien-tu"
                  aria-label="Cân điện tử — về Phiếu cân"
                  className={cx('flex items-center gap-2 font-bold text-scale-fg min-h-touch min-w-touch pr-2 rounded-lg', FOCUS_RING)}
                >
                  <Scale className="w-6 h-6 text-scale-primary flex-shrink-0" aria-hidden="true" />
                  <span className="hidden sm:inline whitespace-nowrap">Cân điện tử</span>
                </Link>

                <nav aria-label="Điều hướng phần cân" className="hidden lg:flex items-center gap-0.5">
                  {visible.map(({ href, label }) => navLink(href, label))}
                </nav>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <ThemeToggle />

                {userName ? (
                  <>
                    <span className="hidden xl:inline-flex items-center gap-1.5 text-sm text-scale-muted-fg max-w-[180px] px-2">
                      <UserRound className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                      <span className="truncate">{userName}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: '/dang-nhap' })}
                      // Trên điện thoại chỉ còn biểu tượng — vẫn phải có tên cho trình đọc màn hình.
                      aria-label="Đăng xuất"
                      className={cx(buttonClass({ variant: 'ghost' }), 'px-3 text-scale-muted-fg')}
                    >
                      <LogOut className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                      <span className="hidden sm:inline">Đăng xuất</span>
                    </button>
                  </>
                ) : (
                  <Link href="/dang-nhap" className={buttonClass({ variant: 'primary' })}>
                    Đăng nhập
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-expanded={menuOpen}
                  aria-controls="scale-mobile-nav"
                  aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
                  className={cx('lg:hidden', buttonClass({ variant: 'ghost', iconOnly: true }))}
                >
                  {menuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
                </button>
              </div>
            </div>

            {menuOpen && (
              <nav id="scale-mobile-nav" aria-label="Điều hướng phần cân" className="lg:hidden border-t border-scale-border py-2">
                {userName && (
                  <p className="flex items-center gap-2 px-3 py-2 text-sm text-scale-muted-fg">
                    <UserRound className="w-4 h-4" aria-hidden="true" /> {userName}
                  </p>
                )}
                <ul className="flex flex-col gap-0.5">
                  {visible.map(({ href, label }) => (
                    <li key={href}>{navLink(href, label, true)}</li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
        </header>

        {/* tabIndex -1: liên kết "Bỏ qua tới nội dung chính" đưa được con trỏ vào đây. */}
        <main id="scale-main" tabIndex={-1} className="flex-1 max-w-shell w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 focus:outline-none">
          {children}
        </main>
      </div>
    </ConfirmProvider>
  );
}

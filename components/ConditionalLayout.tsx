'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';


/**
 * Bọc layout công khai (header/nav/footer) và bỏ qua chúng cho khu vực /admin.
 *
 * Ghi chú: bản trước có một MutationObserver theo dõi thuộc tính style/class của
 * <body> và <html> trên mọi trang để chống khóa cuộn của widget Cloudinary.
 * Dự án đã chuyển sang UploadThing nên không còn widget đó nữa, trong khi
 * observer vẫn chạy suốt vòng đời trang và kích hoạt lại mỗi lần bất kỳ thư
 * viện nào chạm vào style của body — tốn CPU mà không giải quyết vấn đề gì.
 */
export default function ConditionalLayout({
  children,
  categoryNav,
}: {
  children: React.ReactNode;
  /**
   * Thanh danh mục đã nạp sẵn dữ liệu trên server.
   * Truyền qua prop vì component này là 'use client' — không thể tự gọi
   * database, mà để nó fetch từ trình duyệt thì mất thêm ~557ms mỗi trang.
   */
  categoryNav: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      {categoryNav}
      {/* id trùng với đích của skip-link trong layout.tsx (tiêu chí 5) */}
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <Footer />
    </div>
  );
}

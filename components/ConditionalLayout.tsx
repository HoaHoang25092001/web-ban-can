'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import MobileActionBar from './MobileActionBar';
import FloatingContactIcons from './FloatingContactIcons';


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
      {/* Thanh hành động đáy: chỉ hiện trên điện thoại (xem MobileActionBar). */}
      <MobileActionBar />
      {/*
        Nút liên hệ nổi bên phải: trước đây chỉ đặt trong app/page.tsx nên khách
        đang xem chi tiết sản phẩm, danh mục hay tin tức — đúng lúc muốn hỏi giá
        nhất — lại không thấy nút gọi nào. Đặt ở đây để có mặt trên MỌI trang
        bán hàng (tiêu chí 1: hành động chính luôn trong tầm tay).

        Chỉ hiện từ `sm` trở lên; trên điện thoại MobileActionBar đã lo việc này,
        hiện cả hai sẽ chồng lên nhau ở góc phải dưới.
      */}
      <FloatingContactIcons />
    </div>
  );
}

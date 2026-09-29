'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Ghi nhận lượt xem trang của khách.
 *
 * Đặt trong ConditionalLayout nên chạy trên mọi trang bán hàng. Next.js là
 * ứng dụng một trang: chuyển trang không tải lại trình duyệt, nên phải theo
 * dõi `pathname` để đếm được cả những lượt xem sau lần tải đầu tiên.
 *
 * Gọi bằng `keepalive` để yêu cầu vẫn được gửi đi ngay cả khi khách bấm sang
 * trang khác ngay lập tức — nếu không, lượt xem cuối cùng trước khi rời đi
 * sẽ bị mất.
 */
export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;

    /*
     * Chờ một nhịp rồi mới gửi.
     *
     * Khách bấm nhầm rồi quay lại ngay trong dưới nửa giây không nên tính là
     * một lượt xem. Cũng tránh cho yêu cầu này tranh băng thông với ảnh và
     * nội dung chính lúc trang đang tải (tiêu chí 7).
     */
    const timer = setTimeout(() => {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: pathname }),
        keepalive: true,
      }).catch(() => {
        /* Thống kê hỏng thì im lặng bỏ qua, không làm phiền khách. */
      });
    }, 600);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}

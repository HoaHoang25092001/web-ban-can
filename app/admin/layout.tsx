import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Quản lý Website',
  description: 'Trang quản trị website bán cần câu',
  robots: 'noindex, nofollow',
};

// Force dynamic rendering for all admin pages
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Chốt chặn khu quản trị, kiểm tra TRÊN MÁY CHỦ.
 *
 * Từ khi có trang đăng nhập chung, một khách hàng dùng phần cân đăng nhập
 * xong có thể gõ thẳng /admin vào thanh địa chỉ. Các API quản trị đã trả 403
 * nên họ không đọc được dữ liệu, nhưng vẫn thấy khung trang và danh sách các
 * mục — vừa khó hiểu vừa lộ ra website có những gì.
 *
 * Đã thử chặn bằng useEffect trong AdminLayout nhưng không ăn: đó là mã chạy
 * ở trình duyệt SAU khi trang đã tải, nên nội dung vẫn kịp hiện ra. Chặn ở
 * máy chủ thì trang không bao giờ được gửi đi (tiêu chí 5).
 */
export default async function AdminAreaLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (session?.user?.kind === 'scale') {
    redirect('/can-dien-tu');
  }

  return <>{children}</>;
}

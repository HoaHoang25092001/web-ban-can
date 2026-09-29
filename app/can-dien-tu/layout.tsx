import type { Metadata } from 'next';
import SessionProvider from '@/components/SessionProvider';

export const metadata: Metadata = {
  title: {
    default: 'Cân điện tử',
    template: '%s · Cân điện tử',
  },
  /* Khu làm việc nội bộ của khách hàng — không được xuất hiện trên Google. */
  robots: { index: false, follow: false },
};

/**
 * Khung ngoài cho toàn bộ khu /can-dien-tu.
 *
 * Bọc SessionProvider để các trang con đọc được phiên đăng nhập; phần bán
 * hàng của website đã có provider riêng nhưng khu này nằm ngoài
 * ConditionalLayout nên phải tự bọc.
 */
export default function ScaleLayout({ children }: { children: React.ReactNode }) {
  return <SessionProvider session={null}>{children}</SessionProvider>;
}

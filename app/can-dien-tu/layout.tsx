import type { Metadata } from 'next';
import SessionProvider from '@/components/SessionProvider';
import { THEME_INIT_SCRIPT } from '@/lib/scale-theme';

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
 * Đoạn mã đặt chế độ sáng/tối phải chạy TRƯỚC khi trang vẽ lần đầu, nếu không
 * khách bật chế độ tối sẽ thấy màn hình loé trắng một nhịp rồi mới chuyển —
 * chói mắt khi làm việc ban đêm.
 */
export default function ScaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider session={null}>
      <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      {children}
    </SessionProvider>
  );
}

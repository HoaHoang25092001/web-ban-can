import type { Metadata } from 'next';
import SessionProvider from '@/components/SessionProvider';
import { THEME_INIT_SCRIPT } from '@/lib/scale-theme';
import { ScaleProvider } from '@/components/scale/scale-context';

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
      {/*
        Kết nối cân đặt ở KHUNG CHUNG của cả khu, không đặt trong trang Màn
        hình cân.

        Bản trước đặt trong page.tsx: chuyển sang "Bản ghi cân" là trang Màn
        hình cân bị gỡ, kéo theo ScaleProvider bị gỡ và cổng cân tự đóng —
        quay lại phải bấm "Kết nối cân" và chọn cổng lại từ đầu. Dự án gốc
        digital-scale cũng đặt ở layout, lúc chép sang tôi đặt sai chỗ.

        Layout của Next.js giữ nguyên khi chuyển giữa các trang con, nên kết
        nối sống suốt trong khu /can-dien-tu. Chỉ ngắt khi rời hẳn khu này
        (đăng xuất, sang trang bán hàng) — lúc đó đóng cổng là đúng.
      */}
      <ScaleProvider>{children}</ScaleProvider>
    </SessionProvider>
  );
}

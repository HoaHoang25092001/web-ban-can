'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PRIMARY_PHONE, telHref, ZALO_URL } from '@/lib/site';

const PHONE_HREF = telHref(PRIMARY_PHONE);

/**
 * Thanh hành động cố định ở đáy màn hình điện thoại.
 *
 * Đo trên máy: vùng 2/3 dưới màn hình — nơi ngón cái với tới dễ nhất khi cầm
 * một tay — chỉ có 1 đến 8 nút bấm, trong khi hành động quan trọng nhất (gọi
 * báo giá) nằm tận trên đầu trang. Khách xem sản phẩm ở giữa trang muốn gọi
 * phải cuộn ngược lên đầu.
 *
 * Ba việc khách thực sự cần làm — gọi, nhắn Zalo, gửi yêu cầu — nay luôn nằm
 * trong tầm ngón cái ở mọi trang (tiêu chí 1, 3 & 6).
 *
 * Chỉ hiện trên điện thoại: từ `sm` trở lên màn hình đủ rộng để hotline nằm
 * sẵn trên header, thêm thanh này chỉ tổ che nội dung.
 */
export default function MobileActionBar() {
  const pathname = usePathname();

  // Khu vực quản trị có thanh công cụ riêng, không chèn thanh của trang bán hàng.
  if (pathname?.startsWith('/admin')) return null;

  const onContactPage = pathname === '/contact';

  return (
    <>
      {/* Khối đệm giữ chỗ: nếu không có, thanh cố định sẽ che mất phần cuối
          chân trang và khách không đọc được dòng cuối cùng. */}
      <div className="h-16 sm:hidden" aria-hidden="true" />

      <nav
        aria-label="Hành động nhanh"
        className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-surface-border shadow-[0_-2px_12px_rgba(15,23,42,0.08)]"
      >
        <ul className="grid grid-cols-3">
          <li>
            <a
              href={PHONE_HREF}
              className="flex flex-col items-center justify-center gap-0.5 min-h-[60px] text-accent-600 active:bg-accent-50 transition-colors"
            >
              <i className="ri-phone-fill text-xl" aria-hidden="true"></i>
              <span className="text-xs font-semibold">Gọi ngay</span>
              <span className="sr-only-text">Gọi hotline {PRIMARY_PHONE}</span>
            </a>
          </li>

          <li>
            <a
              href={ZALO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-0.5 min-h-[60px] text-[#0068FF] active:bg-blue-50 transition-colors border-x border-surface-border"
            >
              <i className="ri-chat-3-fill text-xl" aria-hidden="true"></i>
              <span className="text-xs font-semibold">Chat Zalo</span>
            </a>
          </li>

          <li>
            <Link
              href={onContactPage ? '#contact-form' : '/contact#contact-form'}
              className="flex flex-col items-center justify-center gap-0.5 min-h-[60px] text-brand-700 active:bg-brand-50 transition-colors"
            >
              <i className="ri-file-list-3-fill text-xl" aria-hidden="true"></i>
              <span className="text-xs font-semibold">Báo giá</span>
              <span className="sr-only-text">Gửi yêu cầu báo giá</span>
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}

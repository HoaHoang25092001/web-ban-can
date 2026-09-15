import Image from 'next/image';
import { BUSINESS, PRIMARY_PHONE, ZALO_URL } from '@/lib/site';

/**
 * Khối mã QR Zalo.
 *
 * Trên máy tính, khách không chat Zalo được bằng một cú bấm — họ phải mở điện
 * thoại ra tìm. Mã QR giải quyết đúng chỗ đó: quét là vào thẳng khung chat.
 * Trên điện thoại thì ngược lại, quét QR bằng chính máy đang xem là vô lý, nên
 * ở đó ưu tiên nút bấm mở Zalo trực tiếp (tiêu chí 1 & 6).
 *
 * Ảnh QR là file SVG tĩnh trong /public, sinh sẵn bằng
 * `node scripts/gen-zalo-qr.mjs` — chạy lại script đó mỗi khi đổi hotline.
 */
export default function ZaloQr({ className = '' }: { className?: string }) {
  return (
    <section className={`card p-6 ${className}`} aria-labelledby="zalo-qr-heading">
      <h2 id="zalo-qr-heading" className="text-xl font-bold text-slate-900 mb-1">
        Chat Zalo
      </h2>
      <p className="text-sm text-slate-500 mb-5">
        Nhắn tin để được báo giá nhanh trong giờ làm việc.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-5">
        {/* Khung QR: nền trắng cố định để mã luôn tương phản đủ cho máy quét,
            kể cả khi thiết bị đang ở chế độ tối. */}
        <div className="flex-shrink-0 rounded-card border border-surface-border bg-white p-2.5">
          <Image
            src={BUSINESS.zaloQr}
            alt={`Mã QR Zalo của ${BUSINESS.name} – quét để chat với hotline ${PRIMARY_PHONE}`}
            width={148}
            height={148}
            className="block w-[148px] h-[148px]"
          />
        </div>

        <div className="min-w-0 text-center sm:text-left">
          <p className="text-sm text-slate-600 leading-relaxed">
            <span className="hidden sm:inline">
              Dùng camera điện thoại quét mã bên cạnh để mở khung chat Zalo.
            </span>
            <span className="sm:hidden">
              Bấm nút bên dưới để mở Zalo ngay trên máy này.
            </span>
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Zalo số{' '}
            <span className="font-semibold text-slate-700 tabular-nums">{PRIMARY_PHONE}</span>
          </p>

          <a
            href={ZALO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center justify-center gap-2 min-h-touch px-5 rounded-control bg-[#0068FF] text-white font-semibold text-sm hover:bg-[#0055D4] transition-colors"
          >
            <i className="ri-chat-3-line text-base" aria-hidden="true"></i>
            Mở Zalo
          </a>
        </div>
      </div>
    </section>
  );
}

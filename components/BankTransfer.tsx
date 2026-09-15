'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BUSINESS, buildVietQrUrl, formatAccountNumber } from '@/lib/site';

/** Một dòng thông tin kèm nút sao chép (tiêu chí 8: giảm ma sát nhập liệu). */
function CopyRow({
  label,
  value,
  display,
  mono = false,
}: {
  label: string;
  value: string;
  display?: string;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      // Trả nhãn về trạng thái cũ để nút còn dùng lại được
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Trình duyệt cũ hoặc không cấp quyền clipboard — bỏ qua, khách vẫn đọc
      // được số trên màn hình để gõ tay.
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-surface-border last:border-0">
      <div className="min-w-0">
        <dt className="text-xs text-slate-500 mb-0.5">{label}</dt>
        <dd
          className={`font-semibold text-slate-900 break-words ${
            mono ? 'font-mono tabular-nums tracking-wide' : ''
          }`}
        >
          {display ?? value}
        </dd>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        /* aria-live để screen reader đọc lên khi sao chép xong */
        aria-label={`Sao chép ${label.toLowerCase()}`}
        className="flex-shrink-0 inline-flex items-center gap-1.5 min-h-touch px-3 rounded-control border border-surface-border text-sm font-medium text-brand-700 hover:bg-brand-50 transition-colors"
      >
        <i
          className={copied ? 'ri-check-line text-emerald-600' : 'ri-file-copy-line'}
          aria-hidden="true"
        ></i>
        <span className={copied ? 'text-emerald-700' : ''}>
          {copied ? 'Đã chép' : 'Chép'}
        </span>
      </button>
    </div>
  );
}

interface BankTransferProps {
  /** Tiêu đề khối, đổi được để phù hợp ngữ cảnh từng trang. */
  title?: string;
  /** Mô tả ngắn dưới tiêu đề. */
  description?: string;
  className?: string;
}

/**
 * Khối thông tin chuyển khoản kèm mã QR.
 *
 * Dùng chung ở trang Liên hệ và Hướng dẫn mua hàng để thông tin không bị chép
 * tay ở hai nơi rồi lệch nhau — mọi thay đổi chỉ sửa tại BUSINESS.bank.
 */
export default function BankTransfer({
  title = 'Thông tin chuyển khoản',
  description = 'Quét mã QR bằng app ngân hàng để điền sẵn thông tin, hoặc chuyển thủ công theo số tài khoản bên dưới.',
  className = '',
}: BankTransferProps) {
  const qrUrl = buildVietQrUrl();

  return (
    <section className={`card overflow-hidden ${className}`} aria-labelledby="bank-heading">
      <div className="px-6 pt-6 pb-4 border-b border-surface-border">
        <h2 id="bank-heading" className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
          <i className="ri-bank-line text-brand-600 text-2xl" aria-hidden="true"></i>
          {title}
        </h2>
        <p className="mt-1.5 text-sm text-slate-600 leading-relaxed max-w-prose">
          {description}
        </p>
      </div>

      {/* Hai cột: QR bên trái, thông tin bên phải. Dưới 640px xếp dọc. */}
      <div className="grid grid-cols-1 sm:grid-cols-[auto_minmax(0,1fr)] gap-6 p-6">

        {/* ── Mã QR ── */}
        <figure className="flex flex-col items-center">
          <div className="bg-white border-2 border-surface-border rounded-card p-3">
            {/* width/height cố định → không nhảy layout khi ảnh tải (tiêu chí 7) */}
            <Image
              src={qrUrl}
              alt={`Mã QR chuyển khoản tới ${BUSINESS.bank.accountHolder}, số tài khoản ${BUSINESS.bank.accountNumber} tại ${BUSINESS.bank.shortName}`}
              width={220}
              height={300}
              className="w-[200px] h-auto"
              unoptimized
            />
          </div>
          <figcaption className="mt-3 text-center">
            <span className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500">
              <i className="ri-qr-scan-2-line" aria-hidden="true"></i>
              Quét bằng app ngân hàng bất kỳ
            </span>
          </figcaption>
        </figure>

        {/* ── Thông tin tài khoản ── */}
        <div className="min-w-0">
          <dl>
            <CopyRow label="Ngân hàng" value={BUSINESS.bank.shortName} display={BUSINESS.bank.name} />
            <CopyRow
              label="Số tài khoản"
              value={BUSINESS.bank.accountNumber}
              display={formatAccountNumber(BUSINESS.bank.accountNumber)}
              mono
            />
            <CopyRow label="Chủ tài khoản" value={BUSINESS.bank.accountHolder} />
          </dl>

          {/* Hướng dẫn nội dung chuyển khoản — thiếu bước này thì kế toán khó
              đối soát, khách hay bị chậm xác nhận đơn (tiêu chí 8). */}
          <div className="mt-4 bg-brand-50 border border-brand-100 rounded-control p-4">
            <p className="text-sm text-brand-900 leading-relaxed">
              <strong className="font-semibold">Nội dung chuyển khoản:</strong> ghi rõ{' '}
              <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-brand-200">
                Họ tên + Số điện thoại
              </span>{' '}
              để chúng tôi xác nhận đơn hàng nhanh hơn.
            </p>
          </div>

          <p className="mt-3 text-xs text-slate-500 leading-relaxed">
            Sau khi chuyển khoản, vui lòng nhắn Zalo hoặc gọi hotline kèm ảnh biên lai để
            chúng tôi xác nhận và sắp lịch giao hàng.
          </p>
        </div>
      </div>
    </section>
  );
}

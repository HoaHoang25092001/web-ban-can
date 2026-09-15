import type { Metadata } from 'next';
import Link from 'next/link';
import { BUSINESS, PRIMARY_PHONE, ZALO_URL, telHref } from '@/lib/site';
import BankTransfer from '@/components/BankTransfer';

export const metadata: Metadata = {
  title: 'Hướng dẫn mua hàng & thanh toán',
  description: `Các bước đặt mua cân điện tử tại Cân Vạn Thịnh Phát: chọn sản phẩm, liên hệ nhận báo giá, thanh toán và nhận hàng. Hotline ${PRIMARY_PHONE}.`,
};

/** Các bước đặt hàng, đúng quy trình công bố trên canvanthinhphat.com */
const STEPS = [
  {
    title: 'Chọn sản phẩm theo danh mục',
    detail:
      'Truy cập mục Danh mục sản phẩm trên thanh điều hướng, chọn dòng cân phù hợp với nhu cầu sử dụng của bạn.',
  },
  {
    title: 'Xem kỹ thông tin sản phẩm',
    detail:
      'Đọc kỹ mức cân, bước nhảy, kích thước bàn cân và xuất xứ trên trang chi tiết để chắc chắn sản phẩm đáp ứng đúng công việc.',
  },
  {
    title: 'Liên hệ với chúng tôi',
    detail:
      'Gọi hotline, nhắn Zalo hoặc gửi biểu mẫu trên website. Vui lòng cung cấp: họ tên, số điện thoại, email và địa chỉ nhận hàng chính xác.',
  },
  {
    title: 'Nhận báo giá',
    detail:
      'Chúng tôi gửi báo giá kèm thông tin chi tiết sản phẩm qua điện thoại hoặc email trong giờ làm việc.',
  },
  {
    title: 'Xác nhận và nhận hàng',
    detail:
      'Sau khi bạn đồng ý báo giá, chúng tôi sắp lịch giao và lắp đặt. Nếu không thấy email báo giá, vui lòng kiểm tra thêm hộp thư rác (spam).',
  },
];

const PAYMENT_METHODS = [
  {
    icon: 'ri-hand-coin-line',
    title: 'Thanh toán khi nhận hàng',
    detail: 'Áp dụng trong khu vực TP. Hồ Chí Minh. Kiểm tra hàng trước khi thanh toán.',
  },
  {
    icon: 'ri-bank-line',
    title: 'Chuyển khoản ngân hàng',
    detail: 'Chuyển khoản trước khi giao hàng, áp dụng cho khách ở tỉnh.',
  },
  {
    icon: 'ri-bank-card-line',
    title: 'Nộp tiền tại ATM / quầy giao dịch',
    detail: 'Nộp vào tài khoản công ty và gửi lại ảnh biên lai để chúng tôi xác nhận.',
  },
];

export default function PurchaseGuidePage() {
  return (
    <div className="bg-surface-muted">
      {/* ── Hero: nói rõ trang này giúp gì (tiêu chí 1) ── */}
      <section className="bg-brand-700 text-white">
        <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <nav aria-label="Đường dẫn" className="mb-4 text-sm text-brand-200">
            <Link href="/" className="inline-flex items-center min-h-touch hover:text-white hover:underline">
              Trang chủ
            </Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-white">Hướng dẫn mua hàng</span>
          </nav>
          <div className="max-w-prose">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Hướng dẫn mua hàng &amp; thanh toán
            </h1>
            <p className="text-lg text-brand-100 leading-relaxed">
              Chỉ 5 bước để nhận báo giá và đặt mua cân điện tử. Cần hỗ trợ nhanh, bạn gọi
              hotline hoặc nhắn Zalo cho chúng tôi.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Nội dung chính ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Các bước đặt hàng */}
            <section className="card p-6 md:p-8" aria-labelledby="steps-heading">
              <h2 id="steps-heading" className="section-title mb-6">
                Các bước đặt hàng
              </h2>
              {/* Danh sách có thứ tự: đúng ngữ nghĩa cho quy trình từng bước */}
              <ol className="space-y-5">
                {STEPS.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span
                      className="flex-shrink-0 w-9 h-9 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center tabular-nums"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 pt-1">
                      <h3 className="font-semibold text-slate-900 mb-1">
                        <span className="sr-only-text">Bước {i + 1}: </span>
                        {step.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed max-w-prose">
                        {step.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* Hình thức thanh toán */}
            <section className="card p-6 md:p-8" aria-labelledby="payment-heading">
              <h2 id="payment-heading" className="section-title mb-6">
                Hình thức thanh toán
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {PAYMENT_METHODS.map((m) => (
                  <li key={m.title} className="border border-surface-border rounded-card p-4">
                    <span className="w-10 h-10 rounded-control bg-brand-50 text-brand-700 flex items-center justify-center mb-3">
                      <i className={`${m.icon} text-xl`} aria-hidden="true"></i>
                    </span>
                    <h3 className="font-semibold text-slate-900 text-sm mb-1">{m.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{m.detail}</p>
                  </li>
                ))}
              </ul>

            </section>

            {/* Khối chuyển khoản dùng chung với trang Liên hệ, kèm mã QR */}
            <BankTransfer />

            {/* Lưu ý quan trọng — minh bạch về giá (tiêu chí 9) */}
            <section className="card p-6 md:p-8" aria-labelledby="notes-heading">
              <h2 id="notes-heading" className="section-title mb-4">
                Lưu ý quan trọng
              </h2>
              <ul className="space-y-3">
                {[
                  `${BUSINESS.priceNote}. Chúng tôi báo giá cuối cùng đã gồm VAT khi bạn yêu cầu xuất hóa đơn.`,
                  'Chúng tôi không bán hàng tự động trực tuyến — mọi đơn hàng đều được tư vấn trực tiếp để chọn đúng loại cân.',
                  'Sản phẩm có tem kiểm định và giấy tờ nhập khẩu đầy đủ, xuất hóa đơn VAT theo yêu cầu.',
                  'Quà tặng kèm (nếu có) được ghi rõ trong báo giá.',
                ].map((note) => (
                  <li key={note} className="flex items-start gap-2.5">
                    <i
                      className="ri-information-line text-brand-600 text-lg flex-shrink-0 mt-0.5"
                      aria-hidden="true"
                    ></i>
                    <span className="text-slate-700 leading-relaxed">{note}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* ── Cột hỗ trợ ── */}
          <aside className="space-y-6">
            <section className="card p-6 lg:sticky lg:top-24" aria-labelledby="help-heading">
              <h2 id="help-heading" className="text-xl font-bold text-slate-900 mb-2">
                Cần hỗ trợ ngay?
              </h2>
              <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                Gọi trực tiếp để được tư vấn chọn đúng mức cân và nhận báo giá trong ngày.
              </p>

              <div className="space-y-3">
                <a href={telHref(PRIMARY_PHONE)} className="btn-primary w-full">
                  <i className="ri-phone-fill" aria-hidden="true"></i>
                  Gọi {PRIMARY_PHONE}
                </a>
                <a
                  href={ZALO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline w-full"
                >
                  <i className="ri-wechat-line" aria-hidden="true"></i>
                  Nhắn Zalo
                </a>
                <Link href="/contact" className="btn-ghost w-full border border-surface-border">
                  Gửi yêu cầu online
                </Link>
              </div>

              <dl className="mt-6 pt-5 border-t border-surface-border space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500 mb-0.5">Giờ làm việc</dt>
                  <dd className="text-slate-800">
                    {BUSINESS.openingHours.map((h) => (
                      <span key={h.label} className="block">
                        {h.label}: {h.time}
                      </span>
                    ))}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 mb-0.5">Địa chỉ</dt>
                  <dd className="text-slate-800 leading-relaxed">{BUSINESS.address.full}</dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

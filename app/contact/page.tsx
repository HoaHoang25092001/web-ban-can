import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';
import BankTransfer from '@/components/BankTransfer';
import ZaloQr from '@/components/ZaloQr';
import LazyMap from '@/components/LazyMap';
import { BUSINESS, PRIMARY_PHONE, telHref } from '@/lib/site';

const PHONES = BUSINESS.phones;
const EMAIL = BUSINESS.email;
const ADDRESS = BUSINESS.address.full;
const MAP_EMBED = BUSINESS.maps.embed;

export const metadata: Metadata = {
  title: 'Liên hệ & nhận báo giá',
  description: `Liên hệ Cân Vạn Thịnh Phát để được tư vấn chọn cân và nhận báo giá. Hotline ${PRIMARY_PHONE}, địa chỉ ${ADDRESS}`,
};

const contactItems = [
  {
    icon: 'ri-map-pin-2-line',
    label: 'Địa chỉ cửa hàng',
    content: <span className="text-slate-700">{ADDRESS}</span>,
  },
  {
    icon: 'ri-phone-line',
    label: 'Hotline',
    content: (
      <span className="flex flex-col gap-2">
        {PHONES.map((phone) => (
          <a
            key={phone}
            href={telHref(phone)}
            className="inline-flex items-center min-h-touch text-brand-700 font-semibold hover:underline w-fit"
          >
            {phone}
          </a>
        ))}
      </span>
    ),
  },
  {
    icon: 'ri-mail-line',
    label: 'Email',
    content: (
      <a href={`mailto:${EMAIL}`} className="inline-flex items-center min-h-touch text-brand-700 font-semibold hover:underline break-all">
        {EMAIL}
      </a>
    ),
  },
  {
    icon: 'ri-time-line',
    label: 'Giờ làm việc',
    content: (
      <span className="text-slate-700">
        {BUSINESS.openingHours.map((h) => (
          <span key={h.label} className="block">
            {h.label}: {h.time}
          </span>
        ))}
      </span>
    ),
  },
];

export default function ContactPage() {
  return (
    <div className="bg-surface-muted">
      {/* ── Hero: nói rõ trang này làm gì và hành động tiếp theo (tiêu chí 1) ── */}
      <section className="bg-brand-700 text-white">
        <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-prose">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Liên hệ &amp; nhận báo giá
            </h1>
            <p className="text-lg text-brand-100 leading-relaxed">
              Để lại thông tin, chúng tôi gọi lại tư vấn chọn đúng loại cân và gửi báo giá
              trong giờ làm việc. Cần gấp, bạn có thể gọi trực tiếp hotline.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={telHref(PRIMARY_PHONE)} className="btn-primary">
                <i className="ri-phone-fill" aria-hidden="true"></i>
                Gọi {PRIMARY_PHONE}
              </a>
              <a
                href="#contact-form"
                className="btn border-2 border-white text-white hover:bg-white hover:text-brand-700"
              >
                Gửi yêu cầu online
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Cột thông tin ── */}
          <div className="lg:col-span-2 space-y-6">
            <section className="card p-6" aria-labelledby="contact-info-heading">
              <h2 id="contact-info-heading" className="text-xl font-bold text-slate-900 mb-5">
                Thông tin liên hệ
              </h2>
              <dl className="space-y-5">
                {contactItems.map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <span className="w-10 h-10 rounded-control bg-brand-50 text-brand-700 flex items-center justify-center flex-shrink-0">
                      <i className={`${item.icon} text-lg`} aria-hidden="true"></i>
                    </span>
                    <div className="min-w-0">
                      <dt className="text-sm font-semibold text-slate-500 mb-0.5">{item.label}</dt>
                      <dd className="leading-relaxed">{item.content}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </section>

            <ZaloQr />

            <section className="card overflow-hidden" aria-labelledby="map-heading">
              <h2 id="map-heading" className="text-xl font-bold text-slate-900 px-6 pt-6 pb-4">
                Bản đồ đường đi
              </h2>
              {/* aspect-ratio cố định để iframe không gây nhảy layout (tiêu chí 7) */}
              <div className="px-6 pb-6">
                <LazyMap aspect="4/3" />
              </div>
            </section>
          </div>

          {/* ── Cột tác vụ: gửi yêu cầu, rồi thanh toán ── */}
          <div className="lg:col-span-3 space-y-6">
            <section id="contact-form" className="card p-6 md:p-8" aria-labelledby="form-heading">
              <h2 id="form-heading" className="text-xl font-bold text-slate-900 mb-1">
                Gửi yêu cầu tư vấn
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Các trường có dấu <span className="text-red-600 font-semibold">*</span> là bắt buộc.
              </p>
              <ContactForm />
            </section>

            <BankTransfer description="Đã chốt đơn và muốn thanh toán trước? Quét mã QR bằng app ngân hàng để điền sẵn thông tin, hoặc chuyển thủ công theo số tài khoản bên dưới." />
          </div>
        </div>
      </div>
    </div>
  );
}

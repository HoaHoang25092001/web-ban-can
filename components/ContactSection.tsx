import ContactForm from './ContactForm';
import { BUSINESS, telHref } from '@/lib/site';

// Server Component: phần thông tin là tĩnh, chỉ riêng form là client component.

const infoItems = [
  { icon: 'ri-map-pin-2-line', label: 'Địa chỉ', lines: [BUSINESS.address.full] },
  { icon: 'ri-phone-line', label: 'Điện thoại', lines: [...BUSINESS.phones], tel: true },
  { icon: 'ri-mail-line', label: 'Email', lines: [BUSINESS.email], mail: true },
  {
    icon: 'ri-time-line',
    label: 'Giờ làm việc',
    lines: BUSINESS.openingHours.map((h) => `${h.label}: ${h.time}`),
  },
];

/**
 * Khối liên hệ trên trang chủ.
 *
 * Lưu ý quan trọng: bản trước gửi dữ liệu khách hàng (tên, số điện thoại, email)
 * tới https://readdy.ai/api/form-submit — một dịch vụ bên ngoài — nên thông tin
 * không hề được lưu vào database của website. Nay dùng chung ContactForm, gửi về
 * /api/contacts và hiển thị trong trang quản trị.
 */
export default function ContactSection() {
  return (
    <section className="py-12" aria-labelledby="contact-section-heading">
      <div className="text-center mb-10">
        <h2 id="contact-section-heading" className="section-title">
          Nhận tư vấn &amp; báo giá
        </h2>
        <p className="section-subtitle mx-auto">
          Để lại thông tin, chúng tôi gọi lại để tư vấn loại cân phù hợp với nhu cầu của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* ── Thông tin liên hệ ── */}
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-6">Thông tin liên hệ</h3>
          <dl className="space-y-5">
            {infoItems.map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <span className="bg-brand-600 text-white w-11 h-11 rounded-control flex items-center justify-center flex-shrink-0">
                  <i className={`${item.icon} text-lg`} aria-hidden="true"></i>
                </span>
                <div className="min-w-0">
                  <dt className="font-semibold text-slate-900 mb-1">{item.label}</dt>
                  <dd className="text-slate-600 leading-relaxed flex flex-col gap-0.5">
                    {item.lines.map((line) =>
                      item.tel ? (
                        <a
                          key={line}
                          href={telHref(line)}
                          className="inline-flex items-center min-h-touch text-brand-700 font-semibold hover:underline w-fit"
                        >
                          {line}
                        </a>
                      ) : item.mail ? (
                        <a
                          key={line}
                          href={`mailto:${line}`}
                          className="inline-flex items-center min-h-touch text-brand-700 font-semibold hover:underline break-all w-fit"
                        >
                          {line}
                        </a>
                      ) : (
                        <span key={line}>{line}</span>
                      )
                    )}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        {/* ── Form ── */}
        <div className="card p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-1">Gửi yêu cầu</h3>
          <p className="text-sm text-slate-500 mb-6">
            Các trường có dấu <span className="text-red-600 font-semibold">*</span> là bắt buộc.
          </p>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

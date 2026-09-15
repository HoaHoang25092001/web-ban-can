import type { Metadata } from 'next';
import Link from 'next/link';
import { BUSINESS, PRIMARY_PHONE, telHref } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Câu hỏi thường gặp',
  description:
    'Giải đáp thắc mắc thường gặp khi mua cân điện tử: chọn mức cân, kiểm định, bảo hành, xuất hóa đơn VAT, giao lắp tận nơi.',
};

interface Faq {
  q: string;
  a: string;
}

const FAQ_GROUPS: { group: string; icon: string; items: Faq[] }[] = [
  {
    group: 'Chọn sản phẩm',
    icon: 'ri-scales-3-line',
    items: [
      {
        q: 'Tôi nên chọn mức cân bao nhiêu?',
        a: 'Chọn mức cân lớn hơn khối lượng nặng nhất bạn thường cân khoảng 20–30%. Ví dụ hàng nặng nhất 70kg thì nên chọn cân 100kg. Cân sát mức tối đa thường xuyên sẽ làm hỏng cảm biến và mất độ chính xác.',
      },
      {
        q: 'Bước nhảy (độ chính xác) là gì?',
        a: 'Bước nhảy là mức thay đổi nhỏ nhất mà cân hiển thị được. Cân 100kg bước nhảy 20g nghĩa là số hiển thị nhảy theo từng 20g. Cân càng lớn thì bước nhảy càng thô; muốn cân chính xác tới gram nên dùng cân kỹ thuật.',
      },
      {
        q: 'Cân dùng ngoài trời hoặc nơi ẩm ướt thì chọn loại nào?',
        a: 'Bạn cần dòng cân chống nước đạt chuẩn IP (thường IP65 trở lên), thân inox. Cân thường dùng ở nơi ẩm ướt sẽ hỏng bo mạch rất nhanh và không được bảo hành.',
      },
    ],
  },
  {
    group: 'Giá & thanh toán',
    icon: 'ri-money-dollar-circle-line',
    items: [
      {
        q: 'Vì sao website không hiện giá của một số sản phẩm?',
        a: 'Giá cân thay đổi theo mức cân, kích thước bàn cân và số lượng đặt. Chúng tôi báo giá trực tiếp để bạn nhận đúng mức giá tốt nhất cho cấu hình mình cần. Gọi hotline hoặc gửi yêu cầu, chúng tôi báo giá trong ngày làm việc.',
      },
      {
        q: 'Giá trên website đã bao gồm VAT chưa?',
        a: `${BUSINESS.priceNote}. Khi bạn cần xuất hóa đơn VAT, chúng tôi sẽ báo giá cuối cùng đã gồm thuế.`,
      },
      {
        q: 'Công ty có xuất hóa đơn VAT không?',
        a: `Có. Công ty có mã số thuế ${BUSINESS.taxCode} và xuất hóa đơn VAT đầy đủ theo yêu cầu. Vui lòng cung cấp thông tin xuất hóa đơn khi đặt hàng.`,
      },
      {
        q: 'Có những hình thức thanh toán nào?',
        a: 'Thanh toán khi nhận hàng (trong TP. Hồ Chí Minh), chuyển khoản ngân hàng, hoặc nộp tiền tại ATM/quầy giao dịch. Chi tiết xem tại trang Hướng dẫn mua hàng.',
      },
    ],
  },
  {
    group: 'Kiểm định & pháp lý',
    icon: 'ri-verified-badge-line',
    items: [
      {
        q: 'Cân có tem kiểm định không?',
        a: 'Có. Sản phẩm được kiểm định bởi cơ quan đo lường và có tem kiểm định hợp lệ. Cân dùng trong mua bán (cân siêu thị, cân tính tiền) bắt buộc phải có tem kiểm định còn hiệu lực.',
      },
      {
        q: 'Bao lâu phải kiểm định lại?',
        a: 'Theo quy định, cân dùng trong thương mại cần kiểm định lại định kỳ (thường 12 tháng/lần). Chúng tôi hỗ trợ khách hàng làm thủ tục kiểm định lại khi tới hạn.',
      },
    ],
  },
  {
    group: 'Giao hàng & bảo hành',
    icon: 'ri-truck-line',
    items: [
      {
        q: 'Bao lâu thì nhận được hàng?',
        a: 'Trong TP. Hồ Chí Minh: 24–48 giờ, có kỹ thuật viên giao và lắp đặt tận nơi. Các tỉnh lân cận: 2–3 ngày. Tỉnh xa: 3–7 ngày qua nhà xe.',
      },
      {
        q: 'Cân được bảo hành bao lâu?',
        a: 'Bảo hành 12 tháng kể từ ngày giao hàng cho lỗi kỹ thuật từ nhà sản xuất. Xem chi tiết điều kiện áp dụng tại trang Chính sách bảo hành.',
      },
      {
        q: 'Cân bị sai số, tôi phải làm gì?',
        a: `Gọi hotline ${PRIMARY_PHONE}, kỹ thuật viên sẽ hướng dẫn kiểm tra và hiệu chuẩn lại qua điện thoại trước. Phần lớn trường hợp sai số do đặt cân không cân bằng hoặc cần hiệu chuẩn lại, xử lý được ngay mà không cần mang máy đi.`,
      },
    ],
  },
];

export default function FaqPage() {
  // Structured data FAQ: giúp câu hỏi hiện trực tiếp trên kết quả Google
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_GROUPS.flatMap((g) =>
      g.items.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      }))
    ),
  };

  return (
    <div className="bg-surface-muted">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="bg-brand-700 text-white">
        <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <nav aria-label="Đường dẫn" className="mb-4 text-sm text-brand-200">
            <Link href="/" className="inline-flex items-center min-h-touch hover:text-white hover:underline">
              Trang chủ
            </Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-white">Câu hỏi thường gặp</span>
          </nav>
          <div className="max-w-prose">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Câu hỏi thường gặp</h1>
            <p className="text-lg text-brand-100 leading-relaxed">
              Những thắc mắc khách hàng hay hỏi nhất khi chọn mua cân điện tử.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {FAQ_GROUPS.map((group) => (
              <section key={group.group} aria-labelledby={`faq-${group.group}`}>
                <h2
                  id={`faq-${group.group}`}
                  className="flex items-center gap-2.5 text-xl font-bold text-slate-900 mb-4"
                >
                  <i className={`${group.icon} text-brand-600 text-2xl`} aria-hidden="true"></i>
                  {group.group}
                </h2>

                <div className="space-y-3">
                  {group.items.map((item) => (
                    /* <details> là phần tử HTML chuẩn cho nội dung đóng/mở:
                       hoạt động với bàn phím và screen reader mà không cần JS,
                       nên trang này vẫn là Server Component (tiêu chí 5 & 7). */
                    <details
                      key={item.q}
                      className="card group overflow-hidden [&[open]]:shadow-card-hover"
                    >
                      <summary className="flex items-center justify-between gap-4 min-h-touch px-5 py-4 cursor-pointer font-semibold text-slate-900 list-none">
                        <span>{item.q}</span>
                        <i
                          className="ri-add-line text-xl text-brand-600 flex-shrink-0 transition-transform group-open:rotate-45"
                          aria-hidden="true"
                        ></i>
                      </summary>
                      <div className="px-5 pb-5 -mt-1">
                        <p className="text-slate-600 leading-relaxed max-w-prose">{item.a}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside>
            <section className="card p-6 lg:sticky lg:top-24" aria-labelledby="ask-heading">
              <h2 id="ask-heading" className="text-xl font-bold text-slate-900 mb-2">
                Chưa tìm thấy câu trả lời?
              </h2>
              <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                Gọi hotline để được tư vấn trực tiếp, hoặc để lại thông tin chúng tôi gọi lại.
              </p>
              <a href={telHref(PRIMARY_PHONE)} className="btn-primary w-full mb-3">
                <i className="ri-phone-fill" aria-hidden="true"></i>
                Gọi {PRIMARY_PHONE}
              </a>
              <Link href="/contact" className="btn-outline w-full">
                Gửi câu hỏi
              </Link>

              <div className="mt-6 pt-5 border-t border-surface-border space-y-2 text-sm">
                <p className="font-semibold text-slate-900">Xem thêm</p>
                <Link
                  href="/huong-dan-mua-hang"
                  className="flex items-center min-h-touch text-brand-700 hover:underline"
                >
                  Hướng dẫn mua hàng
                </Link>
                <Link
                  href="/chinh-sach"
                  className="flex items-center min-h-touch text-brand-700 hover:underline"
                >
                  Chính sách bảo hành &amp; đổi trả
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

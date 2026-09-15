import type { Metadata } from 'next';
import Link from 'next/link';
import { BUSINESS, PRIMARY_PHONE, telHref } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Chính sách bảo hành, đổi trả & vận chuyển',
  description:
    'Chính sách bảo hành 12 tháng, đổi trả 15 ngày và giao lắp tận nơi của Cân Vạn Thịnh Phát. Điều kiện áp dụng và quy trình xử lý rõ ràng.',
};

const WARRANTY_COVERED = [
  'Lỗi bo mạch, màn hình hiển thị, phím bấm do nhà sản xuất',
  'Lỗi cảm biến (loadcell) trong điều kiện sử dụng đúng hướng dẫn',
  'Lỗi nguồn, sạc, pin đi kèm máy',
];

const WARRANTY_EXCLUDED = [
  'Cân quá tải trọng cho phép làm hỏng cảm biến',
  'Rơi vỡ, va đập mạnh, ngâm nước (trừ dòng cân chống nước đúng chuẩn IP)',
  'Tự ý tháo máy, sửa chữa ở nơi khác, mất tem bảo hành',
  'Hao mòn tự nhiên của pin, dây dẫn, mặt bàn cân',
];

const RETURN_CONDITIONS = [
  'Trong vòng 15 ngày kể từ ngày nhận hàng',
  'Sản phẩm còn nguyên tem, hộp và phụ kiện đi kèm',
  'Lỗi kỹ thuật do nhà sản xuất, không phải do sử dụng sai',
  'Có hóa đơn hoặc phiếu giao hàng của công ty',
];

export default function PolicyPage() {
  return (
    <div className="bg-surface-muted">
      <section className="bg-brand-700 text-white">
        <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <nav aria-label="Đường dẫn" className="mb-4 text-sm text-brand-200">
            <Link href="/" className="inline-flex items-center min-h-touch hover:text-white hover:underline">
              Trang chủ
            </Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-white">Chính sách bảo hành &amp; đổi trả</span>
          </nav>
          <div className="max-w-prose">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Chính sách bảo hành, đổi trả &amp; vận chuyển
            </h1>
            <p className="text-lg text-brand-100 leading-relaxed">
              Điều kiện áp dụng và quy trình xử lý được nêu rõ để bạn biết chính xác mình
              được hỗ trợ những gì.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">

            {/* ── Bảo hành ── */}
            <section className="card p-6 md:p-8" aria-labelledby="warranty-heading">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-11 h-11 rounded-control bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <i className="ri-shield-check-line text-xl" aria-hidden="true"></i>
                </span>
                <div>
                  <h2 id="warranty-heading" className="text-xl font-bold text-slate-900">
                    Bảo hành 12 tháng
                  </h2>
                  <p className="text-sm text-slate-500">Tính từ ngày giao hàng</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                    <i className="ri-check-line" aria-hidden="true"></i>
                    Được bảo hành
                  </h3>
                  <ul className="space-y-2">
                    {WARRANTY_COVERED.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                        <i className="ri-checkbox-circle-fill text-emerald-600 flex-shrink-0 mt-0.5" aria-hidden="true"></i>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  {/* Nói rõ trường hợp KHÔNG được bảo hành để khách không hiểu
                      nhầm rồi thất vọng về sau (tiêu chí 9: minh bạch). */}
                  <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <i className="ri-close-line" aria-hidden="true"></i>
                    Không áp dụng
                  </h3>
                  <ul className="space-y-2">
                    {WARRANTY_EXCLUDED.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                        <i className="ri-close-circle-fill text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true"></i>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-surface-border">
                <h3 className="font-semibold text-slate-900 mb-2">Quy trình bảo hành</h3>
                <ol className="space-y-1.5 text-sm text-slate-700 list-decimal ml-5 max-w-prose">
                  <li>Gọi hotline {PRIMARY_PHONE} mô tả tình trạng máy.</li>
                  <li>Kỹ thuật viên hướng dẫn xử lý qua điện thoại trước — nhiều lỗi khắc phục được ngay.</li>
                  <li>Nếu cần mang máy về, chúng tôi hẹn lịch tới lấy hoặc bạn gửi về địa chỉ công ty.</li>
                  <li>Thời gian sửa chữa thường 3–7 ngày làm việc tùy linh kiện.</li>
                </ol>
              </div>
            </section>

            {/* ── Đổi trả ── */}
            <section className="card p-6 md:p-8" aria-labelledby="return-heading">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-11 h-11 rounded-control bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
                  <i className="ri-refresh-line text-xl" aria-hidden="true"></i>
                </span>
                <div>
                  <h2 id="return-heading" className="text-xl font-bold text-slate-900">
                    Đổi trả trong 15 ngày
                  </h2>
                  <p className="text-sm text-slate-500">Miễn phí nếu lỗi do kỹ thuật</p>
                </div>
              </div>

              <h3 className="font-semibold text-slate-900 mb-3">Điều kiện đổi trả</h3>
              <ul className="space-y-2 mb-5">
                {RETURN_CONDITIONS.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                    <i className="ri-checkbox-circle-fill text-emerald-600 flex-shrink-0 mt-0.5" aria-hidden="true"></i>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="bg-amber-50 border border-amber-200 rounded-control p-4">
                <p className="text-sm text-amber-900 leading-relaxed">
                  <strong className="font-semibold">Lưu ý:</strong> Sản phẩm đặt theo yêu cầu
                  riêng (mức cân, kích thước bàn cân đặc biệt) không áp dụng đổi trả, trừ khi
                  có lỗi kỹ thuật từ nhà sản xuất.
                </p>
              </div>
            </section>

            {/* ── Vận chuyển & lắp đặt ── */}
            <section className="card p-6 md:p-8" aria-labelledby="shipping-heading">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-11 h-11 rounded-control bg-brand-50 text-brand-700 flex items-center justify-center flex-shrink-0">
                  <i className="ri-truck-line text-xl" aria-hidden="true"></i>
                </span>
                <h2 id="shipping-heading" className="text-xl font-bold text-slate-900">
                  Vận chuyển &amp; lắp đặt
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[480px]">
                  <caption className="sr-only-text">
                    Thời gian và chi phí giao hàng theo khu vực
                  </caption>
                  <thead>
                    <tr className="bg-surface-sunken text-left">
                      <th scope="col" className="px-4 py-3 font-semibold text-slate-900">Khu vực</th>
                      <th scope="col" className="px-4 py-3 font-semibold text-slate-900">Thời gian</th>
                      <th scope="col" className="px-4 py-3 font-semibold text-slate-900">Chi phí</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['TP. Hồ Chí Minh', '24 – 48 giờ', 'Miễn phí với đơn từ 3.000.000đ'],
                      ['Bình Dương, Đồng Nai, Long An', '2 – 3 ngày', 'Miễn phí với đơn từ 3.000.000đ'],
                      ['Các tỉnh còn lại', '3 – 7 ngày', 'Theo cước nhà xe, báo trước khi gửi'],
                    ].map(([area, time, cost]) => (
                      <tr key={area} className="border-t border-surface-border">
                        <th scope="row" className="px-4 py-3 font-semibold text-slate-900 text-left">
                          {area}
                        </th>
                        <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{time}</td>
                        <td className="px-4 py-3 text-slate-600">{cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-5 text-sm text-slate-600 leading-relaxed max-w-prose">
                Trong khu vực TP. Hồ Chí Minh, kỹ thuật viên giao máy, lắp đặt, hiệu chuẩn và
                hướng dẫn sử dụng trực tiếp. Khách ở tỉnh được hướng dẫn lắp đặt qua điện thoại
                hoặc video call.
              </p>
            </section>
          </div>

          {/* ── Cột hỗ trợ ── */}
          <aside>
            <section className="card p-6 lg:sticky lg:top-24" aria-labelledby="support-heading">
              <h2 id="support-heading" className="text-xl font-bold text-slate-900 mb-2">
                Cần bảo hành hoặc đổi trả?
              </h2>
              <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                Gọi hotline để được hướng dẫn xử lý nhanh nhất. Nhiều lỗi khắc phục được ngay
                qua điện thoại.
              </p>
              <a href={telHref(PRIMARY_PHONE)} className="btn-primary w-full mb-3">
                <i className="ri-phone-fill" aria-hidden="true"></i>
                Gọi {PRIMARY_PHONE}
              </a>
              <Link href="/contact" className="btn-outline w-full">
                Gửi yêu cầu online
              </Link>

              <div className="mt-6 pt-5 border-t border-surface-border text-sm">
                <p className="text-slate-500 mb-1">Địa chỉ nhận bảo hành</p>
                <p className="text-slate-800 leading-relaxed">{BUSINESS.address.full}</p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { BUSINESS, PRIMARY_PHONE, telHref } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Giới thiệu công ty',
  description:
    'Cân Vạn Thịnh Phát nhập khẩu và phân phối cân điện tử chính hãng YAOHUA, OHAUS, SHINKO, JADEVER. Bảo hành 12 tháng, lắp đặt và hiệu chuẩn tận nơi.',
};

const BRANDS = ['YAOHUA', 'OHAUS', 'SHINKO', 'JADEVER', 'SHIMADZU', 'METTLER'];

const PRODUCT_LINES = [
  { name: 'Cân bàn điện tử', range: '20kg – 500kg', use: 'Cửa hàng, kho nhỏ, xưởng sản xuất' },
  { name: 'Cân sàn điện tử', range: '300kg – 15 tấn', use: 'Kho hàng, cân pallet, có loại âm nền' },
  { name: 'Cân treo điện tử', range: '20kg – 300kg', use: 'Treo móc cẩu, cân hàng rời' },
  { name: 'Cân đếm điện tử', range: '3kg – 300kg', use: 'Đếm linh kiện, kiểm kho' },
  { name: 'Cân nhà bếp', range: '1g – 7,5kg', use: 'Nhà hàng, tiệm bánh, gia đình' },
  { name: 'Cân kỹ thuật', range: '120g – 3kg', use: 'Phòng thí nghiệm, tiệm vàng' },
  { name: 'Cân ô tô', range: '30 – 120 tấn', use: 'Trạm cân xe tải, nhà máy' },
  { name: 'Cân mảnh heo', range: '200kg – 5 tấn', use: 'Lò mổ, chế biến thực phẩm' },
  { name: 'Cân siêu thị', range: '6kg – 300kg', use: 'Bán lẻ, tính giá trực tiếp' },
  { name: 'Cân y tế', range: '100g – 20kg', use: 'Phòng khám, cân trẻ sơ sinh' },
];

/**
 * Dịch vụ công ty cung cấp, lấy từ trang giới thiệu canvanthinhphat.com.
 * Bản trước chỉ nói chung chung "nhập khẩu và phân phối" — bỏ sót mảng sản
 * xuất, gia công cơ khí và hiệu chuẩn mà công ty thực sự làm (tiêu chí 1).
 */
const SERVICES = [
  {
    icon: 'ri-tools-line',
    title: 'Sửa chữa & bảo trì',
    text: 'Sửa chữa mọi dòng cân điện tử, thay loadcell, đầu cân, sạc pin.',
  },
  {
    icon: 'ri-ruler-2-line',
    title: 'Hiệu chuẩn & kiểm định',
    text: 'Hiệu chuẩn tất cả các loại cân, hỗ trợ thủ tục kiểm định định kỳ.',
  },
  {
    icon: 'ri-hammer-line',
    title: 'Gia công cơ khí',
    text: 'Gia công bàn cân, khung cân theo kích thước khách hàng yêu cầu.',
  },
  {
    icon: 'ri-code-box-line',
    title: 'Phần mềm cân',
    text: 'Viết phần mềm quản lý cân theo đặc thù từng doanh nghiệp.',
  },
];

const VALUES = [
  {
    icon: 'ri-award-line',
    title: 'Linh kiện mới 100%',
    text: 'Nhập từ nhà sản xuất quốc tế đạt chứng nhận ISO 9001.',
  },
  {
    icon: 'ri-team-line',
    title: 'Kỹ thuật viên tay nghề cao',
    text: 'Hỗ trợ lắp đặt, hiệu chuẩn và sửa chữa tận nơi hoặc từ xa.',
  },
  {
    icon: 'ri-shield-check-line',
    title: 'Bảo hành 12 tháng',
    text: 'Chuyên viên tới tận nơi kiểm tra, đảm bảo máy hoạt động đúng chuẩn.',
  },
  {
    icon: 'ri-map-pin-line',
    title: 'Phục vụ toàn quốc',
    text: 'Giao hàng cả nước, lắp đặt tận nơi tại TP. Hồ Chí Minh và lân cận.',
  },
];

export default function IntroducePage() {
  return (
    <div className="bg-surface-muted">
      {/* ── Hero ── */}
      <section className="bg-brand-700 text-white">
        <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-prose">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {BUSINESS.legalName}
            </h1>
            <p className="text-lg text-brand-100 leading-relaxed">
              Sản xuất, nhập khẩu, thương mại và sửa chữa cân điện tử cùng thiết bị đo lường.
              Phục vụ nhà máy, xí nghiệp và cửa hàng trên toàn quốc với phương châm: uy tín,
              chất lượng, đảm bảo.
            </p>
            {/* Slogan chính thức của công ty (tiêu chí 1) */}
            <p className="mt-5 text-xl font-semibold text-white border-l-4 border-accent-600 pl-4">
              &ldquo;{BUSINESS.slogan}&rdquo;
            </p>
            <p className="mt-4 text-sm text-brand-200">
              Mã số thuế: <span className="font-mono tabular-nums">{BUSINESS.taxCode}</span>
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-12">

        {/* ── Thương hiệu phân phối ── */}
        <section aria-labelledby="brands-heading">
          <h2 id="brands-heading" className="section-title mb-4">
            Thương hiệu chúng tôi phân phối
          </h2>
          <ul className="flex flex-wrap gap-2">
            {BRANDS.map((brand) => (
              <li
                key={brand}
                className="px-4 py-2 bg-white border border-surface-border rounded-full text-sm font-semibold text-slate-700"
              >
                {brand}
              </li>
            ))}
          </ul>
        </section>

        {/* ── Dịch vụ cung cấp ── */}
        <section aria-labelledby="services-heading">
          <h2 id="services-heading" className="section-title mb-2">
            Dịch vụ chúng tôi cung cấp
          </h2>
          <p className="section-subtitle mb-6">
            Ngoài bán thiết bị, chúng tôi nhận sửa chữa, hiệu chuẩn và gia công theo yêu cầu.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICES.map((sv) => (
              <li key={sv.title} className="card p-5">
                <span className="w-11 h-11 rounded-control bg-accent-50 text-accent-700 flex items-center justify-center mb-3">
                  <i className={`${sv.icon} text-xl`} aria-hidden="true"></i>
                </span>
                <h3 className="font-semibold text-slate-900 mb-1">{sv.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{sv.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Vì sao chọn chúng tôi ── */}
        <section aria-labelledby="values-heading">
          <h2 id="values-heading" className="section-title mb-6">
            Vì sao khách hàng chọn chúng tôi
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {VALUES.map((value) => (
              <li key={value.title} className="card p-5 flex items-start gap-4">
                <span className="w-11 h-11 rounded-control bg-brand-50 text-brand-700 flex items-center justify-center flex-shrink-0">
                  <i className={`${value.icon} text-xl`} aria-hidden="true"></i>
                </span>
                <span>
                  <span className="block font-semibold text-slate-900 mb-1">{value.title}</span>
                  <span className="block text-sm text-slate-600 leading-relaxed">{value.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Dòng sản phẩm: bảng thay cho danh sách dài khó quét (tiêu chí 9) ── */}
        <section aria-labelledby="products-heading">
          <h2 id="products-heading" className="section-title mb-2">
            Các dòng cân chúng tôi cung cấp
          </h2>
          <p className="section-subtitle mb-6">
            Chưa rõ nên chọn loại nào? Gọi hotline để được tư vấn theo đúng nhu cầu sử dụng.
          </p>

          {/* Bảng cuộn ngang riêng, không làm trang bị cuộn ngang (tiêu chí 6) */}
          <div className="card overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <caption className="sr-only-text">
                Danh sách dòng cân, mức cân và mục đích sử dụng
              </caption>
              <thead>
                <tr className="bg-surface-sunken text-left">
                  <th scope="col" className="px-4 py-3 font-semibold text-slate-900">Dòng cân</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-slate-900">Mức cân</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-slate-900">Phù hợp với</th>
                </tr>
              </thead>
              <tbody>
                {PRODUCT_LINES.map((line) => (
                  <tr key={line.name} className="border-t border-surface-border">
                    <th scope="row" className="px-4 py-3 font-semibold text-slate-900 text-left">
                      {line.name}
                    </th>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{line.range}</td>
                    <td className="px-4 py-3 text-slate-600">{line.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Cơ quan quản lý: bằng chứng về tính pháp lý (tiêu chí 9) ── */}
        <section className="card p-6 md:p-8 bg-brand-50 border-brand-100" aria-labelledby="regulator-heading">
          <h2 id="regulator-heading" className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2.5">
            <i className="ri-government-line text-brand-700 text-2xl" aria-hidden="true"></i>
            Hoạt động dưới sự quản lý của
          </h2>
          <p className="text-sm text-slate-600 mb-4 max-w-prose">
            Thiết bị đo lường dùng trong mua bán bắt buộc phải có tem kiểm định hợp lệ.
            Chúng tôi chịu sự giám sát của:
          </p>
          <ul className="space-y-2">
            {BUSINESS.regulators.map((r) => (
              <li key={r} className="flex items-start gap-2.5 text-slate-800">
                <i className="ri-checkbox-circle-fill text-brand-600 flex-shrink-0 mt-1" aria-hidden="true"></i>
                <span className="leading-relaxed">{r}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Liên hệ + CTA ── */}
        <section className="card p-6 md:p-8" aria-labelledby="contact-heading">
          <h2 id="contact-heading" className="section-title mb-6">
            Thông tin liên hệ
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            <div>
              <dt className="text-sm font-semibold text-slate-500 mb-1">Địa chỉ</dt>
              <dd className="text-slate-800">
                {BUSINESS.address.full}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-slate-500 mb-1">Mã số thuế</dt>
              <dd className="text-slate-800 font-mono tabular-nums">{BUSINESS.taxCode}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-slate-500 mb-1">Hotline</dt>
              <dd className="flex flex-col gap-0.5">
                {BUSINESS.phones.map((phone) => (
                  <a
                    key={phone}
                    href={telHref(phone)}
                    className="inline-flex items-center min-h-touch text-brand-700 font-semibold hover:underline w-fit"
                  >
                    {phone}
                  </a>
                ))}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-slate-500 mb-1">Email</dt>
              <dd>
                <a
                  href={`mailto:${BUSINESS.email}`}
                  className="inline-flex items-center min-h-touch text-brand-700 font-semibold hover:underline break-all"
                >
                  {BUSINESS.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-slate-500 mb-1">Facebook</dt>
              <dd>
                <a
                  href={BUSINESS.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center min-h-touch text-brand-700 font-semibold hover:underline"
                >
                  Cân Vạn Thịnh Phát
                </a>
              </dd>
            </div>
          </dl>

          {/* Một CTA chính, nói rõ hành động tiếp theo (tiêu chí 1 & 8) */}
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="btn-primary">
              <i className="ri-mail-send-line" aria-hidden="true"></i>
              Gửi yêu cầu tư vấn
            </Link>
            <a href={telHref(PRIMARY_PHONE)} className="btn-outline">
              <i className="ri-phone-line" aria-hidden="true"></i>
              Gọi {PRIMARY_PHONE}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

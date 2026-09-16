/**
 * Thông tin doanh nghiệp – nguồn dữ liệu DUY NHẤT cho toàn site.
 *
 * Trước đây địa chỉ, hotline và email được chép tay ở Header, Footer, trang liên
 * hệ và trang giới thiệu, dẫn tới tình trạng mỗi nơi một địa chỉ khác nhau.
 * Mọi thay đổi thông tin công ty từ nay chỉ sửa tại file này.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://cangiare.com';

export const BUSINESS = {
  name: 'Cân Vạn Thịnh Phát',
  /** Tên pháp lý đầy đủ, đúng theo trang giới thiệu của canvanthinhphat.com */
  legalName:
    'Công ty TNHH Sản Xuất Thương Mại Dịch Vụ Cân Điện Tử Vạn Thịnh Phát',
  /** Mã số thuế — thông tin bắt buộc công bố, tăng độ tin cậy (tiêu chí 9) */
  taxCode: '0316441699',

  address: {
    street: '605 Quốc lộ 13',
    ward: 'Phường Hiệp Bình',
    city: 'TP. Hồ Chí Minh',
    country: 'Việt Nam',
    /** Địa chỉ đầy đủ một dòng, dùng để hiển thị. */
    full: '605 Quốc lộ 13, Phường Hiệp Bình, TP. Hồ Chí Minh, Việt Nam',
  },

  /**
   * Hotline chính của công ty, dùng cho nút gọi, link Zalo và mã QR Zalo.
   * Đổi số ở đây là toàn bộ website cập nhật theo; nhớ chạy lại
   * `node scripts/gen-zalo-qr.mjs` để sinh mã QR Zalo mới.
   */
  phones: ['0369.759.187'],

  email: 'canvanthinhphat@gmail.com',

  openingHours: [
    { label: 'Thứ 2 – Thứ 6', time: '8:00 – 17:30' },
    { label: 'Thứ 7', time: '8:00 – 12:00' },
  ],

  social: {
    facebook: 'https://www.facebook.com/share/199wuzrdpL/?mibextid=wwXIfr',
  },

  /**
   * Mã QR Zalo trỏ tới hotline chính.
   * File tĩnh sinh sẵn bằng `node scripts/gen-zalo-qr.mjs` — không gọi dịch
   * vụ QR bên ngoài lúc chạy nên không phụ thuộc mạng bên thứ ba (tiêu chí 7).
   * Chạy lại script này mỗi khi đổi hotline chính.
   */
  zaloQr: '/zalo-qr.svg',

  maps: {
    embed:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9735.328153114564!2d106.71712638288983!3d10.850012652328257!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175294ccb9340d5%3A0x8c132b508576bcf8!2zQ8OibiBW4bqhbiBUaOG7i25oIFBow6F0!5e1!3m2!1svi!2sus!4v1758380395114!5m2!1svi!2sus',
    directions:
      'https://www.google.com/maps/search/?api=1&query=605+Quoc+lo+13+Phuong+Hiep+Binh+TP+Ho+Chi+Minh',
  },

  /**
   * Thông tin chuyển khoản.
   * Chỉ hiển thị ở trang "Hướng dẫn mua hàng", KHÔNG để ở Footer mọi trang —
   * canvanthinhphat.com cũng không công bố công khai số tài khoản.
   */
  bank: {
    name: 'Ngân hàng TMCP Kỹ Thương Việt Nam (Techcombank)',
    shortName: 'Techcombank',
    accountNumber: '19036255538018',
    accountHolder: 'DANG QUANG THINH',
    /**
     * Mã ngân hàng theo chuẩn VietQR (Napas) — dùng để sinh ảnh QR động.
     * Sinh QR từ API thay vì nhúng ảnh tĩnh: khi đổi số tài khoản chỉ cần sửa
     * ở file này, mã QR tự cập nhật theo, không lo QR cũ trỏ sai tài khoản.
     */
    bin: '970407',
  },

  /** Số năm hoạt động, theo mô tả trên canvanthinhphat.com ("hơn 4 năm"). */
  yearsInBusiness: 4,

  /**
   * Lưu ý về giá, đúng theo chính sách công bố trên website công ty.
   * Phải nói rõ để khách không hiểu nhầm khi nhận báo giá (tiêu chí 9).
   */
  priceNote: 'Giá trên website chưa bao gồm VAT',

  /**
   * Slogan chính thức, lấy nguyên văn từ trang giới thiệu canvanthinhphat.com.
   * Nhấn vào ĐỘ CHÍNH XÁC — giá trị cốt lõi của ngành đo lường (tiêu chí 1).
   */
  slogan: 'Nói đến cân điện tử là nói đến độ chính xác',

  /**
   * Cơ quan quản lý giám sát hoạt động.
   * Nêu rõ giúp khách yên tâm về tính pháp lý của tem kiểm định (tiêu chí 9).
   */
  regulators: [
    'Chi cục Tiêu chuẩn Đo lường Chất lượng TP. Hồ Chí Minh',
    'Sở Khoa học và Công nghệ các tỉnh',
    'Tổng cục Tiêu chuẩn Đo lường Chất lượng Việt Nam',
  ],
} as const;

/** Hotline chính, dạng hiển thị: "0369.759.187". */
export const PRIMARY_PHONE = BUSINESS.phones[0];

/** Link chat Zalo dựng từ hotline chính. */
export const ZALO_URL = `https://zalo.me/${PRIMARY_PHONE.replace(/\./g, '')}`;

/** Chuyển "0369.759.187" thành "0369759187" để dùng trong href="tel:". */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/\./g, '')}`;
}

/**
 * Sinh ảnh mã QR chuyển khoản theo chuẩn VietQR / Napas 247.
 *
 * Khách quét mã bằng app ngân hàng là điền sẵn số tài khoản, tên người nhận và
 * (nếu truyền) cả số tiền + nội dung — giảm hẳn sai sót khi gõ tay 14 chữ số
 * (tiêu chí 8: giảm ma sát trong luồng tác vụ).
 *
 * Dùng API sinh ảnh động thay vì file ảnh tĩnh: đổi số tài khoản ở BUSINESS.bank
 * là QR tự đổi theo, tránh trường hợp ảnh QR cũ vẫn trỏ về tài khoản đã bỏ.
 */
export function buildVietQrUrl(options?: { amount?: number; message?: string }) {
  const { bin, accountNumber, accountHolder } = BUSINESS.bank;
  const params = new URLSearchParams();
  params.set('accountName', accountHolder);
  if (options?.amount) params.set('amount', String(options.amount));
  if (options?.message) params.set('addInfo', options.message);

  // "compact2" hiển thị kèm logo ngân hàng và thông tin tài khoản dưới mã QR
  return `https://img.vietqr.io/image/${bin}-${accountNumber}-compact2.png?${params.toString()}`;
}

/** Số tài khoản chia nhóm cho dễ đọc và dễ đối chiếu: 1903 6255 5380 18 */
export function formatAccountNumber(acc: string): string {
  return acc.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

/**
 * Structured data theo Schema.org.
 * Giúp Google hiển thị đúng địa chỉ, giờ mở cửa và số điện thoại ngay trên kết
 * quả tìm kiếm — tăng độ tin cậy và tỷ lệ nhấp (tiêu chí 9).
 */
export function buildLocalBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: BUSINESS.name,
    legalName: BUSINESS.legalName,
    url: SITE_URL,
    telephone: BUSINESS.phones.map((p) => p.replace(/\./g, '')),
    email: BUSINESS.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS.address.street,
      addressLocality: BUSINESS.address.ward,
      addressRegion: BUSINESS.address.city,
      addressCountry: 'VN',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '17:30',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '08:00',
        closes: '12:00',
      },
    ],
    sameAs: [BUSINESS.social.facebook],
    priceRange: 'VND',
    // Mã số thuế giúp Google xác thực đây là doanh nghiệp có đăng ký
    taxID: BUSINESS.taxCode,
    vatID: BUSINESS.taxCode,
  };
}

/**
 * Dữ liệu có cấu trúc cho một sản phẩm (schema.org/Product).
 *
 * Giúp Google hiển thị sản phẩm kèm ảnh và tình trạng hàng ngay trên trang
 * kết quả tìm kiếm, thay vì chỉ một dòng link chữ.
 *
 * Website không niêm yết giá công khai (khách phải liên hệ báo giá), nên KHÔNG
 * khai báo `price`. Khai giá sai hoặc giá bịa sẽ khiến Google gỡ toàn bộ
 * rich result của website — mất nhiều hơn được.
 */
export function buildProductJsonLd(product: {
  id: number | string;
  name: string;
  description?: string | null;
  image?: string | null;
  brand?: string | null;
  capacity?: string | null;
  categoryName?: string | null;
}) {
  const url = `${SITE_URL}/product/${product.id}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    url,
    ...(product.image ? { image: [product.image] } : {}),
    ...(product.description
      ? { description: product.description.replace(/<[^>]+>/g, '').slice(0, 300) }
      : {}),
    ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
    ...(product.categoryName ? { category: product.categoryName } : {}),
    ...(product.capacity
      ? {
          additionalProperty: [
            {
              '@type': 'PropertyValue',
              name: 'Mức cân tối đa',
              value: product.capacity,
            },
          ],
        }
      : {}),
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'VND',
      availability: 'https://schema.org/InStock',
      // Giá liên hệ: khai 0 để báo "có bán, hỏi giá" thay vì bịa một con số.
      price: '0',
      seller: { '@type': 'Organization', name: BUSINESS.name },
    },
  };
}

/**
 * Đường dẫn phân cấp (schema.org/BreadcrumbList).
 *
 * Google dùng nó để hiển thị "Trang chủ › Cân bàn › Tên sản phẩm" thay cho
 * đường link dài khó đọc, giúp khách biết mình sẽ vào đâu trước khi bấm.
 */
export function buildBreadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

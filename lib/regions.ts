/**
 * Đổi mã vùng của Vercel sang tên tỉnh/thành tiếng Việt.
 *
 * Vercel gửi kèm mỗi yêu cầu một mã vùng ngắn (header `x-vercel-ip-country-region`),
 * ví dụ "SG" nghĩa là TP.HCM. Mã này theo chuẩn ISO 3166-2, nhưng dùng ký hiệu
 * cũ của Việt Nam nên phải tra bảng mới ra tên đọc được.
 *
 * Bảng dịch để ngay trong mã nguồn thay vì gọi dịch vụ tra cứu bên ngoài: tra
 * IP theo từng lượt truy cập vừa tốn tiền vừa làm chậm trang, trong khi Vercel
 * đã cung cấp sẵn thông tin này miễn phí.
 */

/** Mã ISO 3166-2:VN → tên tỉnh/thành. */
const VN_REGIONS: Record<string, string> = {
  '01': 'Lai Châu', '02': 'Lào Cai', '03': 'Hà Giang', '04': 'Cao Bằng',
  '05': 'Sơn La', '06': 'Yên Bái', '07': 'Tuyên Quang', '09': 'Lạng Sơn',
  '13': 'Quảng Ninh', '14': 'Hòa Bình', '18': 'Ninh Bình', '20': 'Thái Bình',
  '21': 'Thanh Hóa', '22': 'Nghệ An', '23': 'Hà Tĩnh', '24': 'Quảng Bình',
  '25': 'Quảng Trị', '26': 'Thừa Thiên Huế', '27': 'Quảng Nam',
  '28': 'Kon Tum', '29': 'Quảng Ngãi', '30': 'Gia Lai', '31': 'Bình Định',
  '32': 'Phú Yên', '33': 'Đắk Lắk', '34': 'Khánh Hòa', '35': 'Lâm Đồng',
  '36': 'Ninh Thuận', '37': 'Tây Ninh', '39': 'Đồng Nai', '40': 'Bình Thuận',
  '41': 'Long An', '43': 'Bà Rịa - Vũng Tàu', '44': 'An Giang',
  '45': 'Đồng Tháp', '46': 'Tiền Giang', '47': 'Kiên Giang', '49': 'Vĩnh Long',
  '50': 'Bến Tre', '51': 'Trà Vinh', '52': 'Sóc Trăng', '53': 'Bắc Kạn',
  '54': 'Bắc Giang', '55': 'Bạc Liêu', '56': 'Bắc Ninh', '57': 'Bình Dương',
  '58': 'Bình Phước', '59': 'Cà Mau', '61': 'Hải Dương', '63': 'Hà Nam',
  '66': 'Hưng Yên', '67': 'Nam Định', '68': 'Phú Thọ', '69': 'Thái Nguyên',
  '70': 'Vĩnh Phúc', '71': 'Điện Biên', '72': 'Đắk Nông', '73': 'Hậu Giang',
  'CT': 'Cần Thơ', 'DN': 'Đà Nẵng', 'HN': 'Hà Nội', 'HP': 'Hải Phòng',
  'SG': 'TP. Hồ Chí Minh',
};

/** Tên nước cho vài quốc gia hay gặp; còn lại giữ nguyên mã. */
const COUNTRIES: Record<string, string> = {
  VN: 'Việt Nam', US: 'Hoa Kỳ', JP: 'Nhật Bản', KR: 'Hàn Quốc',
  CN: 'Trung Quốc', TH: 'Thái Lan', SG: 'Singapore', TW: 'Đài Loan',
  MY: 'Malaysia', KH: 'Campuchia', LA: 'Lào', AU: 'Úc', DE: 'Đức',
  FR: 'Pháp', GB: 'Anh', IN: 'Ấn Độ',
};

/**
 * Tên hiển thị cho một lượt truy cập.
 *
 * Khách trong nước → tên tỉnh. Khách nước ngoài → tên nước, vì biết "Hoa Kỳ"
 * hữu ích hơn nhiều so với biết đó là bang California.
 */
export function regionLabel(country?: string | null, region?: string | null): string {
  if (country === 'VN') {
    if (region && VN_REGIONS[region]) return VN_REGIONS[region];
    return 'Việt Nam (chưa rõ tỉnh)';
  }
  if (country) return COUNTRIES[country] ?? country;
  return 'Không xác định';
}

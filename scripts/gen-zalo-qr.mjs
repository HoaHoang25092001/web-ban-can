/**
 * Sinh mã QR Zalo thành file SVG tĩnh trong /public.
 *
 * Chạy: node scripts/gen-zalo-qr.mjs
 *
 * Sinh sẵn lúc build thay vì gọi dịch vụ QR bên ngoài lúc chạy: không phụ
 * thuộc mạng của bên thứ ba, không tốn thêm một lượt tải khi khách mở trang,
 * và QR vẫn hiện được cả khi dịch vụ kia sập (tiêu chí 7).
 *
 * SVG thay vì PNG vì mã QR là hình khối đặc — SVG nét căng ở mọi kích thước
 * mà chỉ nặng vài KB.
 */
import QRCode from 'qrcode';
import { writeFileSync } from 'node:fs';

const PHONE = '0911.093.511';
const ZALO_URL = `https://zalo.me/${PHONE.replace(/\./g, '')}`;

const svg = await QRCode.toString(ZALO_URL, {
  type: 'svg',
  errorCorrectionLevel: 'M',
  margin: 1,
  color: { dark: '#0F172A', light: '#FFFFFF' },
});

writeFileSync('public/zalo-qr.svg', svg, 'utf8');
console.log(`✓ public/zalo-qr.svg  →  ${ZALO_URL}`);

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
import { writeFileSync, readFileSync } from 'node:fs';

/*
 * Đọc hotline thẳng từ lib/site.ts để mã QR không bao giờ lệch với số hiển
 * thị trên website. Bản trước chép cứng số ở đây, nên đổi hotline trong
 * site.ts rồi chạy lại script này vẫn sinh ra QR trỏ về số CŨ mà không báo
 * lỗi gì — sai lặng lẽ, rất khó phát hiện.
 */
const siteSrc = readFileSync(new URL('../lib/site.ts', import.meta.url), 'utf8');
const phoneMatch = siteSrc.match(/phones:\s*\[\s*'([^']+)'/);
if (!phoneMatch) {
  console.error('Không đọc được số điện thoại từ lib/site.ts');
  process.exit(1);
}

const PHONE = phoneMatch[1];
const ZALO_URL = `https://zalo.me/${PHONE.replace(/\./g, '')}`;

const svg = await QRCode.toString(ZALO_URL, {
  type: 'svg',
  errorCorrectionLevel: 'M',
  margin: 1,
  color: { dark: '#0F172A', light: '#FFFFFF' },
});

writeFileSync('public/zalo-qr.svg', svg, 'utf8');
console.log(`✓ public/zalo-qr.svg  →  ${ZALO_URL}`);

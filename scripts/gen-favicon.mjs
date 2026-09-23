/**
 * Tạo favicon dạng PNG/ICO từ app/icon.svg.
 *
 *   node scripts/gen-favicon.mjs
 *
 * VÌ SAO CẦN: Google Search chỉ đọc được BMP, GIF, ICO, PNG, JPEG, PPM, TIFF
 * (developers.google.com/search/docs/appearance/favicon-in-search).
 * SVG KHÔNG nằm trong danh sách đó, nên site chỉ có icon.svg sẽ bị Google
 * thay bằng biểu tượng quả địa cầu mặc định trên trang kết quả tìm kiếm.
 *
 * Trình duyệt vẫn ưu tiên SVG (sắc nét ở mọi kích thước) — file SVG giữ
 * nguyên, các file dưới đây chỉ để phục vụ Google và các máy cũ.
 */
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';

const svg = readFileSync('app/icon.svg');

/* Google yêu cầu ảnh vuông, tối thiểu 8x8, khuyến nghị lớn hơn 48x48.
 * Dùng 512 cho bản chính: dư sức cho mọi bề mặt hiển thị, mà vẫn nhẹ. */
const SIZES = [
  { file: 'app/icon.png', size: 512, desc: 'bản chính cho Google' },
  { file: 'public/favicon-96.png', size: 96, desc: 'tab trình duyệt' },
];

for (const { file, size, desc } of SIZES) {
  await sharp(svg, { density: 384 })
    .resize(size, size, { fit: 'contain', background: { r: 13, g: 71, b: 161, alpha: 1 } })
    .png({ compressionLevel: 9 })
    .toFile(file);
  console.log(`  ✓ ${file.padEnd(26)} ${size}×${size}  (${desc})`);
}

/*
 * favicon.ico: định dạng cũ nhưng nhiều công cụ (và một số trình thu thập)
 * vẫn dò thẳng /favicon.ico ở thư mục gốc. Tự dựng theo cấu trúc ICO chuẩn,
 * nhúng một ảnh PNG 48x48 bên trong — ICO cho phép chứa PNG từ Windows Vista.
 */
const png48 = await sharp(svg, { density: 384 }).resize(48, 48).png({ compressionLevel: 9 }).toBuffer();

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);  // reserved
header.writeUInt16LE(1, 2);  // type 1 = icon
header.writeUInt16LE(1, 4);  // số ảnh chứa bên trong

const entry = Buffer.alloc(16);
entry.writeUInt8(48, 0);                 // rộng
entry.writeUInt8(48, 1);                 // cao
entry.writeUInt8(0, 2);                  // số màu (0 = ≥256)
entry.writeUInt8(0, 3);                  // reserved
entry.writeUInt16LE(1, 4);               // color planes
entry.writeUInt16LE(32, 6);              // bit mỗi điểm ảnh
entry.writeUInt32LE(png48.length, 8);    // kích thước dữ liệu ảnh
entry.writeUInt32LE(22, 12);             // vị trí dữ liệu (6 + 16)

writeFileSync('public/favicon.ico', Buffer.concat([header, entry, png48]));
console.log(`  ✓ public/favicon.ico        48×48   (${png48.length + 22} bytes)`);
console.log('\nXong. Nhớ khai báo trong metadata.icons của app/layout.tsx.');

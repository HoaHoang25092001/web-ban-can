/**
 * Tạo toàn bộ ảnh nhận diện từ logo VTP gốc của công ty.
 *
 *   node scripts/gen-logo.mjs <đường-dẫn-logo-gốc>
 *
 * Sinh ra:
 *   public/logo-vtp.png      logo ngang, dùng trên đầu trang
 *   app/icon.png             512×512 cho Google và thẻ chia sẻ
 *   public/favicon-96.png    96×96 cho tab trình duyệt
 *   public/favicon.ico       48×48 cho công cụ dò thẳng /favicon.ico
 *   app/apple-icon.png       180×180 cho màn hình chính iPhone/iPad
 *
 * VÌ SAO CẦN SCRIPT: ảnh gốc có viền trắng thừa rất rộng (logo thật chỉ chiếm
 * 1737×607 trong khung 1984×1248). Nếu thu nhỏ thẳng cả khung, logo sẽ bé tí
 * giữa một vùng trắng — trên tab trình duyệt 16px thì gần như không thấy gì.
 * Script cắt đúng vùng logo trước rồi mới thu nhỏ.
 */
import sharp from 'sharp';
import { writeFileSync } from 'fs';

const src = process.argv[2];
if (!src) {
  console.error('Thiếu đường dẫn logo.\n  Dùng: node scripts/gen-logo.mjs <đường-dẫn>');
  process.exit(1);
}

/**
 * Tìm vùng thật sự có hình, bỏ viền trắng quanh.
 *
 * Không dùng sharp.trim() vì nền ảnh gốc là trắng ngà (#f8f8f8) chứ không
 * phải trắng tuyệt đối, trim() với ngưỡng mặc định không nhận ra.
 */
async function findBounds(file) {
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * c;
      // Coi là nền nếu cả ba kênh đều rất sáng.
      if (!(data[i] > 235 && data[i + 1] > 235 && data[i + 2] > 235)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

const box = await findBounds(src);
console.log(`Vùng logo trong ảnh gốc: ${box.width}×${box.height} (cắt bỏ viền trắng)`);

/** Logo đã cắt sạch viền, dùng làm gốc cho mọi kích thước bên dưới. */
const cropped = await sharp(src).extract(box).png().toBuffer();

// 1. Logo ngang cho đầu trang — giữ nguyên tỷ lệ, chiều cao 160px là đủ sắc
//    cho màn hình Retina mà không nặng.
await sharp(cropped).resize({ height: 160 }).png({ compressionLevel: 9 })
  .toFile('public/logo-vtp.png');

/**
 * Các ảnh vuông.
 *
 * Google và trình duyệt đều yêu cầu ảnh VUÔNG. Logo hình bầu dục nằm ngang
 * nên phải chèn thêm nền hai bên trên dưới. Dùng nền TRẮNG thay vì trong
 * suốt: nền trong suốt sẽ thành đen trên tab chế độ tối, logo đỏ-vàng trên
 * nền đen nhìn bẩn.
 */
const SQUARE = [
  { file: 'app/icon.png', size: 512, desc: 'bản chính cho Google' },
  { file: 'public/favicon-96.png', size: 96, desc: 'tab trình duyệt' },
  { file: 'app/apple-icon.png', size: 180, desc: 'màn hình chính iPhone/iPad' },
];

for (const { file, size, desc } of SQUARE) {
  /*
   * Làm trong MỘT bước resize với `position: centre`.
   *
   * Bản trước resize xuống 88% rồi `extend` thêm viền 6% mỗi bên — nhưng
   * extend CỘNG THÊM vào kích thước đã có, nên 512 ra thành 574. Lệnh resize
   * cuối cũng không ép lại được vì đã qua extend. Đo ra mới thấy sai.
   *
   * Cách này cho sharp tự chèn nền quanh logo tới đúng kích thước đích.
   */
  await sharp(cropped)
    .resize(size, size, {
      fit: 'contain',
      position: 'centre',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png({ compressionLevel: 9 })
    .toFile(file);
  console.log(`  ✓ ${file.padEnd(24)} ${size}×${size}  (${desc})`);
}

/*
 * favicon.ico: định dạng cũ nhưng nhiều công cụ vẫn dò thẳng /favicon.ico ở
 * thư mục gốc. Tự dựng theo cấu trúc ICO chuẩn, nhúng một ảnh PNG 48×48 bên
 * trong — ICO cho phép chứa PNG từ Windows Vista trở đi.
 */
const png48 = await sharp(cropped)
  .resize(48, 48, { fit: 'contain', position: 'centre', background: { r: 255, g: 255, b: 255, alpha: 1 } })
  .png({ compressionLevel: 9 })
  .toBuffer();

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);   // reserved
header.writeUInt16LE(1, 2);   // type 1 = icon
header.writeUInt16LE(1, 4);   // số ảnh chứa bên trong

const entry = Buffer.alloc(16);
entry.writeUInt8(48, 0);                // rộng
entry.writeUInt8(48, 1);                // cao
entry.writeUInt8(0, 2);                 // số màu (0 = ≥256)
entry.writeUInt8(0, 3);                 // reserved
entry.writeUInt16LE(1, 4);              // color planes
entry.writeUInt16LE(32, 6);             // bit mỗi điểm ảnh
entry.writeUInt32LE(png48.length, 8);   // kích thước dữ liệu ảnh
entry.writeUInt32LE(22, 12);            // vị trí dữ liệu (6 + 16)

writeFileSync('public/favicon.ico', Buffer.concat([header, entry, png48]));
console.log(`  ✓ public/favicon.ico      48×48   (${png48.length + 22} bytes)`);

const logoMeta = await sharp('public/logo-vtp.png').metadata();
console.log(`  ✓ public/logo-vtp.png     ${logoMeta.width}×${logoMeta.height} (logo ngang cho đầu trang)`);
console.log('\nXong.');

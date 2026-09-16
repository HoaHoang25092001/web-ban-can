/**
 * Sao lưu TOÀN BỘ database ra một file JSON trước khi dọn dữ liệu.
 *
 * Chạy: node scripts/backup-before-reset.mjs
 *
 * File sinh ra chứa đầy đủ sản phẩm, danh mục, tin tức, đánh giá — kể cả
 * đường dẫn ảnh trên UploadThing. Giữ file này cẩn thận: nếu sau khi dọn mà
 * đổi ý, đây là cách duy nhất khôi phục lại 3.174 ảnh sản phẩm đã nhập từ
 * website cũ.
 */
import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'node:fs';

const prisma = new PrismaClient();

const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
const file = `backup-truoc-khi-don-${stamp}.json`;

const data = {
  taoLuc: new Date().toISOString(),
  ghiChu: 'Sao lưu đầy đủ trước khi dọn dữ liệu để chạy thật',
  categories: await prisma.category.findMany(),
  products: await prisma.product.findMany(),
  news: await prisma.news.findMany(),
  reviews: await prisma.review.findMany(),
  contactRequests: await prisma.contactRequest.findMany(),
  // KHÔNG sao lưu bảng admin: chứa mật khẩu đã băm, không nên để trong file rời.
};

writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');

const mb = (JSON.stringify(data).length / 1024 / 1024).toFixed(1);
console.log(`✓ Đã sao lưu: ${file}  (${mb} MB)`);
console.log(`  Sản phẩm: ${data.products.length}`);
console.log(`  Danh mục: ${data.categories.length}`);
console.log(`  Tin tức: ${data.news.length}`);
console.log(`  Đánh giá: ${data.reviews.length}`);
console.log('\n  GIỮ FILE NÀY. Đây là cách duy nhất khôi phục dữ liệu đã xoá.');

await prisma.$disconnect();

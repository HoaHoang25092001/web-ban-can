/**
 * Dọn dữ liệu để bắt đầu chạy thật.
 *
 *   node scripts/reset-data.mjs          → xem trước, KHÔNG xoá gì
 *   node scripts/reset-data.mjs --write  → thực hiện xoá
 *
 * Giữ lại:
 *   - Toàn bộ 15 danh mục (là khung điều hướng của website, xoá đi thì
 *     thanh menu và trang danh mục trống trơn)
 *   - Vài sản phẩm mẫu ở các danh mục chính, ưu tiên sản phẩm CÓ ẢNH
 *   - 6 đánh giá khách hàng (bạn không yêu cầu xoá)
 *   - Tài khoản quản trị
 *
 * Xoá:
 *   - Toàn bộ tin tức (69 bài gần giống nhau, Google coi là nội dung mỏng)
 *   - Các sản phẩm còn lại
 *   - Yêu cầu báo giá có tiền tố [THỬ] do script kiểm thử tạo
 *
 * Ảnh trên UploadThing KHÔNG bị xoá — chỉ mất liên kết trong database. Nếu cần
 * khôi phục, dùng file backup-truoc-khi-don-*.json.
 */
import { PrismaClient } from '@prisma/client';

const WRITE = process.argv.includes('--write');
const prisma = new PrismaClient();

// Mỗi danh mục này giữ lại 2 sản phẩm mẫu để kiểm tra giao diện.
const KEEP_PER_CATEGORY = 2;
const SAMPLE_CATEGORIES = [
  'Cân bàn điện tử',
  'Cân sàn điện tử',
  'Cân treo điện tử',
  'Cân tính tiền',
  'Cân ghế điện tử',
];

const categories = await prisma.category.findMany({ select: { id: true, name: true } });
const keepIds = [];

for (const catName of SAMPLE_CATEGORIES) {
  const cat = categories.find((c) => c.name === catName);
  if (!cat) continue;
  // Ưu tiên sản phẩm CÓ ẢNH: sản phẩm thiếu ảnh hiện ra ô xám, nhìn như lỗi.
  const picks = await prisma.product.findMany({
    where: { categoryId: cat.id, NOT: { image: null } },
    select: { id: true, name: true },
    orderBy: { createdAt: 'desc' },
    take: KEEP_PER_CATEGORY,
  });
  picks.forEach((p) => keepIds.push(p.id));
}

const totalProducts = await prisma.product.count();
const totalNews = await prisma.news.count();
const testContacts = await prisma.contactRequest.count({ where: { name: { startsWith: '[THỬ]' } } });

console.log(`${WRITE ? '═══ ĐANG XOÁ ═══' : '═══ XEM TRƯỚC (chưa xoá gì) ═══'}\n`);
console.log(`Sản phẩm:  ${totalProducts} → giữ lại ${keepIds.length}, xoá ${totalProducts - keepIds.length}`);
console.log(`Tin tức:   ${totalNews} → xoá tất cả`);
console.log(`Yêu cầu báo giá [THỬ]: ${testContacts} → xoá`);
console.log(`Danh mục:  ${categories.length} → giữ nguyên`);
console.log(`Đánh giá:  ${await prisma.review.count()} → giữ nguyên`);

if (!WRITE) {
  console.log('\nSản phẩm sẽ giữ lại:');
  for (const id of keepIds) {
    const p = await prisma.product.findUnique({ where: { id }, select: { name: true, category: { select: { name: true } } } });
    console.log(`  • [${p.category?.name}] ${p.name.slice(0, 50)}`);
  }
  console.log('\nThêm --write để thực hiện xoá.');
  await prisma.$disconnect();
  process.exit(0);
}

// ── Thực hiện xoá ──
const delNews = await prisma.news.deleteMany({});
console.log(`\n✓ Đã xoá ${delNews.count} bài tin tức`);

const delContacts = await prisma.contactRequest.deleteMany({ where: { name: { startsWith: '[THỬ]' } } });
console.log(`✓ Đã xoá ${delContacts.count} yêu cầu báo giá thử nghiệm`);

/*
 * Xoá sản phẩm theo từng lô 200.
 * Neon là Postgres serverless đặt tại Mỹ — một lệnh DELETE trên 3.200 hàng dễ
 * chạm giới hạn thời gian kết nối và đứt giữa chừng (lỗi P1017 từng gặp khi
 * nhập dữ liệu). Chia lô nhỏ thì chậm hơn một chút nhưng chắc chắn xong.
 */
let deleted = 0;
for (;;) {
  const batch = await prisma.product.findMany({
    where: { id: { notIn: keepIds } },
    select: { id: true },
    take: 200,
  });
  if (batch.length === 0) break;
  const r = await prisma.product.deleteMany({ where: { id: { in: batch.map((b) => b.id) } } });
  deleted += r.count;
  process.stdout.write(`\r  đang xoá sản phẩm... ${deleted}`);
}
console.log(`\r✓ Đã xoá ${deleted} sản phẩm                    `);

console.log('\n═══ CÒN LẠI ═══');
console.log(`  Sản phẩm: ${await prisma.product.count()}`);
console.log(`  Danh mục: ${await prisma.category.count()}`);
console.log(`  Tin tức:  ${await prisma.news.count()}`);
console.log(`  Đánh giá: ${await prisma.review.count()}`);
console.log(`  Yêu cầu báo giá: ${await prisma.contactRequest.count()}`);

await prisma.$disconnect();

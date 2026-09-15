/**
 * Đánh dấu "nổi bật" cho một số sản phẩm để trang chủ có nội dung hiển thị.
 *
 * Chạy:  node scripts/set-featured.mjs [--per-category=N]
 *
 * Ưu tiên sản phẩm ĐÃ CÓ ẢNH — trang chủ là nơi khách nhìn đầu tiên, card
 * không ảnh trông như lỗi hiển thị (tiêu chí 3 & 9).
 *
 * Chạy lại được nhiều lần: mỗi lần sẽ bỏ đánh dấu cũ rồi chọn lại, nên sau khi
 * tải thêm ảnh có thể chạy lại để thay bằng sản phẩm có ảnh.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const flag = process.argv.find((a) => a.startsWith('--per-category='));
const PER_CATEGORY = flag ? parseInt(flag.split('=')[1]) : 8;

const categories = await prisma.category.findMany({
  select: { id: true, name: true },
  orderBy: { name: 'asc' },
});

// Bỏ đánh dấu cũ để lần chạy sau luôn cho kết quả nhất quán
await prisma.product.updateMany({ where: { featured: true }, data: { featured: false } });

let total = 0;
for (const cat of categories) {
  // Chỉ lấy sản phẩm có ảnh; danh mục nào chưa có ảnh nào thì bỏ qua
  const picks = await prisma.product.findMany({
    where: { categoryId: cat.id, image: { not: null } },
    select: { id: true },
    orderBy: { createdAt: 'desc' },
    take: PER_CATEGORY,
  });

  if (picks.length === 0) {
    console.log(`  ${cat.name}: chưa có sản phẩm nào có ảnh, bỏ qua`);
    continue;
  }

  await prisma.product.updateMany({
    where: { id: { in: picks.map((p) => p.id) } },
    data: { featured: true },
  });
  total += picks.length;
  console.log(`  ${cat.name}: ${picks.length} sản phẩm`);
}

console.log(`\nĐã đánh dấu nổi bật ${total} sản phẩm.`);
await prisma.$disconnect();

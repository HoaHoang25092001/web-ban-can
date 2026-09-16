import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
// Nhân bản sản phẩm trong danh mục 17 để đủ dữ liệu kiểm thử phân trang
const src = await p.product.findMany({ where: { categoryId: 17, NOT: { image: null } }, take: 6 });
let n = 0;
for (let i = 0; i < 20; i++) {
  const s = src[i % src.length];
  await p.product.create({
    data: {
      name: `[KIỂM THỬ ${i + 1}] ${s.name.slice(0, 40)}`,
      description: s.description, capacity: s.capacity, accuracy: s.accuracy,
      price: s.price, image: s.image, images: s.images, categoryId: 17,
      manufacturer: s.manufacturer, origin: s.origin,
    },
  });
  n++;
}
console.log(`Đã tạo ${n} sản phẩm kiểm thử. Danh mục 17 giờ có: ${await p.product.count({ where: { categoryId: 17 } })}`);
await p.$disconnect();

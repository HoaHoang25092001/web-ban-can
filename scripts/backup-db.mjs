import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'fs';
const prisma = new PrismaClient();
const data = {
  exportedAt: new Date().toISOString(),
  categories: await prisma.category.findMany(),
  products: await prisma.product.findMany(),
  news: await prisma.news.findMany(),
  reviews: await prisma.review.findMany(),
  contacts: await prisma.contactRequest.findMany(),
};
const f = `backup-${Date.now()}.json`;
writeFileSync(f, JSON.stringify(data, null, 2));
console.log('Đã sao lưu vào', f);
console.log('  danh mục:', data.categories.length, '| sản phẩm:', data.products.length,
            '| tin tức:', data.news.length, '| đánh giá:', data.reviews.length, '| liên hệ:', data.contacts.length);
await prisma.$disconnect();

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
await prisma.$connect();
const time = async (label, fn) => {
  const t = Date.now(); await fn();
  const ms = Date.now() - t;
  console.log(`  ${label.padEnd(40)} ${String(ms).padStart(5)}ms ${ms > 800 ? '← CHẬM' : ''}`);
};
console.log('=== Sau khi tối ưu ===');
await time('news list (chỉ cột cần)', async () => {
  await Promise.all([
    prisma.news.findMany({ where:{published:true}, take:6,
      select:{id:true,title:true,excerpt:true,image:true,createdAt:true,updatedAt:true},
      orderBy:{createdAt:'desc'} }),
    prisma.news.count({ where:{published:true} }),
  ]);
});
await time('category 24 sp + count', async () => {
  await Promise.all([
    prisma.product.findMany({ where:{categoryId:12}, take:24,
      select:{id:true,name:true,capacity:true,accuracy:true,price:true,image:true,featured:true},
      orderBy:[{image:{sort:'desc',nulls:'last'}},{createdAt:'desc'}] }),
    prisma.product.count({ where:{categoryId:12} }),
  ]);
});
await time('sitemap gộp 1 truy vấn', async () => {
  await prisma.$queryRaw`
    SELECT 'category' AS kind, id, "updatedAt" AS updated_at FROM categories
    UNION ALL SELECT 'product', id, "updatedAt" FROM products
    UNION ALL SELECT 'news', id, "updatedAt" FROM news WHERE published = true`;
});
await prisma.$disconnect();

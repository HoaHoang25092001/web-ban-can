import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
await prisma.$connect();
// Một truy vấn khởi động để loại thời gian bắt tay kết nối khỏi phép đo
await prisma.$queryRaw`SELECT 1`;

const bench = async (label, fn, runs = 3) => {
  const times = [];
  for (let i = 0; i < runs; i++) {
    const t = Date.now(); await fn(); times.push(Date.now() - t);
  }
  const min = Math.min(...times);
  console.log(`  ${label.padEnd(36)} ${times.map(t=>String(t).padStart(5)).join(' ')} ms  (tốt nhất ${min}ms)`);
};

console.log('=== Đo khi kết nối đã sẵn sàng (3 lần mỗi truy vấn) ===');
await bench('news list', async () => {
  await Promise.all([
    prisma.news.findMany({ where:{published:true}, take:6,
      select:{id:true,title:true,excerpt:true,image:true,createdAt:true,updatedAt:true},
      orderBy:{createdAt:'desc'} }),
    prisma.news.count({ where:{published:true} }),
  ]);
});
await bench('news list GỘP 1 truy vấn', async () => {
  await prisma.$queryRaw`
    SELECT id, title, excerpt, image, "createdAt", "updatedAt",
           COUNT(*) OVER() AS total
    FROM news WHERE published = true
    ORDER BY "createdAt" DESC LIMIT 6`;
});
await bench('category 24 sp', async () => {
  await Promise.all([
    prisma.product.findMany({ where:{categoryId:12}, take:24,
      select:{id:true,name:true,capacity:true,accuracy:true,price:true,image:true,featured:true},
      orderBy:[{image:{sort:'desc',nulls:'last'}},{createdAt:'desc'}] }),
    prisma.product.count({ where:{categoryId:12} }),
  ]);
});
await prisma.$disconnect();

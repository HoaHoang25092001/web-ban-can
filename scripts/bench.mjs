import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const time = async (label, fn) => {
  const t = Date.now();
  const r = await fn();
  console.log(`  ${label.padEnd(34)} ${((Date.now()-t)/1000).toFixed(2)}s`);
  return r;
};
await prisma.$connect();
console.log('=== Đo từng truy vấn của /api/products ===');
await time('findMany 15 sp + category', () =>
  prisma.product.findMany({ include:{category:true}, take:15, orderBy:{createdAt:'desc'} }));
await time('count (toàn bảng)', () => prisma.product.count());
await time('count featured', () => prisma.product.count({ where:{featured:true} }));
await time('queryRaw array_length images', () =>
  prisma.$queryRaw`SELECT COUNT(*)::bigint AS count FROM products WHERE array_length(images, 1) > 1`);
await prisma.$disconnect();

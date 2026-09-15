import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const time = async (label, fn) => {
  const t = Date.now(); const r = await fn();
  console.log(`  ${label.padEnd(36)} ${((Date.now()-t)/1000).toFixed(2)}s`);
  return r;
};
await prisma.$connect();
console.log('=== Các truy vấn của trang chủ ===');
const t0 = Date.now();
await Promise.all([
  time('products featured (72)', () => prisma.product.findMany({
    where:{featured:true, image:{not:null}}, take:72,
    select:{id:true,name:true,capacity:true,accuracy:true,price:true,image:true,featured:true,categoryId:true,category:{select:{id:true,name:true}}},
    orderBy:{createdAt:'desc'} })),
  time('news', () => prisma.news.findMany({ where:{published:true}, take:6,
    select:{id:true,title:true,content:true,excerpt:true,image:true,createdAt:true}, orderBy:{createdAt:'desc'} })),
  time('reviews', () => prisma.review.findMany({ where:{isVisible:true}, take:20,
    select:{id:true,reviewerName:true,content:true,rating:true,isVisible:true,createdAt:true}, orderBy:{createdAt:'desc'} })),
  time('categories', () => prisma.category.findMany({ select:{id:true,name:true}, orderBy:{name:'asc'} })),
]);
console.log(`  ${'TỔNG (chạy song song)'.padEnd(36)} ${((Date.now()-t0)/1000).toFixed(2)}s`);
await prisma.$disconnect();

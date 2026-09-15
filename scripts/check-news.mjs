import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const total = await prisma.news.count();
const pub = await prisma.news.count({ where: { published: true } });
console.log(`Tổng: ${total} bài | Đã xuất bản: ${pub}`);

const items = await prisma.news.findMany({
  select: { id:true, title:true, excerpt:true, content:true, createdAt:true, image:true },
  orderBy: { createdAt: 'desc' }, take: 5,
});
console.log('\n=== 5 bài mới nhất ===');
items.forEach(n => {
  console.log(`\n  ${n.title.slice(0,70)}`);
  console.log(`    ${n.createdAt.toISOString().slice(0,10)} | ${n.content.length} ký tự | ảnh: ${n.image ? 'có' : 'chưa'}`);
  console.log(`    tóm: ${(n.excerpt||'').slice(0,90)}`);
});

// Tóm tắt có thực sự khác nhau không?
const all = await prisma.news.findMany({ select: { excerpt: true } });
const uniq = new Set(all.map(x => (x.excerpt||'').slice(0,60)));
console.log(`\nSố tóm tắt khác nhau: ${uniq.size}/${all.length}`);
await prisma.$disconnect();

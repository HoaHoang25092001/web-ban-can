import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
try {
  const withImg = await prisma.product.count({ where: { image: { not: null } } });
  const total = await prisma.product.count();
  console.log(`Có ảnh: ${withImg}/${total}`);
  const s = await prisma.product.findFirst({ where: { image: { not: null } }, select: { id:true, name:true, image:true } });
  if (s) {
    console.log('\nMẫu:', s.name.slice(0,50));
    console.log('URL :', s.image);
    const r = await fetch(s.image, { signal: AbortSignal.timeout(30000) });
    console.log('Tải thử:', r.status, r.headers.get('content-type'), r.headers.get('content-length'), 'bytes');
  }
} finally { await prisma.$disconnect(); }

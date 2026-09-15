import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// Postgres có extension unaccent để bỏ dấu — kiểm tra có bật được không
try {
  await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS unaccent');
  console.log('✓ Đã bật extension unaccent');
  const r = await prisma.$queryRawUnsafe(`SELECT unaccent('Cân Bàn Điện Tử') AS kq`);
  console.log('  Thử bỏ dấu:', r[0].kq);
} catch (e) {
  console.log('✗ Không bật được unaccent:', e.message.split('\n')[0]);
}
await prisma.$disconnect();

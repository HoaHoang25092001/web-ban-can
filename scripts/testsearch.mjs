import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
for (const q of ['can', 'cân', 'Cân bàn', 'can ban', 'A12E', 'yaohua']) {
  const n = await prisma.product.count({
    where: { OR: [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ]},
  });
  console.log(`  "${q}"`.padEnd(14), '→', n, 'kết quả');
}
await prisma.$disconnect();

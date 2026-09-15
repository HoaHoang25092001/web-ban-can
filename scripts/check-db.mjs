import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
try {
  const [c, p] = await Promise.all([prisma.category.count(), prisma.product.count()]);
  console.log('Tổng: ', c, 'danh mục |', p, 'sản phẩm');
  const cats = await prisma.category.findMany({
    select: { id: true, name: true, _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  });
  console.log('\n=== Danh mục ===');
  cats.forEach(x => console.log(' ', String(x._count.products).padStart(5), '|', x.name, `(id ${x.id})`));
  const sample = await prisma.product.findFirst({ include: { category: true } });
  console.log('\n=== Sản phẩm mẫu ===');
  console.log('  tên     :', sample.name.slice(0, 70));
  console.log('  danh mục:', sample.category.name);
  console.log('  mức cân :', sample.capacity, '| hãng:', sample.manufacturer);
  console.log('  có ảnh  :', sample.image ? 'có' : 'CHƯA (nhập ở bước sau)');
} finally { await prisma.$disconnect(); }

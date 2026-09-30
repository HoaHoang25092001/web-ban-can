/**
 * Thêm dữ liệu MẪU cho một tài khoản cân điện tử, để xem thử giao diện.
 *
 *   node scripts/seed-scale-demo.mjs <tên-đăng-nhập>
 *   node scripts/seed-scale-demo.mjs <tên-đăng-nhập> --clear
 *
 * Mặt hàng và nhân viên đều có tiền tố "[MẪU]" để phân biệt với dữ liệu thật
 * và xoá đi dễ dàng. Bản ghi cân trải trên nhiều ngày để thử được bộ lọc theo
 * khoảng thời gian.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const MARK = '[MẪU]';

const username = process.argv[2];
if (!username || username.startsWith('--')) {
  console.error('Thiếu tên đăng nhập.\n  Dùng: node scripts/seed-scale-demo.mjs <tên-đăng-nhập>');
  await prisma.$disconnect();
  process.exit(1);
}

const user = await prisma.scaleUser.findUnique({ where: { username } });
if (!user) {
  console.error(`Không tìm thấy tài khoản "${username}".`);
  await prisma.$disconnect();
  process.exit(1);
}

if (process.argv.includes('--clear')) {
  const r = await prisma.weighingRecord.deleteMany({
    where: { userId: user.id, productName: { startsWith: MARK } },
  });
  const p = await prisma.scaleProduct.deleteMany({
    where: { userId: user.id, name: { startsWith: MARK } },
  });
  const e = await prisma.scaleEmployee.deleteMany({
    where: { userId: user.id, name: { startsWith: MARK } },
  });
  console.log(`✓ Đã xoá ${r.count} bản ghi, ${p.count} mặt hàng, ${e.count} nhân viên mẫu.`);
  await prisma.$disconnect();
  process.exit(0);
}

// Không tạo trùng nếu chạy lại nhiều lần.
const existing = await prisma.scaleProduct.count({
  where: { userId: user.id, name: { startsWith: MARK } },
});
if (existing > 0) {
  console.log(`Đã có sẵn ${existing} mặt hàng mẫu — bỏ qua để không tạo trùng.`);
  console.log(`Muốn tạo lại: node scripts/seed-scale-demo.mjs ${username} --clear`);
  await prisma.$disconnect();
  process.exit(0);
}

const PRODUCTS = [
  { code: 'G01', name: 'Gạo ST25 bao 50kg' },
  { code: 'G02', name: 'Gạo nếp cái hoa vàng' },
  { code: 'C01', name: 'Cà phê nhân Robusta' },
  { code: 'T01', name: 'Tiêu đen khô' },
  { code: 'D01', name: 'Điều thô chưa bóc' },
];

const EMPLOYEES = [
  { code: 'NV01', name: 'Nguyễn Văn Ba' },
  { code: 'NV02', name: 'Trần Thị Tư' },
  { code: 'NV03', name: 'Lê Văn Năm' },
];

const products = [];
for (const p of PRODUCTS) {
  products.push(
    await prisma.scaleProduct.create({
      data: { code: p.code, name: `${MARK} ${p.name}`, userId: user.id },
    })
  );
}
for (const e of EMPLOYEES) {
  await prisma.scaleEmployee.create({
    data: { code: e.code, name: `${MARK} ${e.name}`, userId: user.id },
  });
}

/* Trải bản ghi trên 12 ngày gần đây để thử được bộ lọc theo khoảng ngày.
 * Khối lượng lẻ ba số để thấy rõ định dạng số trong bảng và tệp Excel. */
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(8 + (n % 9), (n * 7) % 60, 0, 0);
  return d;
};

const RECORDS = [
  { p: 0, w: 1250.5,  e: 0, n: 'Xe tải 51C-123.45', d: 0 },
  { p: 0, w: 980.25,  e: 0, n: null,                d: 0 },
  { p: 1, w: 640.75,  e: 1, n: 'Hàng xuất kho',     d: 1 },
  { p: 2, w: 2100,    e: 2, n: 'Lô nhập buổi sáng', d: 2 },
  { p: 2, w: 1875.5,  e: 2, n: null,                d: 2 },
  { p: 3, w: 320.125, e: 1, n: 'Cân lại lần 2',     d: 4 },
  { p: 4, w: 4500,    e: 0, n: 'Giao cho đại lý',   d: 7 },
  { p: 0, w: 1100,    e: 2, n: null,                d: 9 },
  { p: 1, w: 755.5,   e: 1, n: 'Hàng tồn',          d: 12 },
];

for (const r of RECORDS) {
  const prod = products[r.p];
  await prisma.weighingRecord.create({
    data: {
      productCode: prod.code,
      productName: prod.name,
      weight: r.w,
      unit: 'kg',
      employeeName: `${MARK} ${EMPLOYEES[r.e].name}`,
      note: r.n,
      weighedAt: daysAgo(r.d),
      userId: user.id,
      productId: prod.id,
    },
  });
}

const total = RECORDS.reduce((s, r) => s + r.w, 0);
console.log(`✓ Đã thêm cho tài khoản "${user.fullName}" (${username}):`);
console.log(`    ${PRODUCTS.length} mặt hàng`);
console.log(`    ${EMPLOYEES.length} nhân viên`);
console.log(`    ${RECORDS.length} bản ghi cân, tổng ${total.toLocaleString('vi-VN')} kg`);
console.log(`\n  Xem tại: /can-dien-tu/ban-ghi`);
console.log(`  Xoá đi : node scripts/seed-scale-demo.mjs ${username} --clear`);

await prisma.$disconnect();

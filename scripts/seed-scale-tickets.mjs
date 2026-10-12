/**
 * Thêm khách hàng và phiếu cân MẪU cho một tài khoản cân điện tử, để thử
 * màn hình Phiếu cân, Khách hàng và trang in.
 *
 *   node scripts/seed-scale-tickets.mjs <tên-đăng-nhập>
 *   node scripts/seed-scale-tickets.mjs <tên-đăng-nhập> --clear
 *
 * Mọi thứ đều có tiền tố "[MẪU]" (tên khách, tên hàng) để phân biệt với dữ
 * liệu thật và xoá đi dễ dàng. Phiếu trải trên nhiều ngày, đủ cả xuất/nhập,
 * đang cân/đã xong, có khách lẻ — để thử bộ lọc và mọi trạng thái nút bấm.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const MARK = '[MẪU]';

const username = process.argv[2];
if (!username || username.startsWith('--')) {
  console.error('Thiếu tên đăng nhập.\n  Dùng: node scripts/seed-scale-tickets.mjs <tên-đăng-nhập>');
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
  // Lượt cân tự xoá theo phiếu (onDelete: Cascade).
  const t = await prisma.scaleTicket.deleteMany({
    where: { userId: user.id, customerName: { startsWith: MARK } },
  });
  const c = await prisma.scaleCustomer.deleteMany({
    where: { userId: user.id, name: { startsWith: MARK } },
  });
  const p = await prisma.scaleProduct.deleteMany({
    where: { userId: user.id, code: { in: PRODUCT_CODES() } },
  });
  console.log(`✓ Đã xoá ${t.count} phiếu, ${c.count} khách hàng, ${p.count} mặt hàng mẫu.`);
  await prisma.$disconnect();
  process.exit(0);
}

function PRODUCT_CODES() {
  return ['TS01', 'TS02', 'TS03', 'GC01', 'GC02'];
}

const existing = await prisma.scaleTicket.count({
  where: { userId: user.id, customerName: { startsWith: MARK } },
});
if (existing > 0) {
  console.log(`Đã có sẵn ${existing} phiếu mẫu — bỏ qua để không tạo trùng.`);
  console.log(`Muốn tạo lại: node scripts/seed-scale-tickets.mjs ${username} --clear`);
  await prisma.$disconnect();
  process.exit(0);
}

/* Hàng tươi sống đựng khay — đúng kiểu hàng trên mẫu phiếu của khách, để
 * cột số khay và trừ bì có số liệu thật mà nhìn. */
const PRODUCTS = [
  { code: 'TS01', name: 'Cá tra phi lê', unitPrice: 42000 },
  { code: 'TS02', name: 'Tôm thẻ loại 1', unitPrice: 165000 },
  { code: 'TS03', name: 'Mực ống', unitPrice: 128500 },
  { code: 'GC01', name: 'Gà ta làm sẵn', unitPrice: 70000 },
  { code: 'GC02', name: 'Vịt xiêm', unitPrice: 45500 },
];

const CUSTOMERS = [
  { name: 'Chị Hoa – vựa cá Bến Tre', phone: '0909 123 456', address: '12 Lê Lợi, P. Bến Nghé, Q.1, TP.HCM', note: 'Giao trước 6 giờ sáng' },
  { name: 'Nhà hàng Hải Sản Biển Đông', phone: '0283 822 1199', address: '45 Nguyễn Huệ, Q.1, TP.HCM', note: null },
  { name: 'Anh Tâm – chợ Bình Điền', phone: '0918 777 321', address: 'Lô C12, chợ Bình Điền, Q.8, TP.HCM', note: 'Hay lấy khay nhựa xanh' },
  { name: 'Cơ sở chế biến Phước Lộc', phone: '0372 456 789', address: 'KCN Tân Tạo, Bình Tân, TP.HCM', note: null },
];

const products = [];
for (const p of PRODUCTS) {
  products.push(
    await prisma.scaleProduct.upsert({
      where: { userId_code: { userId: user.id, code: p.code } },
      update: { unitPrice: p.unitPrice },
      create: { code: p.code, name: `${MARK} ${p.name}`, unitPrice: p.unitPrice, userId: user.id },
    })
  );
}

// Mã khách nối tiếp mã KH lớn nhất đang có, như cách hệ thống tự đánh mã.
const khRows = await prisma.scaleCustomer.findMany({
  where: { userId: user.id, code: { startsWith: 'KH' } },
  select: { code: true },
});
let khMax = khRows.reduce((m, r) => Math.max(m, Number(r.code.slice(2)) || 0), 0);

const customers = [];
for (const c of CUSTOMERS) {
  khMax += 1;
  customers.push(
    await prisma.scaleCustomer.create({
      data: {
        code: `KH${String(khMax).padStart(5, '0')}`,
        name: `${MARK} ${c.name}`,
        phone: c.phone,
        address: c.address,
        note: c.note,
        userId: user.id,
      },
    })
  );
}

/** Giờ Việt Nam, n ngày trước, lúc h:m. */
const vnTime = (daysAgo, h, m) => {
  const vnNow = new Date(Date.now() + 7 * 3600_000);
  const d = new Date(Date.UTC(vnNow.getUTCFullYear(), vnNow.getUTCMonth(), vnNow.getUTCDate() - daysAgo, h - 7, m));
  return d;
};

/** Cùng công thức với lib/scale-ticket.ts — trừ bì, TL hàng, thành tiền. */
const round3 = (v) => Math.round(v * 1000) / 1000;
const line = (pi, gross, trays, trayWeight = 0.8, price) => {
  const p = products[pi];
  const unitPrice = price ?? p.unitPrice ?? 0;
  const tareWeight = round3(trays * trayWeight);
  const netWeight = round3(gross - tareWeight);
  return {
    productCode: p.code,
    productName: p.name,
    grossWeight: gross,
    trayCount: trays,
    trayWeight,
    tareWeight,
    netWeight,
    unitPrice,
    amount: Math.round(netWeight * unitPrice),
  };
};

/* c: chỉ số khách (null = khách lẻ gõ tay), d: số ngày trước. */
const TICKETS = [
  {
    c: 0, d: 0, h: 5, m: 40, type: 'XUAT', status: 'OPEN', plate: '71C-123.45', driver: 'Anh Tư',
    lines: [line(0, 12.3, 1), line(0, 15.05, 2), line(0, 11.75, 1)],
  },
  {
    c: 1, d: 0, h: 7, m: 15, type: 'XUAT', status: 'DONE', plate: '51D-678.90', driver: 'Lê Văn Sáu', note: 'Giao cổng sau nhà hàng',
    lines: [line(1, 8.6, 1), line(1, 9.15, 1), line(2, 6.4, 1), line(2, 7.05, 1), line(1, 10.2, 1, 0.8, 160000)],
  },
  {
    c: 2, d: 1, h: 4, m: 50, type: 'XUAT', status: 'DONE', plate: '62C-045.12', driver: 'Trần Văn Bảy',
    lines: [
      line(3, 13.4, 1), line(3, 14.25, 1), line(4, 9.4, 1), line(3, 12.85, 1),
      line(4, 10.1, 1), line(3, 15.3, 2), line(4, 8.95, 1), line(3, 11.6, 1),
    ],
  },
  {
    c: 3, d: 2, h: 9, m: 5, type: 'NHAP', status: 'DONE', plate: '61H-222.33', driver: 'Nguyễn Văn Tám', note: 'Hàng nhập từ ao Phước Lộc',
    lines: [line(0, 48.5, 4, 1.2, 38000), line(0, 51.2, 4, 1.2, 38000), line(0, 47.9, 4, 1.2, 38000)],
  },
  {
    c: null, name: 'Khách lẻ – cô Ba', d: 3, h: 6, m: 20, type: 'XUAT', status: 'DONE',
    lines: [line(3, 3.25, 0), line(4, 2.6, 0)],
  },
  {
    c: 0, d: 5, h: 5, m: 10, type: 'XUAT', status: 'DONE', plate: '71C-123.45', driver: 'Anh Tư',
    lines: [line(0, 20.4, 2), line(0, 19.85, 2), line(2, 7.3, 1), line(0, 21.1, 2)],
  },
  {
    c: 1, d: 8, h: 7, m: 30, type: 'XUAT', status: 'DONE', plate: '51D-678.90', driver: 'Lê Văn Sáu',
    lines: [line(1, 6.75, 1), line(2, 5.9, 1)],
  },
];

const last = await prisma.scaleTicket.findFirst({
  where: { userId: user.id },
  orderBy: { ticketNo: 'desc' },
  select: { ticketNo: true },
});
let no = last?.ticketNo ?? 0;

// Tạo theo thứ tự thời gian để số phiếu tăng dần theo ngày, như thực tế.
const ordered = [...TICKETS].sort((a, b) => b.d - a.d || a.h * 60 + a.m - (b.h * 60 + b.m));
let totalAmount = 0;
for (const t of ordered) {
  const c = t.c === null ? null : customers[t.c];
  const createdAt = vnTime(t.d, t.h, t.m);
  no += 1;
  await prisma.scaleTicket.create({
    data: {
      ticketNo: no,
      type: t.type,
      status: t.status,
      customerId: c?.id ?? null,
      customerName: c?.name ?? `${MARK} ${t.name}`,
      customerPhone: c?.phone ?? null,
      customerAddress: c?.address ?? null,
      driverName: t.driver ?? null,
      vehiclePlate: t.plate ?? null,
      note: t.note ?? null,
      createdAt,
      completedAt: t.status === 'DONE' ? new Date(createdAt.getTime() + 40 * 60_000) : null,
      userId: user.id,
      lines: {
        create: t.lines.map((l, i) => ({ ...l, weighedAt: new Date(createdAt.getTime() + (i + 1) * 90_000) })),
      },
    },
  });
  totalAmount += t.lines.reduce((s, l) => s + l.amount, 0);
}

console.log(`✓ Đã thêm cho tài khoản "${user.fullName}" (${username}):`);
console.log(`    ${PRODUCTS.length} mặt hàng có đơn giá`);
console.log(`    ${CUSTOMERS.length} khách hàng`);
console.log(`    ${TICKETS.length} phiếu cân (số ${no - TICKETS.length + 1}–${no}), ${TICKETS.reduce((s, t) => s + t.lines.length, 0)} lượt cân, tổng ${totalAmount.toLocaleString('vi-VN')} đ`);
console.log(`\n  Xem tại: /can-dien-tu/phieu  và  /can-dien-tu/khach-hang`);
console.log(`  Xoá đi : node scripts/seed-scale-tickets.mjs ${username} --clear`);

await prisma.$disconnect();

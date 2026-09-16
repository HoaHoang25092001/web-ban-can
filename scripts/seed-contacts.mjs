/**
 * Tạo vài yêu cầu báo giá MẪU để thử luồng xử lý phía quản trị.
 *
 * Cách dùng:
 *   node scripts/seed-contacts.mjs          → thêm dữ liệu mẫu
 *   node scripts/seed-contacts.mjs --clear  → xoá sạch dữ liệu mẫu
 *
 * Tên khách đều kèm tiền tố "[THỬ]" và số điện thoại dùng dải 0900000xxx không
 * có thật, để không bao giờ nhầm với yêu cầu thật của khách và gọi nhầm.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const MARK = '[THỬ]';

const minutesAgo = (m) => new Date(Date.now() - m * 60_000);

const SAMPLES = [
  {
    name: `${MARK} Nguyễn Văn Hùng`,
    phone: '0900000111',
    email: 'hung.kho@example.com',
    product: 'Xin báo giá',
    message:
      'Cần báo giá cân bàn 100kg cho kho hàng ở Thủ Đức. Có cần kiểm định không, ' +
      'và bao lâu thì giao được ạ?',
    status: 'new',
    createdAt: minutesAgo(25),
  },
  {
    name: `${MARK} Trần Thị Mai`,
    phone: '0900000222',
    email: null,
    product: 'Bảo hành, sửa chữa',
    message:
      'Cân sàn 2 tấn bên em mua năm ngoái đang báo sai số. Bên mình có nhận ' +
      'sửa tận nơi ở Bình Dương không?',
    status: 'processing',
    note: 'Đã gọi lúc 9h, khách hẹn mang cân qua cửa hàng chiều thứ 5.',
    createdAt: minutesAgo(60 * 26),
  },
];

if (process.argv.includes('--clear')) {
  const r = await prisma.contactRequest.deleteMany({
    where: { name: { startsWith: MARK } },
  });
  console.log(`✓ Đã xoá ${r.count} yêu cầu mẫu.`);
  console.log(`  Còn lại ${await prisma.contactRequest.count()} yêu cầu trong hệ thống.`);
  await prisma.$disconnect();
  process.exit(0);
}

// Không tạo trùng nếu chạy script nhiều lần.
const existing = await prisma.contactRequest.count({
  where: { name: { startsWith: MARK } },
});
if (existing > 0) {
  console.log(`Đã có sẵn ${existing} yêu cầu mẫu — bỏ qua để không tạo trùng.`);
  console.log('Muốn tạo lại: node scripts/seed-contacts.mjs --clear rồi chạy lại.');
  await prisma.$disconnect();
  process.exit(0);
}

for (const s of SAMPLES) {
  await prisma.contactRequest.create({ data: s });
  console.log(`  + ${s.name} (${s.phone}) — ${s.status}`);
}

console.log(`\n✓ Đã thêm ${SAMPLES.length} yêu cầu mẫu.`);
console.log('  Xem tại: /admin/contacts');
console.log('  Xoá đi:  node scripts/seed-contacts.mjs --clear');

await prisma.$disconnect();

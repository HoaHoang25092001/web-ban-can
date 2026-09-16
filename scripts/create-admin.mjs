/**
 * Tạo hoặc đổi mật khẩu tài khoản quản trị.
 *
 * Cách dùng:
 *   node scripts/create-admin.mjs <email> <mật khẩu> ["Tên hiển thị"]
 *
 * Ví dụ:
 *   node scripts/create-admin.mjs canvanthinhphat@gmail.com "MatKhauManh#2026" "Quản trị viên"
 *
 * Mật khẩu được băm bằng bcrypt trước khi lưu — database không bao giờ chứa
 * mật khẩu dạng đọc được. Nếu email đã tồn tại thì script đổi mật khẩu cho
 * tài khoản đó thay vì tạo trùng.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const [email, password, name] = process.argv.slice(2);

if (!email || !password) {
  console.error('Thiếu tham số.\n');
  console.error('  node scripts/create-admin.mjs <email> <mật khẩu> ["Tên hiển thị"]\n');
  process.exit(1);
}

if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error(`Email không hợp lệ: ${email}`);
  process.exit(1);
}

if (password.length < 10) {
  console.error('Mật khẩu phải dài ít nhất 10 ký tự.');
  console.error('Đây là tài khoản nắm toàn bộ dữ liệu khách hàng — đừng dùng mật khẩu ngắn.');
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const hashed = await bcrypt.hash(password, 10);
  const existing = await prisma.admin.findUnique({ where: { email } });

  if (existing) {
    await prisma.admin.update({
      where: { email },
      data: { password: hashed, ...(name ? { name } : {}) },
    });
    console.log(`✓ Đã đổi mật khẩu cho tài khoản: ${email}`);
  } else {
    await prisma.admin.create({
      data: { email, password: hashed, name: name || 'Quản trị viên' },
    });
    console.log(`✓ Đã tạo tài khoản quản trị: ${email}`);
  }

  const total = await prisma.admin.count();
  console.log(`  Hiện có ${total} tài khoản quản trị.`);
  console.log('  Đăng nhập tại: /admin/login');
} catch (err) {
  console.error('Lỗi:', err.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}

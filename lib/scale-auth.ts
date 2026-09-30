import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Xác định khách hàng đang đăng nhập ở phần cân điện tử.
 *
 * ĐÂY LÀ CHỐT CHẶN DUY NHẤT cho việc cách ly dữ liệu giữa các khách. Mọi
 * truy vấn trong khu /can-dien-tu đều phải lấy id từ hàm này rồi lọc theo nó,
 * TUYỆT ĐỐI không nhận id khách từ địa chỉ trang hay biểu mẫu — khách chỉ cần
 * sửa một con số trên thanh địa chỉ là đọc được dữ liệu của người khác.
 *
 * Trả `null` khi: chưa đăng nhập, đăng nhập bằng tài khoản quản trị website
 * (không phải tài khoản cân), hoặc tài khoản đã bị khoá.
 */
export async function getScaleUser() {
  const session = await getServerSession(authOptions);

  // Phải đúng loại 'scale'. Tài khoản quản trị website không được dùng khu này.
  if (!session?.user?.id || session.user.kind !== 'scale') return null;

  const id = Number(session.user.id);
  if (!Number.isInteger(id) || id <= 0) return null;

  /*
   * Đọc lại từ database mỗi lần thay vì tin vào phiên đăng nhập.
   *
   * Phiên có hạn dùng nhiều ngày; nếu chủ shop khoá tài khoản hôm nay mà chỉ
   * kiểm tra lúc đăng nhập, khách vẫn dùng tiếp tới khi phiên hết hạn.
   */
  const user = await prisma.scaleUser.findFirst({
    where: { id, isActive: true },
    select: { id: true, username: true, fullName: true },
  });

  return user;
}

/**
 * Chặn truy cập API của phần cân khi chưa đăng nhập.
 *
 * Dùng ở đầu mỗi route:
 *
 *   const user = await getScaleUser();
 *   if (!user) return unauthorizedScale();
 */
export function unauthorizedScale() {
  return NextResponse.json(
    { error: 'Bạn cần đăng nhập để sử dụng phần cân điện tử' },
    { status: 401 }
  );
}

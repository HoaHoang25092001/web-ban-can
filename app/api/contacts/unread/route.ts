import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';

export const dynamic = 'force-dynamic';

/**
 * Đếm số yêu cầu báo giá CHƯA xử lý.
 *
 * Dùng cho huy hiệu trên menu quản trị: trước đây admin phải tự nhớ mở trang
 * Liên hệ mới biết có khách gửi yêu cầu, nên yêu cầu dễ nằm im nhiều ngày —
 * với nghề bán hàng, chậm gọi lại là mất đơn (tiêu chí 1 & 7).
 *
 * Chỉ trả về một con số nên rất nhẹ; dùng COUNT(*) thay vì tải bản ghi về đếm.
 */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const count = await prisma.contactRequest.count({ where: { status: 'new' } });
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error counting new contacts:', error);
    // Lỗi đếm không được làm hỏng cả khung quản trị — trả 0 và bỏ qua huy hiệu.
    return NextResponse.json({ count: 0 });
  }
}

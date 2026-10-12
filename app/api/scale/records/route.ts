import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getScaleUser, unauthorizedScale } from '@/lib/scale-auth';
import { lineWhere } from '@/lib/scale-ticket-server';

export const dynamic = 'force-dynamic';

/**
 * Bản ghi cân = mọi lượt cân trong các phiếu của khách đang đăng nhập.
 *
 * Từ khi gộp Màn hình cân vào Phiếu cân, mọi lần cân đều nằm trong một phiếu,
 * nên trang này đọc thẳng từ lượt cân của phiếu thay vì bảng bản ghi riêng
 * như trước — cân ở đâu cũng hiện ở đây, không còn hai nguồn lệch nhau.
 *
 * Chỉ đọc. Xoá hay sửa lượt cân làm trong phiếu, để phiếu đã in và sổ sách
 * luôn khớp nhau.
 */
export async function GET(request: NextRequest) {
  const user = await getScaleUser();
  if (!user) return unauthorizedScale();

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const where = lineWhere(user.id, searchParams);

    const [records, total, sum] = await Promise.all([
      prisma.scaleTicketLine.findMany({
        where,
        orderBy: [{ weighedAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          ticket: { select: { id: true, ticketNo: true, type: true, customerName: true } },
        },
      }),
      prisma.scaleTicketLine.count({ where }),
      // Tổng của TOÀN BỘ kết quả lọc, không chỉ trang đang xem.
      prisma.scaleTicketLine.aggregate({ where, _sum: { netWeight: true, amount: true } }),
    ]);

    return NextResponse.json({
      records,
      totalWeight: sum._sum.netWeight ?? 0,
      totalAmount: sum._sum.amount ?? 0,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Không tải được bản ghi cân:', error);
    return NextResponse.json({ error: 'Không tải được bản ghi cân' }, { status: 500 });
  }
}

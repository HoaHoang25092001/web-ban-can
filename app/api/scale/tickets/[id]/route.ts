import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getScaleUser, unauthorizedScale } from '@/lib/scale-auth';
import { findOwnedTicket, optionalText } from '@/lib/scale-ticket-server';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

const NOT_FOUND = () => NextResponse.json({ error: 'Không tìm thấy phiếu' }, { status: 404 });

export async function GET(_request: NextRequest, { params }: Params) {
  const user = await getScaleUser();
  if (!user) return unauthorizedScale();

  const ticket = await findOwnedTicket(Number((await params).id), user.id);
  return ticket ? NextResponse.json(ticket) : NOT_FOUND();
}

/**
 * Sửa thông tin phiếu, hoặc chuyển trạng thái.
 *
 *  - { status: 'DONE' }  "Xong phiếu": khoá lại, không thêm/xoá lượt cân được nữa.
 *  - { status: 'OPEN' }  "Mở lại phiếu": để sửa khi lỡ bấm xong quá sớm.
 *  - các trường khác     chỉ sửa được khi phiếu còn mở.
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await getScaleUser();
  if (!user) return unauthorizedScale();

  try {
    const ticket = await findOwnedTicket(Number((await params).id), user.id);
    if (!ticket) return NOT_FOUND();
    const body = await request.json();

    if (body.status === 'DONE' || body.status === 'OPEN') {
      if (body.status === 'DONE' && ticket.lines.length === 0) {
        return NextResponse.json({ error: 'Phiếu chưa có lượt cân nào' }, { status: 400 });
      }
      const updated = await prisma.scaleTicket.update({
        where: { id: ticket.id },
        data: { status: body.status, completedAt: body.status === 'DONE' ? new Date() : null },
        include: { lines: { orderBy: [{ weighedAt: 'asc' }, { id: 'asc' }] } },
      });
      return NextResponse.json(updated);
    }

    if (ticket.status === 'DONE') {
      return NextResponse.json({ error: 'Phiếu đã xong. Mở lại phiếu để sửa.' }, { status: 409 });
    }

    let customerId: number | null = ticket.customerId;
    if (body.customerId !== undefined) {
      customerId = null;
      if (body.customerId) {
        const c = await prisma.scaleCustomer.findFirst({
          where: { id: Number(body.customerId), userId: user.id },
          select: { id: true },
        });
        if (!c) return NextResponse.json({ error: 'Không tìm thấy khách hàng' }, { status: 404 });
        customerId = c.id;
      }
    }

    const updated = await prisma.scaleTicket.update({
      where: { id: ticket.id },
      data: {
        type: body.type === 'NHAP' ? 'NHAP' : 'XUAT',
        customerId,
        customerName: optionalText(body.customerName, 200),
        customerPhone: optionalText(body.customerPhone, 30),
        customerAddress: optionalText(body.customerAddress, 300),
        driverName: optionalText(body.driverName, 100),
        vehiclePlate: optionalText(body.vehiclePlate, 30),
        note: optionalText(body.note, 500),
      },
      include: { lines: { orderBy: [{ weighedAt: 'asc' }, { id: 'asc' }] } },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Không cập nhật được phiếu:', error);
    return NextResponse.json({ error: 'Không cập nhật được phiếu' }, { status: 500 });
  }
}

/** Xoá cả phiếu cùng mọi lượt cân. */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const user = await getScaleUser();
  if (!user) return unauthorizedScale();

  try {
    const result = await prisma.scaleTicket.deleteMany({
      where: { id: Number((await params).id), userId: user.id },
    });
    return result.count ? NextResponse.json({ ok: true }) : NOT_FOUND();
  } catch (error) {
    console.error('Không xoá được phiếu:', error);
    return NextResponse.json({ error: 'Không xoá được phiếu' }, { status: 500 });
  }
}

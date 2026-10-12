import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getScaleUser, unauthorizedScale } from '@/lib/scale-auth';
import { findOwnedTicket } from '@/lib/scale-ticket-server';
import { computeLine, roundKg } from '@/lib/scale-ticket';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

function num(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

/**
 * Thêm một lượt cân vào phiếu.
 *
 * Trừ bì, khối lượng hàng và thành tiền được TÍNH LẠI ở đây từ số cân, số
 * khay, bì một khay và đơn giá — không nhận các con số đã tính sẵn từ trình
 * duyệt, để không ai sửa được thành tiền trên phiếu bằng cách gửi số khác lên.
 */
export async function POST(request: NextRequest, { params }: Params) {
  const user = await getScaleUser();
  if (!user) return unauthorizedScale();

  try {
    const ticket = await findOwnedTicket(Number((await params).id), user.id);
    if (!ticket) return NextResponse.json({ error: 'Không tìm thấy phiếu' }, { status: 404 });
    if (ticket.status === 'DONE') {
      return NextResponse.json({ error: 'Phiếu đã xong, không thêm lượt cân được nữa' }, { status: 409 });
    }

    const body = await request.json();
    const productName = String(body.productName ?? '').trim();
    const grossWeight = roundKg(num(body.grossWeight));
    const trayCount = Math.trunc(num(body.trayCount ?? 0));
    const trayWeight = roundKg(num(body.trayWeight ?? 0));
    const unitPrice = Math.round(num(body.unitPrice ?? 0));

    if (!productName) return NextResponse.json({ error: 'Vui lòng chọn loại hàng' }, { status: 400 });
    if (!(grossWeight > 0)) return NextResponse.json({ error: 'Khối lượng cân phải lớn hơn 0' }, { status: 400 });
    if (!(trayCount >= 0) || !(trayWeight >= 0)) {
      return NextResponse.json({ error: 'Số khay và bì không hợp lệ' }, { status: 400 });
    }
    if (!(unitPrice >= 0)) return NextResponse.json({ error: 'Đơn giá không hợp lệ' }, { status: 400 });

    const { tareWeight, netWeight, amount } = computeLine({ grossWeight, trayCount, trayWeight, unitPrice });
    if (netWeight <= 0) {
      return NextResponse.json(
        { error: `Trừ bì ${tareWeight} kg lớn hơn khối lượng cân ${grossWeight} kg` },
        { status: 400 }
      );
    }

    const line = await prisma.scaleTicketLine.create({
      data: {
        ticketId: ticket.id,
        productCode: String(body.productCode ?? '').trim().slice(0, 100),
        productName: productName.slice(0, 300),
        grossWeight,
        trayCount,
        trayWeight,
        tareWeight,
        netWeight,
        unitPrice,
        amount,
      },
    });
    return NextResponse.json(line, { status: 201 });
  } catch (error) {
    console.error('Không lưu được lượt cân:', error);
    return NextResponse.json({ error: 'Không lưu được lượt cân' }, { status: 500 });
  }
}

/** Xoá một lượt cân (cân nhầm). Body: { lineId }. */
export async function DELETE(request: NextRequest, { params }: Params) {
  const user = await getScaleUser();
  if (!user) return unauthorizedScale();

  try {
    const ticket = await findOwnedTicket(Number((await params).id), user.id);
    if (!ticket) return NextResponse.json({ error: 'Không tìm thấy phiếu' }, { status: 404 });
    if (ticket.status === 'DONE') {
      return NextResponse.json({ error: 'Phiếu đã xong. Mở lại phiếu để xoá lượt cân.' }, { status: 409 });
    }

    const { lineId } = await request.json();
    // ticketId nằm trong điều kiện: không xoá được lượt cân của phiếu khác.
    const result = await prisma.scaleTicketLine.deleteMany({
      where: { id: Number(lineId), ticketId: ticket.id },
    });
    if (!result.count) return NextResponse.json({ error: 'Không tìm thấy lượt cân' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Không xoá được lượt cân:', error);
    return NextResponse.json({ error: 'Không xoá được lượt cân' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getScaleUser, unauthorizedScale } from '@/lib/scale-auth';
import { nextCustomerCode, optionalText } from '@/lib/scale-ticket-server';
import { roundKg, vnDayStart } from '@/lib/scale-ticket';

export const dynamic = 'force-dynamic';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Danh sách phiếu, lọc theo khoảng ngày lập phiếu (giờ Việt Nam). */
export async function GET(request: NextRequest) {
  const user = await getScaleUser();
  if (!user) return unauthorizedScale();

  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const search = searchParams.get('search')?.trim();

    const createdAt: Prisma.DateTimeFilter = {};
    if (from && DATE_RE.test(from)) createdAt.gte = vnDayStart(from);
    if (to && DATE_RE.test(to)) {
      // Cộng một ngày để bao trọn ngày cuối: "đến ngày 12" gồm cả 23:59 ngày 12.
      createdAt.lt = new Date(vnDayStart(to).getTime() + 86400_000);
    }

    const searchNo = search && /^\d+$/.test(search) ? Number(search) : null;

    const tickets = await prisma.scaleTicket.findMany({
      where: {
        userId: user.id,
        ...(createdAt.gte || createdAt.lt ? { createdAt } : {}),
        ...(search
          ? {
              OR: [
                ...(searchNo !== null ? [{ ticketNo: searchNo }] : []),
                { customerName: { contains: search, mode: 'insensitive' as const } },
                { customerPhone: { contains: search } },
                { vehiclePlate: { contains: search, mode: 'insensitive' as const } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 300,
      include: { lines: { select: { netWeight: true, amount: true } } },
    });

    return NextResponse.json({
      tickets: tickets.map(({ lines, ...t }) => ({
        ...t,
        lineCount: lines.length,
        totalWeight: roundKg(lines.reduce((s, l) => s + l.netWeight, 0)),
        totalAmount: lines.reduce((s, l) => s + l.amount, 0),
      })),
    });
  } catch (error) {
    console.error('Không tải được danh sách phiếu:', error);
    return NextResponse.json({ error: 'Không tải được danh sách phiếu' }, { status: 500 });
  }
}

/**
 * Tạo phiếu mới.
 *
 * Số phiếu = số lớn nhất của tài khoản này + 1. Hai máy cùng bấm "Tạo phiếu"
 * một lúc có thể cùng tính ra một số; ràng buộc @@unique([userId, ticketNo])
 * chặn bản thứ hai, và ở đây thử lại với số kế tiếp thay vì báo lỗi.
 */
export async function POST(request: NextRequest) {
  const user = await getScaleUser();
  if (!user) return unauthorizedScale();

  try {
    const body = await request.json();
    const type = body.type === 'NHAP' ? 'NHAP' : 'XUAT';

    let customerId: number | null = null;
    let customerName = optionalText(body.customerName, 200);
    let customerPhone = optionalText(body.customerPhone, 30);
    let customerAddress = optionalText(body.customerAddress, 300);

    if (body.customerId) {
      const customer = await prisma.scaleCustomer.findFirst({
        where: { id: Number(body.customerId), userId: user.id },
      });
      if (!customer) return NextResponse.json({ error: 'Không tìm thấy khách hàng' }, { status: 404 });
      customerId = customer.id;
      // Cho phép sửa số điện thoại/địa chỉ riêng cho phiếu này (giao tới chỗ khác).
      customerName = customerName ?? customer.name;
      customerPhone = customerPhone ?? customer.phone;
      customerAddress = customerAddress ?? customer.address;
    } else if (body.saveCustomer && customerName) {
      /* Khách mới gõ tay: lưu luôn vào danh bạ để lần sau chỉ việc chọn, khỏi
         phải mở trang Khách hàng nhập trước rồi mới quay lại cân. */
      const created = await prisma.scaleCustomer.create({
        data: {
          code: await nextCustomerCode(user.id),
          name: customerName,
          phone: customerPhone,
          address: customerAddress,
          userId: user.id,
        },
      });
      customerId = created.id;
    }

    for (let attempt = 0; attempt < 5; attempt++) {
      const last = await prisma.scaleTicket.findFirst({
        where: { userId: user.id },
        orderBy: { ticketNo: 'desc' },
        select: { ticketNo: true },
      });
      try {
        const ticket = await prisma.scaleTicket.create({
          data: {
            ticketNo: (last?.ticketNo ?? 0) + 1,
            type,
            customerId,
            customerName,
            customerPhone,
            customerAddress,
            driverName: optionalText(body.driverName, 100),
            vehiclePlate: optionalText(body.vehiclePlate, 30),
            note: optionalText(body.note, 500),
            userId: user.id,
          },
          include: { lines: true },
        });
        return NextResponse.json(ticket, { status: 201 });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') continue;
        throw e;
      }
    }
    return NextResponse.json({ error: 'Không cấp được số phiếu, vui lòng thử lại' }, { status: 409 });
  } catch (error) {
    console.error('Không tạo được phiếu:', error);
    return NextResponse.json({ error: 'Không tạo được phiếu' }, { status: 500 });
  }
}

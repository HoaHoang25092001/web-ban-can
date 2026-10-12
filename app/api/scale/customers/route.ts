import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getScaleUser, unauthorizedScale } from '@/lib/scale-auth';
import { nextCustomerCode, optionalText as optional } from '@/lib/scale-ticket-server';

export const dynamic = 'force-dynamic';

/** Danh bạ khách hàng của tài khoản đang đăng nhập. */
export async function GET() {
  const user = await getScaleUser();
  if (!user) return unauthorizedScale();

  try {
    const customers = await prisma.scaleCustomer.findMany({
      where: { userId: user.id },
      orderBy: { name: 'asc' },
      take: 2000,
      include: { _count: { select: { tickets: true } } },
    });
    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Không tải được danh sách khách hàng:', error);
    return NextResponse.json({ error: 'Không tải được danh sách khách hàng' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getScaleUser();
  if (!user) return unauthorizedScale();

  try {
    const body = await request.json();
    const name = String(body.name ?? '').trim();
    if (!name) return NextResponse.json({ error: 'Vui lòng nhập tên khách hàng' }, { status: 400 });

    let code = String(body.code ?? '').trim().slice(0, 50);
    if (!code) code = await nextCustomerCode(user.id);

    const existing = await prisma.scaleCustomer.findFirst({
      where: { userId: user.id, code },
      select: { name: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Mã "${code}" đã dùng cho khách "${existing.name}"` },
        { status: 409 }
      );
    }

    const created = await prisma.scaleCustomer.create({
      data: {
        code,
        name: name.slice(0, 200),
        phone: optional(body.phone, 30),
        address: optional(body.address, 300),
        note: optional(body.note, 500),
        userId: user.id,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Không tạo được khách hàng:', error);
    return NextResponse.json({ error: 'Không tạo được khách hàng' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const user = await getScaleUser();
  if (!user) return unauthorizedScale();

  try {
    const body = await request.json();
    const id = Number(body.id);
    if (!Number.isInteger(id)) return NextResponse.json({ error: 'Thiếu mã khách hàng' }, { status: 400 });

    const owned = await prisma.scaleCustomer.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    });
    if (!owned) return NextResponse.json({ error: 'Không tìm thấy khách hàng' }, { status: 404 });

    const name = String(body.name ?? '').trim();
    if (!name) return NextResponse.json({ error: 'Vui lòng nhập tên khách hàng' }, { status: 400 });
    const code = String(body.code ?? '').trim().slice(0, 50);
    if (!code) return NextResponse.json({ error: 'Vui lòng nhập mã khách hàng' }, { status: 400 });

    const dup = await prisma.scaleCustomer.findFirst({
      where: { userId: user.id, code, NOT: { id } },
      select: { name: true },
    });
    if (dup) {
      return NextResponse.json({ error: `Mã "${code}" đã dùng cho khách "${dup.name}"` }, { status: 409 });
    }

    /* Chỉ sửa danh bạ. Phiếu cũ đã chép sẵn tên, số điện thoại, địa chỉ lúc
       lập nên KHÔNG đổi theo — chứng từ đã giao cho khách phải giữ nguyên. */
    const updated = await prisma.scaleCustomer.update({
      where: { id },
      data: {
        code,
        name: name.slice(0, 200),
        phone: optional(body.phone, 30),
        address: optional(body.address, 300),
        note: optional(body.note, 500),
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Không cập nhật được khách hàng:', error);
    return NextResponse.json({ error: 'Không cập nhật được khách hàng' }, { status: 500 });
  }
}

/** Xoá khách khỏi danh bạ. Phiếu cũ vẫn giữ tên, số điện thoại, địa chỉ đã chép. */
export async function DELETE(request: NextRequest) {
  const user = await getScaleUser();
  if (!user) return unauthorizedScale();

  try {
    const { id } = await request.json();
    const result = await prisma.scaleCustomer.deleteMany({
      where: { id: Number(id), userId: user.id },
    });
    if (result.count === 0) return NextResponse.json({ error: 'Không tìm thấy khách hàng' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Không xoá được khách hàng:', error);
    return NextResponse.json({ error: 'Không xoá được khách hàng' }, { status: 500 });
  }
}

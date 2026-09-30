import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getScaleUser, unauthorizedScale } from '@/lib/scale-auth';

export const dynamic = 'force-dynamic';

/**
 * Danh sách nhân viên cân hàng của khách đang đăng nhập.
 *
 * Cùng nguyên tắc cách ly với mặt hàng và bản ghi: mọi truy vấn lọc theo
 * `userId` lấy từ phiên đăng nhập, không bao giờ nhận từ địa chỉ trang.
 */
export async function GET(request: NextRequest) {
  const user = await getScaleUser();
  if (!user) return unauthorizedScale();

  try {
    const search = new URL(request.url).searchParams.get('search')?.trim();

    const employees = await prisma.scaleEmployee.findMany({
      where: {
        userId: user.id,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { code: { contains: search, mode: 'insensitive' as const } },
              ],
            }
          : {}),
      },
      orderBy: { name: 'asc' },
      take: 500,
    });

    return NextResponse.json({ employees });
  } catch (error) {
    console.error('Không tải được danh sách nhân viên:', error);
    return NextResponse.json({ error: 'Không tải được danh sách nhân viên' }, { status: 500 });
  }
}

/** Thêm nhân viên. */
export async function POST(request: NextRequest) {
  const user = await getScaleUser();
  if (!user) return unauthorizedScale();

  try {
    const body = await request.json();
    const code = String(body.code ?? '').trim();
    const name = String(body.name ?? '').trim();

    if (!code) return NextResponse.json({ error: 'Vui lòng nhập mã nhân viên' }, { status: 400 });
    if (!name) return NextResponse.json({ error: 'Vui lòng nhập tên nhân viên' }, { status: 400 });

    // Báo lỗi dễ hiểu thay vì để database ném ra lỗi kỹ thuật khi trùng mã.
    const existing = await prisma.scaleEmployee.findFirst({
      where: { userId: user.id, code },
      select: { name: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Mã "${code}" đã dùng cho nhân viên "${existing.name}"` },
        { status: 409 }
      );
    }

    const created = await prisma.scaleEmployee.create({
      data: { code: code.slice(0, 50), name: name.slice(0, 200), userId: user.id },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Không tạo được nhân viên:', error);
    return NextResponse.json({ error: 'Không tạo được nhân viên' }, { status: 500 });
  }
}

/** Sửa nhân viên. */
export async function PUT(request: NextRequest) {
  const user = await getScaleUser();
  if (!user) return unauthorizedScale();

  try {
    const body = await request.json();
    const id = Number(body.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: 'Thiếu mã nhân viên' }, { status: 400 });
    }

    // Xác nhận nhân viên này thuộc về khách đang đăng nhập trước khi sửa.
    const owned = await prisma.scaleEmployee.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    });
    if (!owned) return NextResponse.json({ error: 'Không tìm thấy nhân viên' }, { status: 404 });

    const data: Record<string, string> = {};
    if (body.code !== undefined) {
      const code = String(body.code).trim();
      if (!code) return NextResponse.json({ error: 'Vui lòng nhập mã nhân viên' }, { status: 400 });
      const dup = await prisma.scaleEmployee.findFirst({
        where: { userId: user.id, code, NOT: { id } },
        select: { name: true },
      });
      if (dup) {
        return NextResponse.json(
          { error: `Mã "${code}" đã dùng cho nhân viên "${dup.name}"` },
          { status: 409 }
        );
      }
      data.code = code.slice(0, 50);
    }
    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) return NextResponse.json({ error: 'Vui lòng nhập tên nhân viên' }, { status: 400 });
      data.name = name.slice(0, 200);
    }

    const updated = await prisma.scaleEmployee.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Không cập nhật được nhân viên:', error);
    return NextResponse.json({ error: 'Không cập nhật được nhân viên' }, { status: 500 });
  }
}

/** Xoá nhân viên. Bản ghi cân cũ vẫn giữ nguyên tên đã lưu. */
export async function DELETE(request: NextRequest) {
  const user = await getScaleUser();
  if (!user) return unauthorizedScale();

  try {
    const { id } = await request.json();
    const employeeId = Number(id);
    if (!Number.isInteger(employeeId)) {
      return NextResponse.json({ error: 'Thiếu mã nhân viên' }, { status: 400 });
    }

    /* deleteMany kèm userId thay vì delete theo id: lệnh delete thường sẽ xoá
     * được cả nhân viên của khách khác nếu đoán trúng id. */
    const result = await prisma.scaleEmployee.deleteMany({
      where: { id: employeeId, userId: user.id },
    });
    if (result.count === 0) {
      return NextResponse.json({ error: 'Không tìm thấy nhân viên' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Không xoá được nhân viên:', error);
    return NextResponse.json({ error: 'Không xoá được nhân viên' }, { status: 500 });
  }
}

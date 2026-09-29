import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getScaleUser, unauthorizedScale } from '@/lib/scale-auth';

export const dynamic = 'force-dynamic';

/** Danh mục mặt hàng của khách đang đăng nhập. */
export async function GET(request: NextRequest) {
  const user = await getScaleUser();
  if (!user) return unauthorizedScale();

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();

    const products = await prisma.scaleProduct.findMany({
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

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Không tải được danh mục mặt hàng:', error);
    return NextResponse.json({ error: 'Không tải được danh mục mặt hàng' }, { status: 500 });
  }
}

/** Thêm mặt hàng mới. */
export async function POST(request: NextRequest) {
  const user = await getScaleUser();
  if (!user) return unauthorizedScale();

  try {
    const body = await request.json();
    const code = String(body.code ?? '').trim();
    const name = String(body.name ?? '').trim();

    if (!code) return NextResponse.json({ error: 'Vui lòng nhập mã hàng' }, { status: 400 });
    if (!name) return NextResponse.json({ error: 'Vui lòng nhập tên hàng' }, { status: 400 });

    /*
     * Mã hàng chỉ cần duy nhất TRONG PHẠM VI khách này — hai công ty khác nhau
     * dùng chung mã "SP001" là bình thường. Ràng buộc @@unique([userId, code])
     * trong schema đã lo việc đó; ở đây kiểm tra trước để báo lỗi dễ hiểu thay
     * vì để database ném ra lỗi kỹ thuật.
     */
    const existing = await prisma.scaleProduct.findFirst({
      where: { userId: user.id, code },
      select: { name: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Mã "${code}" đã dùng cho mặt hàng "${existing.name}"` },
        { status: 409 }
      );
    }

    const created = await prisma.scaleProduct.create({
      data: { code: code.slice(0, 100), name: name.slice(0, 300), userId: user.id },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Không tạo được mặt hàng:', error);
    return NextResponse.json({ error: 'Không tạo được mặt hàng' }, { status: 500 });
  }
}

/** Sửa mặt hàng. */
export async function PUT(request: NextRequest) {
  const user = await getScaleUser();
  if (!user) return unauthorizedScale();

  try {
    const body = await request.json();
    const id = Number(body.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: 'Thiếu mã mặt hàng' }, { status: 400 });
    }

    // Xác nhận mặt hàng này thuộc về khách đang đăng nhập trước khi sửa.
    const owned = await prisma.scaleProduct.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    });
    if (!owned) return NextResponse.json({ error: 'Không tìm thấy mặt hàng' }, { status: 404 });

    const data: Record<string, string> = {};
    if (body.code !== undefined) {
      const code = String(body.code).trim();
      if (!code) return NextResponse.json({ error: 'Vui lòng nhập mã hàng' }, { status: 400 });
      const dup = await prisma.scaleProduct.findFirst({
        where: { userId: user.id, code, NOT: { id } },
        select: { name: true },
      });
      if (dup) {
        return NextResponse.json(
          { error: `Mã "${code}" đã dùng cho mặt hàng "${dup.name}"` },
          { status: 409 }
        );
      }
      data.code = code.slice(0, 100);
    }
    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) return NextResponse.json({ error: 'Vui lòng nhập tên hàng' }, { status: 400 });
      data.name = name.slice(0, 300);
    }

    const updated = await prisma.scaleProduct.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Không cập nhật được mặt hàng:', error);
    return NextResponse.json({ error: 'Không cập nhật được mặt hàng' }, { status: 500 });
  }
}

/** Xoá mặt hàng. Bản ghi cân cũ vẫn giữ nguyên tên và mã đã lưu. */
export async function DELETE(request: NextRequest) {
  const user = await getScaleUser();
  if (!user) return unauthorizedScale();

  try {
    const { id } = await request.json();
    const productId = Number(id);
    if (!Number.isInteger(productId)) {
      return NextResponse.json({ error: 'Thiếu mã mặt hàng' }, { status: 400 });
    }

    const result = await prisma.scaleProduct.deleteMany({
      where: { id: productId, userId: user.id },
    });
    if (result.count === 0) {
      return NextResponse.json({ error: 'Không tìm thấy mặt hàng' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Không xoá được mặt hàng:', error);
    return NextResponse.json({ error: 'Không xoá được mặt hàng' }, { status: 500 });
  }
}

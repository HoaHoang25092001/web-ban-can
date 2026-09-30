import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';

export const dynamic = 'force-dynamic';

/**
 * Quản lý tài khoản khách hàng dùng phần cân điện tử.
 *
 * Dành cho QUẢN TRỊ VIÊN website: cấp tài khoản, đặt lại mật khẩu, khoá khi
 * khách hết hạn dịch vụ.
 *
 * KHÔNG trả về số liệu cân của khách. Chủ shop quản lý được tài khoản nhưng
 * không đọc được sản lượng của khách — đó là bí mật kinh doanh của họ.
 */
export async function GET(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();

    const users = await prisma.scaleUser.findMany({
      where: search
        ? {
            OR: [
              { username: { contains: search, mode: 'insensitive' } },
              { fullName: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
            ],
          }
        : {},
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
      /*
       * Chỉ lấy đúng các cột cần cho bảng quản lý.
       *
       * Đặc biệt KHÔNG lấy `password` — kể cả dạng đã băm cũng không nên rời
       * khỏi máy chủ. Đếm số bản ghi (`_count`) để chủ shop biết tài khoản nào
       * đang dùng thật, nhưng không thấy nội dung bản ghi.
       */
      select: {
        id: true,
        username: true,
        fullName: true,
        phone: true,
        note: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        _count: { select: { records: true, products: true } },
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Không tải được danh sách tài khoản cân:', error);
    return NextResponse.json({ error: 'Không tải được danh sách tài khoản' }, { status: 500 });
  }
}

/** Tên đăng nhập: chỉ chữ thường, số, gạch dưới và gạch ngang. */
const USERNAME_RE = /^[a-z0-9_-]{3,50}$/;
const MIN_PASSWORD = 8;

/** Cấp tài khoản mới cho khách. */
export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const username = String(body.username ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    const fullName = String(body.fullName ?? '').trim();

    if (!USERNAME_RE.test(username)) {
      return NextResponse.json(
        { error: 'Tên đăng nhập chỉ gồm chữ thường, số, dấu _ hoặc -, dài 3–50 ký tự' },
        { status: 400 }
      );
    }
    if (password.length < MIN_PASSWORD) {
      return NextResponse.json(
        { error: `Mật khẩu phải có ít nhất ${MIN_PASSWORD} ký tự` },
        { status: 400 }
      );
    }
    if (!fullName) {
      return NextResponse.json({ error: 'Vui lòng nhập tên khách hàng' }, { status: 400 });
    }

    const existing = await prisma.scaleUser.findUnique({
      where: { username },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ error: `Tên đăng nhập "${username}" đã có người dùng` }, { status: 409 });
    }

    const created = await prisma.scaleUser.create({
      data: {
        username,
        // bcrypt với 10 vòng: tiêu chuẩn hiện hành, đủ chậm để chống dò mật khẩu.
        password: await bcrypt.hash(password, 10),
        fullName: fullName.slice(0, 200),
        phone: body.phone?.trim()?.slice(0, 30) || null,
        note: body.note?.trim()?.slice(0, 500) || null,
      },
      select: { id: true, username: true, fullName: true, isActive: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Không tạo được tài khoản cân:', error);
    return NextResponse.json({ error: 'Không tạo được tài khoản' }, { status: 500 });
  }
}

/** Sửa thông tin, đổi mật khẩu, hoặc khoá/mở tài khoản. */
export async function PUT(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const id = Number(body.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: 'Thiếu mã tài khoản' }, { status: 400 });
    }

    const data: Record<string, unknown> = {};

    if (body.fullName !== undefined) {
      const fullName = String(body.fullName).trim();
      if (!fullName) {
        return NextResponse.json({ error: 'Vui lòng nhập tên khách hàng' }, { status: 400 });
      }
      data.fullName = fullName.slice(0, 200);
    }
    if (body.phone !== undefined) data.phone = body.phone?.trim()?.slice(0, 30) || null;
    if (body.note !== undefined) data.note = body.note?.trim()?.slice(0, 500) || null;
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

    /* Đổi mật khẩu: chỉ khi thực sự gửi mật khẩu mới. Không cho đặt chuỗi rỗng
     * — như vậy sẽ tạo ra tài khoản không ai đăng nhập được mà cũng không rõ
     * vì sao. */
    if (body.password) {
      const password = String(body.password);
      if (password.length < MIN_PASSWORD) {
        return NextResponse.json(
          { error: `Mật khẩu phải có ít nhất ${MIN_PASSWORD} ký tự` },
          { status: 400 }
        );
      }
      data.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.scaleUser.update({
      where: { id },
      data,
      select: { id: true, username: true, fullName: true, isActive: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Không cập nhật được tài khoản cân:', error);
    return NextResponse.json({ error: 'Không cập nhật được tài khoản' }, { status: 500 });
  }
}

/**
 * Xoá tài khoản khách.
 *
 * Xoá theo dây chuyền cả mặt hàng và bản ghi cân của họ (onDelete: Cascade),
 * nên chỉ dùng khi thật sự muốn xoá sạch. Hết hạn dịch vụ thì nên KHOÁ
 * (isActive = false) để giữ lại dữ liệu phòng khi khách quay lại.
 */
export async function DELETE(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await request.json();
    const userId = Number(id);
    if (!Number.isInteger(userId)) {
      return NextResponse.json({ error: 'Thiếu mã tài khoản' }, { status: 400 });
    }

    const user = await prisma.scaleUser.findUnique({
      where: { id: userId },
      select: { username: true, _count: { select: { records: true } } },
    });
    if (!user) return NextResponse.json({ error: 'Không tìm thấy tài khoản' }, { status: 404 });

    await prisma.scaleUser.delete({ where: { id: userId } });

    return NextResponse.json({ ok: true, deletedRecords: user._count.records });
  } catch (error) {
    console.error('Không xoá được tài khoản cân:', error);
    return NextResponse.json({ error: 'Không xoá được tài khoản' }, { status: 500 });
  }
}

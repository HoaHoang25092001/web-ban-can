import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getScaleUser, unauthorizedScale } from '@/lib/scale-auth';

export const dynamic = 'force-dynamic';

/**
 * Bản ghi cân của khách đang đăng nhập.
 *
 * Mọi truy vấn đều bắt đầu bằng `userId: user.id` lấy từ phiên đăng nhập —
 * không bao giờ nhận id khách từ địa chỉ trang hay biểu mẫu. Đây là điều giữ
 * cho khách A không đọc được dữ liệu của khách B.
 */
export async function GET(request: NextRequest) {
  const user = await getScaleUser();
  if (!user) return unauthorizedScale();

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const search = searchParams.get('search')?.trim();
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const where: Record<string, unknown> = { userId: user.id };

    if (search) {
      where.OR = [
        { productName: { contains: search, mode: 'insensitive' } },
        { productCode: { contains: search, mode: 'insensitive' } },
        { employeeName: { contains: search, mode: 'insensitive' } },
      ];
    }

    /* Lọc theo ngày: `to` cộng thêm một ngày để bao trọn ngày cuối, nếu không
     * thì chọn "đến 20/9" sẽ bỏ sót mọi bản ghi trong chính ngày 20/9. */
    if (from || to) {
      const range: Record<string, Date> = {};
      if (from) range.gte = new Date(`${from}T00:00:00`);
      if (to) {
        const end = new Date(`${to}T00:00:00`);
        end.setDate(end.getDate() + 1);
        range.lt = end;
      }
      where.weighedAt = range;
    }

    const [records, total, sum] = await Promise.all([
      prisma.weighingRecord.findMany({
        where,
        orderBy: { weighedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.weighingRecord.count({ where }),
      // Tổng khối lượng của TOÀN BỘ kết quả lọc, không chỉ trang đang xem.
      prisma.weighingRecord.aggregate({ where, _sum: { weight: true } }),
    ]);

    return NextResponse.json({
      records,
      totalWeight: sum._sum.weight ?? 0,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Không tải được bản ghi cân:', error);
    return NextResponse.json({ error: 'Không tải được bản ghi cân' }, { status: 500 });
  }
}

/** Lưu một lần cân. */
export async function POST(request: NextRequest) {
  const user = await getScaleUser();
  if (!user) return unauthorizedScale();

  try {
    const body = await request.json();
    const productCode = String(body.productCode ?? '').trim();
    const productName = String(body.productName ?? '').trim();
    const weight = Number(body.weight);

    if (!productName) {
      return NextResponse.json({ error: 'Vui lòng chọn hoặc nhập tên mặt hàng' }, { status: 400 });
    }
    /*
     * Khối lượng phải là số hữu hạn và không âm.
     *
     * Kiểm tra cả `isFinite`: cân lỗi hoặc đứt kết nối có thể trả về NaN hay
     * Infinity, ghi vào sổ sách thì mọi phép cộng sau đó đều hỏng theo.
     */
    if (!Number.isFinite(weight) || weight < 0) {
      return NextResponse.json({ error: 'Khối lượng không hợp lệ' }, { status: 400 });
    }

    /*
     * Chỉ nhận mặt hàng THUỘC VỀ khách này.
     *
     * Nếu tin vào productId khách gửi lên, họ có thể gắn bản ghi của mình vào
     * mặt hàng của khách khác — vừa sai dữ liệu vừa lộ thông tin.
     */
    let productId: number | null = null;
    if (body.productId) {
      const owned = await prisma.scaleProduct.findFirst({
        where: { id: Number(body.productId), userId: user.id },
        select: { id: true },
      });
      productId = owned?.id ?? null;
    }

    const created = await prisma.weighingRecord.create({
      data: {
        productCode: productCode.slice(0, 100),
        productName: productName.slice(0, 300),
        weight,
        unit: String(body.unit ?? 'kg').slice(0, 10),
        employeeName: body.employeeName?.trim()?.slice(0, 150) || null,
        note: body.note?.trim()?.slice(0, 500) || null,
        weighedAt: body.weighedAt ? new Date(body.weighedAt) : new Date(),
        userId: user.id,
        productId,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Không lưu được bản ghi cân:', error);
    return NextResponse.json({ error: 'Không lưu được bản ghi cân' }, { status: 500 });
  }
}

/** Xoá một bản ghi — chỉ xoá được bản ghi của chính mình. */
export async function DELETE(request: NextRequest) {
  const user = await getScaleUser();
  if (!user) return unauthorizedScale();

  try {
    const { id } = await request.json();
    const recordId = Number(id);
    if (!Number.isInteger(recordId)) {
      return NextResponse.json({ error: 'Thiếu mã bản ghi' }, { status: 400 });
    }

    /* deleteMany kèm userId thay vì delete theo id: lệnh delete thường sẽ xoá
     * được cả bản ghi của khách khác nếu đoán trúng id. */
    const result = await prisma.weighingRecord.deleteMany({
      where: { id: recordId, userId: user.id },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Không tìm thấy bản ghi' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Không xoá được bản ghi cân:', error);
    return NextResponse.json({ error: 'Không xoá được bản ghi' }, { status: 500 });
  }
}

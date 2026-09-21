import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/require-admin';
import { uniqueSlug } from '@/lib/slug';

/**
 * GET /api/pages — danh sách trang.
 *
 * `?published=true` để lấy trang đã đăng (dùng cho phía khách);
 * không truyền thì lấy tất cả (khu quản trị).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');
    const search = searchParams.get('search')?.trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));

    const where: Record<string, unknown> = {};
    if (published === 'true') where.published = true;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [pages, total] = await Promise.all([
      prisma.page.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        /*
         * Không lấy cột `content`. Bảng danh sách chỉ cần tiêu đề, đường dẫn và
         * trạng thái, trong khi mỗi trang SEO dài vài nghìn ký tự — với 1.600
         * trang như web cũ thì tải về rồi bỏ đi hàng megabyte (tiêu chí 7).
         * Trang sửa chi tiết gọi /api/pages/[id] và vẫn nhận đủ content.
         */
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          image: true,
          published: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.page.count({ where }),
    ]);

    return NextResponse.json({
      pages,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ error: 'Không tải được danh sách trang' }, { status: 500 });
  }
}

/** POST /api/pages — tạo trang mới. */
export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const title = String(body.title ?? '').trim();
    const content = String(body.content ?? '').trim();

    if (!title) {
      return NextResponse.json({ error: 'Vui lòng nhập tiêu đề trang' }, { status: 400 });
    }
    if (!content) {
      return NextResponse.json({ error: 'Vui lòng nhập nội dung trang' }, { status: 400 });
    }

    /*
     * Người dùng có thể tự đặt đường dẫn; bỏ trống thì sinh từ tiêu đề. Dù
     * nhập tay vẫn phải chạy qua slugify — gõ "Quy Nhơn!" thành đường dẫn thô
     * sẽ cho URL có dấu và dấu chấm than, trình duyệt mã hoá thành chuỗi %C3%…
     * vừa xấu vừa mất tác dụng SEO.
     */
    const desired = String(body.slug ?? '').trim() || title;
    const slug = await uniqueSlug(desired, async (s) =>
      (await prisma.page.count({ where: { slug: s } })) > 0
    );

    const created = await prisma.page.create({
      data: {
        title,
        slug,
        content,
        excerpt: body.excerpt?.trim() || null,
        image: body.image || null,
        metaTitle: body.metaTitle?.trim() || null,
        metaDescription: body.metaDescription?.trim() || null,
        published: Boolean(body.published),
      },
    });

    // Danh sách trang công khai và sitemap phải thấy trang mới ngay.
    revalidatePath('/trang');
    revalidatePath('/sitemap.xml');

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Không tạo được trang' }, { status: 500 });
  }
}

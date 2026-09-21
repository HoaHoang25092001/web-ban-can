import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/require-admin';
import { uniqueSlug } from '@/lib/slug';

/** GET /api/pages/[id] — lấy một trang kèm đầy đủ nội dung để sửa. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const page = await prisma.page.findUnique({ where: { id: parseInt(id) } });
    if (!page) {
      return NextResponse.json({ error: 'Không tìm thấy trang' }, { status: 404 });
    }
    return NextResponse.json(page);
  } catch {
    return NextResponse.json({ error: 'Không tải được trang' }, { status: 500 });
  }
}

/** PUT /api/pages/[id] — cập nhật trang. */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    const pageId = parseInt(id);
    const body = await request.json();

    const current = await prisma.page.findUnique({ where: { id: pageId } });
    if (!current) {
      return NextResponse.json({ error: 'Không tìm thấy trang' }, { status: 404 });
    }

    const data: Record<string, unknown> = {};

    if (body.title !== undefined) {
      const title = String(body.title).trim();
      if (!title) {
        return NextResponse.json({ error: 'Vui lòng nhập tiêu đề trang' }, { status: 400 });
      }
      data.title = title;
    }

    if (body.content !== undefined) {
      const content = String(body.content).trim();
      if (!content) {
        return NextResponse.json({ error: 'Vui lòng nhập nội dung trang' }, { status: 400 });
      }
      data.content = content;
    }

    /*
     * Đường dẫn chỉ đổi khi người dùng CHỦ ĐỘNG sửa ô đường dẫn.
     *
     * Không tự sinh lại slug theo tiêu đề mới: trang đã đăng có thể đã được
     * Google lập chỉ mục và khách đã lưu link. Âm thầm đổi đường dẫn khi chủ
     * shop chỉ sửa một chữ trong tiêu đề sẽ làm hỏng mọi link cũ (lỗi 404) và
     * mất thứ hạng tìm kiếm đã gây dựng.
     */
    if (body.slug !== undefined) {
      const desired = String(body.slug).trim();
      if (desired) {
        data.slug = await uniqueSlug(desired, async (s) =>
          (await prisma.page.count({ where: { slug: s, NOT: { id: pageId } } })) > 0
        );
      }
    }

    if (body.excerpt !== undefined) data.excerpt = body.excerpt?.trim() || null;
    if (body.image !== undefined) data.image = body.image || null;
    if (body.metaTitle !== undefined) data.metaTitle = body.metaTitle?.trim() || null;
    if (body.metaDescription !== undefined) {
      data.metaDescription = body.metaDescription?.trim() || null;
    }
    if (body.published !== undefined) data.published = Boolean(body.published);

    const updated = await prisma.page.update({ where: { id: pageId }, data });

    /*
     * Làm mới cả đường dẫn CŨ lẫn MỚI. Nếu chỉ làm mới đường dẫn mới, trang ở
     * địa chỉ cũ vẫn phục vụ bản lưu đệm cho tới khi hết hạn.
     */
    revalidatePath(`/trang/${current.slug}`);
    if (updated.slug !== current.slug) revalidatePath(`/trang/${updated.slug}`);
    revalidatePath('/trang');
    revalidatePath('/sitemap.xml');

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Không cập nhật được trang' }, { status: 500 });
  }
}

/** DELETE /api/pages/[id] — xoá trang. */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    const pageId = parseInt(id);

    const current = await prisma.page.findUnique({ where: { id: pageId } });
    if (!current) {
      return NextResponse.json({ error: 'Không tìm thấy trang' }, { status: 404 });
    }

    await prisma.page.delete({ where: { id: pageId } });

    revalidatePath(`/trang/${current.slug}`);
    revalidatePath('/trang');
    revalidatePath('/sitemap.xml');

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Không xoá được trang' }, { status: 500 });
  }
}

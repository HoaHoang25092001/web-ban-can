import { NextRequest, NextResponse } from 'next/server';
import { UTApi } from 'uploadthing/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';

export const dynamic = 'force-dynamic';

const utapi = new UTApi();

/* appId nằm trong UPLOADTHING_TOKEN (chuỗi base64 chứa JSON). Đọc ra để dựng
 * đúng dạng URL mà database đang lưu. */
const APP_ID = (() => {
  try {
    const raw = process.env.UPLOADTHING_TOKEN;
    if (!raw) return 'utfs';
    return JSON.parse(Buffer.from(raw, 'base64').toString('utf8')).appId ?? 'utfs';
  } catch {
    return 'utfs';
  }
})();

/**
 * Thư viện ảnh của website.
 *
 * Liệt kê ảnh đã tải lên UploadThing kèm thông tin ảnh đó đang được dùng ở đâu
 * (sản phẩm nào, bài viết nào) — nhờ vậy người quản trị biết ảnh nào xoá được
 * và ảnh nào đang hiển thị trên web.
 *
 * Phân trang phía máy chủ: kho ảnh có thể lên tới vài nghìn tấm, tải hết một
 * lượt sẽ rất chậm (tiêu chí 7).
 */
export async function GET(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '40')));

    // Lấy danh sách file trên UploadThing
    const res = await utapi.listFiles({
      limit,
      offset: (page - 1) * limit,
    });

    /*
     * Tra cứu ảnh nào đang được dùng.
     * Chỉ lấy đúng các cột chứa đường dẫn ảnh, không kéo cả bản ghi về.
     */
    const [products, news, categories] = await Promise.all([
      prisma.product.findMany({ select: { id: true, name: true, image: true, images: true } }),
      prisma.news.findMany({ select: { id: true, title: true, image: true } }),
      prisma.category.findMany({ select: { id: true, name: true, image: true } }),
    ]);

    // Bản đồ url → nơi đang dùng, dựng một lần thay vì dò lại cho từng ảnh.
    const usage = new Map<string, { type: string; id: number; label: string }[]>();

    /** Rút phần key ở cuối đường dẫn: ".../f/<key>" → "<key>". */
    const keyOf = (url: string) => url.split('/f/').pop()?.split('?')[0] ?? url;

    const add = (url: string | null, entry: { type: string; id: number; label: string }) => {
      if (!url) return;
      const k = keyOf(url);
      const list = usage.get(k) ?? [];
      list.push(entry);
      usage.set(k, list);
    };
    for (const p of products) {
      add(p.image, { type: 'product', id: p.id, label: p.name });
      for (const img of p.images ?? []) add(img, { type: 'product', id: p.id, label: p.name });
    }
    for (const n of news) add(n.image, { type: 'news', id: n.id, label: n.title });
    for (const c of categories) add(c.image, { type: 'category', id: c.id, label: c.name });

    const files = (res.files ?? []).map((f) => {
      // UploadThing v7 trả về `ufsUrl`; các bản cũ hơn dùng `url`.
      const url =
        (f as unknown as { ufsUrl?: string }).ufsUrl ??
        (f as unknown as { url?: string }).url ??
        `https://${APP_ID}.ufs.sh/f/${f.key}`;
      return {
        key: f.key,
        name: f.name,
        size: f.size,
        url,
        uploadedAt: f.uploadedAt,
        usedBy: usage.get(f.key) ?? [],
      };
    });

    return NextResponse.json({
      files,
      pagination: { page, limit, hasMore: files.length === limit },
    });
  } catch (error) {
    console.error('Error listing media:', error);
    return NextResponse.json(
      { error: 'Không tải được thư viện ảnh' },
      { status: 500 }
    );
  }
}

/**
 * Xoá ảnh khỏi UploadThing.
 *
 * Từ chối xoá ảnh đang được sản phẩm hoặc bài viết sử dụng: xoá đi thì trang
 * đó hiện ô vỡ, mà người xoá thường không biết mình vừa làm hỏng trang nào.
 */
export async function DELETE(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { key, url } = await request.json();
    if (!key) {
      return NextResponse.json({ error: 'Thiếu mã ảnh' }, { status: 400 });
    }

    if (url) {
      // Dùng `contains: key` để bắt được mọi biến thể URL của cùng một ảnh.
      const [usedByProduct, usedByNews] = await Promise.all([
        prisma.product.findFirst({
          where: { OR: [{ image: { contains: key } }, { images: { has: url } }] },
          select: { name: true },
        }),
        prisma.news.findFirst({ where: { image: { contains: key } }, select: { title: true } }),
      ]);
      const owner = usedByProduct?.name ?? usedByNews?.title;
      if (owner) {
        return NextResponse.json(
          { error: `Ảnh đang được dùng ở "${owner}". Hãy gỡ khỏi đó trước khi xoá.` },
          { status: 409 }
        );
      }
    }

    await utapi.deleteFiles([key]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json({ error: 'Không xoá được ảnh' }, { status: 500 });
  }
}

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

    /*
     * Ghi nhận một nơi đang dùng ảnh, BỎ QUA nếu đã ghi rồi.
     *
     * Sản phẩm thường để ảnh chính (`image`) nằm luôn trong thư viện ảnh
     * (`images[]`) — cùng một tấm, hai cột. Không lọc thì thư viện hiện sản
     * phẩm đó hai dòng y hệt nhau, người quản trị tưởng dữ liệu bị nhân đôi
     * hoặc có hai sản phẩm trùng tên (tiêu chí 1).
     */
    const add = (url: string | null, entry: { type: string; id: number; label: string }) => {
      if (!url) return;
      const k = keyOf(url);
      const list = usage.get(k) ?? [];
      if (list.some((e) => e.type === entry.type && e.id === entry.id)) return;
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

/** Số ảnh tối đa xoá trong một lượt: đủ cho một trang lưới, mà vẫn giữ
 *  thời gian phản hồi ngắn và giới hạn thiệt hại nếu bấm nhầm. */
const MAX_DELETE_BATCH = 50;

/**
 * Xoá một hoặc nhiều ảnh khỏi UploadThing.
 *
 * Nhận `{ key, url }` cho một ảnh, hoặc `{ keys: [{key, url}, ...] }` cho
 * nhiều ảnh. Xoá hàng loạt gom vào MỘT lượt gọi thay vì gọi lần lượt: kho
 * lưu trữ đặt ở Mỹ nên mỗi lượt tốn vài trăm mili-giây, xoá 20 ảnh riêng lẻ
 * sẽ mất hàng chục giây (tiêu chí 7).
 *
 * Từ chối xoá ảnh đang được sản phẩm hoặc bài viết sử dụng: xoá đi thì trang
 * đó hiện ô vỡ, mà người xoá thường không biết mình vừa làm hỏng trang nào.
 */
export async function DELETE(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();

    // Gộp hai dạng đầu vào về cùng một danh sách để xử lý chung một luồng.
    const items: { key: string; url?: string }[] = Array.isArray(body.keys)
      ? body.keys.filter((k: unknown): k is { key: string; url?: string } =>
          Boolean(k && typeof k === 'object' && typeof (k as { key?: unknown }).key === 'string')
        )
      : body.key
      ? [{ key: String(body.key), url: body.url }]
      : [];

    if (items.length === 0) {
      return NextResponse.json({ error: 'Thiếu mã ảnh' }, { status: 400 });
    }
    if (items.length > MAX_DELETE_BATCH) {
      return NextResponse.json(
        { error: `Chỉ xoá được tối đa ${MAX_DELETE_BATCH} ảnh một lượt.` },
        { status: 400 }
      );
    }

    /*
     * Kiểm tra ảnh đang được dùng.
     *
     * Đọc TOÀN BỘ cột ảnh một lần rồi đối chiếu trong bộ nhớ, thay vì truy vấn
     * riêng cho từng ảnh: xoá 50 ảnh mà truy vấn từng cái là 100 lượt đi-về
     * database, mỗi lượt ~0,5s tới Neon.
     */
    const [products, news, categories] = await Promise.all([
      prisma.product.findMany({ select: { name: true, image: true, images: true } }),
      prisma.news.findMany({ select: { title: true, image: true } }),
      prisma.category.findMany({ select: { name: true, image: true } }),
    ]);

    const keyOf = (url: string) => url.split('/f/').pop()?.split('?')[0] ?? url;
    const owners = new Map<string, string>();
    const claim = (url: string | null, label: string) => {
      if (!url) return;
      const k = keyOf(url);
      if (!owners.has(k)) owners.set(k, label);
    };
    for (const p of products) {
      claim(p.image, p.name);
      for (const img of p.images ?? []) claim(img, p.name);
    }
    for (const n of news) claim(n.image, n.title);
    for (const c of categories) claim(c.image, c.name);

    const blocked = items.filter((it) => owners.has(it.key));
    const deletable = items.filter((it) => !owners.has(it.key));

    /* Chỉ xoá một ảnh mà ảnh đó đang được dùng → báo lỗi luôn, đúng như trước.
     * Xoá nhiều ảnh → vẫn xoá những ảnh hợp lệ rồi báo lại số bị bỏ qua, để
     * một ảnh vướng không chặn cả lượt. */
    if (deletable.length === 0) {
      const first = blocked[0];
      return NextResponse.json(
        {
          error:
            blocked.length === 1
              ? `Ảnh đang được dùng ở "${owners.get(first.key)}". Hãy gỡ khỏi đó trước khi xoá.`
              : `Cả ${blocked.length} ảnh đều đang được sử dụng, không xoá được ảnh nào.`,
        },
        { status: 409 }
      );
    }

    /*
     * PHẢI kiểm tra `deletedCount`, không được chỉ nhìn `success`.
     *
     * UploadThing trả về `{success: true, deletedCount: 0}` khi không xoá được
     * gì cả — `success` chỉ có nghĩa "yêu cầu gửi đi thành công", không phải
     * "đã xoá xong". Bản trước bỏ qua kết quả này nên luôn trả 200: giao diện
     * gỡ thẻ ảnh khỏi màn hình và báo "Đã xoá ảnh", nhưng ảnh vẫn nằm nguyên
     * trên máy chủ và hiện lại ngay khi tải lại trang (tiêu chí 8).
     */
    const result = await utapi.deleteFiles(deletable.map((it) => it.key));
    if (!result.success || result.deletedCount === 0) {
      console.error('Xoá ảnh không thành công:', { keys: deletable.map((i) => i.key), result });
      return NextResponse.json(
        {
          error:
            'Máy chủ lưu trữ không xoá được ảnh này. Ảnh có thể đã bị xoá trước đó — hãy tải lại trang để xem danh sách mới nhất.',
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      deletedCount: result.deletedCount,
      deletedKeys: deletable.map((it) => it.key),
      // Danh sách ảnh bị bỏ qua kèm nơi đang dùng, để giao diện nói rõ vì sao.
      skipped: blocked.map((it) => ({ key: it.key, owner: owners.get(it.key) })),
    });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json({ error: 'Không xoá được ảnh' }, { status: 500 });
  }
}

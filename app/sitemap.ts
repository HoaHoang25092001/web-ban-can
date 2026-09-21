import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { prisma } from '@/lib/prisma';



// Sitemap đọc dữ liệu thật từ database nên không thể prerender lúc build.
export const dynamic = 'force-dynamic';

/**
 * Sitemap giúp Google lập chỉ mục đầy đủ trang sản phẩm và danh mục
 * (tiêu chí 4: URL sạch, cấu trúc logic).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/introduce`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/huong-dan-mua-hang`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/chinh-sach`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/cau-hoi-thuong-gap`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/news`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/trang`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.8 },
  ];

  try {
    /*
     * Gộp 3 bảng vào MỘT truy vấn bằng UNION ALL.
     *
     * Ba lệnh findMany riêng tuy chạy song song nhưng Neon (Postgres serverless
     * đặt tại Mỹ) xử lý tuần tự trên kết nối pooled, nên tổng thời gian xấp xỉ
     * 3 lần độ trễ mạng (~2,5s). Một truy vấn chỉ tốn một vòng đi-về (tiêu chí 7).
     */
    const rows = await prisma.$queryRaw<Array<{
      kind: string; id: number; slug: string | null; updated_at: Date;
    }>>`
      SELECT 'category' AS kind, id, NULL::text AS slug, "updatedAt" AS updated_at FROM categories
      UNION ALL
      SELECT 'product', id, NULL::text, "updatedAt" FROM products
      UNION ALL
      SELECT 'news', id, NULL::text, "updatedAt" FROM news WHERE published = true
      UNION ALL
      SELECT 'page', id, slug, "updatedAt" FROM pages WHERE published = true
    `;

    const categories = rows.filter((r) => r.kind === 'category');
    const products = rows.filter((r) => r.kind === 'product');
    const news = rows.filter((r) => r.kind === 'news');
    // Trang nội dung định địa chỉ bằng slug chứ không phải id, nên phải bỏ qua
    // bản ghi thiếu slug — nếu không sẽ sinh ra URL "/trang/null" hỏng.
    const pages = rows.filter((r) => r.kind === 'page' && r.slug);

    return [
      ...staticRoutes,
      ...categories.map((c) => ({
        url: `${SITE_URL}/category/${c.id}`,
        lastModified: c.updated_at,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
      ...products.map((p) => ({
        url: `${SITE_URL}/product/${p.id}`,
        lastModified: p.updated_at,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      })),
      ...news.map((n) => ({
        url: `${SITE_URL}/news/${n.id}`,
        lastModified: n.updated_at,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      })),
      ...pages.map((p) => ({
        url: `${SITE_URL}/trang/${p.slug}`,
        lastModified: p.updated_at,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
    ];
  } catch (error) {
    // Không để lỗi kết nối database làm hỏng cả sitemap
    console.error('Error building sitemap:', error);
    return staticRoutes;
  }
}

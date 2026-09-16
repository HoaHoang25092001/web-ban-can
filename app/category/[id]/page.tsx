import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import ProductCard from '../../../components/ProductCard';
import { Metadata } from 'next';
import { PRIMARY_PHONE, SITE_URL, buildBreadcrumbJsonLd } from '@/lib/site';

// Cache 5 phút: danh sách sản phẩm theo danh mục thay đổi không thường xuyên,
// không cần truy vấn lại database ở mỗi lượt xem (tiêu chí 7).
export const revalidate = 300;

interface CategoryPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{ page?: string }>;
}

/**
 * Số sản phẩm mỗi trang.
 * Danh mục lớn nhất có hơn 1.100 sản phẩm — tải hết một lần sẽ mất nhiều giây
 * và tạo ra trang nặng hàng chục MB (tiêu chí 7). 24 sản phẩm chia hết cho lưới
 * 2/3/4 cột nên hàng cuối luôn đầy, không bị lẻ.
 */
const PER_PAGE = 24;

/**
 * Tra cứu danh mục, dùng chung cho generateMetadata và thân trang.
 *
 * Next.js gọi generateMetadata và component như hai lượt riêng, nên bản trước
 * truy vấn `category.findUnique` HAI LẦN cho mỗi lượt xem. `cache` của React
 * gộp lại thành một lần trong cùng một request (tiêu chí 7).
 */
const getCategory = cache((id: number) =>
  prisma.category.findUnique({ where: { id } })
);

/**
 * Đếm số sản phẩm trong danh mục.
 *
 * Phép đếm phải quét toàn bộ hàng của danh mục — danh mục lớn nhất có hơn 1.100
 * sản phẩm — mà chỉ dùng để tính số trang. Con số đó gần như không đổi, nên
 * cache riêng 1 giờ thay vì quét lại mỗi 5 phút cùng danh sách sản phẩm.
 */
const getCount = unstable_cache(
  (id: number) => prisma.product.count({ where: { categoryId: id } }),
  ['category-product-count'],
  { revalidate: 3600, tags: ['products'] }
);

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const category = await getCategory(parseInt(id));
    if (!category) return { title: 'Không tìm thấy danh mục - Vạn Thịnh Phát' };

    /* Tiêu đề đưa cụm khách thực sự gõ ("cân bàn điện tử giá rẻ") lên đầu,
     * nhưng vẫn kèm "chính hãng" để không bị hiểu là hàng trôi nổi. */
    const title = `${category.name} Giá Rẻ Chính Hãng`;
    const description =
      `${category.name} giá rẻ chính hãng tại TP.HCM. Có tem kiểm định, ` +
      `bảo hành 12 tháng, giao lắp tận nơi. Gọi ${PRIMARY_PHONE} để được báo giá nhanh.`;

    return {
      title,
      description,
      // Chỉ trang 1 mới là địa chỉ chuẩn; các trang 2, 3… trỏ canonical về
      // chính nó để Google không coi là nội dung trùng lặp.
      alternates: { canonical: `/category/${category.id}` },
      openGraph: {
        type: 'website',
        title,
        description,
        url: `${SITE_URL}/category/${category.id}`,
      },
    };
  } catch {
    return { title: 'Danh mục sản phẩm - Vạn Thịnh Phát' };
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const categoryId = parseInt(id);
  const currentPage = Math.max(1, parseInt(pageParam || '1') || 1);

  if (isNaN(categoryId)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-md border max-w-md">
          <div className="text-red-500 mb-4">
            <i className="ri-error-warning-line text-6xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ID danh mục không hợp lệ</h2>
          <p className="text-gray-600 mb-6">Vui lòng quay lại trang chủ và thử lại.</p>
          <Link
            href="/"
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95"
          >
            <i className="ri-home-line mr-2"></i>
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  // Tải trực tiếp dữ liệu từ Database thông qua Prisma
  const [category, products, totalProducts] = await Promise.all([
    getCategory(categoryId),
    prisma.product.findMany({
      where: { categoryId: categoryId },
      // Chỉ lấy các cột cần cho card, không kéo cả mô tả dài về
      select: {
        id: true, name: true, capacity: true, accuracy: true,
        price: true, image: true, featured: true,
      },
      /*
       * Sản phẩm CÓ ẢNH lên trước.
       * 52/3.226 sản phẩm không lấy được ảnh từ web cũ; nếu chỉ sắp theo ngày
       * tạo thì chúng dồn lên đầu trang 1 — khách mở danh mục ra thấy toàn ô
       * xám trống, tưởng website hỏng (tiêu chí 3 & 9).
       * Postgres xếp NULL sau cùng khi dùng 'desc' với nulls last.
       */
      orderBy: [
        { image: { sort: 'desc', nulls: 'last' } },
        { createdAt: 'desc' },
      ],
      skip: (currentPage - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    getCount(categoryId),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalProducts / PER_PAGE));

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-md border max-w-md">
          <div className="text-red-500 mb-4">
            <i className="ri-error-warning-line text-6xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy danh mục</h2>
          <p className="text-gray-600 mb-4">Danh mục không tồn tại hoặc đã bị xóa khỏi hệ thống.</p>
          <p className="text-gray-400 mb-6 text-xs">ID danh mục: {id}</p>
          <Link
            href="/"
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95"
          >
            <i className="ri-home-line mr-2"></i>
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4 font-medium">
            <Link href="/" className="hover:text-blue-600 transition-colors inline-flex items-center min-h-touch">
              Trang chủ
            </Link>
            <i className="ri-arrow-right-s-line text-gray-400"></i>
            <span className="text-gray-400">Danh mục sản phẩm</span>
            <i className="ri-arrow-right-s-line text-gray-400"></i>
            <span className="text-gray-900 font-semibold">{category.name}</span>
          </nav>

          {/* Category Header */}
          <div className="flex items-start space-x-6">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                {category.icon && (
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 text-blue-600 rounded-xl mr-4 shadow-sm border border-blue-100">
                    <i className={`${category.icon} text-2xl`}></i>
                  </div>
                )}
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">{category.name}</h1>
              </div>
              {category.description && (
                <p className="text-base text-gray-600 leading-relaxed max-w-4xl mt-2">{category.description}</p>
              )}
              <p className="text-xs text-slate-500 font-bold bg-slate-100 border rounded-full px-3 py-1 inline-block mt-3 uppercase tracking-wider">
                {totalProducts.toLocaleString('vi-VN')} sản phẩm
                {totalPages > 1 && ` · trang ${currentPage}/${totalPages}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border shadow-sm">
            <i className="ri-inbox-line text-6xl text-gray-300 mb-4 block"></i>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Chưa có sản phẩm nào
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Danh mục này hiện tại chưa có sản phẩm nào. Vui lòng quay lại sau.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                headingLevel={2}
                product={{
                  id: product.id,
                  name: product.name,
                  category: { id: categoryId, name: category.name },
                  capacity: product.capacity ?? '',
                  accuracy: product.accuracy ?? '',
                  price: product.price ?? '',
                  image: product.image ?? '',
                  featured: product.featured,
                }}
              />
            ))}
          </div>
        )}

        {/* ── Phân trang ── */}
        {totalPages > 1 && (
          <nav aria-label="Phân trang sản phẩm" className="mt-10 flex flex-col items-center gap-3">
            <ul className="flex items-center gap-1 flex-wrap justify-center">
              {/* Trang trước */}
              <li>
                {currentPage > 1 ? (
                  <Link
                    href={`/category/${categoryId}?page=${currentPage - 1}`}
                    rel="prev"
                    aria-label="Trang trước"
                    className="inline-flex items-center gap-1 min-h-touch px-3 rounded-control border border-surface-border bg-white text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                  >
                    <i className="ri-arrow-left-s-line" aria-hidden="true"></i>
                    <span className="hidden sm:inline">Trước</span>
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 min-h-touch px-3 rounded-control border border-surface-border bg-slate-50 text-slate-400 cursor-not-allowed">
                    <i className="ri-arrow-left-s-line" aria-hidden="true"></i>
                    <span className="hidden sm:inline">Trước</span>
                  </span>
                )}
              </li>

              {/* Dãy số trang: luôn hiện trang đầu, trang cuối và lân cận trang
                  hiện tại; phần bị lược bỏ thay bằng dấu … (tiêu chí 4) */}
              {buildPageList(currentPage, totalPages).map((item, idx) =>
                item === 'gap' ? (
                  <li key={`gap-${idx}`} aria-hidden="true" className="px-2 text-slate-400">
                    …
                  </li>
                ) : (
                  <li key={item}>
                    <Link
                      href={`/category/${categoryId}?page=${item}`}
                      aria-label={`Trang ${item}`}
                      aria-current={item === currentPage ? 'page' : undefined}
                      className={`inline-flex items-center justify-center min-w-touch min-h-touch px-3 rounded-control border transition-colors tabular-nums ${
                        item === currentPage
                          ? 'bg-brand-600 text-white border-brand-600 font-semibold'
                          : 'bg-white text-slate-700 border-surface-border hover:bg-brand-50 hover:text-brand-700'
                      }`}
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}

              {/* Trang sau */}
              <li>
                {currentPage < totalPages ? (
                  <Link
                    href={`/category/${categoryId}?page=${currentPage + 1}`}
                    rel="next"
                    aria-label="Trang sau"
                    className="inline-flex items-center gap-1 min-h-touch px-3 rounded-control border border-surface-border bg-white text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                  >
                    <span className="hidden sm:inline">Sau</span>
                    <i className="ri-arrow-right-s-line" aria-hidden="true"></i>
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 min-h-touch px-3 rounded-control border border-surface-border bg-slate-50 text-slate-400 cursor-not-allowed">
                    <span className="hidden sm:inline">Sau</span>
                    <i className="ri-arrow-right-s-line" aria-hidden="true"></i>
                  </span>
                )}
              </li>
            </ul>

            <p className="text-sm text-slate-500">
              Trang {currentPage} / {totalPages} · {totalProducts.toLocaleString('vi-VN')} sản phẩm
            </p>
          </nav>
        )}
      </div>
    </div>
  );
}

/**
 * Dựng dãy số trang rút gọn: 1 … 4 5 [6] 7 8 … 42
 * Danh mục lớn nhất có tới 47 trang — hiện hết số trang sẽ tràn màn hình và
 * không ai bấm nổi trang giữa.
 */
function buildPageList(current: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set<number>([1, total, current]);
  for (let d = 1; d <= 1; d++) {
    if (current - d > 1) pages.add(current - d);
    if (current + d < total) pages.add(current + d);
  }
  const sorted = [...pages].sort((a, b) => a - b);

  const out: (number | 'gap')[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push('gap');
    out.push(p);
    prev = p;
  }
  return out;
}
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Tìm Kiếm Sản Phẩm - Vạn Thịnh Phát',
  description: 'Tìm kiếm nhanh các thiết bị cân điện tử chính hãng từ thương hiệu uy tín chất lượng cao.',
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || '';
  const currentPage = parseInt(resolvedSearchParams.page || '1');
  const limit = 12;
  const skip = (currentPage - 1) * limit;

  // Nếu không có từ khóa, hiển thị trang tìm kiếm trống
  if (!query.trim()) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center bg-white p-12 rounded-2xl border shadow-sm max-w-xl mx-auto">
            <i className="ri-search-line text-6xl text-slate-300 mb-4 block"></i>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Tìm kiếm sản phẩm
            </h1>
            <p className="text-gray-550 text-slate-500 mb-8">
              Vui lòng nhập từ khóa tìm kiếm trên thanh tìm kiếm để bắt đầu tìm sản phẩm.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95"
            >
              <i className="ri-home-line mr-2"></i>
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Cấu hình điều kiện tìm kiếm bằng Prisma
  const where: any = {
    OR: [
      {
        name: {
          contains: query.trim(),
          mode: 'insensitive',
        },
      },
      {
        description: {
          contains: query.trim(),
          mode: 'insensitive',
        },
      },
    ],
  };

  // Thực hiện song song truy vấn lấy sản phẩm và tổng đếm từ DB trên Server
  const [productsRaw, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  // Chuẩn hóa dữ liệu sang client-safe format
  const products = productsRaw.map(p => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    category: {
      id: p.category.id,
      name: p.category.name,
    },
    capacity: p.capacity ?? '',
    accuracy: p.accuracy ?? '',
    price: p.price ?? '',
    image: p.image ?? '',
  }));

  return (
    <div className="min-h-screen bg-gray-50 pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
            Kết quả tìm kiếm
          </h1>
          <p className="text-gray-650 text-slate-500 font-medium text-sm">
            Từ khóa: <span className="font-extrabold text-blue-600">&quot;{query}&quot;</span>
          </p>
          <p className="text-xs text-slate-500 font-bold bg-blue-50 border border-blue-100 rounded-full px-3 py-1 inline-block mt-3 uppercase tracking-wider">
            Tìm thấy <span className="text-blue-700">{total}</span> sản phẩm phù hợp
          </p>
        </div>

        {/* No Results */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border shadow-sm max-w-xl mx-auto">
            <i className="ri-search-line text-6xl text-gray-300 mb-4 block"></i>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Không tìm thấy sản phẩm
            </h2>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">
              Không có sản phẩm nào phù hợp với từ khóa &quot;{query}&quot;. Vui lòng thử lại với từ khóa khác.
            </p>
            <div className="space-y-3 bg-slate-50 p-5 rounded-xl text-left border text-sm text-slate-650 max-w-sm mx-auto">
              <p className="font-bold text-slate-700">Gợi ý tìm kiếm:</p>
              <ul className="space-y-1.5 text-xs text-slate-500 font-medium">
                <li>• Kiểm tra kỹ chính tả từ khóa.</li>
                <li>• Sử dụng các từ khóa ngắn gọn, thông dụng (VD: &quot;cân bàn&quot;, &quot;tanita&quot;).</li>
                <li>• Thử tìm kiếm theo hãng sản xuất hoặc danh mục.</li>
              </ul>
            </div>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95 mt-8"
            >
              <i className="ri-home-line mr-2"></i>
              Về trang chủ
            </Link>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-12">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                {currentPage === 1 ? (
                  <span className="px-4 py-2 border rounded-lg text-slate-350 bg-slate-100/50 cursor-not-allowed select-none text-xs md:text-sm font-bold">
                    <i className="ri-arrow-left-line"></i>
                  </span>
                ) : (
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}&page=${currentPage - 1}`}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs md:text-sm font-bold text-slate-700 bg-white"
                  >
                    <i className="ri-arrow-left-line"></i>
                  </Link>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <div key={page}>
                    {currentPage === page ? (
                      <span className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs md:text-sm font-bold shadow-md select-none">
                        {page}
                      </span>
                    ) : (
                      <Link
                        href={`/search?q=${encodeURIComponent(query)}&page=${page}`}
                        className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-55 bg-white text-xs md:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        {page}
                      </Link>
                    )}
                  </div>
                ))}

                {currentPage === totalPages ? (
                  <span className="px-4 py-2 border rounded-lg text-slate-350 bg-slate-100/50 cursor-not-allowed select-none text-xs md:text-sm font-bold">
                    <i className="ri-arrow-right-line"></i>
                  </span>
                ) : (
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}&page=${currentPage + 1}`}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs md:text-sm font-bold text-slate-700 bg-white"
                  >
                    <i className="ri-arrow-right-line"></i>
                  </Link>
                )}
              </div>
            )}
          </>
        )}

        {/* Back to Home */}
        <div className="text-center mt-16 border-t pt-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-extrabold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <i className="ri-arrow-left-line mr-2"></i>
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

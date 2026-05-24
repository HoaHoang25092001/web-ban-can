import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import ProductCard from '../../../components/ProductCard';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) }
    });
    if (!category) return { title: 'Không tìm thấy danh mục - Vạn Thịnh Phát' };
    return {
      title: `${category.name} - Cân điện tử chất lượng cao`,
      description: category.description || `Mua cân điện tử chính hãng thuộc danh mục ${category.name} uy tín, chính xác cao.`
    };
  } catch {
    return { title: 'Danh mục sản phẩm - Vạn Thịnh Phát' };
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { id } = await params;
  const categoryId = parseInt(id);

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
  const [category, products] = await Promise.all([
    prisma.category.findUnique({
      where: { id: categoryId }
    }),
    prisma.product.findMany({
      where: { categoryId: categoryId },
      orderBy: { createdAt: 'desc' }
    })
  ]);

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
            <Link href="/" className="hover:text-blue-600 transition-colors">
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
                {products.length} sản phẩm có sẵn
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
      </div>
    </div>
  );
}
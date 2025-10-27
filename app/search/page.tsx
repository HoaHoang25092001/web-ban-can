'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

interface Product {
  id: number;
  name: string;
  category: {
    id: number;
    name: string;
  };
  capacity: string;
  accuracy: string;
  price: string;
  image: string;
  featured?: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `/api/products?search=${encodeURIComponent(query)}&page=${currentPage}&limit=12`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }

        const data = await response.json();
        setProducts(data.products || []);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!query.trim()) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <i className="ri-search-line text-6xl text-gray-400 mb-4"></i>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Tìm kiếm sản phẩm
            </h1>
            <p className="text-gray-600 mb-8">
              Vui lòng nhập từ khóa tìm kiếm để bắt đầu
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i className="ri-home-line mr-2"></i>
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Kết quả tìm kiếm
          </h1>
          <p className="text-gray-600">
            Từ khóa: <span className="font-semibold text-gray-900">&quot;{query}&quot;</span>
          </p>
          {pagination && (
            <p className="text-gray-600 mt-2">
              Tìm thấy <span className="font-semibold text-blue-600">{pagination.total}</span> sản phẩm
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Đang tìm kiếm...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <i className="ri-error-warning-line text-4xl text-red-500 mb-4"></i>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-20">
            <i className="ri-search-line text-6xl text-gray-400 mb-4"></i>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Không tìm thấy sản phẩm
            </h2>
            <p className="text-gray-600 mb-8">
              Không có sản phẩm nào phù hợp với từ khóa &quot;{query}&quot;
            </p>
            <div className="space-y-4">
              <p className="text-gray-600">Gợi ý:</p>
              <ul className="text-gray-600 space-y-2">
                <li>• Kiểm tra lại chính tả của từ khóa</li>
                <li>• Thử sử dụng từ khóa khác hoặc ngắn gọn hơn</li>
                <li>• Sử dụng các từ khóa chung hơn</li>
              </ul>
            </div>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors mt-8"
            >
              <i className="ri-home-line mr-2"></i>
              Về trang chủ
            </Link>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && products.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} showCategory={true} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <i className="ri-arrow-left-line"></i>
                </button>

                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <i className="ri-arrow-right-line"></i>
                </button>
              </div>
            )}
          </>
        )}

        {/* Back to Home */}
        {!loading && (
          <div className="text-center mt-12">
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
            >
              <i className="ri-arrow-left-line mr-2"></i>
              Quay lại trang chủ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}

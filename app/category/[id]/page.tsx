'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import ProductDetail from '../../../components/ProductDetail';

interface Product {
  id: number;
  name: string;
  description: string | null;
  capacity: string | null;
  accuracy: string | null;
  price: string | null;
  image: string | null;
  featured: boolean;
}

interface Category {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  image: string | null;
}

interface CategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { id } = use(params);
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch category details
        const categoryResponse = await fetch(`/api/categories/${id}`);
        
        if (!categoryResponse.ok) {
          const errorText = await categoryResponse.text();
          throw new Error(`Failed to fetch category: ${categoryResponse.status} - ${errorText}`);
        }
        
        const categoryData = await categoryResponse.json();
        setCategory(categoryData);

        // Fetch products in this category
        const productsResponse = await fetch(`/api/products?categoryId=${id}`);
        
        if (!productsResponse.ok) {
          const errorText = await productsResponse.text();
          throw new Error(`Failed to fetch products: ${productsResponse.status} - ${errorText}`);
        }
        
        const productsData = await productsResponse.json();
        setProducts(productsData.products || []);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCategoryAndProducts();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <i className="ri-error-warning-line text-6xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi khi tải danh mục</h2>
          <p className="text-gray-600 mb-4">
            Chi tiết lỗi: {error}
          </p>
          <p className="text-gray-500 mb-4 text-sm">
            Category ID: {id}
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <i className="ri-home-line mr-2"></i>
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <i className="ri-error-warning-line text-6xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không thể tải danh mục</h2>
          <p className="text-gray-600 mb-4">
            Danh mục không tồn tại hoặc đã bị xóa
          </p>
          <p className="text-gray-500 mb-4 text-sm">
            Category ID: {id}
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
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
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-blue-600">
              Trang chủ
            </Link>
            <i className="ri-arrow-right-s-line"></i>
            <span>Danh mục sản phẩm</span>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-gray-900 font-medium">{category.name}</span>
          </nav>

          {/* Category Header */}
          <div className="flex items-start space-x-6">
            {category.image && (
              <div className="flex-shrink-0">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-24 h-24 object-cover rounded-lg border"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center mb-2">
                {category.icon && (
                  <i className={`${category.icon} text-3xl text-blue-600 mr-3`}></i>
                )}
                <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
              </div>
              {category.description && (
                <p className="text-lg text-gray-600">{category.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                {products.length} sản phẩm có sẵn
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <i className="ri-inbox-line text-6xl text-gray-400 mb-4"></i>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Chưa có sản phẩm nào
            </h3>
            <p className="text-gray-600">
              Danh mục này hiện tại chưa có sản phẩm nào. Vui lòng quay lại sau.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                  {product.image && product.image.trim() !== '' ? (
                    <img
                      src={product.image.startsWith('/') ? `http://localhost:3000${product.image}` : product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover object-center hover:opacity-75 transition-opacity"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=${encodeURIComponent(product.name.substring(0, 20))}`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <i className="ri-image-line text-4xl text-gray-400"></i>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    {product.capacity && (
                      <p><span className="font-medium">Khối lượng:</span> {product.capacity}</p>
                    )}
                    {product.accuracy && (
                      <p><span className="font-medium">Độ chính xác:</span> {product.accuracy}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    {product.price ? (
                      <span className="text-xl font-bold text-blue-600">
                        {product.price} 
                      </span>
                    ) : (
                      <span className="text-gray-500">Liên hệ</span>
                    )}
                    <button
                      onClick={() => setSelectedProductId(product.id)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Xem Chi Tiết
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <ProductDetail 
        productId={selectedProductId}
        onClose={() => setSelectedProductId(null)}
      />
    </div>
  );
}
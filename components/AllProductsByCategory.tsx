'use client';

import { useState, useEffect } from 'react';
import ProductDetail from './ProductDetail';

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
  products: Product[];
}

export default function AllProductsByCategory() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  useEffect(() => {
    const fetchCategoriesWithProducts = async () => {
      try {
        const response = await fetch('/api/categories?includeProducts=true');
        if (!response.ok) {
          throw new Error('Failed to fetch categories with products');
        }
        const data = await response.json();
        setCategories(data.categories || []);
        // Mở rộng tất cả danh mục ban đầu
        setExpandedCategories(new Set(data.categories?.map((cat: Category) => cat.id) || []));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesWithProducts();
  }, []);

  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getDefaultImage = (productName: string, categoryName: string) => {
    const query = encodeURIComponent(`${productName} ${categoryName} electronic scale weighing equipment`);
    return `https://readdy.ai/api/search-image?query=${query}&width=300&height=250&orientation=landscape`;
  };

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Tất Cả Sản Phẩm</h2>
            <p className="text-xl text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Tất Cả Sản Phẩm</h2>
            <p className="text-red-600">Lỗi: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Tất Cả Sản Phẩm</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Khám phá toàn bộ danh mục sản phẩm cân điện tử chất lượng cao của chúng tôi
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center text-gray-500">
            <p>Chưa có sản phẩm nào.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {categories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Category Header */}
                <div 
                  className="bg-blue-600 text-white p-6 cursor-pointer hover:bg-blue-700 transition-colors"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {category.icon && (
                        <i className={`${category.icon} text-2xl`}></i>
                      )}
                      <div>
                        <h3 className="text-2xl font-bold">{category.name}</h3>
                        {category.description && (
                          <p className="text-blue-100 mt-1">{category.description}</p>
                        )}
                        <p className="text-blue-200 text-sm mt-1">
                          {category.products.length} sản phẩm
                        </p>
                      </div>
                    </div>
                    <div className="transform transition-transform duration-200">
                      <svg 
                        className={`w-6 h-6 ${expandedCategories.has(category.id) ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Products Grid */}
                {expandedCategories.has(category.id) && (
                  <div className="p-6">
                    {category.products.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        Chưa có sản phẩm nào trong danh mục này.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {category.products.map((product) => (
                          <div key={product.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                              <img
                                src={product.image || getDefaultImage(product.name, category.name)}
                                alt={product.name}
                                className="w-full h-48 object-cover object-center"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = getDefaultImage(product.name, category.name);
                                }}
                              />
                            </div>
                            <div className="p-4">
                              <div className="mb-2 flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h4>
                                {product.featured && (
                                  <span className="inline-block px-2 py-1 text-xs font-semibold text-yellow-600 bg-yellow-100 rounded-full">
                                    Nổi bật
                                  </span>
                                )}
                              </div>
                              
                              {product.description && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
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
                                  <span className="text-lg font-bold text-blue-600">{product.price} </span>
                                ) : (
                                  <span className="text-sm text-gray-500">Liên hệ báo giá</span>
                                )}
                                <button 
                                  onClick={() => setSelectedProductId(product.id)}
                                  className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                                >
                                  Chi tiết
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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
    </section>
  );
}

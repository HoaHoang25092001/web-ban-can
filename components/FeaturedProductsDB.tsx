'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';

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

interface CategoryWithProducts {
  id: number;
  name: string;
  products: Product[];
}

export default function FeaturedProducts() {
  const [categoriesWithProducts, setCategoriesWithProducts] = useState<CategoryWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProductsByCategory = async () => {
      try {
        const response = await fetch('/api/products?featured=true');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        const products = data.products || [];
        
        // Group products by category
        const categoriesMap = new Map<number, CategoryWithProducts>();
        products.forEach((product: Product) => {
          const categoryId = product.category.id;
          if (!categoriesMap.has(categoryId)) {
            categoriesMap.set(categoryId, {
              id: categoryId,
              name: product.category.name,
              products: []
            });
          }
          categoriesMap.get(categoryId)!.products.push(product);
        });
        
        setCategoriesWithProducts(Array.from(categoriesMap.values()));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Fallback to static data grouped by categories if API fails
        setCategoriesWithProducts([
          {
            id: 1,
            name: 'Cân điện tử',
            products: [
              {
                id: 1,
                name: 'Cân điện tử ACS-30',
                category: { id: 1, name: 'Cân điện tử' },
                capacity: '30kg',
                accuracy: '1g',
                price: '2,500,000',
                image: 'https://readdy.ai/api/search-image?query=professional%20digital%20scale%20ACS-30%20model%20with%20stainless%20steel%20platform%20and%20bright%20LCD%20display%2C%20commercial%20weighing%20equipment%2C%20white%20background%20with%20blue%20accents&width=300&height=250&seq=prod-1&orientation=landscape'
              }
            ]
          },
          {
            id: 2,
            name: 'Cân kỹ thuật',
            products: [
              {
                id: 2,
                name: 'Cân kỹ thuật FA-210',
                category: { id: 2, name: 'Cân kỹ thuật' },
                capacity: '210g',
                accuracy: '0.1mg',
                price: '15,800,000',
                image: 'https://readdy.ai/api/search-image?query=precision%20analytical%20balance%20FA-210%20with%20glass%20windshield%20chamber%2C%20laboratory%20scale%20with%20high%20accuracy%20display%2C%20scientific%20equipment%20on%20white%20background&width=300&height=250&seq=prod-2&orientation=landscape'
              }
            ]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProductsByCategory();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Sản Phẩm Nổi Bật</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Đang tải sản phẩm...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Sản Phẩm Nổi Bật</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Những sản phẩm cân điện tử được khách hàng tin tưởng và lựa chọn nhiều nhất theo từng danh mục
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
            Lưu ý: Đang hiển thị dữ liệu mẫu. API chưa kết nối database.
          </div>
        )}

        <div className="space-y-12">
          {categoriesWithProducts.map((category) => (
            <div key={category.id} className="bg-gray-50 rounded-lg p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-600">
                    {category.products.length} sản phẩm nổi bật
                  </p>
                </div>
                <Link
                  href={`/category/${category.id}`}
                  className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 bg-white rounded-md hover:bg-blue-50 transition-colors text-sm font-medium"
                >
                  Xem tất cả
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
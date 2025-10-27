'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export default function ProductCategoriesDB() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/categories', {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Categories loaded from API:', data.categories?.length || 0, 'items');
        setCategories(data.categories || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        // Fallback to static data only if no data was loaded
        setCategories([
          {
            id: 1,
            name: 'Cân điện tử',
            description: 'Cân điện tử chính xác cho mọi mục đích sử dụng',
            icon: 'ri-scales-line'
          },
          {
            id: 2,
            name: 'Cân kỹ thuật',
            description: 'Cân kỹ thuật độ chính xác cao cho phòng thí nghiệm',
            icon: 'ri-flask-line'
          },
          {
            id: 3,
            name: 'Cân bàn điện tử',
            description: 'Cân bàn điện tử tiện lợi cho cửa hàng, văn phòng',
            icon: 'ri-table-line'
          },
          {
            id: 4,
            name: 'Cân sàn điện tử',
            description: 'Cân sàn công nghiệp chịu tải trọng lớn',
            icon: 'ri-building-2-line'
          },
          {
            id: 5,
            name: 'Cân ô tô',
            description: 'Cân ô tô, cân xe tải chính xác và bền bỉ',
            icon: 'ri-truck-line'
          },
          {
            id: 6,
            name: 'Cân treo móc cẩu',
            description: 'Cân treo, cân móc cẩu an toàn và chính xác',
            icon: 'ri-hammer-line'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Danh Mục Sản Phẩm</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Đang tải danh mục sản phẩm...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Danh Mục Sản Phẩm</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Khám phá đa dạng các loại cân điện tử chất lượng cao phù hợp với mọi nhu cầu
          </p>
        </div>

        {error && categories.length === 0 && (
          <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            Lỗi: Không thể tải dữ liệu từ server. Vui lòng thử lại sau.
          </div>
        )}
        
        {error && categories.length > 0 && (
          <div className="mb-8 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
            Lưu ý: Đang hiển thị dữ liệu dự phòng. Đã có lỗi khi kết nối API.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}`}
              className="group block bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
                  <i className={`${category.icon || 'ri-image-line'} text-4xl text-blue-600`}></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-gray-600 mb-4 italic line-clamp-2">
                  {category.description}
                </p>
                <div className="flex items-center justify-center text-blue-600 font-medium">
                  <span>Xem sản phẩm</span>
                  <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

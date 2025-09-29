'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  image: string;
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
            icon: 'ri-scales-line',
            image: 'https://readdy.ai/api/search-image?query=professional%20digital%20electronic%20scale%20with%20LCD%20display%20on%20clean%20white%20background%2C%20precision%20weighing%20equipment%2C%20modern%20design%20with%20blue%20accents&width=400&height=300&seq=cat-1&orientation=landscape'
          },
          {
            id: 2,
            name: 'Cân kỹ thuật',
            description: 'Cân kỹ thuật độ chính xác cao cho phòng thí nghiệm',
            icon: 'ri-flask-line',
            image: 'https://readdy.ai/api/search-image?query=precision%20analytical%20balance%20laboratory%20scale%20with%20glass%20chamber%20and%20digital%20display%2C%20high%20accuracy%20technical%20scale%2C%20scientific%20equipment%20white%20background&width=400&height=300&seq=cat-2&orientation=landscape'
          },
          {
            id: 3,
            name: 'Cân bàn điện tử',
            description: 'Cân bàn điện tử tiện lợi cho cửa hàng, văn phòng',
            icon: 'ri-table-line',
            image: 'https://readdy.ai/api/search-image?query=table%20top%20digital%20scale%20with%20stainless%20steel%20platform%20and%20LED%20display%2C%20commercial%20weighing%20scale%20for%20retail%20shops%2C%20clean%20white%20background%20with%20blue%20details&width=400&height=300&seq=cat-3&orientation=landscape'
          },
          {
            id: 4,
            name: 'Cân sàn điện tử',
            description: 'Cân sàn công nghiệp chịu tải trọng lớn',
            icon: 'ri-building-2-line',
            image: 'https://readdy.ai/api/search-image?query=heavy%20duty%20industrial%20floor%20scale%20platform%20with%20digital%20indicator%2C%20warehouse%20weighing%20equipment%2C%20stainless%20steel%20platform%2C%20professional%20industrial%20setting&width=400&height=300&seq=cat-4&orientation=landscape'
          },
          {
            id: 5,
            name: 'Cân ô tô',
            description: 'Cân ô tô, cân xe tải chính xác và bền bỉ',
            icon: 'ri-truck-line',
            image: 'https://readdy.ai/api/search-image?query=truck%20weighbridge%20scale%20system%20for%20heavy%20vehicles%2C%20industrial%20truck%20scale%20with%20concrete%20platform%20and%20digital%20control%20house%2C%20professional%20weighing%20facility&width=400&height=300&seq=cat-5&orientation=landscape'
          },
          {
            id: 6,
            name: 'Cân treo móc cẩu',
            description: 'Cân treo, cân móc cẩu an toàn và chính xác',
            icon: 'ri-hammer-line',
            image: 'https://readdy.ai/api/search-image?query=heavy%20duty%20crane%20scale%20hanging%20hook%20scale%20with%20digital%20display%2C%20industrial%20lifting%20weighing%20equipment%2C%20robust%20metal%20construction%2C%20professional%20warehouse%20setting&width=400&height=300&seq=cat-6&orientation=landscape'
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}`}
              className="group block bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                {category.image && category.image.trim() !== '' ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-48 object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <i className={`${category.icon || 'ri-image-line'} text-4xl text-gray-400`}></i>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <i className={`${category.icon} text-2xl text-blue-600 mr-3`}></i>
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  {category.description}
                </p>
                <div className="flex items-center text-blue-600 font-medium">
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


'use client';

import Link from 'next/link';

const categories = [
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
];

export default function ProductCategories() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Danh Mục Sản Phẩm</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Chúng tôi cung cấp đầy đủ các loại cân điện tử chính hãng từ các thương hiệu uy tín
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.id}`}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group cursor-pointer"
            >
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
                  <i className={`${category.icon} text-4xl text-blue-600`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{category.name}</h3>
                <p className="text-gray-600 mb-4 italic line-clamp-2">{category.description}</p>
                <div className="flex items-center justify-center text-blue-600 font-medium">
                  <span>Xem chi tiết</span>
                  <i className="ri-arrow-right-line w-4 h-4 flex items-center justify-center ml-2"></i>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
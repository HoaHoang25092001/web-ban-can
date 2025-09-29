
'use client';

import Link from 'next/link';

const categories = [
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.id}`}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group cursor-pointer"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 bg-blue-600 text-white p-3 rounded-lg">
                  <i className={`${category.icon} w-6 h-6 flex items-center justify-center`}></i>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{category.name}</h3>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <div className="flex items-center text-blue-600 font-medium">
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
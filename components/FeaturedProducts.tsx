
'use client';

const products = [
  {
    id: 1,
    name: 'Cân điện tử ACS-30',
    category: 'Cân điện tử',
    capacity: '30kg',
    accuracy: '1g',
    price: '2,500,000',
    image: 'https://readdy.ai/api/search-image?query=professional%20digital%20scale%20ACS-30%20model%20with%20stainless%20steel%20platform%20and%20bright%20LCD%20display%2C%20commercial%20weighing%20equipment%2C%20white%20background%20with%20blue%20accents&width=300&height=250&seq=prod-1&orientation=landscape'
  },
  {
    id: 2,
    name: 'Cân kỹ thuật FA-210',
    category: 'Cân kỹ thuật',
    capacity: '210g',
    accuracy: '0.1mg',
    price: '15,800,000',
    image: 'https://readdy.ai/api/search-image?query=precision%20analytical%20balance%20FA-210%20with%20glass%20windshield%20chamber%2C%20laboratory%20scale%20with%20high%20accuracy%20display%2C%20scientific%20equipment%20on%20white%20background&width=300&height=250&seq=prod-2&orientation=landscape'
  },
  {
    id: 3,
    name: 'Cân sàn 1 tấn',
    category: 'Cân sàn điện tử',
    capacity: '1000kg',
    accuracy: '200g',
    price: '12,000,000',
    image: 'https://readdy.ai/api/search-image?query=heavy%20duty%20industrial%20floor%20scale%20platform%201%20ton%20capacity%20with%20digital%20indicator%2C%20stainless%20steel%20weighing%20platform%2C%20warehouse%20equipment%20setting&width=300&height=250&seq=prod-3&orientation=landscape'
  },
  {
    id: 4,
    name: 'Cân móc cẩu 5 tấn',
    category: 'Cân treo móc cẩu',
    capacity: '5000kg',
    accuracy: '2kg',
    price: '18,500,000',
    image: 'https://readdy.ai/api/search-image?query=heavy%20duty%20crane%20hook%20scale%205%20ton%20capacity%20with%20wireless%20remote%20display%2C%20industrial%20lifting%20weighing%20equipment%2C%20robust%20steel%20construction&width=300&height=250&seq=prod-4&orientation=landscape'
  }
];

export default function FeaturedProducts() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Sản Phẩm Nổi Bật</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Những sản phẩm cân điện tử được khách hàng tin tưởng và lựa chọn nhiều nhất
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
              <div className="relative h-48 overflow-hidden">
                {product.image && product.image.trim() !== '' ? (
                  <img
                    src={product.image.startsWith('/') ? `http://localhost:3000${product.image}` : product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
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
                <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                  Nổi bật
                </div>
              </div>
              <div className="p-6">
                <div className="text-sm text-blue-600 font-medium mb-2">{product.category}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{product.name}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Khối lượng:</span>
                    <span className="font-medium">{product.capacity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Độ chính xác:</span>
                    <span className="font-medium">{product.accuracy}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer">
                    Liên hệ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer">
            Xem tất cả sản phẩm
          </button>
        </div>
      </div>
    </section>
  );
}

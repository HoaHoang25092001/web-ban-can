
'use client';

import Link from 'next/link';
import SearchProduct from './SearchProduct';

export default function HeroSection() {
  return (
    <section 
      className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 lg:py-16 bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('https://readdy.ai/api/search-image?query=modern%20professional%20weighing%20scale%20facility%20with%20clean%20white%20and%20light%20blue%20interior%2C%20industrial%20precision%20equipment%2C%20bright%20natural%20lighting%2C%20minimal%20clean%20background%2C%20professional%20measurement%20laboratory%20setting&width=1200&height=600&seq=hero-bg-clean&orientation=landscape')`
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-12">
          {/* Left: Text Content */}
          <div className="lg:w-1/2">
            <h1 className="text-3xl lg:text-5xl font-bold mb-4 leading-tight drop-shadow-lg">
              Cân Điện Tử
              <span className="text-blue-200"> Chính Hãng</span>
            </h1>
            <p className="text-lg lg:text-xl mb-6 text-gray-100 leading-relaxed drop-shadow-md">
              Đơn vị cung cấp thiết bị cân điện tử chuyên nghiệp, chính xác và bền bỉ cho mọi nhu cầu
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold text-base hover:bg-blue-50 transition-colors inline-block text-center whitespace-nowrap cursor-pointer shadow-lg">
                Xem sản phẩm
              </Link>
              <Link href="/contact" className="border-2 border-white text-white px-6 py-3 rounded-lg font-bold text-base hover:bg-white hover:text-blue-600 transition-colors inline-block text-center whitespace-nowrap cursor-pointer shadow-lg">
                Liên hệ tư vấn
              </Link>
            </div>
          </div>

          {/* Right: Search Section */}
          <div className="lg:w-1/2 w-full">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5 lg:p-6">
              <div className="text-center mb-4">
                <h2 className="text-xl lg:text-2xl font-bold text-white mb-1">Tìm kiếm sản phẩm</h2>
                <p className="text-sm lg:text-base text-blue-100">
                  Nhập tên sản phẩm bạn muốn tìm
                </p>
              </div>
              <SearchProduct />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

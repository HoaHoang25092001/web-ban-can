
'use client';

import Link from 'next/link';

export default function HeroSection() {
  return (
    <section 
      className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 lg:py-32 bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('https://readdy.ai/api/search-image?query=modern%20professional%20weighing%20scale%20facility%20with%20clean%20white%20and%20light%20blue%20interior%2C%20industrial%20precision%20equipment%2C%20bright%20natural%20lighting%2C%20minimal%20clean%20background%2C%20professional%20measurement%20laboratory%20setting&width=1200&height=600&seq=hero-bg-clean&orientation=landscape')`
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col lg:flex-row items-center justify-between w-full">
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight drop-shadow-lg">
              Cân Điện Tử
              <br />
              <span className="text-blue-200">Chính Hãng</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-gray-100 leading-relaxed drop-shadow-md">
              Đơn vị cung cấp thiết bị cân điện tử chuyên nghiệp, chính xác và bền bỉ cho mọi nhu cầu
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/" className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors inline-block text-center whitespace-nowrap cursor-pointer shadow-lg">
                Xem sản phẩm
              </Link>
              <Link href="/contact" className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition-colors inline-block text-center whitespace-nowrap cursor-pointer shadow-lg">
                Liên hệ tư vấn
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

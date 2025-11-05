
'use client';

const features = [
  {
    icon: 'ri-shield-check-line',
    title: 'Sản phẩm chính hãng',
    description: 'Đảm bảo 100% sản phẩm chính hãng từ các thương hiệu uy tín'
  },
  {
    icon: 'ri-tools-line',
    title: 'Lắp đặt tận nơi',
    description: 'Đội ngũ kỹ thuật giàu kinh nghiệm hỗ trợ lắp đặt tại nhà'
  },
  {
    icon: 'ri-customer-service-2-line',
    title: 'Hỗ trợ 24/7',
    description: 'Dịch vụ chăm sóc khách hàng và hỗ trợ kỹ thuật nhanh chóng'
  },
  {
    icon: 'ri-award-line',
    title: 'Bảo hành dài hạn',
    description: 'Cam kết bảo hành dài hạn và sửa chữa miễn phí'
  }
];

export default function AboutSection() {
  return (
    <section className="py-20 bg-blue-50">
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Về Cân Vạn Thịnh Phát</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Vạn Thịnh Phát là đơn vị chuyên cung cấp các thiết bị cân điện tử chính hãng từ các thương hiệu nổi tiếng. 
              Với nhiều năm kinh nghiệm trong lĩnh vực thiết bị đo lường, chúng tôi cam kết mang đến cho khách hàng 
              những sản phẩm chất lượng cao và dịch vụ tốt nhất.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="bg-blue-600 text-white p-2 rounded-lg flex-shrink-0">
                    <i className={`${feature.icon} w-5 h-5 flex items-center justify-center`}></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img
              src="https://readdy.ai/api/search-image?query=professional%20team%20of%20technicians%20working%20with%20precision%20weighing%20equipment%20in%20modern%20industrial%20facility%2C%20engineers%20calibrating%20digital%20scales%2C%20professional%20workplace%20with%20blue%20and%20white%20theme&width=600&height=500&seq=about-img&orientation=landscape"
              alt="Đội ngũ kỹ thuật Vạn Thịnh Phát"
              className="w-full rounded-xl shadow-lg object-cover object-top"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-blue-600 mb-1">10+</div>
              <div className="text-sm text-gray-600">Năm kinh nghiệm</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
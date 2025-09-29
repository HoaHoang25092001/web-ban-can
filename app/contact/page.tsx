'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          phone: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Liên Hệ Với Chúng Tôi
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Vạn Thịnh Phát - Đối tác tin cậy trong lĩnh vực thiết bị cân điện tử
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-lg">
              <div className="flex items-center">
                <i className="ri-phone-line w-6 h-6 mr-2"></i>
                <span>0326.711.476</span>
              </div>
              <div className="flex items-center">
                <i className="ri-mail-line w-6 h-6 mr-2"></i>
                <span>canvanthinhphat@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Company Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Về Công Ty Vạn Thịnh Phát
              </h2>
              <div className="prose prose-lg text-gray-600">
                <p className="mb-4">
                  <strong>Công ty Vạn Thịnh Phát</strong> là đơn vị hàng đầu chuyên cung cấp thiết bị cân điện tử 
                  chính hãng tại Việt Nam. Với hơn 10 năm kinh nghiệm trong lĩnh vực này, chúng tôi đã khẳng định 
                  được vị thế và uy tín trên thị trường.
                </p>
                <p className="mb-4">
                  Chúng tôi tự hào là đại lý phân phối độc quyền của nhiều thương hiệu cân điện tử nổi tiếng 
                  trên thế giới như Tanita, A&D, Ohaus, Sartorius và nhiều thương hiệu uy tín khác.
                </p>
                <p className="mb-6">
                  Sứ mệnh của chúng tôi là mang đến cho khách hàng những sản phẩm chất lượng cao nhất, 
                  dịch vụ tận tâm và giải pháp đo lường chính xác cho mọi nhu cầu trong sản xuất và kinh doanh.
                </p>
              </div>
              
              {/* Key Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                    <i className="ri-shield-check-line w-5 h-5"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Sản phẩm chính hãng</h4>
                    <p className="text-sm text-gray-600">100% chính hãng, có CO/CQ</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                    <i className="ri-tools-line w-5 h-5"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Lắp đặt tận nơi</h4>
                    <p className="text-sm text-gray-600">Đội ngũ kỹ thuật chuyên nghiệp</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                    <i className="ri-customer-service-2-line w-5 h-5"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Hỗ trợ 24/7</h4>
                    <p className="text-sm text-gray-600">Tư vấn và chăm sóc khách hàng</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                    <i className="ri-award-line w-5 h-5"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Bảo hành dài hạn</h4>
                    <p className="text-sm text-gray-600">Cam kết bảo hành chính hãng</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information & Form Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Thông Tin Liên Hệ
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hãy liên hệ với chúng tôi để được tư vấn và báo giá tốt nhất
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Thông Tin Liên Hệ
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-600 text-white p-3 rounded-lg">
                      <i className="ri-map-pin-line w-6 h-6"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Địa chỉ</h4>
                      <p className="text-gray-600">605 Quốc lộ 13, Phường Hiệp Bình, TP. Hồ Chí Minh, Việt Nam</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-600 text-white p-3 rounded-lg">
                      <i className="ri-phone-line w-6 h-6"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Điện thoại</h4>
                      <div className="text-gray-600 space-y-1">
                        <p>📞 0326.711.476</p>
                        <p>📞 0911.093.511</p>
                        <p>📞 0923.051.134</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-600 text-white p-3 rounded-lg">
                      <i className="ri-mail-line w-6 h-6"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Email</h4>
                      <p className="text-gray-600">canvanthinhphat@gmail.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-600 text-white p-3 rounded-lg">
                      <i className="ri-time-line w-6 h-6"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Giờ làm việc</h4>
                      <div className="text-gray-600 space-y-1">
                        <p>Thứ 2 - Thứ 6: 8:00 - 17:30</p>
                        <p>Thứ 7: 8:00 - 12:00</p>
                        <p>Chủ nhật: Nghỉ</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Google Maps Placeholder */}
              <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9735.328153114564!2d106.71712638288983!3d10.850012652328257!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175294ccb9340d5%3A0x8c132b508576bcf8!2zQ8OibiBW4bqhbiBUaOG7i25oIFBow6F0!5e1!3m2!1svi!2sus!4v1758380395114!5m2!1svi!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg"
              ></iframe>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Gửi Thông Tin Liên Hệ
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập email"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Chủ đề *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn chủ đề</option>
                    <option value="product-inquiry">Tư vấn sản phẩm</option>
                    <option value="price-quote">Báo giá</option>
                    <option value="technical-support">Hỗ trợ kỹ thuật</option>
                    <option value="warranty">Bảo hành</option>
                    <option value="collaboration">Hợp tác kinh doanh</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    maxLength={1000}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Nhập nội dung chi tiết yêu cầu của bạn..."
                  ></textarea>
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {formData.message.length}/1000 ký tự
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      Đang gửi...
                    </span>
                  ) : (
                    'Gửi thông tin'
                  )}
                </button>
                
                {submitStatus === 'success' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 flex items-center">
                      <i className="ri-check-line mr-2"></i>
                      Cảm ơn bạn! Chúng tôi đã nhận được thông tin và sẽ liên hệ lại trong thời gian sớm nhất.
                    </p>
                  </div>
                )}
                
                {submitStatus === 'error' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 flex items-center">
                      <i className="ri-error-warning-line mr-2"></i>
                      Có lỗi xảy ra khi gửi thông tin. Vui lòng thử lại sau hoặc liên hệ trực tiếp qua số điện thoại.
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Cần Tư Vấn Ngay?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Đội ngũ chuyên gia của chúng tôi sẵn sàng hỗ trợ bạn 24/7
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <a
              href="tel:0326711476"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
            >
              <i className="ri-phone-line mr-2"></i>
              Gọi ngay: 0326.711.476
            </a>
            <a
              href="mailto:canvanthinhphat@gmail.com"
              className="inline-flex items-center px-8 py-4 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition-colors"
            >
              <i className="ri-mail-line mr-2"></i>
              Gửi email
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
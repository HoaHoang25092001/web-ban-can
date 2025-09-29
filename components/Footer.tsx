
'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {/* Map */}
          <div>
            <h3 className="text-lg font-bold mb-6">Bản Đồ</h3>
            <div className="w-full h-48 bg-gray-800 rounded-lg overflow-hidden">
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

          {/* Company Info */}
          <div>
            <div className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-pacifico)" }}>
              Cân Vạn Thịnh Phát
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Đơn vị chuyên cung cấp thiết bị cân điện tử chính hãng với chất lượng cao và dịch vụ tốt nhất. 
              Chúng tôi cam kết mang đến giải pháp đo lường chính xác cho mọi nhu cầu.
            </p>
            <div className="flex space-x-4">
              <a href="tel:0123456789" className="bg-blue-600 hover:bg-blue-700 p-3 rounded-lg transition-colors cursor-pointer">
                <span className="ri-phone-line w-5 h-5 flex items-center justify-center"></span>
              </a>
              <a href="mailto:info@canvanthinhphat.com" className="bg-blue-600 hover:bg-blue-700 p-3 rounded-lg transition-colors cursor-pointer">
                <span className="ri-mail-line w-5 h-5 flex items-center justify-center"></span>
              </a>
              <a href="https://www.facebook.com/datmaphihi" className="bg-blue-600 hover:bg-blue-700 p-3 rounded-lg transition-colors cursor-pointer">
                <span className="ri-facebook-fill w-5 h-5 flex items-center justify-center"></span>
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6">Thông Tin Liên Hệ</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="ri-map-pin-line w-5 h-5 flex items-center justify-center text-blue-400 mt-1"></span>
                <span className="text-gray-300 text-sm">605 Quốc lộ 13, Phường Hiệp Bình, TP. Hồ Chí Minh, Việt Nam</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="ri-phone-line w-5 h-5 flex items-center justify-center text-blue-400"></span>
                <span className="text-gray-300 text-sm">0326.711.476, 0911.093.511, 0923.051.134</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="ri-mail-line w-5 h-5 flex items-center justify-center text-blue-400"></span>
                <span className="text-gray-300 text-sm">canvanthinhphat@gmail.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="ri-time-line w-5 h-5 flex items-center justify-center text-blue-400 mt-1"></span>
                <div className="text-gray-300 text-sm">
                  <div>T2-T6: 8:00 - 17:30</div>
                  <div>T7: 8:00 - 12:00</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Account Info */}
          <div>
            <h3 className="text-lg font-bold mb-6">Thông Tin Tài Khoản</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-blue-400 mb-2">Ngân hàng TMCP Á Châu</h4>
                <div className="text-gray-300 text-sm space-y-1">
                  <div>STK: 199911115118</div>
                  <div>Chủ TK: PGD Văn Thánh</div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">Quét mã QR để chuyển khoản</div>
                <div className="w-16 h-16 bg-white rounded flex items-center justify-center">
                  <span className="text-xs text-gray-600">QR Code</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 Cân Vạn Thịnh Phát. Tất cả quyền được bảo lưu.
            </div>
            {/* <div className="flex space-x-6 text-sm">
              <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                Chính sách bảo mật
              </span>
              <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                Điều khoản sử dụng
              </span>
            </div> */}
          </div>
        </div> 
      </div>
    </footer>
  );
}
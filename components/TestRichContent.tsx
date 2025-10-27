'use client';

import RichContentDisplay from '@/components/RichContentDisplay';

export default function TestRichContent() {
  const sampleContent = `
    <h2>Thông Tin Chi Tiết :</h2>
    <p><strong>Cân Điện Tử Chính Hãng Technology</strong></p>
    <p>Cung Cấp COCQ Nguồn Gốc Xuất Xứ Theo Yêu Cầu Khách Hàng</p>
    <p><em>Làm Bảng Báo Giá Theo Yêu Cầu Khách Hàng</em></p>
    <p>Nhân Viên Công Ty Cân Điện Tử Sẽ Hướng Dẫn Trực Tiếp Cách Sử Dụng Cũng Như Hất Tất Cả Các Chức Năng Sản Phẩm Để Quý Khách Hàng Có Thể Trải Nghiệm Sản Phẩm Tốt Nhất</p>
    <p>Kiểm Định, Hiệu Chuẩn Đồi Trung Tâm Do Lường (Tùy Theo Yêu Cầu Khách Hàng) 😊</p>
    <p>Truyền Tin Hiệu Kết Nối Máy Tính Và Máy In, Chế Độ Truyền 9600.</p>
    <ul>
      <li>Model :</li>
      <li>Nhà Sản Xuất :</li>
      <li>Mức Cân :</li>
      <li>Sai Số Bước Nhảy :</li>
      <li>Độ Ổn Định Min = e =20 .40 d</li>
    </ul>
    <ol>
      <li>Tính Năng Của Cân Điện Tử:</li>
      <li>Chính xác cao (độ phân giải bên trong 1/10.000)</li>
    </ol>
  `;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Rich Content Display</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Hiển thị như trong sản phẩm:</h3>
        <RichContentDisplay content={sampleContent} />
      </div>
    </div>
  );
}
import { redirect } from 'next/navigation';

/**
 * Đường dẫn đăng nhập quản trị cũ.
 *
 * Hai trang đăng nhập riêng đã gộp thành một tại /dang-nhap. Giữ lại tệp này
 * để chuyển hướng: NextAuth vẫn trỏ về đây khi phiên hết hạn (cấu hình
 * `pages.signIn`), và chủ shop có thể đã lưu địa chỉ cũ vào dấu trang.
 */
export default function AdminLoginRedirect() {
  redirect('/dang-nhap');
}

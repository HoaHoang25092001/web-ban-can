import { redirect } from 'next/navigation';

/**
 * Đường dẫn đăng nhập cũ của phần cân điện tử.
 *
 * Đã gộp vào trang đăng nhập chung /dang-nhap. Giữ lại để chuyển hướng: các
 * trang trong khu cân đẩy về đây khi chưa đăng nhập, và khách có thể đã lưu
 * địa chỉ này.
 */
export default function ScaleLoginRedirect() {
  redirect('/dang-nhap');
}

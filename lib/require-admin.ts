import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

/**
 * Chặn mọi truy cập chưa đăng nhập vào API quản trị.
 *
 * Trước đây các route quản trị KHÔNG kiểm tra phiên đăng nhập: chỉ cần mở
 * `/api/contacts` trong trình duyệt là đọc được toàn bộ tên, số điện thoại và
 * email khách hàng; gọi DELETE là xoá sạch yêu cầu báo giá. Đây là rò rỉ dữ
 * liệu cá nhân (Nghị định 13/2023/NĐ-CP), không phải chỉ là thiếu sót giao diện.
 *
 * Cách dùng ở đầu mỗi handler cần bảo vệ:
 *
 *   const denied = await requireAdmin();
 *   if (denied) return denied;
 *
 * Trả về `null` khi đã đăng nhập hợp lệ, hoặc một NextResponse 401 để handler
 * trả thẳng về cho client.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Bạn cần đăng nhập để thực hiện thao tác này' },
      { status: 401 }
    );
  }

  /*
   * Phải đúng LOẠI tài khoản quản trị.
   *
   * Từ khi có thêm tài khoản khách hàng dùng phần cân điện tử, chỉ kiểm tra
   * "đã đăng nhập" là không đủ: đo được một khách hàng đăng nhập ở
   * /can-dien-tu vẫn gọi được API quản trị và đọc danh sách toàn bộ tài khoản
   * khách khác. Tài khoản cân phải bị chặn khỏi mọi API quản trị website.
   *
   * Phiên cũ (tạo trước khi thêm trường `kind`) không có giá trị này; coi như
   * quản trị viên vì trước đó chỉ có một loại tài khoản duy nhất.
   */
  if (session.user.kind === 'scale') {
    return NextResponse.json(
      { error: 'Tài khoản này không có quyền truy cập khu quản trị' },
      { status: 403 }
    );
  }

  return null;
}

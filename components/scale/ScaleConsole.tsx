'use client';

import Link from 'next/link';
import { FileText, Printer, History } from 'lucide-react';
import { ConnectionBar, WeightDisplay } from '@/components/scale/WeightDisplay';
import { Card, buttonClass } from '@/components/scale/ui';

/**
 * Màn hình xem số cân cho khách CHƯA đăng nhập.
 *
 * Đã đăng nhập thì cân ở Phiếu cân (components/scale/TicketWorkbench.tsx).
 * Trang này chỉ để khách mới mua cân cắm vào thử máy, thấy số nhảy là biết cân
 * chạy — không lưu gì, muốn lập phiếu thì đăng nhập.
 *
 * Dùng chung ConnectionBar và WeightDisplay với Phiếu cân, để khi khách đăng
 * nhập xong, màn hình quen thuộc y hệt — chỉ có thêm phần lập phiếu.
 */
export default function ScaleConsole() {
  return (
    <div className="space-y-5">
      <ConnectionBar />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] items-start">
        <Card title="Khối lượng hiện tại" titleId="console-weight">
          <WeightDisplay size="xl" />
          <p className="mt-3 text-sm text-scale-muted-fg">
            Số trên đây phải giống hệt số trên màn hình cân. Nếu không giống, thử đổi <strong>loại cân</strong> rồi
            kết nối lại.
          </p>
        </Card>

        <Card title="Muốn lập phiếu cân?" titleId="console-login">
          <ul className="space-y-3 text-sm text-scale-fg">
            <li className="flex gap-3">
              <FileText className="w-5 h-5 text-scale-primary flex-shrink-0" aria-hidden="true" />
              Cân từng lượt, trừ bì theo số khay, tự tính tiền.
            </li>
            <li className="flex gap-3">
              <Printer className="w-5 h-5 text-scale-primary flex-shrink-0" aria-hidden="true" />
              In phiếu xuất/nhập kho khổ A4 có chữ ký.
            </li>
            <li className="flex gap-3">
              <History className="w-5 h-5 text-scale-primary flex-shrink-0" aria-hidden="true" />
              Xem lại lịch sử, xuất Excel.
            </li>
          </ul>
          <Link href="/dang-nhap" className={`${buttonClass({ variant: 'primary', size: 'lg', block: true })} mt-5`}>
            Đăng nhập
          </Link>
          <p className="mt-3 text-xs text-scale-muted-fg">
            Chưa có tài khoản? Liên hệ Cân Vạn Thịnh Phát để được cấp.
          </p>
        </Card>
      </div>
    </div>
  );
}

import { getScaleUser } from '@/lib/scale-auth';
import ScaleShell from '@/components/scale/ScaleShell';
import ScaleConsole from '@/components/scale/ScaleConsole';
import TicketWorkbench from '@/components/scale/TicketWorkbench';

export const dynamic = 'force-dynamic';

/**
 * Phiếu cân — chỗ cân DUY NHẤT của khu cân điện tử.
 *
 * Trước đây có hai nơi cân: "Màn hình cân" (lưu bản ghi lẻ) và "Phiếu cân"
 * (lưu theo phiếu). Hai nơi lưu vào hai chỗ khác nhau nên lịch sử bị chia đôi;
 * nay gộp lại, mọi lần cân đều thuộc một phiếu.
 *
 * Chưa đăng nhập vẫn vào được và thấy số cân — khách mới mua cân cắm vào là
 * thử được máy ngay, chỉ khi muốn lập phiếu mới cần tài khoản.
 */
export default async function ScaleHomePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; khach?: string }>;
}) {
  const user = await getScaleUser();

  if (!user) {
    return (
      <ScaleShell>
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-scale-fg">Cân điện tử</h1>
          <p className="text-sm text-scale-muted-fg mt-1">
            Kết nối cân để đọc khối lượng trực tiếp. Đăng nhập để lập phiếu cân và in phiếu.
          </p>
        </div>
        {/* Kết nối cân do ScaleProvider ở app/can-dien-tu/layout.tsx giữ, để
            không bị ngắt khi chuyển sang trang khác rồi quay lại. */}
        <ScaleConsole />
      </ScaleShell>
    );
  }

  const { id, khach } = await searchParams;
  const ticketId = Number(id);
  const customerId = Number(khach);

  return (
    <ScaleShell userName={user.fullName}>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-scale-fg">Phiếu cân</h1>
        <p className="text-sm text-scale-muted-fg mt-1">
          Cân từng lượt, trừ bì theo số khay, tự tính tiền — xong phiếu là in ngay khổ A4.
        </p>
      </div>
      <TicketWorkbench
        initialTicketId={Number.isInteger(ticketId) && ticketId > 0 ? ticketId : undefined}
        initialCustomerId={Number.isInteger(customerId) && customerId > 0 ? customerId : undefined}
      />
    </ScaleShell>
  );
}

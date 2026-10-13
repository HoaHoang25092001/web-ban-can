import { getScaleUser } from '@/lib/scale-auth';
import ScaleShell from '@/components/scale/ScaleShell';
import ScaleConsole from '@/components/scale/ScaleConsole';
import TicketWorkbench from '@/components/scale/TicketWorkbench';
import { PageHeader } from '@/components/scale/ui';

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
        <PageHeader
          title="Cân điện tử"
          description="Kết nối cân để xem khối lượng trực tiếp. Đăng nhập để lập phiếu cân, trừ bì, tính tiền và in phiếu."
        />
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
      <PageHeader
        title="Phiếu cân"
        description="Đặt hàng lên cân, chọn loại hàng rồi bấm F2 để lưu từng lượt. Cân xong bấm Xong phiếu và In phiếu."
      />
      <TicketWorkbench
        initialTicketId={Number.isInteger(ticketId) && ticketId > 0 ? ticketId : undefined}
        initialCustomerId={Number.isInteger(customerId) && customerId > 0 ? customerId : undefined}
      />
    </ScaleShell>
  );
}

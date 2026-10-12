import { redirect } from 'next/navigation';
import { getScaleUser } from '@/lib/scale-auth';
import ScaleShell from '@/components/scale/ScaleShell';
import CustomerManager from '@/components/scale/CustomerManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Khách hàng' };

export default async function ScaleCustomersPage() {
  const user = await getScaleUser();
  if (!user) redirect('/dang-nhap');

  return (
    <ScaleShell userName={user.fullName}>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-scale-fg">Khách hàng</h1>
        <p className="text-sm text-scale-muted-fg mt-1">
          Lưu sẵn thông tin khách để lúc lập phiếu cân chỉ việc chọn — số điện thoại, địa chỉ tự điền lên phiếu.
        </p>
      </div>
      <CustomerManager />
    </ScaleShell>
  );
}

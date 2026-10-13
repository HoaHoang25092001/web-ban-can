import { redirect } from 'next/navigation';
import { getScaleUser } from '@/lib/scale-auth';
import ScaleShell from '@/components/scale/ScaleShell';
import { PageHeader } from '@/components/scale/ui';
import CustomerManager from '@/components/scale/CustomerManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Khách hàng' };

export default async function ScaleCustomersPage() {
  const user = await getScaleUser();
  if (!user) redirect('/dang-nhap');

  return (
    <ScaleShell userName={user.fullName}>
      <PageHeader
        title="Khách hàng"
        description="Lưu sẵn thông tin khách để lúc lập phiếu cân chỉ việc chọn — số điện thoại, địa chỉ tự điền lên phiếu."
      />
      <CustomerManager />
    </ScaleShell>
  );
}

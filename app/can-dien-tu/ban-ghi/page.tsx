import { redirect } from 'next/navigation';
import { getScaleUser } from '@/lib/scale-auth';
import ScaleShell from '@/components/scale/ScaleShell';
import { PageHeader } from '@/components/scale/ui';
import RecordsClient from '@/components/scale/RecordsClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Bản ghi cân' };

export default async function RecordsPage() {
  const user = await getScaleUser();
  if (!user) redirect('/dang-nhap');

  return (
    <ScaleShell userName={user.fullName}>
      <PageHeader
        title="Bản ghi cân"
        description="Mọi lượt cân trong các phiếu của bạn. Lọc theo loại hàng, khách hoặc khoảng ngày, rồi xuất Excel."
      />
      <RecordsClient />
    </ScaleShell>
  );
}

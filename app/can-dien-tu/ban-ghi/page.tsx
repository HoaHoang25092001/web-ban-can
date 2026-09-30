import { redirect } from 'next/navigation';
import { getScaleUser } from '@/lib/scale-auth';
import ScaleShell from '@/components/scale/ScaleShell';
import RecordsClient from '@/components/scale/RecordsClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Bản ghi cân' };

export default async function RecordsPage() {
  const user = await getScaleUser();
  if (!user) redirect('/dang-nhap');

  return (
    <ScaleShell userName={user.fullName}>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-scale-fg">Bản ghi cân</h1>
        <p className="text-sm text-scale-muted-fg mt-1">
          Toàn bộ số liệu cân hàng của bạn. Lọc theo mặt hàng hoặc khoảng ngày.
        </p>
      </div>
      <RecordsClient />
    </ScaleShell>
  );
}

import { redirect } from 'next/navigation';
import { getScaleUser } from '@/lib/scale-auth';
import ScaleShell from '@/components/scale/ScaleShell';
import ProductsClient from '@/components/scale/ProductsClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Mặt hàng' };

export default async function ScaleProductsPage() {
  const user = await getScaleUser();
  if (!user) redirect('/dang-nhap');

  return (
    <ScaleShell userName={user.fullName}>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">Mặt hàng</h1>
        <p className="text-sm text-slate-600 mt-1">
          Khai báo sẵn mặt hàng để lúc cân chỉ việc chọn từ danh sách.
        </p>
      </div>
      <ProductsClient />
    </ScaleShell>
  );
}

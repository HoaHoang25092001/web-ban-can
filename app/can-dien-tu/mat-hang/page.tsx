import { redirect } from 'next/navigation';
import { getScaleUser } from '@/lib/scale-auth';
import ScaleShell from '@/components/scale/ScaleShell';
import CatalogManager from '@/components/scale/CatalogManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sản phẩm' };

export default async function ScaleProductsPage() {
  const user = await getScaleUser();
  if (!user) redirect('/dang-nhap');

  return (
    <ScaleShell userName={user.fullName}>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-scale-fg">Sản phẩm</h1>
        <p className="text-sm text-scale-muted-fg mt-1">
          Khai báo sẵn mặt hàng để lúc cân chỉ việc chọn từ danh sách.
        </p>
      </div>
      <CatalogManager
        endpoint="/api/scale/products"
        labels={{
          singular: 'Sản phẩm',
          codeLabel: 'Mã hàng',
          nameLabel: 'Tên hàng',
          codePlaceholder: 'VD: SP001',
          namePlaceholder: 'VD: Gạo ST25',
          emptyTitle: 'Chưa có mặt hàng nào',
          emptyHint: 'Khai báo mặt hàng để lúc cân chọn nhanh, không phải gõ tay.',
          deleteNote: 'Các bản ghi cân cũ vẫn giữ nguyên tên và mã đã lưu.',
          listKey: 'products',
        }}
      />
    </ScaleShell>
  );
}

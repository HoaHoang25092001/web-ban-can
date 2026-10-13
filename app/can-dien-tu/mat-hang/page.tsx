import { redirect } from 'next/navigation';
import { getScaleUser } from '@/lib/scale-auth';
import ScaleShell from '@/components/scale/ScaleShell';
import { PageHeader } from '@/components/scale/ui';
import CatalogManager from '@/components/scale/CatalogManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sản phẩm' };

export default async function ScaleProductsPage() {
  const user = await getScaleUser();
  if (!user) redirect('/dang-nhap');

  return (
    <ScaleShell userName={user.fullName}>
      <PageHeader
        title="Sản phẩm"
        description="Khai báo sẵn mặt hàng để lúc cân chỉ việc chọn từ danh sách."
      />
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
          priceLabel: 'Đơn giá mặc định',
        }}
      />
    </ScaleShell>
  );
}

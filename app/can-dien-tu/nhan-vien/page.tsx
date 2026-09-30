import { redirect } from 'next/navigation';
import { getScaleUser } from '@/lib/scale-auth';
import ScaleShell from '@/components/scale/ScaleShell';
import CatalogManager from '@/components/scale/CatalogManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Nhân viên' };

export default async function ScaleEmployeesPage() {
  const user = await getScaleUser();
  if (!user) redirect('/dang-nhap');

  return (
    <ScaleShell userName={user.fullName}>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-scale-fg">Nhân viên</h1>
        <p className="text-sm text-scale-muted-fg mt-1">
          Khai báo sẵn nhân viên để lúc cân chỉ việc chọn tên từ danh sách.
        </p>
      </div>
      <CatalogManager
        endpoint="/api/scale/employees"
        labels={{
          singular: 'Nhân viên',
          codeLabel: 'Mã nhân viên',
          nameLabel: 'Tên nhân viên',
          codePlaceholder: 'VD: NV01',
          namePlaceholder: 'VD: Nguyễn Văn Ba',
          emptyTitle: 'Chưa có nhân viên nào',
          emptyHint: 'Khai báo nhân viên để lúc cân chọn nhanh, không phải gõ tay.',
          deleteNote: 'Các bản ghi cân cũ vẫn giữ nguyên tên đã lưu.',
          listKey: 'employees',
        }}
      />
    </ScaleShell>
  );
}

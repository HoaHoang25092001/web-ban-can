import { getScaleUser } from '@/lib/scale-auth';
import ScaleShell from '@/components/scale/ScaleShell';
import ScaleConsole from '@/components/scale/ScaleConsole';
import { ScaleProvider } from '@/components/scale/scale-context';

export const dynamic = 'force-dynamic';

/**
 * Màn hình cân.
 *
 * KHÔNG bắt đăng nhập — đúng theo flow của dự án gốc: khách mới mua cân cắm
 * vào là xem được số ngay, chỉ khi muốn LƯU lại thành bản ghi mới cần tài
 * khoản. Bắt đăng nhập từ đầu thì người đi lắp cân không thử được máy.
 */
export default async function ScaleHomePage() {
  const user = await getScaleUser();

  return (
    <ScaleShell userName={user?.fullName}>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-scale-fg">Màn hình cân</h1>
        <p className="text-sm text-scale-muted-fg mt-1">
          Kết nối cân để đọc khối lượng trực tiếp.
          {user
            ? ' Lưu lại thành bản ghi ở khối bên phải.'
            : ' Đăng nhập để lưu lại thành bản ghi.'}
        </p>
      </div>
      {/* ScaleProvider giữ kết nối cân cho cả cây component bên dưới */}
      <ScaleProvider>
        <ScaleConsole canSave={Boolean(user)} />
      </ScaleProvider>
    </ScaleShell>
  );
}

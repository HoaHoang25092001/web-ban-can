import { redirect } from 'next/navigation';
import { getScaleUser } from '@/lib/scale-auth';
import ScaleShell from '@/components/scale/ScaleShell';
import ScaleConsole from '@/components/scale/ScaleConsole';
import { ScaleProvider } from '@/components/scale/scale-context';

export const dynamic = 'force-dynamic';

/**
 * Màn hình cân.
 *
 * Kiểm tra đăng nhập TRÊN MÁY CHỦ trước khi vẽ giao diện: nếu chỉ kiểm tra ở
 * trình duyệt, nội dung vẫn được gửi xuống rồi mới ẩn đi — người biết cách là
 * đọc được (tiêu chí 5).
 */
export default async function ScaleHomePage() {
  const user = await getScaleUser();
  if (!user) redirect('/can-dien-tu/dang-nhap');

  return (
    <ScaleShell userName={user.fullName}>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">Màn hình cân</h1>
        <p className="text-sm text-slate-600 mt-1">
          Kết nối cân để đọc khối lượng trực tiếp, rồi lưu lại thành bản ghi.
        </p>
      </div>
      {/* ScaleProvider giữ kết nối cân cho cả cây component bên dưới */}
      <ScaleProvider>
        <ScaleConsole />
      </ScaleProvider>
    </ScaleShell>
  );
}

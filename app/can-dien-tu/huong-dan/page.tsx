import type { Metadata } from 'next';
import Link from 'next/link';
import { getScaleUser } from '@/lib/scale-auth';
import ScaleShell from '@/components/scale/ScaleShell';
import { PRIMARY_PHONE, telHref } from '@/lib/site';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Hướng dẫn' };

/**
 * Các lỗi hay gặp, chép từ dự án digital-scale gốc.
 *
 * Viết theo cặp "triệu chứng khách nhìn thấy" → "việc cần làm", không dùng từ
 * kỹ thuật: người đọc là công nhân đứng cạnh cân, không phải lập trình viên
 * (tiêu chí 9).
 */
const TROUBLESHOOTING = [
  {
    problem: 'Nút "Kết nối cân" bị mờ, báo trình duyệt không hỗ trợ',
    fix: 'Mở trang bằng Google Chrome hoặc Microsoft Edge, trên chính máy tính đang nối với cân. Firefox, Safari và điện thoại iPhone/iPad không kết nối được với cân.',
  },
  {
    problem: 'Báo "Bạn chưa chọn cổng của cân"',
    fix: 'Bấm "Kết nối cân" lại, chọn cổng COM hoặc USB của cân trong hộp thoại của trình duyệt rồi bấm "Kết nối".',
  },
  {
    problem: 'Báo cổng đang được mở ở nơi khác',
    fix: 'Đóng các tab khác đang mở màn hình cân, và đóng phần mềm cân khác đang chạy, rồi thử lại.',
  },
  {
    problem: 'Đã kết nối nhưng số cân không đổi hoặc sai',
    fix: 'Kiểm tra "Loại cân" đã chọn đúng model chưa. Đổi loại cân sẽ ngắt kết nối — bấm "Kết nối cân" lại sau khi đổi.',
  },
  {
    problem: 'Đăng nhập báo sai tên đăng nhập hoặc mật khẩu',
    fix: 'Dùng TÊN ĐĂNG NHẬP do Cân Vạn Thịnh Phát cấp, không phải email. Nếu quên mật khẩu hoặc tài khoản bị khoá, gọi cho chúng tôi để được cấp lại.',
  },
];

export default async function ScaleHelpPage() {
  // Trang này xem được cả khi chưa đăng nhập — khách mới mua cân cần đọc trước.
  const user = await getScaleUser();

  return (
    <ScaleShell userName={user?.fullName}>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-scale-fg">Hướng dẫn sử dụng</h1>
        <p className="text-sm text-scale-muted-fg mt-1">
          Các bước cơ bản và cách xử lý lỗi thường gặp.
        </p>
      </div>

      <div className="grid max-w-3xl gap-5 text-scale-fg">
        <section
          aria-labelledby="help-connect"
          className="rounded-2xl border border-scale-border bg-scale-card p-6"
        >
          <h2 id="help-connect" className="text-xl font-semibold">
            1. Kết nối cân
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-6 leading-relaxed">
            <li>Cắm cáp của cân vào máy tính và bật cân.</li>
            <li>
              Mở{' '}
              {/* py cho đủ vùng chạm 44px: đây là liên kết nằm giữa câu nên
                  không đặt thành khối vuông được (tiêu chí 5). */}
              <Link
                href="/can-dien-tu"
                className="inline-flex items-center min-h-touch font-semibold text-scale-primary underline underline-offset-4"
              >
                Màn hình cân
              </Link>{' '}
              bằng Google Chrome hoặc Microsoft Edge.
            </li>
            <li>Chọn đúng &ldquo;Loại cân&rdquo;.</li>
            <li>Bấm &ldquo;Kết nối cân&rdquo;, chọn cổng của cân trong hộp thoại của trình duyệt.</li>
            <li>
              Khi thấy &ldquo;Đã ổn định&rdquo;, số trên màn hình là khối lượng hiện tại.
            </li>
          </ol>
        </section>

        <section
          aria-labelledby="help-save"
          className="rounded-2xl border border-scale-border bg-scale-card p-6"
        >
          <h2 id="help-save" className="text-xl font-semibold">
            2. Lưu bản ghi cân
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-6 leading-relaxed">
            <li>Đăng nhập bằng tài khoản Cân Vạn Thịnh Phát cấp.</li>
            <li>Kết nối cân và đặt hàng lên bàn cân.</li>
            <li>Chọn mặt hàng trong danh sách, hoặc gõ tay nếu chưa khai báo.</li>
            <li>Nếu cần, chọn nhân viên cân và ghi chú.</li>
            <li>
              Bấm &ldquo;Lưu lần cân&rdquo;. Khối lượng được lấy tự động từ cân tại thời điểm bấm.
            </li>
          </ol>
        </section>

        <section
          aria-labelledby="help-manage"
          className="rounded-2xl border border-scale-border bg-scale-card p-6"
        >
          <h2 id="help-manage" className="text-xl font-semibold">
            3. Quản lý dữ liệu
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
            <li>
              <strong>Bản ghi cân</strong> — xem lại toàn bộ số liệu, lọc theo mặt hàng hoặc khoảng
              ngày, và xuất ra tệp Excel.
            </li>
            <li>
              <strong>Sản phẩm</strong> — khai báo sẵn mặt hàng để lúc cân chọn nhanh.
            </li>
            <li>
              <strong>Nhân viên</strong> — khai báo tên người cân, chọn từ danh sách thay vì gõ tay.
            </li>
          </ul>
          <p className="mt-3 text-sm text-scale-muted-fg">
            Dữ liệu của bạn hoàn toàn riêng tư: khách hàng khác không xem được, và Cân Vạn Thịnh Phát
            cũng không đọc số liệu cân hàng của bạn.
          </p>
        </section>

        <section
          aria-labelledby="help-trouble"
          className="rounded-2xl border border-scale-border bg-scale-card p-6"
        >
          <h2 id="help-trouble" className="text-xl font-semibold">
            4. Lỗi thường gặp
          </h2>
          <dl className="mt-3 space-y-4">
            {TROUBLESHOOTING.map((t) => (
              <div key={t.problem}>
                <dt className="font-semibold text-scale-fg">{t.problem}</dt>
                <dd className="mt-1 text-scale-muted-fg leading-relaxed">{t.fix}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-2xl border border-scale-border bg-scale-card p-6">
          <h2 className="text-xl font-semibold">Cần hỗ trợ thêm?</h2>
          <p className="mt-2 text-scale-muted-fg leading-relaxed">
            Gọi cho Cân Vạn Thịnh Phát để được hướng dẫn trực tiếp.
          </p>
          <a
            href={telHref(PRIMARY_PHONE)}
            className="mt-4 inline-flex items-center justify-center min-h-touch px-5 rounded-lg bg-scale-primary text-scale-primary-fg font-semibold hover:bg-scale-primary-hover transition-colors"
          >
            Gọi {PRIMARY_PHONE}
          </a>
        </section>
      </div>
    </ScaleShell>
  );
}

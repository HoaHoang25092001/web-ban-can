import type { Metadata } from 'next';
import Link from 'next/link';
import { getScaleUser } from '@/lib/scale-auth';
import ScaleShell from '@/components/scale/ScaleShell';
import { PRIMARY_PHONE, telHref } from '@/lib/site';
import { PageHeader, buttonClass } from '@/components/scale/ui';

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
    problem: 'Báo "Trình duyệt này không đọc số tự động từ cân được"',
    fix: 'Trên máy tính: mở bằng Google Chrome hoặc Microsoft Edge. Trên điện thoại Android: mở bằng Google Chrome và cập nhật lên bản mới nhất. iPhone/iPad, Firefox, Safari, Samsung Internet không đọc cân tự động được — vẫn cân được bằng cách gõ tay số trên màn hình cân vào ô khối lượng.',
  },
  {
    problem: 'Bấm "Kết nối cân" nhưng danh sách trống, không thấy cân',
    fix: 'Máy tính: kiểm tra cáp đã cắm chặt, thử cổng USB khác. Điện thoại Android: kiểm tra cáp OTG (thử rút ra cắm lại), hoặc với cân Bluetooth thì vào Cài đặt → Bluetooth ghép đôi với cân trước rồi mới bấm Kết nối.',
  },
  {
    problem: 'Báo cổng đang được mở ở nơi khác',
    fix: 'Đóng các tab khác đang mở màn hình cân, và đóng phần mềm cân khác đang chạy, rồi thử lại.',
  },
  {
    problem: 'Đã kết nối nhưng số cân không đổi hoặc sai',
    fix: 'Kiểm tra ô loại cân (cạnh nút "Kết nối cân") đã chọn đúng model chưa. Muốn đổi loại cân thì bấm "Ngắt kết nối" trước, đổi xong bấm "Kết nối cân" lại.',
  },
  {
    problem: 'Số cân cứ báo "Đang dao động", bấm lưu bị hỏi lại',
    fix: 'Đợi hàng trên bàn cân đứng yên vài giây cho tới khi hiện "Ổn định" rồi mới bấm Lưu lượt cân (F2). Nếu cân đã đứng yên mà vẫn báo dao động, kiểm tra lại loại cân đã chọn.',
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
      <PageHeader title="Hướng dẫn sử dụng" description="Các bước cơ bản và cách xử lý lỗi thường gặp." />

      <div className="grid max-w-3xl gap-5 text-scale-fg">
        <section
          aria-labelledby="help-connect"
          className="rounded-2xl border border-scale-border bg-scale-card p-6 shadow-sm"
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
                Phiếu cân
              </Link>{' '}
              bằng Google Chrome hoặc Microsoft Edge.
            </li>
            <li>Chọn đúng loại cân ở ô bên cạnh nút &ldquo;Kết nối cân&rdquo;.</li>
            <li>Bấm &ldquo;Kết nối cân&rdquo;, chọn cổng của cân trong hộp thoại của trình duyệt.</li>
            <li>
              Khi thấy &ldquo;Ổn định&rdquo;, số trên màn hình là khối lượng hiện tại.
            </li>
          </ol>
        </section>

        {/* Chrome 148 (4/2026) trở lên trên Android đã đọc được cân qua USB và
            Bluetooth — cùng một cách với máy tính, không cần cài ứng dụng. */}
        <section
          aria-labelledby="help-android"
          className="rounded-2xl border border-scale-border bg-scale-card p-6 shadow-sm"
        >
          <h2 id="help-android" className="text-xl font-semibold">
            Dùng trên điện thoại Android
          </h2>
          <p className="mt-2 text-scale-muted-fg leading-relaxed">
            Không cần cài ứng dụng — mở trang bằng Google Chrome là cân được, giống trên máy tính.
          </p>

          <h3 className="mt-4 font-semibold">Cần chuẩn bị</h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-6 leading-relaxed">
            <li>
              <strong>Google Chrome bản 148 trở lên.</strong> Mở CH Play, tìm &ldquo;Google Chrome&rdquo;, bấm Cập nhật nếu có.
              Samsung Internet, Cốc Cốc, Firefox chưa đọc được cân.
            </li>
            <li>
              <strong>Cân cắm dây:</strong> cáp <strong>RS232 sang USB</strong> (loại đang dùng với máy tính) và một{' '}
              <strong>đầu chuyển OTG</strong> (USB-C hoặc micro-USB tuỳ điện thoại).
            </li>
            <li>
              <strong>Cân Bluetooth:</strong> bật Bluetooth của cân, rồi vào <em>Cài đặt → Bluetooth</em> trên điện thoại ghép
              đôi với cân trước (mã ghép thường là 1234 hoặc 0000).
            </li>
            <li>
              Đầu cân cài chế độ <strong>gửi số liên tục, tốc độ 9600</strong> — giống khi dùng với máy tính.
            </li>
          </ul>

          <h3 className="mt-4 font-semibold">Các bước</h3>
          <ol className="mt-2 list-decimal space-y-1.5 pl-6 leading-relaxed">
            <li>Nối đầu cân → cáp RS232-USB → đầu OTG → điện thoại (hoặc ghép đôi Bluetooth như trên), bật cân.</li>
            <li>Mở Chrome, vào cangiare.com/can-dien-tu và đăng nhập.</li>
            <li>Chọn loại cân, bấm &ldquo;Kết nối cân&rdquo;, chọn cân trong danh sách hiện ra, bấm &ldquo;Kết nối&rdquo;.</li>
            <li>Nếu điện thoại hỏi quyền dùng thiết bị USB, bấm &ldquo;Cho phép&rdquo;.</li>
          </ol>
          <p className="mt-3 text-sm text-scale-muted-fg leading-relaxed">
            Khi đang kết nối cân, màn hình điện thoại được giữ sáng để không tự tắt giữa lúc cân. Nên dùng đầu OTG có cổng
            sạc phụ nếu cân lâu. iPhone và iPad không đọc được cân (Apple chưa cho phép) — trên các máy đó vẫn cân được bằng
            cách gõ tay số.
          </p>
        </section>

        <section
          aria-labelledby="help-save"
          className="rounded-2xl border border-scale-border bg-scale-card p-6 shadow-sm"
        >
          <h2 id="help-save" className="text-xl font-semibold">
            2. Cân và in phiếu
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-6 leading-relaxed">
            <li>Đăng nhập bằng tài khoản Cân Vạn Thịnh Phát cấp.</li>
            <li>
              Chọn <strong>Xuất kho</strong> hoặc <strong>Nhập kho</strong>, điền khách hàng (gõ tên để
              chọn từ danh bạ), số xe, tài xế.
            </li>
            <li>
              Đặt hàng lên cân, chọn loại hàng, số khay và bì một khay. Đơn giá tự điền nếu mặt hàng
              đã khai giá.
            </li>
            <li>
              Bấm &ldquo;Lưu lượt cân&rdquo; hoặc phím <strong>F2</strong>. Lượt cân đầu tiên tự tạo
              phiếu. Lặp lại cho từng lượt.
            </li>
            <li>
              Cân xong bấm &ldquo;Xong phiếu&rdquo; để khoá phiếu, rồi &ldquo;In phiếu&rdquo; để in
              khổ A4 hoặc lưu PDF.
            </li>
          </ol>
        </section>

        <section
          aria-labelledby="help-manage"
          className="rounded-2xl border border-scale-border bg-scale-card p-6 shadow-sm"
        >
          <h2 id="help-manage" className="text-xl font-semibold">
            3. Quản lý dữ liệu
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
            <li>
              <strong>Bản ghi cân</strong> — mọi lượt cân trong các phiếu; lọc theo loại hàng, khách
              hoặc khoảng ngày, và xuất ra tệp Excel.
            </li>
            <li>
              <strong>Sản phẩm</strong> — khai báo sẵn mặt hàng và đơn giá để lúc cân chọn nhanh.
            </li>
            <li>
              <strong>Khách hàng</strong> — danh bạ khách, số điện thoại và địa chỉ tự điền lên phiếu.
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
          className="rounded-2xl border border-scale-border bg-scale-card p-6 shadow-sm"
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

        <section className="rounded-2xl border border-scale-border bg-scale-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Cần hỗ trợ thêm?</h2>
          <p className="mt-2 text-scale-muted-fg leading-relaxed">
            Gọi cho Cân Vạn Thịnh Phát để được hướng dẫn trực tiếp.
          </p>
          <a
            href={telHref(PRIMARY_PHONE)}
            className={`${buttonClass({ variant: 'primary' })} mt-4`}
          >
            Gọi {PRIMARY_PHONE}
          </a>
        </section>
      </div>
    </ScaleShell>
  );
}

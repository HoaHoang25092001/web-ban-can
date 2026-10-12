'use client';

import Link from 'next/link';
import { Usb, Unplug, AlertTriangle } from 'lucide-react';
import { useScaleContext } from '@/components/scale/scale-context';
import { formatWeightByScaleModel, SCALE_MODEL_LABELS, type ScaleModel } from '@/lib/scale-drivers/ScaleModel';

/**
 * Màn hình xem số cân cho khách CHƯA đăng nhập.
 *
 * Đã đăng nhập thì cân ở Phiếu cân (components/scale/TicketWorkbench.tsx).
 * Trang này chỉ để khách mới mua cân cắm vào thử máy, thấy số nhảy là biết cân
 * chạy — không lưu gì, muốn lập phiếu thì đăng nhập.
 */
export default function ScaleConsole() {
  const { reading, status, error, connect, disconnect, isConnected, hasWebSerial, scaleModel, setScaleModel } =
    useScaleContext();

  /*
   * Web Serial API chỉ có trên Chrome và Edge bản máy tính.
   *
   * Firefox, Safari và mọi trình duyệt trên iPhone/iPad đều KHÔNG hỗ trợ —
   * nói rõ ngay từ đầu, thay vì để khách bấm "Kết nối" rồi nhận lỗi khó hiểu
   * và tưởng cân hỏng (tiêu chí 8).
   */
  if (hasWebSerial === false) {
    return (
      <div className="bg-scale-card rounded-2xl border border-scale-warning p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-scale-warning flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-bold text-scale-fg">Trình duyệt này không kết nối được với cân</h2>
            <p className="text-sm text-scale-fg mt-2 leading-relaxed max-w-prose">
              Việc đọc số từ cân cần trình duyệt hỗ trợ cổng nối tiếp (Web Serial). Hiện chỉ
              <strong> Google Chrome</strong> và <strong>Microsoft Edge</strong> trên máy tính
              làm được. Firefox, Safari và các trình duyệt trên iPhone/iPad chưa hỗ trợ.
            </p>
            <p className="text-sm text-scale-fg mt-3 max-w-prose">
              Đăng nhập rồi vào <strong>Phiếu cân</strong> vẫn lập phiếu được: nhập tay số trên màn hình cân, chỉ không đọc tự động.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const weightText = reading ? formatWeightByScaleModel(reading.valueKg, scaleModel) : '--';

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      {/* Số cân lớn */}
      <section className="bg-scale-card rounded-2xl border border-scale-border p-6 flex flex-col justify-between min-h-[19rem]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-lg font-bold text-scale-fg">Khối lượng hiện tại</h2>
          {reading && (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                reading.stable
                  ? 'bg-scale-success-soft text-scale-success border border-scale-success'
                  : 'bg-scale-warning-soft text-scale-warning border border-scale-warning'
              }`}
            >
              {reading.stable ? 'Đã ổn định' : 'Đang dao động'}
            </span>
          )}
        </div>

        {/* clamp() cho chữ co giãn theo bề ngang màn hình: số cân phải đọc
            được từ xa khi đứng cạnh cân, nhưng không tràn trên điện thoại. */}
        <div className="flex-1 flex items-center justify-center py-4">
          {reading ? (
            <p className="flex items-baseline gap-3 font-mono font-bold text-scale-primary">
              <span className="text-[clamp(3.5rem,13vw,9rem)] leading-none tracking-tight break-all">
                {weightText}
              </span>
              <span className="text-2xl sm:text-3xl text-scale-fg">kg</span>
            </p>
          ) : (
            /* Chưa kết nối thì nói rõ phải làm gì, thay vì hiện "--" trơ trọi
               khiến người dùng tưởng cân hỏng hoặc trang lỗi (tiêu chí 8). */
            <div className="text-center px-4">
              <Usb className="w-10 h-10 text-scale-muted-fg mx-auto mb-3" aria-hidden="true" />
              <p className="font-semibold text-scale-fg">Chưa kết nối với cân</p>
              <p className="text-sm text-scale-muted-fg mt-1 max-w-xs mx-auto">
                Cắm cân vào máy tính rồi bấm <strong>Kết nối cân</strong> ở bên phải để bắt đầu đọc khối lượng.
              </p>
            </div>
          )}
        </div>

      </section>

      {/* Bảng điều khiển */}
      <section className="space-y-4">
        <div className="bg-scale-card rounded-2xl border border-scale-border p-5">
          <h2 className="text-base font-bold text-scale-fg mb-3">Kết nối cân</h2>

          <label htmlFor="scale-model" className="block text-sm font-medium text-scale-fg mb-1.5">
            Loại cân
          </label>
          <select
            id="scale-model"
            value={scaleModel}
            onChange={(e) => setScaleModel(e.target.value as ScaleModel)}
            disabled={isConnected}
            className="w-full min-h-touch px-3 rounded-lg bg-scale-card border border-scale-input text-scale-fg text-sm mb-4 disabled:bg-scale-secondary focus:outline-none focus:ring-2 focus:ring-scale-ring"
          >
            {Object.entries(SCALE_MODEL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => (isConnected ? disconnect() : connect())}
            className={`w-full inline-flex items-center justify-center gap-2 min-h-touch px-4 rounded-lg font-semibold text-sm transition-colors ${
              isConnected
                ? 'bg-scale-secondary text-scale-fg hover:bg-scale-muted'
                : 'bg-scale-primary text-scale-primary-fg hover:bg-scale-primary-hover'
            }`}
          >
            {isConnected ? (
              <>
                <Unplug className="w-4 h-4" aria-hidden="true" /> Ngắt kết nối
              </>
            ) : (
              <>
                <Usb className="w-4 h-4" aria-hidden="true" /> Kết nối cân
              </>
            )}
          </button>

          <p className="text-xs text-scale-muted-fg mt-2">
            Trạng thái: <span className="font-medium text-scale-fg">{status}</span>
          </p>
          {error && <p className="text-xs text-scale-danger mt-1">{error}</p>}
        </div>

        <div className="bg-scale-card rounded-2xl border border-scale-border p-5">
          <h2 className="text-base font-bold text-scale-fg">Muốn lập phiếu cân?</h2>
          <p className="text-sm text-scale-muted-fg mt-1.5 leading-relaxed">
            Đăng nhập bằng tài khoản Cân Vạn Thịnh Phát cấp để cân theo phiếu, trừ bì, tính tiền,
            in phiếu xuất kho và xem lại lịch sử.
          </p>
          <Link
            href="/dang-nhap"
            className="mt-4 inline-flex items-center justify-center w-full min-h-touch px-4 rounded-lg bg-scale-primary text-scale-primary-fg font-semibold text-sm hover:bg-scale-primary-hover transition-colors"
          >
            Đăng nhập
          </Link>
        </div>
      </section>
    </div>
  );
}

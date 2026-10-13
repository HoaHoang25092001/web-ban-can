'use client';

import { forwardRef, useEffect, useState } from 'react';
import { CircleCheck, Activity, Unplug, Usb, TriangleAlert } from 'lucide-react';
import { useScaleContext } from '@/components/scale/scale-context';
import { formatWeightByScaleModel, SCALE_MODEL_LABELS, type ScaleModel } from '@/lib/scale-drivers/ScaleModel';
import { buttonClass, cx, inputClass } from '@/components/scale/ui';
import { detectPlatform, unsupportedReason, type Platform } from '@/lib/scale-drivers/platform';

/**
 * Màn hình số cân — chữ số rất lớn, đọc được từ xa vài bước chân, giữa lúc
 * tay người cân còn đang bê hàng.
 *
 * Theo đúng chế độ sáng/tối người dùng chọn. Bản đầu để nền tối cố định cho
 * giống đèn LED đầu cân, nhưng giữa trang sáng lại có một khối đen — người
 * dùng tưởng lỗi giao diện. Tương phản đo được (WCAG AA cần 4,5:1):
 *   - Sáng, nền #f8fafc: xanh #15803d 4,9:1 · vàng #b45309 4,8:1 · xám #475569 7,2:1
 *   - Tối,  nền #020617: xanh #4ade80 13:1 · vàng #fcd34d 15:1 · xám #94a3b8 7,9:1
 *
 * Trạng thái luôn có CHỮ kèm biểu tượng ("Ổn định", "Đang dao động"), không
 * chỉ đổi màu số (WCAG 1.4.1) — người mù màu xanh-vàng vẫn phân biệt được.
 *
 * Khi chưa kết nối cân, ô này thành ô nhập tay nhưng giữ nguyên kích thước và
 * kiểu chữ — người dùng không phải tìm ô nhập ở chỗ khác.
 */
export const WeightDisplay = forwardRef<
  HTMLInputElement,
  {
    /** Số nhập tay khi chưa kết nối cân; bỏ trống = màn hình chỉ xem, không cho nhập. */
    manualValue?: string;
    onManualChange?: (value: string) => void;
    manualInvalid?: boolean;
    manualDescribedBy?: string;
    size?: 'lg' | 'xl';
  }
>(function WeightDisplay({ manualValue, onManualChange, manualInvalid, manualDescribedBy, size = 'lg' }, ref) {
  const { reading, isConnected, scaleModel } = useScaleContext();
  const allowManual = onManualChange !== undefined;

  const state: 'stable' | 'unstable' | 'waiting' | 'manual' | 'off' = isConnected
    ? reading
      ? reading.stable
        ? 'stable'
        : 'unstable'
      : 'waiting'
    : allowManual
      ? 'manual'
      : 'off';

  const digits =
    isConnected && reading ? formatWeightByScaleModel(reading.valueKg, scaleModel, reading.decimals) : null;

  const digitColor =
    state === 'stable'
      ? 'text-green-700 dark:text-green-400'
      : state === 'unstable'
        ? 'text-amber-700 dark:text-amber-300'
        : 'text-slate-600 dark:text-slate-400';

  const NEUTRAL = 'text-slate-600 border-slate-400 dark:text-slate-300 dark:border-slate-500';

  const STATE_LABEL = {
    stable: { icon: <CircleCheck className="w-4 h-4" aria-hidden="true" />, text: 'Ổn định', cls: 'text-green-700 border-green-600 bg-green-50 dark:bg-transparent dark:text-green-400 dark:border-green-400/60' },
    unstable: { icon: <Activity className="w-4 h-4" aria-hidden="true" />, text: 'Đang dao động', cls: 'text-amber-700 border-amber-600 bg-amber-50 dark:bg-transparent dark:text-amber-300 dark:border-amber-300/60' },
    waiting: { icon: <Activity className="w-4 h-4" aria-hidden="true" />, text: 'Đang chờ số từ cân…', cls: NEUTRAL },
    manual: { icon: <Unplug className="w-4 h-4" aria-hidden="true" />, text: 'Nhập tay', cls: NEUTRAL },
    off: { icon: <Unplug className="w-4 h-4" aria-hidden="true" />, text: 'Chưa kết nối', cls: NEUTRAL },
  }[state];

  const numberSize = size === 'xl' ? 'text-[clamp(4rem,14vw,9.5rem)]' : 'text-[clamp(3.5rem,9vw,6.5rem)]';

  return (
    <div className="rounded-2xl bg-slate-50 ring-1 ring-scale-border shadow-inner px-5 pt-4 pb-5 sm:px-6 dark:bg-slate-950 dark:ring-slate-800">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300">Khối lượng</span>
        {/* aria-live: báo cho trình đọc màn hình khi cân chuyển ổn định / dao động.
            Chỉ đọc nhãn trạng thái — đọc từng con số nhảy liên tục sẽ rất ồn. */}
        <span
          aria-live="polite"
          className={cx('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-semibold', STATE_LABEL.cls)}
        >
          {STATE_LABEL.icon}
          {STATE_LABEL.text}
        </span>
      </div>

      <div className="mt-2 flex items-baseline justify-end gap-3 min-h-[1.1em] tabular-nums leading-none">
        {state === 'manual' ? (
          <>
            <label htmlFor="w-manual" className="sr-only">
              Khối lượng đọc trên màn hình cân (kg)
            </label>
            <input
              ref={ref}
              id="w-manual"
              inputMode="decimal"
              autoComplete="off"
              value={manualValue ?? ''}
              onChange={(e) => onManualChange?.(e.target.value)}
              placeholder="0.00"
              aria-invalid={manualInvalid || undefined}
              aria-describedby={manualDescribedBy}
              className={cx(
                numberSize,
                'w-full min-w-0 bg-transparent text-right font-bold text-slate-900 dark:text-green-400',
                // Chữ mờ gợi ý phải nhạt hẳn so với số thật — bản trước đậm quá,
                // người dùng tưởng cân đang báo 0.00.
                'placeholder:text-slate-300 dark:placeholder:text-slate-700',
                'border-b-2 focus:outline-none',
                manualInvalid
                  ? 'border-red-600 dark:border-red-400'
                  : 'border-slate-300 focus:border-scale-primary dark:border-slate-700 dark:focus:border-green-400'
              )}
            />
          </>
        ) : (
          <span className={cx(numberSize, 'font-bold tracking-tight break-all', digitColor)}>
            {digits ?? '--.--'}
          </span>
        )}
        <span className="text-2xl sm:text-3xl font-bold text-slate-600 dark:text-slate-300">kg</span>
      </div>
    </div>
  );
});

/**
 * Thanh kết nối cân: trạng thái, chọn loại cân, nút kết nối — gom một chỗ.
 *
 * Trình duyệt không hỗ trợ (Safari, Firefox, mọi trình duyệt trên iPhone)
 * thì nói thẳng và chỉ cách làm tiếp, không để nút "Kết nối" bấm rồi lỗi.
 */
export function ConnectionBar() {
  const { status, error, connect, disconnect, isConnected, hasWebSerial, scaleModel, setScaleModel } =
    useScaleContext();
  // Chỉ đọc được tên thiết bị trên trình duyệt — máy chủ không biết khách dùng máy gì.
  const [platform, setPlatform] = useState<Platform | null>(null);
  useEffect(() => setPlatform(detectPlatform()), []);
  const onPhone = platform?.os === 'android';

  if (hasWebSerial === false) {
    const reason = unsupportedReason(platform ?? detectPlatform(''));
    return (
      <div role="status" className="flex items-start gap-3 rounded-xl border border-scale-warning bg-scale-warning-soft p-4 text-sm">
        <TriangleAlert className="w-5 h-5 flex-shrink-0 text-scale-warning" aria-hidden="true" />
        <div className="text-scale-fg">
          <p className="font-semibold">{reason.title}</p>
          <p className="mt-1">{reason.fix}</p>
        </div>
      </div>
    );
  }

  const connecting = status === 'connecting';

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-scale-border bg-scale-card p-3 sm:flex-row sm:items-center sm:justify-between sm:pl-5">
      <div className="flex items-center gap-3 min-w-0" role="status">
        <span
          aria-hidden="true"
          className={cx(
            'w-3 h-3 rounded-full flex-shrink-0',
            isConnected ? 'bg-scale-success ring-4 ring-scale-success-soft' : 'bg-scale-muted-fg'
          )}
        />
        <div className="min-w-0">
          <p className="font-semibold text-scale-fg">
            {isConnected ? 'Đã kết nối cân' : connecting ? 'Đang kết nối…' : 'Chưa kết nối cân'}
          </p>
          {/* Lỗi được xuống dòng đầy đủ — bản trước cắt cụt bằng "…", người
              dùng không đọc được hướng dẫn khắc phục ở cuối câu. */}
          {error ? (
            <p className="text-sm text-scale-danger font-medium mt-0.5">{error}</p>
          ) : (
            <p className="text-xs text-scale-muted-fg">
              {isConnected
                ? SCALE_MODEL_LABELS[scaleModel]
                : onPhone
                  ? 'Cắm cân vào điện thoại bằng cáp OTG (hoặc bật Bluetooth của cân), rồi bấm Kết nối.'
                  : 'Cắm cân vào máy tính, chọn loại cân rồi bấm Kết nối.'}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="scale-model" className="sr-only">
          Loại cân
        </label>
        <select
          id="scale-model"
          value={scaleModel}
          onChange={(e) => setScaleModel(e.target.value as ScaleModel)}
          disabled={isConnected || connecting}
          title={isConnected ? 'Ngắt kết nối để đổi loại cân' : 'Loại cân'}
          className={cx(inputClass(), 'sm:w-56 flex-1 sm:flex-none')}
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
          disabled={connecting}
          className={cx(buttonClass({ variant: isConnected ? 'secondary' : 'primary' }), 'flex-1 sm:flex-none')}
        >
          {isConnected ? <Unplug className="w-4 h-4" aria-hidden="true" /> : <Usb className="w-4 h-4" aria-hidden="true" />}
          {isConnected ? 'Ngắt kết nối' : 'Kết nối cân'}
        </button>
      </div>
    </div>
  );
}

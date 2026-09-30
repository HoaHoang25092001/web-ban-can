'use client';

import { useState, useEffect, useCallback } from 'react';
import { Usb, Unplug, AlertTriangle, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { useScaleContext } from '@/components/scale/scale-context';
import { formatWeightByScaleModel, SCALE_MODEL_LABELS, type ScaleModel } from '@/lib/scale-drivers/ScaleModel';

interface Product {
  id: number;
  code: string;
  name: string;
}

/**
 * Màn hình cân: đọc số trực tiếp từ cân và lưu lại thành bản ghi.
 *
 * Viết lại từ dự án gốc thay vì chép nguyên: bản gốc dùng bộ giao diện
 * shadcn/radix mà website này không có. Dùng lại các lớp Tailwind sẵn có
 * vừa đỡ thêm thư viện, vừa đồng nhất với phần còn lại của trang.
 */
export default function ScaleConsole() {
  const { reading, status, error, connect, disconnect, isConnected, hasWebSerial, scaleModel, setScaleModel } =
    useScaleContext();

  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState<string>('');
  const [manualName, setManualName] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/scale/products')
      .then((r) => (r.ok ? r.json() : { products: [] }))
      .then((d) => setProducts(d.products ?? []))
      .catch(() => setProducts([]));
  }, []);

  const selected = products.find((p) => String(p.id) === productId);

  const save = useCallback(async () => {
    const weight = reading?.valueKg;
    if (weight === undefined || weight === null) {
      setMessage({ ok: false, text: 'Chưa đọc được khối lượng từ cân.' });
      return;
    }
    const name = selected?.name ?? manualName.trim();
    if (!name) {
      setMessage({ ok: false, text: 'Vui lòng chọn hoặc nhập tên mặt hàng.' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/scale/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selected?.id,
          productCode: selected?.code ?? '',
          productName: name,
          weight,
          employeeName,
          note,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage({ ok: true, text: `Đã lưu ${weight} kg — ${name}` });
        setNote('');
      } else {
        setMessage({ ok: false, text: data.error ?? 'Không lưu được bản ghi.' });
      }
    } catch {
      setMessage({ ok: false, text: 'Không kết nối được tới máy chủ.' });
    } finally {
      setSaving(false);
    }
  }, [reading, selected, manualName, employeeName, note]);

  /*
   * Web Serial API chỉ có trên Chrome và Edge bản máy tính.
   *
   * Firefox, Safari và mọi trình duyệt trên iPhone/iPad đều KHÔNG hỗ trợ —
   * nói rõ ngay từ đầu, thay vì để khách bấm "Kết nối" rồi nhận lỗi khó hiểu
   * và tưởng cân hỏng (tiêu chí 8).
   */
  if (hasWebSerial === false) {
    return (
      <div className="bg-white rounded-2xl border border-amber-300 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-bold text-slate-900">Trình duyệt này không kết nối được với cân</h2>
            <p className="text-sm text-slate-700 mt-2 leading-relaxed max-w-prose">
              Việc đọc số từ cân cần trình duyệt hỗ trợ cổng nối tiếp (Web Serial). Hiện chỉ
              <strong> Google Chrome</strong> và <strong>Microsoft Edge</strong> trên máy tính
              làm được. Firefox, Safari và các trình duyệt trên iPhone/iPad chưa hỗ trợ.
            </p>
            <p className="text-sm text-slate-700 mt-3 max-w-prose">
              Bạn vẫn xem và nhập được bản ghi ở mục <strong>Bản ghi cân</strong>, chỉ không đọc
              tự động từ cân.
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
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between min-h-[19rem]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-lg font-bold text-slate-900">Khối lượng hiện tại</h2>
          {reading && (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                reading.stable
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
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
            <p className="flex items-baseline gap-3 font-mono font-bold text-brand-700">
              <span className="text-[clamp(3.5rem,13vw,9rem)] leading-none tracking-tight break-all">
                {weightText}
              </span>
              <span className="text-2xl sm:text-3xl text-slate-700">kg</span>
            </p>
          ) : (
            /* Chưa kết nối thì nói rõ phải làm gì, thay vì hiện "--" trơ trọi
               khiến người dùng tưởng cân hỏng hoặc trang lỗi (tiêu chí 8). */
            <div className="text-center px-4">
              <Usb className="w-10 h-10 text-slate-300 mx-auto mb-3" aria-hidden="true" />
              <p className="font-semibold text-slate-700">Chưa kết nối với cân</p>
              <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                Cắm cân vào máy tính rồi bấm <strong>Kết nối cân</strong> ở bên phải để bắt đầu đọc khối lượng.
              </p>
            </div>
          )}
        </div>

        {/* aria-live để người dùng trình đọc màn hình biết đã lưu hay lỗi */}
        <div aria-live="polite" className="min-h-[1.5rem]">
          {message && (
            <p
              className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                message.ok ? 'text-emerald-700' : 'text-red-700'
              }`}
            >
              {message.ok && <CheckCircle2 className="w-4 h-4" aria-hidden="true" />}
              {message.text}
            </p>
          )}
        </div>
      </section>

      {/* Bảng điều khiển */}
      <section className="space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-base font-bold text-slate-900 mb-3">Kết nối cân</h2>

          <label htmlFor="scale-model" className="block text-sm font-medium text-slate-700 mb-1.5">
            Loại cân
          </label>
          <select
            id="scale-model"
            value={scaleModel}
            onChange={(e) => setScaleModel(e.target.value as ScaleModel)}
            disabled={isConnected}
            className="w-full min-h-touch px-3 rounded-lg border border-slate-300 text-sm mb-4 disabled:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
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
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                : 'bg-brand-600 text-white hover:bg-brand-700'
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

          <p className="text-xs text-slate-500 mt-2">
            Trạng thái: <span className="font-medium text-slate-700">{status}</span>
          </p>
          {error && <p className="text-xs text-red-700 mt-1">{error}</p>}
        </div>

        {/* Lưu bản ghi */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <h2 className="text-base font-bold text-slate-900">Lưu lần cân</h2>

          <div>
            <label htmlFor="product" className="block text-sm font-medium text-slate-700 mb-1.5">
              Mặt hàng
            </label>
            <select
              id="product"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full min-h-touch px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">— Nhập tay —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} · {p.name}
                </option>
              ))}
            </select>
          </div>

          {!productId && (
            <div>
              <label htmlFor="manual-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                Tên mặt hàng
              </label>
              <input
                id="manual-name"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="Ví dụ: Gạo ST25"
                className="w-full min-h-touch px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          )}

          <div>
            <label htmlFor="employee" className="block text-sm font-medium text-slate-700 mb-1.5">
              Người cân <span className="text-slate-500 font-normal">(không bắt buộc)</span>
            </label>
            <input
              id="employee"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              className="w-full min-h-touch px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-medium text-slate-700 mb-1.5">
              Ghi chú <span className="text-slate-500 font-normal">(không bắt buộc)</span>
            </label>
            <input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full min-h-touch px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="button"
            onClick={save}
            disabled={saving || !reading}
            className="w-full inline-flex items-center justify-center gap-2 min-h-touch px-4 rounded-lg bg-accent-600 text-white font-semibold text-sm hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="w-4 h-4" aria-hidden="true" />
            )}
            {saving ? 'Đang lưu…' : 'Lưu lần cân'}
          </button>
          {!reading && (
            <p className="text-xs text-slate-500">Kết nối cân để đọc khối lượng trước khi lưu.</p>
          )}
        </div>
      </section>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Usb,
  Unplug,
  Save,
  Loader2,
  Printer,
  CheckCircle2,
  RotateCcw,
  FilePlus2,
  Trash2,
  Search,
  Lock,
  Scale as ScaleIcon,
} from 'lucide-react';
import { useScaleContext } from '@/components/scale/scale-context';
import { formatWeightByScaleModel, SCALE_MODEL_LABELS, type ScaleModel } from '@/lib/scale-drivers/ScaleModel';
import {
  computeLine,
  formatKg,
  formatMoney,
  formatVnDateTime,
  roundKg,
  ticketTotals,
  vnToday,
  TICKET_TYPE_LABEL,
  type TicketType,
} from '@/lib/scale-ticket';

interface Product {
  id: number;
  code: string;
  name: string;
  unitPrice: number | null;
}

interface Customer {
  id: number;
  code: string;
  name: string;
  phone: string | null;
  address: string | null;
}

interface Line {
  id: number;
  productCode: string;
  productName: string;
  grossWeight: number;
  trayCount: number;
  trayWeight: number;
  tareWeight: number;
  netWeight: number;
  unitPrice: number;
  amount: number;
  weighedAt: string;
}

interface Ticket {
  id: number;
  ticketNo: number;
  type: TicketType;
  status: 'OPEN' | 'DONE';
  customerId: number | null;
  customerName: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  driverName: string | null;
  vehiclePlate: string | null;
  note: string | null;
  createdAt: string;
  lines: Line[];
}

interface TicketSummary extends Omit<Ticket, 'lines'> {
  lineCount: number;
  totalWeight: number;
  totalAmount: number;
}

interface Header {
  type: TicketType;
  customerId: number | null;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  driverName: string;
  vehiclePlate: string;
  note: string;
}

const EMPTY_HEADER: Header = {
  type: 'XUAT',
  customerId: null,
  customerName: '',
  customerPhone: '',
  customerAddress: '',
  driverName: '',
  vehiclePlate: '',
  note: '',
};

function headerOf(t: Ticket): Header {
  return {
    type: t.type,
    customerId: t.customerId,
    customerName: t.customerName ?? '',
    customerPhone: t.customerPhone ?? '',
    customerAddress: t.customerAddress ?? '',
    driverName: t.driverName ?? '',
    vehiclePlate: t.vehiclePlate ?? '',
    note: t.note ?? '',
  };
}

/** "1,5" hay "1.5" đều hiểu là 1,5 kg — người Việt quen gõ dấu phẩy. */
function parseDecimal(s: string) {
  const n = Number(s.trim().replace(',', '.'));
  return s.trim() === '' ? 0 : n;
}

/** Đơn giá gõ "28.500" hay "28500" đều là hai mươi tám nghìn rưỡi. */
function parsePrice(s: string) {
  const digits = s.replace(/[^\d]/g, '');
  return digits ? Number(digits) : 0;
}

/* Bì một khay hầu như không đổi giữa các lần cân — nhớ lại trên máy này để
   sáng hôm sau mở ra khỏi phải nhập lại. Chỉ là tiện ích, mất cũng không sao. */
const TRAY_KEY = 'scale-tray-weight';
function loadTrayWeight() {
  try {
    return localStorage.getItem(TRAY_KEY) ?? '';
  } catch {
    return '';
  }
}
function storeTrayWeight(v: string) {
  try {
    localStorage.setItem(TRAY_KEY, v);
  } catch {
    /* chế độ ẩn danh — bỏ qua */
  }
}

const INPUT =
  'w-full min-h-touch px-3 rounded-lg bg-scale-card border border-scale-input text-scale-fg text-sm focus:outline-none focus:ring-2 focus:ring-scale-ring disabled:bg-scale-muted disabled:text-scale-muted-fg';
const LABEL = 'block text-sm font-medium text-scale-fg mb-1.5';
const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 min-h-touch px-4 rounded-lg bg-scale-primary text-scale-primary-fg text-sm font-semibold hover:bg-scale-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors';
const BTN_OUTLINE =
  'inline-flex items-center justify-center gap-2 min-h-touch px-4 rounded-lg border border-scale-border bg-scale-card text-scale-fg text-sm font-medium hover:bg-scale-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors';

/**
 * Màn hình lập phiếu cân — theo đúng thứ tự làm việc của ứng dụng cân trên
 * máy tính khách đang dùng:
 *
 *   1. Điền khách, số xe, tài xế (hoặc chọn khách có sẵn).
 *   2. Mỗi lần đặt hàng lên cân: chọn loại hàng, số khay → bấm F2 lưu lượt.
 *   3. Cân xong: "Xong phiếu" để khoá, rồi "In phiếu".
 *
 * Khác bản máy tính một chỗ: không phải bấm "Tạo phiếu" trước. Lượt cân đầu
 * tiên tự tạo phiếu — người đứng cân thường quên bước đó, bấm F2 rồi mới
 * thấy báo lỗi, phải làm lại.
 */
export default function TicketWorkbench({
  initialTicketId,
  initialCustomerId,
}: {
  initialTicketId?: number;
  initialCustomerId?: number;
}) {
  const { reading, status, error: scaleError, connect, disconnect, isConnected, hasWebSerial, scaleModel, setScaleModel } =
    useScaleContext();

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [header, setHeader] = useState<Header>(EMPTY_HEADER);
  const [savedHeader, setSavedHeader] = useState<Header>(EMPTY_HEADER);
  const [saveCustomer, setSaveCustomer] = useState(true);

  const [productId, setProductId] = useState('');
  const [manualProduct, setManualProduct] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [trayCount, setTrayCount] = useState('0');
  const [trayWeight, setTrayWeight] = useState('');
  const [manualWeight, setManualWeight] = useState('');

  const [busy, setBusy] = useState<string | null>(null);
  /* Đang tải phiếu mở từ Bản ghi cân hay đường dẫn ?id=. Không có cờ này thì
     một hai giây đầu màn hình ghi "Phiếu mới" với các ô trống — người cân
     tưởng phải lập phiếu mới và bắt đầu gõ vào. */
  const [opening, setOpening] = useState(Boolean(initialTicketId));
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const [from, setFrom] = useState(() => vnToday(-6));
  const [to, setTo] = useState(() => vnToday());
  const [search, setSearch] = useState('');
  const [list, setList] = useState<TicketSummary[]>([]);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => setTrayWeight(loadTrayWeight()), []);

  /* ---------------- tải dữ liệu ---------------- */

  const loadCustomers = useCallback(async () => {
    const r = await fetch('/api/scale/customers');
    if (r.ok) setCustomers((await r.json()).customers ?? []);
  }, []);

  useEffect(() => {
    fetch('/api/scale/products')
      .then((r) => (r.ok ? r.json() : { products: [] }))
      .then((d) => setProducts(d.products ?? []))
      .catch(() => {});
    loadCustomers().catch(() => {});
  }, [loadCustomers]);

  const loadList = useCallback(async () => {
    setListLoading(true);
    try {
      const qs = new URLSearchParams({ from, to, ...(search.trim() ? { search: search.trim() } : {}) });
      const r = await fetch(`/api/scale/tickets?${qs}`);
      if (r.ok) setList((await r.json()).tickets ?? []);
    } finally {
      setListLoading(false);
    }
  }, [from, to, search]);

  // Gõ tìm kiếm thì chờ người dùng dừng tay một chút rồi mới gọi máy chủ.
  useEffect(() => {
    const t = setTimeout(() => loadList().catch(() => {}), 300);
    return () => clearTimeout(t);
  }, [loadList]);

  const applyTicket = useCallback((t: Ticket | null) => {
    setTicket(t);
    const h = t ? headerOf(t) : EMPTY_HEADER;
    setHeader(h);
    setSavedHeader(h);
    // Ghi số phiếu lên thanh địa chỉ: lỡ tải lại trang vẫn mở đúng phiếu đang cân.
    window.history.replaceState(null, '', t ? `/can-dien-tu?id=${t.id}` : '/can-dien-tu');
  }, []);

  const openTicket = useCallback(
    async (id: number) => {
      setMessage(null);
      setOpening(true);
      try {
        const r = await fetch(`/api/scale/tickets/${id}`);
        if (r.ok) applyTicket(await r.json());
        else setMessage({ ok: false, text: 'Không mở được phiếu.' });
      } catch {
        setMessage({ ok: false, text: 'Không kết nối được tới máy chủ.' });
      } finally {
        setOpening(false);
      }
    },
    [applyTicket]
  );

  useEffect(() => {
    if (initialTicketId) openTicket(initialTicketId);
  }, [initialTicketId, openTicket]);

  // Đến từ nút "Lập phiếu" ở trang Khách hàng: điền sẵn khách đó.
  useEffect(() => {
    if (!initialCustomerId || initialTicketId) return;
    const c = customers.find((x) => x.id === initialCustomerId);
    if (c) {
      setHeader((h) =>
        h.customerId ? h : { ...h, customerId: c.id, customerName: c.name, customerPhone: c.phone ?? '', customerAddress: c.address ?? '' }
      );
    }
  }, [initialCustomerId, initialTicketId, customers]);

  /* ---------------- thông tin phiếu ---------------- */

  const locked = ticket?.status === 'DONE';
  const headerDirty = JSON.stringify(header) !== JSON.stringify(savedHeader);
  const matchedCustomer = header.customerId ? customers.find((c) => c.id === header.customerId) : undefined;
  const isNewCustomer = !header.customerId && header.customerName.trim() !== '';

  const onCustomerName = (value: string) => {
    const c = customers.find((x) => x.name.toLowerCase() === value.trim().toLowerCase());
    if (c) {
      setHeader((h) => ({ ...h, customerId: c.id, customerName: c.name, customerPhone: c.phone ?? '', customerAddress: c.address ?? '' }));
    } else {
      setHeader((h) => ({ ...h, customerId: null, customerName: value }));
    }
  };

  /**
   * Bảo đảm có phiếu trên máy chủ và thông tin đầu phiếu đã lưu, rồi trả về phiếu.
   * Mọi thao tác (lưu lượt cân, xong phiếu, in) đều gọi hàm này trước — khỏi
   * cảnh sửa số xe xong quên bấm lưu, in ra vẫn là số xe cũ.
   */
  const ensureTicket = useCallback(async (): Promise<Ticket | null> => {
    if (ticket && !headerDirty) return ticket;
    const res = ticket
      ? await fetch(`/api/scale/tickets/${ticket.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(header),
        })
      : await fetch('/api/scale/tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...header, saveCustomer: isNewCustomer && saveCustomer }),
        });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage({ ok: false, text: data.error ?? 'Không lưu được phiếu.' });
      return null;
    }
    applyTicket(data);
    if (!ticket && isNewCustomer && saveCustomer) loadCustomers().catch(() => {});
    return data as Ticket;
  }, [ticket, headerDirty, header, isNewCustomer, saveCustomer, applyTicket, loadCustomers]);

  const saveHeader = async () => {
    setBusy('header');
    setMessage(null);
    try {
      const t = await ensureTicket();
      if (t) {
        setMessage({ ok: true, text: `Đã lưu thông tin phiếu số ${t.ticketNo}.` });
        loadList();
      }
    } finally {
      setBusy(null);
    }
  };

  /* ---------------- lượt cân ---------------- */

  const product = products.find((p) => String(p.id) === productId);
  const productName = product?.name ?? manualProduct.trim();

  const onProduct = (value: string) => {
    setProductId(value);
    const p = products.find((x) => String(x.id) === value);
    // Mặt hàng có giá mặc định thì điền sẵn; vẫn sửa được cho từng khách.
    if (p?.unitPrice != null) setUnitPrice(String(p.unitPrice));
  };

  const gross = isConnected ? reading?.valueKg ?? null : manualWeight.trim() ? parseDecimal(manualWeight) : null;
  const trays = Math.max(0, Math.trunc(parseDecimal(trayCount) || 0));
  const perTray = parseDecimal(trayWeight);
  const price = parsePrice(unitPrice);
  const preview =
    gross !== null && Number.isFinite(gross) && Number.isFinite(perTray)
      ? computeLine({ grossWeight: roundKg(gross), trayCount: trays, trayWeight: perTray, unitPrice: price })
      : null;

  /** "Cân bì": đặt khay rỗng lên cân, lấy số đó chia cho số khay ra bì một khay. */
  const weighTare = () => {
    if (!reading) return;
    const per = roundKg(reading.valueKg / Math.max(trays, 1));
    setTrayWeight(String(per));
    storeTrayWeight(String(per));
    setMessage({ ok: true, text: `Bì một khay = ${formatKg(per)} kg${trays > 1 ? ` (${formatKg(reading.valueKg)} kg ÷ ${trays} khay)` : ''}.` });
  };

  const saveLine = useCallback(async () => {
    if (busy) return;
    setMessage(null);
    if (locked) {
      setMessage({ ok: false, text: 'Phiếu đã xong. Bấm "Mở lại phiếu" nếu cần cân thêm.' });
      return;
    }
    if (!productName) {
      setMessage({ ok: false, text: 'Chọn loại hàng trước khi lưu lượt cân.' });
      return;
    }
    if (gross === null || !Number.isFinite(gross) || gross <= 0) {
      setMessage({ ok: false, text: isConnected ? 'Cân chưa có số (đang 0 kg).' : 'Nhập khối lượng đọc trên cân.' });
      return;
    }
    if (!Number.isFinite(perTray) || perTray < 0) {
      setMessage({ ok: false, text: 'Bì một khay không hợp lệ.' });
      return;
    }
    if (preview && preview.netWeight <= 0) {
      setMessage({ ok: false, text: 'Trừ bì lớn hơn khối lượng cân — kiểm tra lại số khay.' });
      return;
    }
    if (isConnected && reading && !reading.stable && !confirm('Cân đang dao động, số chưa đứng yên. Vẫn lưu lượt này?')) {
      return;
    }

    setBusy('line');
    try {
      const t = await ensureTicket();
      if (!t) return;
      const res = await fetch(`/api/scale/tickets/${t.id}/lines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productCode: product?.code ?? '',
          productName,
          grossWeight: roundKg(gross),
          trayCount: trays,
          trayWeight: perTray,
          unitPrice: price,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ ok: false, text: data.error ?? 'Không lưu được lượt cân.' });
        return;
      }
      /* Cộng vào danh sách MỚI NHẤT chứ không vào bản `t` trong tay: `t` có
         thể là bản cũ chụp từ trước, cộng vào đó sẽ làm mất lượt vừa lưu ngay
         trước — máy chủ có đủ mà màn hình lại thiếu. */
      setTicket((prev) =>
        prev && prev.id === t.id ? { ...prev, lines: [...prev.lines, data as Line] } : { ...t, lines: [...t.lines, data as Line] }
      );
      setMessage({ ok: true, text: `Đã lưu: ${productName} ${formatKg((data as Line).netWeight)} kg.` });
      if (!isConnected) setManualWeight('');
      if (trayWeight) storeTrayWeight(trayWeight);
      loadList();
    } catch {
      setMessage({ ok: false, text: 'Không kết nối được tới máy chủ.' });
    } finally {
      setBusy(null);
    }
  }, [busy, locked, productName, gross, isConnected, perTray, preview, reading, ensureTicket, product, trays, price, trayWeight, loadList]);

  // F2 = lưu lượt cân, giống ứng dụng trên máy tính — tay khỏi rời bàn phím.
  const saveLineRef = useRef(saveLine);
  saveLineRef.current = saveLine;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        saveLineRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const deleteLine = async (line: Line, index: number) => {
    if (!ticket) return;
    if (!confirm(`Xoá lượt cân số ${index + 1} (${line.productName} ${formatKg(line.netWeight)} kg)?`)) return;
    setBusy(`del-${line.id}`);
    try {
      const res = await fetch(`/api/scale/tickets/${ticket.id}/lines`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineId: line.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setTicket((prev) => (prev ? { ...prev, lines: prev.lines.filter((l) => l.id !== line.id) } : prev));
        loadList();
      } else setMessage({ ok: false, text: data.error ?? 'Không xoá được lượt cân.' });
    } finally {
      setBusy(null);
    }
  };

  /* ---------------- thao tác với phiếu ---------------- */

  const setStatus = async (next: 'DONE' | 'OPEN') => {
    if (next === 'OPEN' && !confirm('Mở lại phiếu để sửa? Nhớ in lại phiếu sau khi sửa xong.')) return;
    setBusy('status');
    setMessage(null);
    try {
      const t = next === 'DONE' ? await ensureTicket() : ticket;
      if (!t) return;
      const res = await fetch(`/api/scale/tickets/${t.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ ok: false, text: data.error ?? 'Không cập nhật được phiếu.' });
        return;
      }
      applyTicket(data);
      setMessage({ ok: true, text: next === 'DONE' ? `Phiếu số ${t.ticketNo} đã xong. Bấm "In phiếu" để in.` : 'Đã mở lại phiếu.' });
      loadList();
    } finally {
      setBusy(null);
    }
  };

  /* Mở trang in ở THẺ MỚI: thẻ này giữ nguyên kết nối cân, in xong đóng thẻ
     kia là quay lại cân tiếp, không phải kết nối lại. */
  const printTicket = async () => {
    setBusy('print');
    try {
      const t = await ensureTicket();
      if (t) window.open(`/can-dien-tu/phieu/${t.id}/in?auto=1`, '_blank');
    } finally {
      setBusy(null);
    }
  };

  const newTicket = () => {
    if (headerDirty && ticket && !confirm('Thông tin phiếu đang sửa chưa lưu. Bỏ qua và lập phiếu mới?')) return;
    applyTicket(null);
    setMessage(null);
  };

  const deleteTicket = async () => {
    if (!ticket) return;
    if (!confirm(`Xoá hẳn phiếu số ${ticket.ticketNo} cùng ${ticket.lines.length} lượt cân? Không khôi phục được.`)) return;
    setBusy('delete');
    try {
      const res = await fetch(`/api/scale/tickets/${ticket.id}`, { method: 'DELETE' });
      if (res.ok) {
        applyTicket(null);
        setMessage({ ok: true, text: `Đã xoá phiếu số ${ticket.ticketNo}.` });
        loadList();
      }
    } finally {
      setBusy(null);
    }
  };

  const lines = useMemo(() => ticket?.lines ?? [], [ticket]);
  const totals = ticketTotals(lines);

  /* ---------------- giao diện ---------------- */

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
        {/* ============ Thông tin phiếu ============ */}
        <section aria-labelledby="ticket-info" className="bg-scale-card rounded-2xl border border-scale-border p-5 self-start">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 id="ticket-info" className="text-base font-bold text-scale-fg">
              {opening ? 'Đang mở phiếu…' : ticket ? `Phiếu số ${ticket.ticketNo}` : 'Phiếu mới'}
            </h2>
            {ticket && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  locked
                    ? 'bg-scale-success-soft text-scale-success border-scale-success'
                    : 'bg-scale-warning-soft text-scale-warning border-scale-warning'
                }`}
              >
                {locked && <Lock className="w-3 h-3" aria-hidden="true" />}
                {locked ? 'Đã xong' : 'Đang cân'}
              </span>
            )}
          </div>

          <fieldset disabled={locked || opening} className="space-y-3">
            <legend className="sr-only">Thông tin phiếu</legend>

            {/* Xuất/Nhập: hai nút bấm to thay cho ô chọn — đổi được bằng một chạm. */}
            <div role="radiogroup" aria-label="Loại phiếu" className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-scale-muted border border-scale-border">
              {(['XUAT', 'NHAP'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={header.type === t}
                  onClick={() => setHeader((h) => ({ ...h, type: t }))}
                  className={`min-h-touch rounded-md text-sm font-semibold transition-colors ${
                    header.type === t ? 'bg-scale-primary text-scale-primary-fg shadow-sm' : 'text-scale-muted-fg hover:text-scale-fg'
                  }`}
                >
                  {TICKET_TYPE_LABEL[t]}
                </button>
              ))}
            </div>

            <div>
              <label htmlFor="t-customer" className={LABEL}>
                Khách hàng
              </label>
              <input
                id="t-customer"
                list="t-customer-list"
                autoComplete="off"
                value={header.customerName}
                onChange={(e) => onCustomerName(e.target.value)}
                placeholder="Gõ tên hoặc chọn từ danh bạ"
                className={INPUT}
              />
              <datalist id="t-customer-list">
                {customers.map((c) => (
                  <option key={c.id} value={c.name} label={[c.code, c.phone].filter(Boolean).join(' · ')} />
                ))}
              </datalist>
              {matchedCustomer && <p className="text-xs text-scale-success mt-1">Khách trong danh bạ · {matchedCustomer.code}</p>}
              {isNewCustomer && !ticket && (
                <label className="flex items-center gap-2 mt-1 min-h-touch text-sm text-scale-fg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveCustomer}
                    onChange={(e) => setSaveCustomer(e.target.checked)}
                    className="w-5 h-5 accent-[var(--scale-primary)]"
                  />
                  Lưu khách mới vào danh bạ
                </label>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="t-phone" className={LABEL}>
                  Điện thoại
                </label>
                <input
                  id="t-phone"
                  type="tel"
                  inputMode="tel"
                  value={header.customerPhone}
                  onChange={(e) => setHeader((h) => ({ ...h, customerPhone: e.target.value }))}
                  className={INPUT}
                />
              </div>
              <div>
                <label htmlFor="t-plate" className={LABEL}>
                  Số xe
                </label>
                <input
                  id="t-plate"
                  value={header.vehiclePlate}
                  onChange={(e) => setHeader((h) => ({ ...h, vehiclePlate: e.target.value.toUpperCase() }))}
                  placeholder="71C-123.45"
                  className={INPUT}
                />
              </div>
            </div>

            <div>
              <label htmlFor="t-address" className={LABEL}>
                Địa chỉ
              </label>
              <input
                id="t-address"
                value={header.customerAddress}
                onChange={(e) => setHeader((h) => ({ ...h, customerAddress: e.target.value }))}
                className={INPUT}
              />
            </div>

            <div>
              <label htmlFor="t-driver" className={LABEL}>
                Tài xế
              </label>
              <input
                id="t-driver"
                value={header.driverName}
                onChange={(e) => setHeader((h) => ({ ...h, driverName: e.target.value }))}
                className={INPUT}
              />
            </div>

            <div>
              <label htmlFor="t-note" className={LABEL}>
                Ghi chú <span className="text-scale-muted-fg font-normal">(in trên phiếu)</span>
              </label>
              <input
                id="t-note"
                value={header.note}
                onChange={(e) => setHeader((h) => ({ ...h, note: e.target.value }))}
                className={INPUT}
              />
            </div>
          </fieldset>

          {ticket && headerDirty && !locked && (
            <button type="button" onClick={saveHeader} disabled={busy !== null} className={`${BTN_OUTLINE} w-full mt-3`}>
              {busy === 'header' ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Save className="w-4 h-4" aria-hidden="true" />}
              Lưu thông tin phiếu
            </button>
          )}

          {/* Thao tác phiếu */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-scale-border">
            {locked ? (
              <button type="button" onClick={() => setStatus('OPEN')} disabled={busy !== null} className={BTN_OUTLINE}>
                <RotateCcw className="w-4 h-4" aria-hidden="true" /> Mở lại phiếu
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStatus('DONE')}
                disabled={busy !== null || lines.length === 0}
                className={BTN_OUTLINE}
              >
                {busy === 'status' ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="w-4 h-4" aria-hidden="true" />}
                Xong phiếu
              </button>
            )}
            <button type="button" onClick={printTicket} disabled={busy !== null || lines.length === 0} className={locked ? BTN_PRIMARY : BTN_OUTLINE}>
              {busy === 'print' ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Printer className="w-4 h-4" aria-hidden="true" />}
              In phiếu
            </button>
            <button type="button" onClick={newTicket} disabled={busy !== null || !ticket} className={BTN_OUTLINE}>
              <FilePlus2 className="w-4 h-4" aria-hidden="true" /> Phiếu mới
            </button>
            <button
              type="button"
              onClick={deleteTicket}
              disabled={busy !== null || !ticket}
              className="inline-flex items-center justify-center gap-2 min-h-touch px-4 rounded-lg text-sm font-medium text-scale-danger hover:bg-scale-danger-soft disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" /> Xoá phiếu
            </button>
          </div>
        </section>

        {/* ============ Cân & lượt cân ============ */}
        <div className="space-y-5 min-w-0">
          <section aria-labelledby="weigh-title" className="bg-scale-card rounded-2xl border border-scale-border p-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 id="weigh-title" className="text-base font-bold text-scale-fg">
                Cân hàng
              </h2>
              {hasWebSerial !== false && (
                <div className="flex flex-wrap items-center gap-2">
                  {/* Loại cân quyết định cách đọc số từ cổng — chỉ đổi được khi
                      chưa kết nối, giống Màn hình cân cũ. */}
                  <label htmlFor="scale-model" className="sr-only">
                    Loại cân
                  </label>
                  <select
                    id="scale-model"
                    value={scaleModel}
                    onChange={(e) => setScaleModel(e.target.value as ScaleModel)}
                    disabled={isConnected}
                    title="Loại cân"
                    className={`${INPUT} w-auto max-w-[14rem]`}
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
                    className={isConnected ? BTN_OUTLINE : BTN_PRIMARY}
                  >
                    {isConnected ? <Unplug className="w-4 h-4" aria-hidden="true" /> : <Usb className="w-4 h-4" aria-hidden="true" />}
                    {isConnected ? 'Ngắt kết nối' : 'Kết nối cân'}
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] mt-4">
              {/* Số cân */}
              <div className="rounded-xl bg-scale-muted border border-scale-border p-4 flex flex-col justify-center min-h-[10rem]">
                {isConnected ? (
                  <>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-scale-muted-fg">Khối lượng trên cân</span>
                      {reading && (
                        <span className={`font-semibold ${reading.stable ? 'text-scale-success' : 'text-scale-warning'}`}>
                          {reading.stable ? 'Đã ổn định' : 'Đang dao động'}
                        </span>
                      )}
                    </div>
                    <p className="flex items-baseline justify-center gap-2 font-mono font-bold text-scale-primary my-3" aria-live="off">
                      <span className="text-[clamp(2.75rem,8vw,4.5rem)] leading-none tracking-tight">
                        {reading ? formatWeightByScaleModel(reading.valueKg, scaleModel) : '--'}
                      </span>
                      <span className="text-xl text-scale-fg">kg</span>
                    </p>
                    <p className="text-xs text-scale-muted-fg text-center truncate">Trạng thái: {status}</p>
                  </>
                ) : (
                  <>
                    <label htmlFor="w-manual" className={LABEL}>
                      Khối lượng (kg)
                    </label>
                    <input
                      id="w-manual"
                      inputMode="decimal"
                      autoComplete="off"
                      value={manualWeight}
                      onChange={(e) => setManualWeight(e.target.value)}
                      placeholder="0"
                      className={`${INPUT} text-3xl font-mono font-bold text-right min-h-[3.75rem]`}
                    />
                    <p className="text-xs text-scale-muted-fg mt-2">
                      {hasWebSerial === false
                        ? 'Trình duyệt này không đọc được cân tự động — nhập số trên màn hình cân.'
                        : 'Chưa kết nối cân: nhập tay số trên màn hình cân, hoặc bấm "Kết nối cân".'}
                    </p>
                  </>
                )}
                {scaleError && <p className="text-xs text-scale-danger mt-1">{scaleError}</p>}
              </div>

              {/* Loại hàng, khay, giá */}
              <fieldset disabled={locked || opening} className="grid grid-cols-2 gap-3">
                <legend className="sr-only">Thông tin lượt cân</legend>
                <div className="col-span-2">
                  <label htmlFor="w-product" className={LABEL}>
                    Loại hàng
                  </label>
                  <select id="w-product" value={productId} onChange={(e) => onProduct(e.target.value)} className={INPUT}>
                    <option value="">— Nhập tay —</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} · {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                {!productId && (
                  <div className="col-span-2">
                    <label htmlFor="w-product-name" className="sr-only">
                      Tên loại hàng
                    </label>
                    <input
                      id="w-product-name"
                      value={manualProduct}
                      onChange={(e) => setManualProduct(e.target.value)}
                      placeholder="Tên loại hàng, VD: Cá lóc"
                      className={INPUT}
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="w-price" className={LABEL}>
                    Đơn giá <span className="text-scale-muted-fg font-normal">đ/kg</span>
                  </label>
                  <input
                    id="w-price"
                    inputMode="numeric"
                    autoComplete="off"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    placeholder="0"
                    className={`${INPUT} text-right`}
                  />
                </div>
                <div>
                  <label htmlFor="w-trays" className={LABEL}>
                    Số khay
                  </label>
                  <input
                    id="w-trays"
                    inputMode="numeric"
                    autoComplete="off"
                    value={trayCount}
                    onChange={(e) => setTrayCount(e.target.value.replace(/[^\d]/g, ''))}
                    className={`${INPUT} text-right`}
                  />
                </div>
                <div className="col-span-2">
                  <label htmlFor="w-tray-weight" className={LABEL}>
                    Bì một khay <span className="text-scale-muted-fg font-normal">(kg)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="w-tray-weight"
                      inputMode="decimal"
                      autoComplete="off"
                      value={trayWeight}
                      onChange={(e) => setTrayWeight(e.target.value)}
                      placeholder="VD: 0,8"
                      className={`${INPUT} text-right`}
                    />
                    <button
                      type="button"
                      onClick={weighTare}
                      disabled={!isConnected || !reading}
                      title="Đặt khay rỗng lên cân rồi bấm để lấy khối lượng bì"
                      className={`${BTN_OUTLINE} flex-shrink-0`}
                    >
                      <ScaleIcon className="w-4 h-4" aria-hidden="true" /> Cân bì
                    </button>
                  </div>
                </div>
              </fieldset>
            </div>

            {/* Xem trước kết quả trước khi lưu: người cân thấy ngay trừ bì đúng chưa. */}
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-px mt-4 rounded-xl overflow-hidden border border-scale-border bg-scale-border text-center">
              {[
                ['TL cân', preview && gross !== null ? `${formatKg(roundKg(gross))} kg` : '—'],
                ['Trừ bì', preview ? `${formatKg(preview.tareWeight)} kg` : '—'],
                ['TL hàng', preview ? `${formatKg(preview.netWeight)} kg` : '—'],
                ['Thành tiền', preview ? `${formatMoney(preview.amount)} đ` : '—'],
              ].map(([k, v]) => (
                <div key={k} className="bg-scale-card px-2 py-2.5">
                  <dt className="text-xs text-scale-muted-fg">{k}</dt>
                  <dd className="font-semibold text-scale-fg font-mono mt-0.5 break-all">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4">
              <button
                type="button"
                onClick={saveLine}
                disabled={busy !== null || locked}
                className={`${BTN_PRIMARY} sm:min-w-[14rem] text-base`}
              >
                {busy === 'line' ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <Save className="w-5 h-5" aria-hidden="true" />}
                Lưu lượt cân
                <kbd className="hidden sm:inline ml-1 px-1.5 py-0.5 rounded bg-black/15 text-xs font-mono">F2</kbd>
              </button>
              <div aria-live="polite" className="min-h-[1.25rem] text-sm">
                {message && (
                  <p className={`font-medium ${message.ok ? 'text-scale-success' : 'text-scale-danger'}`}>{message.text}</p>
                )}
              </div>
            </div>
          </section>

          {/* Tổng */}
          <section aria-label="Tổng phiếu" className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-scale-card border border-scale-border p-4">
              <p className="text-xs font-semibold text-scale-muted-fg uppercase tracking-wide">Tổng trọng lượng</p>
              <p className="font-mono font-bold text-2xl sm:text-3xl text-scale-fg mt-1 break-all">
                {formatKg(totals.netWeight)} <span className="text-base font-semibold">kg</span>
              </p>
              <p className="text-xs text-scale-muted-fg mt-1">
                {lines.length} lượt cân · {totals.trayCount} khay
              </p>
            </div>
            <div className="rounded-2xl bg-scale-card border-2 border-scale-primary p-4">
              <p className="text-xs font-semibold text-scale-muted-fg uppercase tracking-wide">Tổng tiền</p>
              <p className="font-mono font-bold text-2xl sm:text-3xl text-scale-primary mt-1 break-all">
                {formatMoney(totals.amount)} <span className="text-base font-semibold">đ</span>
              </p>
            </div>
          </section>

          {/* Các lượt cân */}
          <section aria-labelledby="lines-title" className="bg-scale-card rounded-2xl border border-scale-border">
            <h2 id="lines-title" className="text-base font-bold text-scale-fg px-5 pt-4 pb-3">
              Các lượt cân
            </h2>
            {lines.length === 0 ? (
              <p className="text-sm text-scale-muted-fg px-5 pb-5">
                Chưa có lượt cân nào. Đặt hàng lên cân, chọn loại hàng rồi bấm <strong>Lưu lượt cân</strong> (F2) — phiếu sẽ tự được tạo.
              </p>
            ) : (
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm whitespace-nowrap">
                  <thead className="bg-scale-muted text-scale-muted-fg text-xs">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-center font-semibold">STT</th>
                      <th scope="col" className="px-3 py-2 text-left font-semibold">Loại hàng</th>
                      <th scope="col" className="px-3 py-2 text-right font-semibold">TL cân</th>
                      <th scope="col" className="px-3 py-2 text-right font-semibold">Số khay</th>
                      <th scope="col" className="px-3 py-2 text-right font-semibold">Trừ bì</th>
                      <th scope="col" className="px-3 py-2 text-right font-semibold">TL hàng</th>
                      <th scope="col" className="px-3 py-2 text-right font-semibold">Đơn giá</th>
                      <th scope="col" className="px-3 py-2 text-right font-semibold">Thành tiền</th>
                      <th scope="col" className="px-1 py-2"><span className="sr-only">Xoá</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-scale-border text-scale-fg">
                    {lines.map((l, i) => (
                      <tr key={l.id}>
                        <td className="px-3 py-1.5 text-center text-scale-muted-fg">{i + 1}</td>
                        <td className="px-3 py-1.5 font-medium">{l.productName}</td>
                        <td className="px-3 py-1.5 text-right font-mono">{formatKg(l.grossWeight)}</td>
                        <td className="px-3 py-1.5 text-right font-mono">{l.trayCount}</td>
                        <td className="px-3 py-1.5 text-right font-mono">{formatKg(l.tareWeight)}</td>
                        <td className="px-3 py-1.5 text-right font-mono font-semibold">{formatKg(l.netWeight)}</td>
                        <td className="px-3 py-1.5 text-right font-mono">{formatMoney(l.unitPrice)}</td>
                        <td className="px-3 py-1.5 text-right font-mono font-semibold">{formatMoney(l.amount)}</td>
                        <td className="px-1 py-0.5 text-right">
                          {!locked && (
                            <button
                              type="button"
                              onClick={() => deleteLine(l, i)}
                              disabled={busy !== null}
                              aria-label={`Xoá lượt cân số ${i + 1}`}
                              className="inline-flex items-center justify-center min-w-touch min-h-touch rounded-lg text-scale-muted-fg hover:text-scale-danger hover:bg-scale-danger-soft disabled:opacity-40 transition-colors"
                            >
                              {busy === `del-${l.id}` ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Trash2 className="w-4 h-4" aria-hidden="true" />}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ============ Danh sách phiếu ============ */}
      <section aria-labelledby="list-title" className="bg-scale-card rounded-2xl border border-scale-border">
        <div className="p-5 pb-3 space-y-3">
          <h2 id="list-title" className="text-base font-bold text-scale-fg">
            Danh sách phiếu
          </h2>
          <div className="grid gap-3 sm:grid-cols-[repeat(2,minmax(0,10rem))_minmax(0,1fr)]">
            <div>
              <label htmlFor="l-from" className={LABEL}>Từ ngày</label>
              <input id="l-from" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className={INPUT} />
            </div>
            <div>
              <label htmlFor="l-to" className={LABEL}>Đến ngày</label>
              <input id="l-to" type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className={INPUT} />
            </div>
            <div>
              <label htmlFor="l-search" className={LABEL}>Tìm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-scale-muted-fg pointer-events-none" aria-hidden="true" />
                <input
                  id="l-search"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Số phiếu, tên khách, điện thoại, số xe"
                  className={`${INPUT} pl-9`}
                />
              </div>
            </div>
          </div>
        </div>

        {listLoading && list.length === 0 ? (
          <div className="flex items-center justify-center py-10 gap-2 text-scale-muted-fg text-sm">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Đang tải…
          </div>
        ) : list.length === 0 ? (
          <p className="text-sm text-scale-muted-fg px-5 pb-5">Không có phiếu nào trong khoảng ngày này.</p>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-scale-muted text-scale-muted-fg text-xs">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left font-semibold">Số phiếu</th>
                  <th scope="col" className="px-3 py-2 text-left font-semibold">Thời gian</th>
                  <th scope="col" className="px-3 py-2 text-left font-semibold">Khách hàng</th>
                  <th scope="col" className="px-3 py-2 text-left font-semibold">Loại</th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">Tổng TL (kg)</th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">Tổng tiền (đ)</th>
                  <th scope="col" className="px-3 py-2 text-left font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-scale-border text-scale-fg">
                {list.map((t) => (
                  <tr key={t.id} className={t.id === ticket?.id ? 'bg-scale-accent' : 'hover:bg-scale-muted'}>
                    <td className="px-1 py-0.5">
                      {/* Cả hàng bấm được, nhưng nút thật nằm ở ô đầu để bàn phím và trình đọc màn hình dùng được. */}
                      <button
                        type="button"
                        onClick={() => openTicket(t.id)}
                        aria-current={t.id === ticket?.id ? 'true' : undefined}
                        className="inline-flex items-center min-h-touch px-2 rounded-lg font-mono font-semibold text-scale-primary hover:underline"
                      >
                        #{t.ticketNo}
                      </button>
                    </td>
                    <td className="px-3 py-1.5 text-scale-muted-fg">{formatVnDateTime(t.createdAt)}</td>
                    <td className="px-3 py-1.5 max-w-[14rem] truncate">{t.customerName || <span className="text-scale-muted-fg">Khách lẻ</span>}</td>
                    <td className="px-3 py-1.5">{TICKET_TYPE_LABEL[t.type]}</td>
                    <td className="px-3 py-1.5 text-right font-mono">{formatKg(t.totalWeight)}</td>
                    <td className="px-3 py-1.5 text-right font-mono font-semibold">{formatMoney(t.totalAmount)}</td>
                    <td className="px-3 py-1.5">
                      <span className={`text-xs font-semibold ${t.status === 'DONE' ? 'text-scale-success' : 'text-scale-warning'}`}>
                        {t.status === 'DONE' ? 'Đã xong' : 'Đang cân'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
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
  ClipboardList,
  FileText,
  UserCheck,
} from 'lucide-react';
import { useScaleContext } from '@/components/scale/scale-context';
import { useConfirm } from '@/components/scale/confirm';
import { ConnectionBar, WeightDisplay } from '@/components/scale/WeightDisplay';
import { Badge, Card, EmptyState, Field, Kbd, Notice, buttonClass, cx, inputClass } from '@/components/scale/ui';
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

type Msg = { tone: 'success' | 'danger' | 'info'; text: string } | null;

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

/**
 * Màn hình lập phiếu cân — theo đúng thứ tự làm việc của người đứng cân:
 *
 *   1. Đặt hàng lên cân, nhìn số (ô số cân to nhất màn hình).
 *   2. Chọn loại hàng, số khay → bấm F2 lưu lượt. Lặp lại cho từng lượt.
 *   3. Điền khách, số xe bất cứ lúc nào; cân xong bấm "Xong phiếu" rồi "In phiếu".
 *
 * Không phải bấm "Tạo phiếu" trước: lượt cân đầu tiên tự tạo phiếu — người
 * đứng cân thường quên bước đó, bấm F2 rồi mới thấy báo lỗi, phải làm lại.
 *
 * Bố cục: bên trái là việc làm liên tục (cân, lưu lượt, xem các lượt); bên
 * phải là việc làm một lần cho cả phiếu (tổng, xong/in, thông tin khách).
 */
export default function TicketWorkbench({
  initialTicketId,
  initialCustomerId,
}: {
  initialTicketId?: number;
  initialCustomerId?: number;
}) {
  const { reading, isConnected } = useScaleContext();
  const confirm = useConfirm();

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [catalogError, setCatalogError] = useState(false);

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
  const [lineErrors, setLineErrors] = useState<{ product?: string; weight?: string; tray?: string }>({});

  const [busy, setBusy] = useState<string | null>(null);
  /* Đang tải phiếu mở từ Bản ghi cân hay đường dẫn ?id=. Không có cờ này thì
     một hai giây đầu màn hình ghi "Phiếu mới" với các ô trống — người cân
     tưởng phải lập phiếu mới và bắt đầu gõ vào. */
  const [opening, setOpening] = useState(Boolean(initialTicketId));
  // Hai chỗ báo kết quả: cạnh nút lưu lượt cân, và cạnh các nút của phiếu.
  // Báo ngay tại chỗ vừa bấm, không bắt người dùng nhìn sang chỗ khác.
  const [lineMsg, setLineMsg] = useState<Msg>(null);
  const [ticketMsg, setTicketMsg] = useState<Msg>(null);

  const [from, setFrom] = useState(() => vnToday(-6));
  const [to, setTo] = useState(() => vnToday());
  const [search, setSearch] = useState('');
  const [list, setList] = useState<TicketSummary[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(false);

  const productRef = useRef<HTMLSelectElement>(null);
  const manualProductRef = useRef<HTMLInputElement>(null);
  const weightRef = useRef<HTMLInputElement>(null);
  const trayWeightRef = useRef<HTMLInputElement>(null);

  useEffect(() => setTrayWeight(loadTrayWeight()), []);

  /* ---------------- tải dữ liệu ---------------- */

  const loadCustomers = useCallback(async () => {
    const r = await fetch('/api/scale/customers');
    if (!r.ok) throw new Error();
    setCustomers((await r.json()).customers ?? []);
  }, []);

  const loadCatalogs = useCallback(() => {
    setCatalogError(false);
    fetch('/api/scale/products')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setProducts(d.products ?? []))
      .catch(() => setCatalogError(true));
    loadCustomers().catch(() => setCatalogError(true));
  }, [loadCustomers]);

  useEffect(() => loadCatalogs(), [loadCatalogs]);

  const loadList = useCallback(async () => {
    setListLoading(true);
    try {
      const qs = new URLSearchParams({ from, to, ...(search.trim() ? { search: search.trim() } : {}) });
      const r = await fetch(`/api/scale/tickets?${qs}`);
      if (!r.ok) throw new Error();
      setList((await r.json()).tickets ?? []);
      setListError(false);
    } catch {
      setListError(true);
    } finally {
      setListLoading(false);
    }
  }, [from, to, search]);

  // Gõ tìm kiếm thì chờ người dùng dừng tay một chút rồi mới gọi máy chủ.
  useEffect(() => {
    const t = setTimeout(() => loadList(), 300);
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
      setTicketMsg(null);
      setLineMsg(null);
      setOpening(true);
      try {
        const r = await fetch(`/api/scale/tickets/${id}`);
        if (r.ok) applyTicket(await r.json());
        else setTicketMsg({ tone: 'danger', text: 'Không mở được phiếu. Có thể phiếu đã bị xoá.' });
      } catch {
        setTicketMsg({ tone: 'danger', text: 'Không kết nối được tới máy chủ. Kiểm tra mạng rồi thử lại.' });
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
        h.customerId
          ? h
          : { ...h, customerId: c.id, customerName: c.name, customerPhone: c.phone ?? '', customerAddress: c.address ?? '' }
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
  const ensureTicket = useCallback(
    async (report: (m: Msg) => void): Promise<Ticket | null> => {
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
        report({ tone: 'danger', text: data.error ?? 'Không lưu được phiếu. Thử lại sau ít phút.' });
        return null;
      }
      applyTicket(data);
      if (!ticket && isNewCustomer && saveCustomer) loadCustomers().catch(() => {});
      return data as Ticket;
    },
    [ticket, headerDirty, header, isNewCustomer, saveCustomer, applyTicket, loadCustomers]
  );

  const saveHeader = async () => {
    setBusy('header');
    setTicketMsg(null);
    try {
      const t = await ensureTicket(setTicketMsg);
      if (t) {
        setTicketMsg({ tone: 'success', text: `Đã lưu thông tin phiếu số ${t.ticketNo}.` });
        loadList();
      }
    } catch {
      setTicketMsg({ tone: 'danger', text: 'Không kết nối được tới máy chủ. Kiểm tra mạng rồi thử lại.' });
    } finally {
      setBusy(null);
    }
  };

  /* ---------------- lượt cân ---------------- */

  const product = products.find((p) => String(p.id) === productId);
  const productName = product?.name ?? manualProduct.trim();

  const onProduct = (value: string) => {
    setProductId(value);
    setLineErrors((e) => ({ ...e, product: undefined }));
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
    setLineErrors((e) => ({ ...e, tray: undefined }));
    setLineMsg({
      tone: 'success',
      text: `Bì một khay = ${formatKg(per)} kg${trays > 1 ? ` (${formatKg(reading.valueKg)} kg ÷ ${trays} khay)` : ''}.`,
    });
  };

  const saveLine = useCallback(async () => {
    if (busy) return;
    setLineMsg(null);
    if (locked) {
      setLineMsg({ tone: 'info', text: 'Phiếu đã xong nên không cân thêm được. Bấm "Mở lại phiếu" nếu cần.' });
      return;
    }

    // Kiểm tra trước khi gửi, báo ĐÚNG Ô sai và đưa con trỏ tới đó.
    const errs: typeof lineErrors = {};
    if (!productName) errs.product = 'Chọn loại hàng trong danh sách, hoặc gõ tên hàng.';
    if (gross === null || !Number.isFinite(gross) || gross <= 0) {
      errs.weight = isConnected
        ? 'Cân đang ở 0 kg — đặt hàng lên cân rồi lưu.'
        : 'Nhập khối lượng đọc trên màn hình cân, ví dụ 12.5';
    }
    if (!Number.isFinite(perTray) || perTray < 0) errs.tray = 'Bì một khay phải là số không âm, ví dụ 0,8';
    else if (preview && preview.netWeight <= 0)
      errs.tray = `Trừ bì ${formatKg(preview.tareWeight)} kg lớn hơn khối lượng cân — kiểm tra lại số khay hoặc bì.`;
    setLineErrors(errs);
    if (errs.product) {
      (productId === '' ? manualProductRef.current ?? productRef.current : productRef.current)?.focus();
      return;
    }
    if (errs.weight) {
      weightRef.current?.focus();
      return;
    }
    if (errs.tray) {
      trayWeightRef.current?.focus();
      return;
    }

    if (
      isConnected &&
      reading &&
      !reading.stable &&
      !(await confirm({
        title: 'Cân chưa đứng số',
        message: 'Số trên cân vẫn đang nhảy, khối lượng lưu lại có thể chưa chính xác. Đợi cân ổn định sẽ chắc hơn.',
        confirmLabel: 'Vẫn lưu',
        cancelLabel: 'Đợi cân ổn định',
      }))
    ) {
      return;
    }

    setBusy('line');
    try {
      const t = await ensureTicket(setLineMsg);
      if (!t) return;
      const res = await fetch(`/api/scale/tickets/${t.id}/lines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productCode: product?.code ?? '',
          productName,
          grossWeight: roundKg(gross!),
          trayCount: trays,
          trayWeight: perTray,
          unitPrice: price,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLineMsg({ tone: 'danger', text: data.error ?? 'Không lưu được lượt cân. Thử lại sau ít phút.' });
        return;
      }
      /* Cộng vào danh sách MỚI NHẤT chứ không vào bản `t` trong tay: `t` có
         thể là bản cũ chụp từ trước, cộng vào đó sẽ làm mất lượt vừa lưu ngay
         trước — máy chủ có đủ mà màn hình lại thiếu. */
      setTicket((prev) =>
        prev && prev.id === t.id ? { ...prev, lines: [...prev.lines, data as Line] } : { ...t, lines: [...t.lines, data as Line] }
      );
      setLineMsg({
        tone: 'success',
        text: `Đã lưu lượt ${(ticket?.id === t.id ? ticket.lines.length : t.lines.length) + 1}: ${productName} ${formatKg((data as Line).netWeight)} kg.`,
      });
      if (!isConnected) setManualWeight('');
      if (trayWeight) storeTrayWeight(trayWeight);
      loadList();
    } catch {
      setLineMsg({ tone: 'danger', text: 'Không kết nối được tới máy chủ. Lượt cân CHƯA được lưu — kiểm tra mạng rồi bấm lại.' });
    } finally {
      setBusy(null);
    }
  }, [busy, locked, productName, productId, gross, isConnected, perTray, preview, reading, confirm, ensureTicket, product, trays, price, trayWeight, loadList, ticket]);

  // F2 = lưu lượt cân, giống ứng dụng trên máy tính — tay khỏi rời bàn phím.
  const saveLineRef = useRef(saveLine);
  saveLineRef.current = saveLine;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Hộp xác nhận đang mở thì không lưu chồng thêm lượt nữa.
      if (e.key === 'F2' && !document.querySelector('dialog[open]')) {
        e.preventDefault();
        saveLineRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const deleteLine = async (line: Line, index: number) => {
    if (!ticket) return;
    const ok = await confirm({
      title: `Xoá lượt cân số ${index + 1}?`,
      message: `${line.productName} — ${formatKg(line.netWeight)} kg, ${formatMoney(line.amount)} đ. Tổng phiếu sẽ tính lại.`,
      confirmLabel: 'Xoá lượt cân',
      tone: 'danger',
    });
    if (!ok) return;
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
        setLineMsg({ tone: 'success', text: `Đã xoá lượt cân số ${index + 1}.` });
        loadList();
      } else setLineMsg({ tone: 'danger', text: data.error ?? 'Không xoá được lượt cân.' });
    } catch {
      setLineMsg({ tone: 'danger', text: 'Không kết nối được tới máy chủ. Lượt cân chưa bị xoá.' });
    } finally {
      setBusy(null);
    }
  };

  /* ---------------- thao tác với phiếu ---------------- */

  const setStatus = async (next: 'DONE' | 'OPEN') => {
    if (
      next === 'OPEN' &&
      !(await confirm({
        title: `Mở lại phiếu số ${ticket?.ticketNo}?`,
        message: 'Phiếu mở lại thì sửa và cân thêm được. Nếu đã in phiếu cho khách, nhớ in lại bản mới sau khi sửa.',
        confirmLabel: 'Mở lại phiếu',
      }))
    )
      return;
    setBusy('status');
    setTicketMsg(null);
    try {
      const t = next === 'DONE' ? await ensureTicket(setTicketMsg) : ticket;
      if (!t) return;
      const res = await fetch(`/api/scale/tickets/${t.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setTicketMsg({ tone: 'danger', text: data.error ?? 'Không cập nhật được phiếu.' });
        return;
      }
      applyTicket(data);
      setTicketMsg({
        tone: 'success',
        text: next === 'DONE' ? `Phiếu số ${t.ticketNo} đã xong và được khoá. Bấm "In phiếu" để in.` : 'Đã mở lại phiếu — sửa và cân thêm được.',
      });
      loadList();
    } catch {
      setTicketMsg({ tone: 'danger', text: 'Không kết nối được tới máy chủ. Kiểm tra mạng rồi thử lại.' });
    } finally {
      setBusy(null);
    }
  };

  /* Mở trang in ở THẺ MỚI: thẻ này giữ nguyên kết nối cân, in xong đóng thẻ
     kia là quay lại cân tiếp, không phải kết nối lại. */
  const printTicket = async () => {
    setBusy('print');
    setTicketMsg(null);
    try {
      const t = await ensureTicket(setTicketMsg);
      if (t) window.open(`/can-dien-tu/phieu/${t.id}/in?auto=1`, '_blank');
    } catch {
      setTicketMsg({ tone: 'danger', text: 'Không kết nối được tới máy chủ. Kiểm tra mạng rồi thử lại.' });
    } finally {
      setBusy(null);
    }
  };

  const newTicket = async () => {
    if (
      headerDirty &&
      !(await confirm({
        title: 'Bỏ thông tin đang nhập?',
        message: 'Thông tin khách, số xe vừa sửa chưa được lưu. Lập phiếu mới sẽ bỏ những thay đổi đó.',
        confirmLabel: 'Bỏ và lập phiếu mới',
        cancelLabel: 'Ở lại',
        tone: 'danger',
      }))
    )
      return;
    applyTicket(null);
    setLineMsg(null);
    setLineErrors({});
    setTicketMsg({ tone: 'info', text: 'Đã chuyển sang phiếu mới. Lượt cân đầu tiên sẽ tự tạo số phiếu.' });
  };

  const deleteTicket = async () => {
    if (!ticket) return;
    const ok = await confirm({
      title: `Xoá phiếu số ${ticket.ticketNo}?`,
      message: `Phiếu cùng ${ticket.lines.length} lượt cân sẽ bị xoá hẳn và không khôi phục được.`,
      confirmLabel: 'Xoá phiếu',
      tone: 'danger',
    });
    if (!ok) return;
    setBusy('delete');
    try {
      const res = await fetch(`/api/scale/tickets/${ticket.id}`, { method: 'DELETE' });
      if (res.ok) {
        applyTicket(null);
        setTicketMsg({ tone: 'success', text: `Đã xoá phiếu số ${ticket.ticketNo}.` });
        loadList();
      } else setTicketMsg({ tone: 'danger', text: 'Không xoá được phiếu.' });
    } catch {
      setTicketMsg({ tone: 'danger', text: 'Không kết nối được tới máy chủ. Phiếu chưa bị xoá.' });
    } finally {
      setBusy(null);
    }
  };

  const lines = useMemo(() => ticket?.lines ?? [], [ticket]);
  const totals = ticketTotals(lines);
  const isBusy = busy !== null;
  const spinner = <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />;

  /* ---------------- giao diện ---------------- */

  return (
    <div className="space-y-5">
      <ConnectionBar />

      {catalogError && (
        <Notice
          tone="warning"
          title="Chưa tải được danh mục mặt hàng hoặc khách hàng"
          action={
            <button type="button" onClick={loadCatalogs} className={buttonClass({ variant: 'ghost' })}>
              Thử lại
            </button>
          }
        >
          Vẫn cân được bằng cách gõ tay tên hàng.
        </Notice>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] items-start">
        {/* ==================== Cột trái: cân liên tục ==================== */}
        <div className="space-y-5 min-w-0">
          <Card title="Cân hàng" titleId="weigh-title">
            <WeightDisplay
              ref={weightRef}
              size="xl"
              manualValue={manualWeight}
              onManualChange={(v) => {
                setManualWeight(v);
                setLineErrors((e) => ({ ...e, weight: undefined }));
              }}
              manualInvalid={Boolean(lineErrors.weight)}
              manualDescribedBy={lineErrors.weight ? 'w-weight-error' : undefined}
            />
            {lineErrors.weight && (
              <p id="w-weight-error" className="mt-2 text-sm font-medium text-scale-danger">
                {lineErrors.weight}
              </p>
            )}

            <fieldset disabled={locked || opening} className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <legend className="sr-only">Thông tin lượt cân</legend>

              <Field id="w-product" label="Loại hàng" error={productId !== '' ? lineErrors.product : undefined} className="sm:col-span-2">
                {(p) => (
                  <select ref={productRef} {...p} value={productId} onChange={(e) => onProduct(e.target.value)} className={inputClass(Boolean(p['aria-invalid']))}>
                    <option value="">— Gõ tay tên hàng —</option>
                    {products.map((pr) => (
                      <option key={pr.id} value={pr.id}>
                        {pr.code} · {pr.name}
                        {pr.unitPrice != null ? ` — ${formatMoney(pr.unitPrice)} đ/kg` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </Field>

              {productId === '' && (
                <Field
                  id="w-product-name"
                  label="Tên hàng"
                  error={lineErrors.product}
                  hint={products.length ? undefined : 'Khai báo mặt hàng ở mục Sản phẩm để lần sau chọn nhanh.'}
                  className="sm:col-span-2"
                >
                  {(p) => (
                    <input
                      ref={manualProductRef}
                      {...p}
                      value={manualProduct}
                      onChange={(e) => {
                        setManualProduct(e.target.value);
                        setLineErrors((x) => ({ ...x, product: undefined }));
                      }}
                      placeholder="Ví dụ: Cá lóc"
                      className={inputClass(Boolean(p['aria-invalid']))}
                    />
                  )}
                </Field>
              )}

              <Field id="w-price" label="Đơn giá (đ/kg)" hint={price > 0 ? `${formatMoney(price)} đ/kg` : 'Để 0 nếu chưa tính tiền.'}>
                {(p) => (
                  <input {...p} inputMode="numeric" autoComplete="off" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} placeholder="0" className={cx(inputClass(), 'text-right tabular-nums')} />
                )}
              </Field>

              <Field id="w-trays" label="Số khay">
                {(p) => (
                  <input
                    {...p}
                    inputMode="numeric"
                    autoComplete="off"
                    value={trayCount}
                    onChange={(e) => setTrayCount(e.target.value.replace(/[^\d]/g, ''))}
                    className={cx(inputClass(), 'text-right tabular-nums')}
                  />
                )}
              </Field>

              <Field
                id="w-tray-weight"
                label="Bì một khay (kg)"
                error={lineErrors.tray}
                hint={isConnected ? 'Đặt khay rỗng lên cân rồi bấm "Cân bì" để lấy tự động.' : 'Khối lượng một khay rỗng, máy sẽ nhớ cho lần sau.'}
                className="sm:col-span-2"
              >
                {(p) => (
                  <div className="flex gap-2">
                    <input
                      ref={trayWeightRef}
                      {...p}
                      inputMode="decimal"
                      autoComplete="off"
                      value={trayWeight}
                      onChange={(e) => {
                        setTrayWeight(e.target.value);
                        setLineErrors((x) => ({ ...x, tray: undefined }));
                      }}
                      placeholder="0,8"
                      className={cx(inputClass(Boolean(p['aria-invalid'])), 'text-right tabular-nums')}
                    />
                    {isConnected && (
                      <button type="button" onClick={weighTare} disabled={!reading} className={cx(buttonClass(), 'flex-shrink-0')}>
                        <ScaleIcon className="w-4 h-4" aria-hidden="true" /> Cân bì
                      </button>
                    )}
                  </div>
                )}
              </Field>
            </fieldset>

            {/* Xem trước kết quả trước khi lưu: người cân thấy ngay trừ bì đúng chưa. */}
            <dl className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-xl border border-scale-border bg-scale-border">
              {[
                ['TL cân', preview && gross !== null ? `${formatKg(roundKg(gross))} kg` : '—', false],
                ['Trừ bì', preview ? `${formatKg(preview.tareWeight)} kg` : '—', false],
                ['TL hàng', preview ? `${formatKg(preview.netWeight)} kg` : '—', true],
                ['Thành tiền', preview ? `${formatMoney(preview.amount)} đ` : '—', true],
              ].map(([k, v, strong]) => (
                <div key={String(k)} className="bg-scale-card px-3 py-3 text-center">
                  <dt className="text-xs font-medium text-scale-muted-fg">{k}</dt>
                  <dd className={cx('mt-1 tabular-nums break-all', strong ? 'text-lg font-bold text-scale-fg' : 'font-semibold text-scale-fg')}>{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                type="button"
                onClick={saveLine}
                disabled={isBusy || locked || opening}
                aria-keyshortcuts="F2"
                className={cx(buttonClass({ variant: 'primary', size: 'lg' }), 'sm:min-w-[15rem]')}
              >
                {busy === 'line' ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <Save className="w-5 h-5" aria-hidden="true" />}
                {busy === 'line' ? 'Đang lưu…' : 'Lưu lượt cân'}
                <Kbd>F2</Kbd>
              </button>
              <div aria-live="polite" className="min-w-0 flex-1">
                {lineMsg && <Notice tone={lineMsg.tone}>{lineMsg.text}</Notice>}
              </div>
            </div>
          </Card>

          {/* ---------------- Các lượt cân ---------------- */}
          <Card title={`Các lượt cân${lines.length ? ` (${lines.length})` : ''}`} titleId="lines-title" padded={false}>
            {lines.length === 0 ? (
              <EmptyState icon={<ClipboardList className="w-9 h-9" aria-hidden="true" />} title="Chưa có lượt cân nào">
                Đặt hàng lên cân, chọn loại hàng rồi bấm <strong>Lưu lượt cân</strong> (phím F2). Lượt đầu tiên sẽ tự tạo phiếu.
              </EmptyState>
            ) : (
              <>
                {/* Máy tính: bảng đủ cột như phiếu giấy. */}
                <div className="hidden md:block relative overflow-x-auto">
                  <table className="w-full text-sm whitespace-nowrap">
                    <caption className="sr-only">Các lượt cân của phiếu</caption>
                    <thead className="bg-scale-muted text-scale-muted-fg text-xs">
                      <tr>
                        <th scope="col" className="px-3 py-2.5 text-center font-semibold">STT</th>
                        <th scope="col" className="px-3 py-2.5 text-left font-semibold">Loại hàng</th>
                        <th scope="col" className="px-3 py-2.5 text-right font-semibold">TL cân</th>
                        <th scope="col" className="px-3 py-2.5 text-right font-semibold">Khay</th>
                        <th scope="col" className="px-3 py-2.5 text-right font-semibold">Trừ bì</th>
                        <th scope="col" className="px-3 py-2.5 text-right font-semibold">TL hàng</th>
                        <th scope="col" className="px-3 py-2.5 text-right font-semibold">Đơn giá</th>
                        <th scope="col" className="px-3 py-2.5 text-right font-semibold">Thành tiền</th>
                        <th scope="col" className="px-2 py-2.5"><span className="sr-only">Thao tác</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-scale-border text-scale-fg">
                      {lines.map((l, i) => (
                        <tr key={l.id}>
                          <td className="px-3 py-1.5 text-center text-scale-muted-fg">{i + 1}</td>
                          <td className="px-3 py-1.5 font-medium max-w-[14rem] truncate" title={l.productName}>{l.productName}</td>
                          <td className="px-3 py-1.5 text-right tabular-nums">{formatKg(l.grossWeight)}</td>
                          <td className="px-3 py-1.5 text-right tabular-nums">{l.trayCount}</td>
                          <td className="px-3 py-1.5 text-right tabular-nums">{formatKg(l.tareWeight)}</td>
                          <td className="px-3 py-1.5 text-right tabular-nums font-semibold">{formatKg(l.netWeight)}</td>
                          <td className="px-3 py-1.5 text-right tabular-nums">{formatMoney(l.unitPrice)}</td>
                          <td className="px-3 py-1.5 text-right tabular-nums font-semibold">{formatMoney(l.amount)}</td>
                          <td className="px-1 py-0.5 text-right">
                            {!locked && (
                              <button
                                type="button"
                                onClick={() => deleteLine(l, i)}
                                disabled={isBusy}
                                aria-label={`Xoá lượt cân số ${i + 1}, ${l.productName}`}
                                className={buttonClass({ variant: 'danger-ghost', iconOnly: true })}
                              >
                                {busy === `del-${l.id}` ? spinner : <Trash2 className="w-4 h-4" aria-hidden="true" />}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Điện thoại: mỗi lượt một thẻ — bảng 9 cột trên màn hình hẹp phải cuộn ngang mới đọc được. */}
                <ol className="md:hidden divide-y divide-scale-border">
                  {lines.map((l, i) => (
                    <li key={l.id} className="flex items-start gap-3 px-5 py-3">
                      <span className="mt-0.5 w-7 h-7 flex-shrink-0 rounded-full bg-scale-muted text-scale-muted-fg text-xs font-bold flex items-center justify-center" aria-hidden="true">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-scale-fg truncate">{l.productName}</p>
                        <p className="text-xs text-scale-muted-fg mt-0.5">
                          Cân {formatKg(l.grossWeight)} kg · {l.trayCount} khay · trừ bì {formatKg(l.tareWeight)} kg
                        </p>
                        <p className="text-sm text-scale-fg mt-1 tabular-nums">
                          <strong>{formatKg(l.netWeight)} kg</strong> × {formatMoney(l.unitPrice)} = <strong>{formatMoney(l.amount)} đ</strong>
                        </p>
                      </div>
                      {!locked && (
                        <button
                          type="button"
                          onClick={() => deleteLine(l, i)}
                          disabled={isBusy}
                          aria-label={`Xoá lượt cân số ${i + 1}, ${l.productName}`}
                          className={buttonClass({ variant: 'danger-ghost', iconOnly: true })}
                        >
                          {busy === `del-${l.id}` ? spinner : <Trash2 className="w-4 h-4" aria-hidden="true" />}
                        </button>
                      )}
                    </li>
                  ))}
                </ol>
              </>
            )}
          </Card>
        </div>

        {/* ==================== Cột phải: cả phiếu ==================== */}
        <div className="space-y-5 lg:sticky lg:top-20">
          <Card
            titleId="ticket-title"
            title={opening ? 'Đang mở phiếu…' : ticket ? `Phiếu số ${ticket.ticketNo}` : 'Phiếu mới'}
            description={ticket ? `Lập lúc ${formatVnDateTime(ticket.createdAt)}` : 'Chưa có số — tự tạo khi lưu lượt cân đầu tiên.'}
            actions={
              ticket ? (
                locked ? (
                  <Badge tone="success" icon={<Lock className="w-3 h-3" aria-hidden="true" />}>Đã xong</Badge>
                ) : (
                  <Badge tone="warning">Đang cân</Badge>
                )
              ) : (
                <Badge tone="neutral">Chưa lưu</Badge>
              )
            }
          >
            {/* Xuất/Nhập: hai nút radio THẬT (ẩn chấm tròn) — Tab vào, mũi tên để đổi,
                trình đọc màn hình đọc đúng "1 trong 2". */}
            <fieldset disabled={locked || opening}>
              <legend className="text-sm font-medium text-scale-fg mb-1.5">Loại phiếu</legend>
              <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-scale-muted border border-scale-border">
                {(['XUAT', 'NHAP'] as const).map((t) => (
                  <label key={t} className="relative">
                    <input
                      type="radio"
                      name="ticket-type"
                      value={t}
                      checked={header.type === t}
                      onChange={() => setHeader((h) => ({ ...h, type: t }))}
                      className="peer sr-only"
                    />
                    <span
                      className={cx(
                        'flex items-center justify-center min-h-touch rounded-lg text-sm font-semibold cursor-pointer transition-colors',
                        'text-scale-muted-fg hover:text-scale-fg',
                        'peer-checked:bg-scale-primary peer-checked:text-scale-primary-fg peer-checked:shadow-sm',
                        'peer-focus-visible:ring-2 peer-focus-visible:ring-scale-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-scale-muted',
                        'peer-disabled:cursor-not-allowed'
                      )}
                    >
                      {TICKET_TYPE_LABEL[t]}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Tổng phiếu — con số khách hỏi nhiều nhất. */}
            <dl className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-scale-muted p-3">
                <dt className="text-xs font-semibold text-scale-muted-fg uppercase tracking-wide">Tổng TL hàng</dt>
                <dd className="mt-1 tabular-nums font-bold text-xl text-scale-fg break-all">
                  {formatKg(totals.netWeight)} <span className="text-sm">kg</span>
                </dd>
                <dd className="text-xs text-scale-muted-fg mt-0.5">
                  {lines.length} lượt · {totals.trayCount} khay
                </dd>
              </div>
              <div className="rounded-xl bg-scale-accent p-3 border border-scale-primary">
                <dt className="text-xs font-semibold text-scale-accent-fg uppercase tracking-wide">Tổng tiền</dt>
                <dd className="mt-1 tabular-nums font-bold text-xl text-scale-fg break-all">
                  {formatMoney(totals.amount)} <span className="text-sm">đ</span>
                </dd>
              </div>
            </dl>

            {/* Nút CHÍNH đổi theo trạng thái: đang cân thì "Xong phiếu", đã xong thì "In phiếu". */}
            <div className="mt-5 grid grid-cols-2 gap-2">
              {locked ? (
                <>
                  <button type="button" onClick={printTicket} disabled={isBusy} className={cx(buttonClass({ variant: 'primary', size: 'lg' }), 'col-span-2')}>
                    {busy === 'print' ? spinner : <Printer className="w-5 h-5" aria-hidden="true" />} In phiếu
                  </button>
                  <button type="button" onClick={() => setStatus('OPEN')} disabled={isBusy} className={cx(buttonClass(), 'col-span-2')}>
                    {busy === 'status' ? spinner : <RotateCcw className="w-4 h-4" aria-hidden="true" />} Mở lại phiếu
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setStatus('DONE')}
                    disabled={isBusy || lines.length === 0 || opening}
                    aria-describedby={lines.length === 0 ? 'ticket-actions-hint' : undefined}
                    className={cx(buttonClass({ variant: 'primary', size: 'lg' }), 'col-span-2')}
                  >
                    {busy === 'status' ? spinner : <CheckCircle2 className="w-5 h-5" aria-hidden="true" />} Xong phiếu
                  </button>
                  <button
                    type="button"
                    onClick={printTicket}
                    disabled={isBusy || lines.length === 0 || opening}
                    aria-describedby={lines.length === 0 ? 'ticket-actions-hint' : undefined}
                    className={cx(buttonClass(), 'col-span-2')}
                  >
                    {busy === 'print' ? spinner : <Printer className="w-4 h-4" aria-hidden="true" />} In thử (chưa xong)
                  </button>
                </>
              )}
              <button type="button" onClick={newTicket} disabled={isBusy || (!ticket && !headerDirty)} className={buttonClass({ variant: 'ghost' })}>
                <FilePlus2 className="w-4 h-4" aria-hidden="true" /> Phiếu mới
              </button>
              <button type="button" onClick={deleteTicket} disabled={isBusy || !ticket} className={buttonClass({ variant: 'danger-ghost' })}>
                {busy === 'delete' ? spinner : <Trash2 className="w-4 h-4" aria-hidden="true" />} Xoá phiếu
              </button>
            </div>
            {lines.length === 0 && !locked && (
              <p id="ticket-actions-hint" className="mt-2 text-xs text-scale-muted-fg">
                Lưu ít nhất một lượt cân để xong phiếu và in.
              </p>
            )}
            <div aria-live="polite" className="mt-3 empty:hidden">
              {ticketMsg && <Notice tone={ticketMsg.tone}>{ticketMsg.text}</Notice>}
            </div>
          </Card>

          {/* ---------------- Khách hàng & giao nhận ---------------- */}
          <Card title="Khách hàng & giao nhận" titleId="customer-title" description="Không bắt buộc — để trống nếu là khách lẻ.">
            {locked && (
              <Notice tone="info" className="mb-4">
                Phiếu đã xong nên thông tin bị khoá. Bấm <strong>Mở lại phiếu</strong> để sửa.
              </Notice>
            )}
            <fieldset disabled={locked || opening} className="space-y-4">
              <legend className="sr-only">Thông tin khách hàng và giao nhận</legend>
              <Field
                id="t-customer"
                label="Khách hàng"
               
                hint={matchedCustomer ? undefined : customers.length ? 'Gõ vài chữ để chọn từ danh bạ.' : undefined}
              >
                {(p) => (
                  <>
                    <input
                      {...p}
                      list="t-customer-list"
                      autoComplete="off"
                      value={header.customerName}
                      onChange={(e) => onCustomerName(e.target.value)}
                      placeholder="Gõ tên hoặc chọn từ danh bạ"
                      className={inputClass()}
                    />
                    <datalist id="t-customer-list">
                      {customers.map((c) => (
                        <option key={c.id} value={c.name} label={[c.code, c.phone].filter(Boolean).join(' · ')} />
                      ))}
                    </datalist>
                  </>
                )}
              </Field>
              {matchedCustomer && (
                <p className="-mt-2 flex items-center gap-1.5 text-sm text-scale-success font-medium">
                  <UserCheck className="w-4 h-4" aria-hidden="true" /> Khách trong danh bạ · {matchedCustomer.code}
                </p>
              )}
              {isNewCustomer && !ticket && (
                <label className="-mt-2 flex items-center gap-2.5 min-h-touch text-sm text-scale-fg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveCustomer}
                    onChange={(e) => setSaveCustomer(e.target.checked)}
                    className="w-5 h-5 rounded accent-[var(--scale-primary)]"
                  />
                  Lưu khách mới này vào danh bạ
                </label>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Field id="t-phone" label="Điện thoại">
                  {(p) => (
                    <input {...p} type="tel" inputMode="tel" autoComplete="off" value={header.customerPhone} onChange={(e) => setHeader((h) => ({ ...h, customerPhone: e.target.value }))} className={inputClass()} />
                  )}
                </Field>
                <Field id="t-plate" label="Số xe">
                  {(p) => (
                    <input {...p} autoComplete="off" value={header.vehiclePlate} onChange={(e) => setHeader((h) => ({ ...h, vehiclePlate: e.target.value.toUpperCase() }))} placeholder="71C-123.45" className={inputClass()} />
                  )}
                </Field>
              </div>
              <Field id="t-address" label="Địa chỉ">
                {(p) => <input {...p} autoComplete="off" value={header.customerAddress} onChange={(e) => setHeader((h) => ({ ...h, customerAddress: e.target.value }))} className={inputClass()} />}
              </Field>
              <Field id="t-driver" label="Tài xế">
                {(p) => <input {...p} autoComplete="off" value={header.driverName} onChange={(e) => setHeader((h) => ({ ...h, driverName: e.target.value }))} className={inputClass()} />}
              </Field>
              <Field id="t-note" label="Ghi chú" hint="In ở cuối phiếu.">
                {(p) => <input {...p} autoComplete="off" value={header.note} onChange={(e) => setHeader((h) => ({ ...h, note: e.target.value }))} className={inputClass()} />}
              </Field>
            </fieldset>

            {headerDirty && !locked && (
              <div className="mt-4 rounded-xl border border-scale-warning bg-scale-warning-soft p-3">
                <p className="text-sm text-scale-fg">
                  {ticket ? 'Có thay đổi chưa lưu.' : 'Thông tin sẽ được lưu cùng lượt cân đầu tiên.'}
                </p>
                {ticket && (
                  <button type="button" onClick={saveHeader} disabled={isBusy} className={cx(buttonClass({ variant: 'primary' }), 'mt-2 w-full')}>
                    {busy === 'header' ? spinner : <Save className="w-4 h-4" aria-hidden="true" />} Lưu thông tin phiếu
                  </button>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ==================== Danh sách phiếu ==================== */}
      <Card title="Danh sách phiếu" titleId="list-title" padded={false}>
        <div className="grid gap-3 px-5 pb-4 sm:grid-cols-[repeat(2,minmax(0,11rem))_minmax(0,1fr)]">
          <Field id="l-from" label="Từ ngày">
            {(p) => <input {...p} type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className={inputClass()} />}
          </Field>
          <Field id="l-to" label="Đến ngày">
            {(p) => <input {...p} type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className={inputClass()} />}
          </Field>
          <Field id="l-search" label="Tìm phiếu">
            {(p) => (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-scale-muted-fg pointer-events-none" aria-hidden="true" />
                <input {...p} type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Số phiếu, tên khách, điện thoại, số xe" className={cx(inputClass(), 'pl-9')} />
              </div>
            )}
          </Field>
        </div>

        {listError ? (
          <div className="px-5 pb-5">
            <Notice
              tone="danger"
              title="Không tải được danh sách phiếu"
              action={
                <button type="button" onClick={loadList} className={buttonClass({ variant: 'ghost' })}>
                  Thử lại
                </button>
              }
            >
              Kiểm tra kết nối mạng rồi thử lại.
            </Notice>
          </div>
        ) : listLoading && list.length === 0 ? (
          <div className="flex items-center justify-center py-10 gap-2 text-scale-muted-fg text-sm" role="status">
            {spinner} Đang tải danh sách phiếu…
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-9 h-9" aria-hidden="true" />}
            title={search.trim() ? 'Không tìm thấy phiếu nào' : 'Chưa có phiếu nào trong khoảng ngày này'}
            action={
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setFrom(vnToday(-29));
                  setTo(vnToday());
                }}
                className={buttonClass()}
              >
                Xem 30 ngày gần nhất
              </button>
            }
          >
            {search.trim() ? 'Thử từ khoá khác hoặc mở rộng khoảng ngày.' : 'Đổi khoảng ngày để xem phiếu cũ hơn.'}
          </EmptyState>
        ) : (
          <>
            <div className="hidden md:block relative overflow-x-auto">
              <table className="w-full text-sm whitespace-nowrap">
                <caption className="sr-only">Danh sách phiếu cân theo khoảng ngày đã chọn</caption>
                <thead className="bg-scale-muted text-scale-muted-fg text-xs">
                  <tr>
                    <th scope="col" className="px-3 py-2.5 text-left font-semibold">Số phiếu</th>
                    <th scope="col" className="px-3 py-2.5 text-left font-semibold">Thời gian</th>
                    <th scope="col" className="px-3 py-2.5 text-left font-semibold">Khách hàng</th>
                    <th scope="col" className="px-3 py-2.5 text-left font-semibold">Loại</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-semibold">Tổng TL (kg)</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-semibold">Tổng tiền (đ)</th>
                    <th scope="col" className="px-3 py-2.5 text-left font-semibold">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-scale-border text-scale-fg">
                  {list.map((t) => (
                    <tr key={t.id} className={t.id === ticket?.id ? 'bg-scale-accent' : 'hover:bg-scale-muted'}>
                      <td className="px-1 py-0.5">
                        <button
                          type="button"
                          onClick={() => openTicket(t.id)}
                          aria-current={t.id === ticket?.id ? 'true' : undefined}
                          aria-label={`Mở phiếu số ${t.ticketNo}`}
                          className={cx(buttonClass({ variant: 'ghost' }), 'tabular-nums text-scale-primary underline-offset-4 hover:underline')}
                        >
                          #{t.ticketNo}
                        </button>
                      </td>
                      <td className="px-3 py-1.5 text-scale-muted-fg">{formatVnDateTime(t.createdAt)}</td>
                      <td className="px-3 py-1.5 max-w-[16rem] truncate" title={t.customerName ?? undefined}>
                        {t.customerName || <span className="text-scale-muted-fg">Khách lẻ</span>}
                      </td>
                      <td className="px-3 py-1.5">{TICKET_TYPE_LABEL[t.type]}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums">{formatKg(t.totalWeight)}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums font-semibold">{formatMoney(t.totalAmount)}</td>
                      <td className="px-3 py-1.5">
                        {t.status === 'DONE' ? <Badge tone="success">Đã xong</Badge> : <Badge tone="warning">Đang cân</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="md:hidden divide-y divide-scale-border border-t border-scale-border">
              {list.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => openTicket(t.id)}
                    aria-current={t.id === ticket?.id ? 'true' : undefined}
                    className={cx('w-full text-left px-5 py-3 flex items-start justify-between gap-3', t.id === ticket?.id ? 'bg-scale-accent' : 'hover:bg-scale-muted', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-scale-ring')}
                  >
                    <span className="min-w-0">
                      <span className="block font-semibold text-scale-fg">
                        Phiếu #{t.ticketNo} · {TICKET_TYPE_LABEL[t.type]}
                      </span>
                      <span className="block text-sm text-scale-fg truncate">{t.customerName || 'Khách lẻ'}</span>
                      <span className="block text-xs text-scale-muted-fg mt-0.5">{formatVnDateTime(t.createdAt)}</span>
                    </span>
                    <span className="text-right flex-shrink-0">
                      <span className="block tabular-nums font-bold text-scale-fg">{formatMoney(t.totalAmount)} đ</span>
                      <span className="block text-xs text-scale-muted-fg tabular-nums">{formatKg(t.totalWeight)} kg</span>
                      <span className="mt-1 inline-block">
                        {t.status === 'DONE' ? <Badge tone="success">Đã xong</Badge> : <Badge tone="warning">Đang cân</Badge>}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </div>
  );
}

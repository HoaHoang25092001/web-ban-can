/**
 * Phép tính và định dạng dùng chung cho phiếu cân.
 *
 * Dùng chung cho cả máy chủ (lúc lưu) lẫn trình duyệt (lúc xem trước và in):
 * con số khách thấy trên màn hình trước khi bấm lưu phải trùng khớp tới từng
 * đồng với con số in ra trên phiếu. Tính ở hai nơi bằng hai đoạn mã khác nhau
 * là sớm muộn lệch nhau ở chỗ làm tròn.
 */

export type TicketType = 'XUAT' | 'NHAP';
export type TicketStatus = 'OPEN' | 'DONE';

export const TICKET_TYPE_LABEL: Record<TicketType, string> = {
  XUAT: 'Xuất kho',
  NHAP: 'Nhập kho',
};

export interface TicketLineLike {
  productCode: string;
  productName: string;
  grossWeight: number;
  trayCount: number;
  trayWeight: number;
  tareWeight: number;
  netWeight: number;
  unitPrice: number;
  amount: number;
}

/** Làm tròn tới gam (3 chữ số thập phân), tránh lỗi số thực kiểu 12.3 − 0.1 = 12.200000000000001. */
export function roundKg(value: number) {
  return Math.round(value * 1000) / 1000;
}

/**
 * Tính một lượt cân từ số đọc trên cân.
 *
 *   Trừ bì   = số khay × khối lượng một khay
 *   TL hàng  = TL cân − trừ bì
 *   Thành tiền = TL hàng × đơn giá, làm tròn tới đồng
 */
export function computeLine(input: {
  grossWeight: number;
  trayCount: number;
  trayWeight: number;
  unitPrice: number;
}) {
  const tareWeight = roundKg(input.trayCount * input.trayWeight);
  const netWeight = roundKg(input.grossWeight - tareWeight);
  const amount = Math.round(netWeight * input.unitPrice);
  return { tareWeight, netWeight, amount };
}

export function ticketTotals(lines: Pick<TicketLineLike, 'netWeight' | 'amount' | 'trayCount'>[]) {
  return lines.reduce(
    (acc, l) => ({
      netWeight: roundKg(acc.netWeight + l.netWeight),
      amount: acc.amount + l.amount,
      trayCount: acc.trayCount + l.trayCount,
    }),
    { netWeight: 0, amount: 0, trayCount: 0 }
  );
}

/**
 * Gộp các lượt cân theo mặt hàng cho bảng tổng trên phiếu in.
 *
 * Gộp theo CẢ mặt hàng lẫn đơn giá: cùng là "Gà" nhưng một nửa bán 70.000đ,
 * nửa kia 65.000đ thì phải thành hai dòng — gộp chung một dòng thì cột đơn giá
 * không biết ghi số nào và thành tiền nhân lại sẽ sai.
 */
export function groupLinesByProduct(lines: TicketLineLike[]) {
  const groups = new Map<
    string,
    { productName: string; unitPrice: number; netWeight: number; amount: number; trayCount: number }
  >();
  for (const l of lines) {
    const key = `${l.productCode}\u0000${l.productName}\u0000${l.unitPrice}`;
    const g = groups.get(key);
    if (g) {
      g.netWeight = roundKg(g.netWeight + l.netWeight);
      g.amount += l.amount;
      g.trayCount += l.trayCount;
    } else {
      groups.set(key, {
        productName: l.productName,
        unitPrice: l.unitPrice,
        netWeight: l.netWeight,
        amount: l.amount,
        trayCount: l.trayCount,
      });
    }
  }
  return Array.from(groups.values());
}

const kgFormat = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 });
const moneyFormat = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 });

/** 47,2 — dấu phẩy thập phân theo kiểu Việt Nam, để không lẫn với dấu chấm hàng nghìn của tiền. */
export function formatKg(value: number) {
  return kgFormat.format(value);
}

/** 1.350.200 */
export function formatMoney(value: number) {
  return moneyFormat.format(value);
}

/* ------------------------------------------------------------------ */
/* Đọc số tiền thành chữ                                               */
/* ------------------------------------------------------------------ */

const DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
/** Đủ tới hàng trăm nghìn tỷ — một phiếu cân không bao giờ chạm tới mức đó. */
const UNITS = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ'];

/**
 * Đọc một nhóm ba chữ số.
 *
 * `full` = nhóm này đứng SAU một nhóm khác, nên phải đọc đủ "không trăm",
 * "linh": 1.005 là "một nghìn không trăm linh năm", không phải "một nghìn năm".
 */
function readTriple(n: number, full: boolean) {
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const u = n % 10;
  const words: string[] = [];

  if (h > 0 || full) words.push(DIGITS[h], 'trăm');

  if (t === 0) {
    if (u > 0 && (h > 0 || full)) words.push('linh');
  } else if (t === 1) {
    words.push('mười');
  } else {
    words.push(DIGITS[t], 'mươi');
  }

  if (u > 0) {
    if (u === 1 && t >= 2) words.push('mốt');
    else if (u === 5 && t >= 1) words.push('lăm');
    else words.push(DIGITS[u]);
  }
  return words.join(' ');
}

/**
 * 1350200 → "Một triệu ba trăm năm mươi nghìn hai trăm đồng".
 *
 * Dòng "Viết bằng chữ" trên phiếu là căn cứ khi hai bên đối chiếu — sai một
 * chữ là sai chứng từ, nên số tiền được làm tròn tới đồng trước khi đọc.
 */
export function moneyToVietnameseWords(amount: number) {
  let n = Math.round(Math.abs(amount));
  if (n === 0) return 'Không đồng';

  // Tách thành các nhóm ba chữ số từ phải sang: 1350200 → [200, 350, 1].
  const groups: number[] = [];
  while (n > 0) {
    groups.push(n % 1000);
    n = Math.floor(n / 1000);
  }

  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    // 1.000.200 = "một triệu hai trăm": nhóm nghìn trống thì bỏ qua hẳn.
    if (groups[i] === 0) continue;
    parts.push([readTriple(groups[i], parts.length > 0), UNITS[i]].filter(Boolean).join(' '));
  }

  const text = `${amount < 0 ? 'âm ' : ''}${parts.join(' ')} đồng`;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/* ------------------------------------------------------------------ */
/* Ngày giờ theo giờ Việt Nam                                          */
/* ------------------------------------------------------------------ */

/**
 * Máy chủ Vercel chạy giờ UTC, chậm hơn Việt Nam 7 tiếng. Lọc "từ ngày 12"
 * mà hiểu theo UTC thì phiếu cân lúc 6 giờ sáng ngày 12 ở Việt Nam (tức 23 giờ
 * ngày 11 UTC) bị loại khỏi danh sách. Nên mọi mốc ngày đều ghi rõ +07:00.
 */
export function vnDayStart(dateStr: string) {
  return new Date(`${dateStr}T00:00:00+07:00`);
}

/** Ngày hôm nay theo giờ Việt Nam, dạng YYYY-MM-DD cho ô chọn ngày. */
export function vnToday(offsetDays = 0) {
  const d = new Date(Date.now() + 7 * 3600_000 + offsetDays * 86400_000);
  return d.toISOString().slice(0, 10);
}

const vnDateTime = new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh',
  hour: '2-digit',
  minute: '2-digit',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

/** "08:15 12/10/2026" */
export function formatVnDateTime(date: Date | string) {
  return vnDateTime.format(new Date(date));
}

/** "Ngày 12 tháng 10 năm 2026" cho dòng ký tên cuối phiếu. */
export function formatVnLongDate(date: Date | string) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).formatToParts(new Date(date));
  const get = (t: string) => parts.find((p) => p.type === t)?.value;
  return `Ngày ${get('day')} tháng ${get('month')} năm ${get('year')}`;
}

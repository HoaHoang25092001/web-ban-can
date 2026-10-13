'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Badge, buttonClass } from '@/components/scale/ui';
import { Printer, ArrowLeft } from 'lucide-react';
import {
  formatKg,
  formatMoney,
  formatVnDateTime,
  formatVnLongDate,
  groupLinesByProduct,
  moneyToVietnameseWords,
  ticketTotals,
  type TicketLineLike,
  type TicketType,
} from '@/lib/scale-ticket';

interface PrintTicket {
  id: number;
  ticketNo: number;
  type: TicketType;
  status: string;
  customerName: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  driverName: string | null;
  vehiclePlate: string | null;
  note: string | null;
  createdAt: string;
  completedAt: string | null;
  lines: (TicketLineLike & { id: number })[];
}

/** Ô còn trống thì in dòng chấm để người nhận viết tay vào, như mẫu giấy. */
const DOTS = '..............................';

/**
 * Phiếu xuất/nhập kho in khổ A4 — bố cục theo đúng mẫu phiếu khách đang
 * dùng: thông tin hai cột, bảng tổng theo loại hàng, bảng chi tiết từng mã
 * cân chia đôi, số tiền bằng chữ và bốn chỗ ký.
 *
 * Màu chữ, nền viết cứng đen/trắng, KHÔNG dùng màu theo chế độ sáng/tối:
 * đang bật chế độ tối mà in ra nền đen chữ trắng là phí cả hộp mực.
 */
export default function PrintableTicket({ ticket, autoPrint }: { ticket: PrintTicket; autoPrint: boolean }) {
  const isExport = ticket.type === 'XUAT';
  const title = isExport ? 'PHIẾU XUẤT KHO' : 'PHIẾU NHẬP KHO';
  const totals = ticketTotals(ticket.lines);
  const groups = groupLinesByProduct(ticket.lines);

  // Bảng chi tiết chia đôi trang: nửa đầu bên trái, nửa sau bên phải.
  const half = Math.ceil(ticket.lines.length / 2);
  const left = ticket.lines.slice(0, half);
  const right = ticket.lines.slice(half);

  useEffect(() => {
    // Tên tệp khi chọn "Lưu dưới dạng PDF" lấy theo tiêu đề trang.
    document.title = `Phieu-${ticket.ticketNo}`;
    if (!autoPrint) return;
    // Chờ phông chữ nạp xong rồi mới in, nếu không bản in đầu tiên có thể lệch chữ.
    const t = setTimeout(() => window.print(), 400);
    return () => clearTimeout(t);
  }, [autoPrint, ticket.ticketNo]);

  return (
    <div className="print-root min-h-screen bg-scale-bg py-6 print:p-0 print:bg-white">
      <style>{`
        @page { size: A4; margin: 10mm 12mm; }
        @media print {
          html, body { background: #fff !important; }
          .print-root { min-height: 0 !important; }
        }
        .ticket-sheet { font-family: 'Times New Roman', Times, serif; }
        .ticket-sheet table { border-collapse: collapse; width: 100%; }
        .ticket-sheet th, .ticket-sheet td { border: 1px solid #000; padding: 3px 6px; }
        .ticket-sheet th { font-weight: 700; text-align: center; background: #f2f2f2; }
        .ticket-sheet thead { display: table-header-group; }
        .ticket-sheet tr { break-inside: avoid; }
        @media print { .ticket-sheet th { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      `}</style>

      {/* Thanh công cụ — chỉ hiện trên màn hình, không in ra */}
      <div className="print:hidden max-w-[210mm] mx-auto px-4 sm:px-0 mb-4 flex flex-wrap items-center gap-2">
        <Link
          href={`/can-dien-tu?id=${ticket.id}`}
          className={buttonClass()}
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Về phiếu cân
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className={buttonClass({ variant: 'primary' })}
        >
          <Printer className="w-4 h-4" aria-hidden="true" /> In phiếu
        </button>
        {ticket.status !== 'DONE' && (
          <Badge tone="warning">Phiếu chưa xong — số liệu vẫn có thể thay đổi</Badge>
        )}
      </div>

      {/* Tờ A4. Trên điện thoại cho cuộn ngang thay vì co chữ nhỏ tới mức không đọc nổi. */}
      <div className="overflow-x-auto print:overflow-visible">
        <article
          className="ticket-sheet mx-auto bg-white text-black w-[210mm] min-h-[297mm] px-[12mm] py-[10mm] shadow-lg print:shadow-none print:w-auto print:min-h-0 print:p-0 text-[13.5px] leading-snug"
          aria-label={`${title} số ${ticket.ticketNo}`}
        >
          <h1 className="text-center text-[22px] font-bold tracking-wide mb-4">{title}</h1>

          {/* Thông tin hai cột */}
          <div className="grid grid-cols-[1.35fr_1fr] gap-x-6 gap-y-1 mb-4">
            <div className="space-y-1">
              <Row label="Số phiếu" value={<b>{ticket.ticketNo}</b>} />
              <Row label="Tên khách hàng" value={<b>{ticket.customerName || DOTS}</b>} />
              <Row label="SĐT" value={ticket.customerPhone || DOTS} />
              <Row label="Địa chỉ" value={ticket.customerAddress || DOTS} />
              <Row label="Thời gian" value={formatVnDateTime(ticket.createdAt)} />
              <Row label={isExport ? 'Giờ giao' : 'Giờ nhập'} value={DOTS} />
            </div>
            <div className="space-y-1">
              <Row label="SL Khay" value={<b>{totals.trayCount}</b>} />
              <Row label="Biển số xe" value={ticket.vehiclePlate || DOTS} />
              <Row label="Tên tài xế" value={ticket.driverName || DOTS} />
              <Row label="Giờ nhận" value={DOTS} />
            </div>
          </div>

          {/* Bảng tổng theo loại hàng */}
          <table className="mb-4">
            <thead>
              <tr>
                <th className="w-[6%]">STT</th>
                <th>Loại hàng</th>
                <th className="w-[8%]">ĐVT</th>
                <th className="w-[15%]">Số lượng {isExport ? 'Xuất' : 'Nhập'}</th>
                <th className="w-[13%]">Đơn giá</th>
                <th className="w-[16%]">Thành tiền</th>
                <th className="w-[13%]">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g, i) => (
                <tr key={i}>
                  <td className="text-center">{i + 1}</td>
                  <td>{g.productName}</td>
                  <td className="text-center">Kg</td>
                  <td className="text-right">{formatKg(g.netWeight)}</td>
                  <td className="text-right">{formatMoney(g.unitPrice)}</td>
                  <td className="text-right">{formatMoney(g.amount)}</td>
                  <td />
                </tr>
              ))}
              <tr className="font-bold">
                <td colSpan={3} className="text-center">TỔNG CỘNG</td>
                <td className="text-right">{formatKg(totals.netWeight)}</td>
                <td />
                <td className="text-right">{formatMoney(totals.amount)}</td>
                <td />
              </tr>
            </tbody>
          </table>

          {/* Chi tiết từng mã cân, chia đôi */}
          <h2 className="text-center font-bold text-[15px] mb-2">BẢNG CHI TIẾT CÁC MÃ CÂN</h2>
          <div className="grid grid-cols-2 gap-3 mb-4 items-start">
            <DetailTable lines={left} start={1} />
            {right.length > 0 ? <DetailTable lines={right} start={half + 1} /> : <div />}
          </div>

          <div className="space-y-1 mb-3">
            <p>
              <b>Viết bằng chữ:</b> <i>{moneyToVietnameseWords(totals.amount)}</i>
            </p>
            <p>
              <b>Tổng số lượng (kg):</b> {formatKg(totals.netWeight)} kg
            </p>
            <p>
              <b>Ghi chú:</b> {ticket.note || DOTS + DOTS}
            </p>
            <p className="italic pt-1">*** Quý khách vui lòng kiểm tra chất lượng và số lượng khi nhận hàng</p>
          </div>

          <p className="text-right italic mb-2 pr-4">{formatVnLongDate(ticket.completedAt ?? ticket.createdAt)}</p>

          {/* Bốn chỗ ký. break-inside: avoid để phần ký không bị tách sang trang sau một mình. */}
          <div className="grid grid-cols-4 text-center break-inside-avoid">
            {['Khách hàng', 'Tài xế', isExport ? 'Nhân viên xuất kho' : 'Nhân viên nhập kho', 'Người lập phiếu'].map((r) => (
              <div key={r} className="pb-20">
                <p className="font-bold">{r}</p>
                <p className="italic text-[12px]">(Ký, ghi rõ họ tên)</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <p className="grid grid-cols-[7.5rem_1fr]">
      <span>{label}:</span>
      <span className="break-words">{value}</span>
    </p>
  );
}

function DetailTable({ lines, start }: { lines: TicketLineLike[]; start: number }) {
  return (
    <table className="text-[12.5px]">
      <thead>
        <tr>
          <th className="w-[12%]">STT</th>
          <th>Loại hàng</th>
          <th className="w-[30%]">TL đã trừ khay (kg)</th>
          <th className="w-[15%]">Số khay</th>
        </tr>
      </thead>
      <tbody>
        {lines.map((l, i) => (
          <tr key={i}>
            <td className="text-center">{start + i}</td>
            <td>{l.productName}</td>
            <td className="text-right">{formatKg(l.netWeight)}</td>
            <td className="text-center">{l.trayCount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

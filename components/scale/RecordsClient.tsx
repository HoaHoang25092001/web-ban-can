'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Loader2, ClipboardList, ChevronLeft, ChevronRight, Scale, FileSpreadsheet, Wallet } from 'lucide-react';
import { formatMoney } from '@/lib/scale-ticket';

interface Record {
  id: number;
  productCode: string;
  productName: string;
  grossWeight: number;
  trayCount: number;
  tareWeight: number;
  netWeight: number;
  unitPrice: number;
  amount: number;
  weighedAt: string;
  ticket: { id: number; ticketNo: number; type: string; customerName: string | null };
}

const fmtNum = (n: number) => n.toLocaleString('vi-VN', { maximumFractionDigits: 3 });
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

/**
 * Danh sách bản ghi cân của khách đang đăng nhập — mọi lượt cân trong các phiếu.
 *
 * Máy chủ luôn lọc theo tài khoản (xem app/api/scale/records), nên trang này
 * không bao giờ nhận được dữ liệu của khách khác dù có sửa tham số trên URL.
 *
 * Chỉ xem, không xoá: lượt cân thuộc về phiếu, xoá ở đây thì phiếu đã in cho
 * khách và sổ sách lệch nhau. Muốn sửa thì bấm số phiếu để mở phiếu đó.
 */
export default function RecordsClient() {
  const [records, setRecords] = useState<Record[]>([]);
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  /**
   * Tải tệp Excel theo ĐÚNG bộ lọc đang xem.
   *
   * Không dùng thẻ <a href> thường: trình duyệt sẽ mở tab mới rồi tải, và nếu
   * phiên hết hạn thì khách nhận về một trang JSON lỗi khó hiểu thay vì tệp.
   * Tải bằng fetch để bắt được lỗi và báo bằng tiếng Việt.
   */
  const exportExcel = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (from) params.set('from', from);
      if (to) params.set('to', to);

      const res = await fetch(`/api/scale/records/export?${params}`);
      if (!res.ok) {
        alert(res.status === 401
          ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
          : 'Không xuất được tệp Excel. Vui lòng thử lại.');
        return;
      }

      /* Lấy tên tệp máy chủ đặt (có kèm ngày giờ); không lấy được thì dùng
         tên dự phòng để việc tải vẫn chạy. */
      const disposition = res.headers.get('Content-Disposition') ?? '';
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? 'ban-ghi-can.xlsx';

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      // Giải phóng bộ nhớ: blob của tệp vài nghìn dòng có thể nặng vài MB.
      URL.revokeObjectURL(url);
    } catch {
      alert('Không kết nối được tới máy chủ.');
    } finally {
      setExporting(false);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (search.trim()) params.set('search', search.trim());
      if (from) params.set('from', from);
      if (to) params.set('to', to);

      const res = await fetch(`/api/scale/records?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setRecords(data.records ?? []);
      setTotalWeight(data.totalWeight ?? 0);
      setTotalAmount(data.totalAmount ?? 0);
      setTotal(data.pagination?.total ?? 0);
      setPages(Math.max(1, data.pagination?.pages ?? 1));
    } catch {
      /* Lỗi mạng: giữ nguyên danh sách cũ thay vì xoá trắng màn hình. */
    } finally {
      setLoading(false);
    }
  }, [page, search, from, to]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-5">
      {/* Tổng hợp: tính trên TOÀN BỘ kết quả lọc, không chỉ trang đang xem —
          nếu không, đổi trang là con số nhảy lung tung. */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-scale-card rounded-xl border border-scale-border p-4 flex items-center gap-4">
          <span className="w-10 h-10 rounded-xl bg-scale-accent flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-5 h-5 text-scale-primary" aria-hidden="true" />
          </span>
          <div>
            <div className="text-2xl font-bold text-scale-fg">{fmtNum(total)}</div>
            <div className="text-xs text-scale-muted-fg">Lượt cân</div>
          </div>
        </div>
        <div className="bg-scale-card rounded-xl border border-scale-border p-4 flex items-center gap-4">
          <span className="w-10 h-10 rounded-xl bg-scale-success-soft flex items-center justify-center flex-shrink-0">
            <Scale className="w-5 h-5 text-scale-success" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="text-2xl font-bold text-scale-fg break-all">{fmtNum(totalWeight)} kg</div>
            <div className="text-xs text-scale-muted-fg">Tổng khối lượng hàng</div>
          </div>
        </div>
        <div className="bg-scale-card rounded-xl border border-scale-border p-4 flex items-center gap-4">
          <span className="w-10 h-10 rounded-xl bg-scale-accent flex items-center justify-center flex-shrink-0">
            <Wallet className="w-5 h-5 text-scale-primary" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="text-2xl font-bold text-scale-fg break-all">{formatMoney(totalAmount)} đ</div>
            <div className="text-xs text-scale-muted-fg">Tổng tiền</div>
          </div>
        </div>
      </div>

      {/* Bộ lọc */}
      <form
        onSubmit={(e) => { e.preventDefault(); setPage(1); load(); }}
        className="bg-scale-card rounded-xl border border-scale-border p-4 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]"
      >
        <div className="relative">
          <label htmlFor="rec-search" className="sr-only">Tìm bản ghi</label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-scale-muted-fg pointer-events-none" aria-hidden="true" />
          <input
            id="rec-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo loại hàng, khách, số xe, số phiếu…"
            className="w-full min-h-touch pl-9 pr-3 rounded-lg bg-scale-card border border-scale-input text-scale-fg text-sm focus:outline-none focus:ring-2 focus:ring-scale-ring"
          />
        </div>
        <div>
          <label htmlFor="rec-from" className="sr-only">Từ ngày</label>
          <input
            id="rec-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            className="min-h-touch px-3 rounded-lg bg-scale-card border border-scale-input text-scale-fg text-sm w-full focus:outline-none focus:ring-2 focus:ring-scale-ring"
          />
        </div>
        <div>
          <label htmlFor="rec-to" className="sr-only">Đến ngày</label>
          <input
            id="rec-to" type="date" value={to} onChange={(e) => setTo(e.target.value)}
            className="min-h-touch px-3 rounded-lg bg-scale-card border border-scale-input text-scale-fg text-sm w-full focus:outline-none focus:ring-2 focus:ring-scale-ring"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 sm:flex-none inline-flex items-center justify-center min-h-touch px-5 rounded-lg bg-scale-primary text-scale-primary-fg text-sm font-semibold hover:bg-scale-primary-hover transition-colors"
          >
            Lọc
          </button>
          {/* Nút xuất đặt cạnh nút Lọc để thấy rõ hai việc liên quan nhau:
              lọc ra cái cần xem, rồi xuất đúng phần đó (tiêu chí 1). */}
          <button
            type="button"
            onClick={exportExcel}
            disabled={exporting || total === 0}
            title={total === 0 ? 'Chưa có bản ghi nào để xuất' : 'Tải tệp Excel theo bộ lọc hiện tại'}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 min-h-touch px-4 rounded-lg border border-scale-success text-scale-success text-sm font-semibold hover:bg-scale-success-soft disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {exporting
              ? <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" aria-hidden="true" />
              : <FileSpreadsheet className="w-4 h-4 flex-shrink-0" aria-hidden="true" />}
            {exporting ? 'Đang xuất…' : 'Xuất Excel'}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-scale-muted-fg">
          <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
          <span className="text-sm">Đang tải bản ghi…</span>
        </div>
      ) : records.length === 0 ? (
        <div className="bg-scale-card rounded-xl border border-scale-border p-12 text-center">
          <ClipboardList className="w-10 h-10 text-scale-muted-fg mx-auto mb-3" aria-hidden="true" />
          <p className="font-semibold text-scale-fg">Chưa có bản ghi nào</p>
          <p className="text-sm text-scale-muted-fg mt-1">
            Vào <strong>Phiếu cân</strong>, kết nối cân rồi bấm <strong>Lưu lượt cân</strong> (F2) — mỗi lượt cân sẽ hiện ở đây.
          </p>
        </div>
      ) : (
        <>
          {/* Máy tính: bảng. Điện thoại: thẻ xếp dọc — bảng nhiều cột trên màn
              hình 390px buộc phải cuộn ngang mới đọc được (tiêu chí 6). */}
          <div className="hidden md:block bg-scale-card rounded-xl border border-scale-border overflow-hidden">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-scale-muted border-b border-scale-border">
                  <tr className="text-left text-scale-muted-fg">
                    <th scope="col" className="px-4 py-3 font-semibold">Thời gian</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Phiếu</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Khách hàng</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Loại hàng</th>
                    <th scope="col" className="px-4 py-3 font-semibold text-right">TL cân</th>
                    <th scope="col" className="px-4 py-3 font-semibold text-right">Khay</th>
                    <th scope="col" className="px-4 py-3 font-semibold text-right">TL hàng</th>
                    <th scope="col" className="px-4 py-3 font-semibold text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-scale-border">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-scale-muted/70">
                      <td className="px-4 py-2 whitespace-nowrap text-scale-muted-fg">{fmtDate(r.weighedAt)}</td>
                      <td className="px-2 py-0.5 whitespace-nowrap">
                        {/* Bấm số phiếu để mở phiếu — sửa hay xoá lượt cân làm ở đó. */}
                        <Link
                          href={`/can-dien-tu?id=${r.ticket.id}`}
                          aria-label={`Mở phiếu số ${r.ticket.ticketNo}`}
                          className="inline-flex items-center min-h-touch px-2 rounded-lg font-mono font-semibold text-scale-primary hover:underline"
                        >
                          #{r.ticket.ticketNo}
                        </Link>
                        {r.ticket.type === 'NHAP' && <span className="text-xs text-scale-muted-fg">Nhập</span>}
                      </td>
                      <td className="px-4 py-2 text-scale-fg max-w-[200px] truncate">
                        {r.ticket.customerName || <span className="text-scale-muted-fg">Khách lẻ</span>}
                      </td>
                      <td className="px-4 py-2">
                        <div className="font-medium text-scale-fg">{r.productName}</div>
                        {r.productCode && <div className="text-xs text-scale-muted-fg">{r.productCode}</div>}
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-scale-muted-fg whitespace-nowrap">{fmtNum(r.grossWeight)}</td>
                      <td className="px-4 py-2 text-right font-mono text-scale-muted-fg">{r.trayCount}</td>
                      <td className="px-4 py-2 text-right font-mono font-semibold text-scale-fg whitespace-nowrap">{fmtNum(r.netWeight)} kg</td>
                      <td className="px-4 py-2 text-right font-mono text-scale-fg whitespace-nowrap">{formatMoney(r.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <ul className="md:hidden space-y-3">
            {records.map((r) => (
              <li key={r.id} className="bg-scale-card rounded-xl border border-scale-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-scale-fg">{r.productName}</div>
                    <div className="text-xs text-scale-muted-fg truncate">{r.ticket.customerName || 'Khách lẻ'}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-scale-fg whitespace-nowrap">{fmtNum(r.netWeight)} kg</div>
                    <div className="font-mono text-sm text-scale-muted-fg whitespace-nowrap">{formatMoney(r.amount)} đ</div>
                  </div>
                </div>
                <div className="text-xs text-scale-muted-fg mt-2">
                  {fmtDate(r.weighedAt)} · cân {fmtNum(r.grossWeight)} kg, {r.trayCount} khay, trừ bì {fmtNum(r.tareWeight)} kg
                </div>
                <div className="mt-2 pt-2 border-t border-scale-border">
                  <Link
                    href={`/can-dien-tu?id=${r.ticket.id}`}
                    className="inline-flex items-center min-h-touch px-3 -mx-3 rounded-lg text-sm font-medium text-scale-primary hover:bg-scale-accent"
                  >
                    Mở phiếu #{r.ticket.ticketNo}
                  </Link>
                </div>
              </li>
            ))}
          </ul>

          {pages > 1 && (
            <nav aria-label="Phân trang bản ghi" className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-sm text-scale-muted-fg">Trang {page} / {pages} · {fmtNum(total)} lượt cân</p>
              <div className="flex gap-2">
                <button
                  type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="inline-flex items-center gap-1 min-h-touch px-4 rounded-lg border border-scale-input bg-scale-card text-sm font-medium text-scale-fg hover:border-scale-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Trước
                </button>
                <button
                  type="button" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages}
                  className="inline-flex items-center gap-1 min-h-touch px-4 rounded-lg border border-scale-input bg-scale-card text-sm font-medium text-scale-fg hover:border-scale-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Sau <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

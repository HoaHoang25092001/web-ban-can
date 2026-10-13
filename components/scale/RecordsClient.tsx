'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Loader2, ClipboardList, ChevronLeft, ChevronRight, Scale, FileSpreadsheet, Wallet, FilterX } from 'lucide-react';
import { formatMoney } from '@/lib/scale-ticket';
import { EmptyState, Field, Notice, buttonClass, cx, inputClass } from '@/components/scale/ui';

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
  // Bộ lọc ĐANG ÁP DỤNG — chỉ đổi khi bấm "Lọc", để gõ dở từ khoá không làm danh sách nhảy liên tục.
  const [applied, setApplied] = useState({ search: '', from: '', to: '' });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);

  const filterParams = useCallback(() => {
    const params = new URLSearchParams();
    if (applied.search) params.set('search', applied.search);
    if (applied.from) params.set('from', applied.from);
    if (applied.to) params.set('to', applied.to);
    return params;
  }, [applied]);

  /**
   * Tải tệp Excel theo ĐÚNG bộ lọc đang xem.
   *
   * Tải bằng fetch thay vì thẻ <a href> để bắt được lỗi (phiên hết hạn, mất
   * mạng) và báo bằng tiếng Việt ngay trên trang, thay vì mở ra trang lỗi lạ.
   */
  const exportExcel = async () => {
    setExporting(true);
    setExportMsg(null);
    try {
      const res = await fetch(`/api/scale/records/export?${filterParams()}`);
      if (!res.ok) {
        setExportMsg({
          tone: 'danger',
          text: res.status === 401 ? 'Phiên đăng nhập đã hết hạn. Tải lại trang và đăng nhập lại.' : 'Không xuất được tệp Excel. Thử lại sau ít phút.',
        });
        return;
      }
      const disposition = res.headers.get('Content-Disposition') ?? '';
      const filename = disposition.match(/filename="([^"]+)"/)?.[1] ?? 'ban-ghi-can.xlsx';
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setExportMsg({ tone: 'success', text: `Đã tải ${filename} (${fmtNum(total)} lượt cân). Xem trong thư mục Tải về.` });
    } catch {
      setExportMsg({ tone: 'danger', text: 'Không kết nối được tới máy chủ. Kiểm tra mạng rồi thử lại.' });
    } finally {
      setExporting(false);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterParams();
      params.set('page', String(page));
      params.set('limit', '50');
      const res = await fetch(`/api/scale/records?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRecords(data.records ?? []);
      setTotalWeight(data.totalWeight ?? 0);
      setTotalAmount(data.totalAmount ?? 0);
      setTotal(data.pagination?.total ?? 0);
      setPages(Math.max(1, data.pagination?.pages ?? 1));
      setLoadError(false);
    } catch {
      // Giữ nguyên danh sách cũ, chỉ báo lỗi — không xoá trắng màn hình.
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [page, filterParams]);

  useEffect(() => {
    load();
  }, [load]);

  const hasFilter = Boolean(applied.search || applied.from || applied.to);
  const clearFilter = () => {
    setSearch('');
    setFrom('');
    setTo('');
    setPage(1);
    setApplied({ search: '', from: '', to: '' });
  };

  const STATS = [
    { icon: ClipboardList, label: 'Lượt cân', value: fmtNum(total), tint: 'bg-scale-accent text-scale-primary' },
    { icon: Scale, label: 'Tổng khối lượng hàng', value: `${fmtNum(totalWeight)} kg`, tint: 'bg-scale-success-soft text-scale-success' },
    { icon: Wallet, label: 'Tổng tiền', value: `${formatMoney(totalAmount)} đ`, tint: 'bg-scale-accent text-scale-primary' },
  ];

  return (
    <div className="space-y-5">
      {/* Tổng hợp: tính trên TOÀN BỘ kết quả lọc, không chỉ trang đang xem —
          nếu không, đổi trang là con số nhảy lung tung. */}
      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {STATS.map(({ icon: Icon, label, value, tint }) => (
          <li key={label} className="bg-scale-card rounded-2xl border border-scale-border p-4 flex items-center gap-4 shadow-sm min-w-0">
            <span className={cx('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', tint)}>
              <Icon className="w-5 h-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-scale-muted-fg">{label}</p>
              <p className="text-xl sm:text-2xl font-bold text-scale-fg tabular-nums break-all">{value}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Bộ lọc — nhãn luôn hiện, không chỉ có "mm/dd/yyyy" mà không biết ô nào là từ ngày. */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setApplied({ search: search.trim(), from, to });
        }}
        className="bg-scale-card rounded-2xl border border-scale-border p-4 shadow-sm grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_10.5rem_10.5rem_auto] lg:items-end"
      >
        <Field id="rec-search" label="Tìm" className="sm:col-span-2 lg:col-span-1">
          {(p) => (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-scale-muted-fg pointer-events-none" aria-hidden="true" />
              <input {...p} type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Loại hàng, khách, số xe, số phiếu" className={cx(inputClass(), 'pl-9')} />
            </div>
          )}
        </Field>
        <Field id="rec-from" label="Từ ngày">
          {(p) => <input {...p} type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className={inputClass()} />}
        </Field>
        <Field id="rec-to" label="Đến ngày">
          {(p) => <input {...p} type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className={inputClass()} />}
        </Field>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
          <button type="submit" className={cx(buttonClass({ variant: 'primary' }), 'flex-1 lg:flex-none')}>
            <Search className="w-4 h-4" aria-hidden="true" /> Lọc
          </button>
          <button
            type="button"
            onClick={exportExcel}
            disabled={exporting || total === 0}
            title={total === 0 ? 'Chưa có bản ghi nào để xuất' : 'Tải tệp Excel theo bộ lọc đang áp dụng'}
            className={cx(buttonClass(), 'flex-1 lg:flex-none whitespace-nowrap')}
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <FileSpreadsheet className="w-4 h-4 text-scale-success" aria-hidden="true" />}
            {exporting ? 'Đang xuất…' : 'Xuất Excel'}
          </button>
        </div>
      </form>

      <div aria-live="polite" className="space-y-3">
        {exportMsg && <Notice tone={exportMsg.tone}>{exportMsg.text}</Notice>}
        {hasFilter && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-scale-muted-fg">
            <span>Đang lọc:</span>
            {applied.search && <span className="font-medium text-scale-fg">“{applied.search}”</span>}
            {(applied.from || applied.to) && (
              <span className="font-medium text-scale-fg">
                {applied.from ? new Date(applied.from).toLocaleDateString('vi-VN') : '…'} – {applied.to ? new Date(applied.to).toLocaleDateString('vi-VN') : '…'}
              </span>
            )}
            <button type="button" onClick={clearFilter} className={buttonClass({ variant: 'ghost' })}>
              <FilterX className="w-4 h-4" aria-hidden="true" /> Bỏ lọc
            </button>
          </div>
        )}
      </div>

      {loadError && (
        <Notice
          tone="danger"
          title="Không tải được bản ghi cân"
          action={
            <button type="button" onClick={load} className={buttonClass({ variant: 'ghost' })}>
              Thử lại
            </button>
          }
        >
          Kiểm tra kết nối mạng rồi thử lại.
        </Notice>
      )}

      {loading && records.length === 0 ? (
        <div role="status" className="flex items-center justify-center py-16 gap-3 text-scale-muted-fg">
          <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
          <span className="text-sm">Đang tải bản ghi…</span>
        </div>
      ) : records.length === 0 && !loadError ? (
        <div className="bg-scale-card rounded-2xl border border-scale-border">
          <EmptyState
            icon={<ClipboardList className="w-9 h-9" aria-hidden="true" />}
            title={hasFilter ? 'Không có lượt cân nào khớp bộ lọc' : 'Chưa có bản ghi nào'}
            action={
              hasFilter ? (
                <button type="button" onClick={clearFilter} className={buttonClass()}>
                  Bỏ lọc
                </button>
              ) : (
                <Link href="/can-dien-tu" className={buttonClass({ variant: 'primary' })}>
                  Đến Phiếu cân
                </Link>
              )
            }
          >
            {hasFilter ? 'Thử từ khoá khác hoặc mở rộng khoảng ngày.' : 'Vào Phiếu cân, kết nối cân rồi bấm Lưu lượt cân (F2) — mỗi lượt cân sẽ hiện ở đây.'}
          </EmptyState>
        </div>
      ) : records.length > 0 ? (
        <div className={cx('transition-opacity', loading && 'opacity-60')} aria-busy={loading}>
          {/* Máy tính: bảng. Điện thoại: thẻ xếp dọc — bảng nhiều cột trên màn
              hình hẹp buộc phải cuộn ngang mới đọc được. */}
          <div className="hidden lg:block bg-scale-card rounded-2xl border border-scale-border overflow-hidden shadow-sm">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Bản ghi cân, trang {page} trên {pages}</caption>
                <thead className="bg-scale-muted border-b border-scale-border">
                  <tr className="text-left text-scale-muted-fg text-xs">
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
                    <tr key={r.id} className="hover:bg-scale-muted">
                      <td className="px-4 py-2 whitespace-nowrap text-scale-muted-fg">{fmtDate(r.weighedAt)}</td>
                      <td className="px-2 py-0.5 whitespace-nowrap">
                        {/* Bấm số phiếu để mở phiếu — sửa hay xoá lượt cân làm ở đó. */}
                        <Link
                          href={`/can-dien-tu?id=${r.ticket.id}`}
                          aria-label={`Mở phiếu số ${r.ticket.ticketNo}`}
                          className={cx(buttonClass({ variant: 'ghost' }), 'px-2 tabular-nums text-scale-primary underline-offset-4 hover:underline')}
                        >
                          #{r.ticket.ticketNo}
                        </Link>
                        {r.ticket.type === 'NHAP' && <span className="text-xs text-scale-muted-fg">Nhập</span>}
                      </td>
                      <td className="px-4 py-2 text-scale-fg max-w-[14rem] truncate" title={r.ticket.customerName ?? undefined}>
                        {r.ticket.customerName || <span className="text-scale-muted-fg">Khách lẻ</span>}
                      </td>
                      <td className="px-4 py-2 max-w-[14rem]">
                        <div className="font-medium text-scale-fg truncate" title={r.productName}>{r.productName}</div>
                        {r.productCode && <div className="text-xs text-scale-muted-fg">{r.productCode}</div>}
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums text-scale-muted-fg whitespace-nowrap">{fmtNum(r.grossWeight)}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-scale-muted-fg">{r.trayCount}</td>
                      <td className="px-4 py-2 text-right tabular-nums font-semibold text-scale-fg whitespace-nowrap">{fmtNum(r.netWeight)} kg</td>
                      <td className="px-4 py-2 text-right tabular-nums text-scale-fg whitespace-nowrap">{formatMoney(r.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <ul className="lg:hidden space-y-3">
            {records.map((r) => (
              <li key={r.id} className="bg-scale-card rounded-2xl border border-scale-border p-4 shadow-sm min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-scale-fg break-words">{r.productName}</p>
                    <p className="text-xs text-scale-muted-fg truncate">{r.ticket.customerName || 'Khách lẻ'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="tabular-nums font-bold text-scale-fg whitespace-nowrap">{fmtNum(r.netWeight)} kg</p>
                    <p className="tabular-nums text-sm text-scale-muted-fg whitespace-nowrap">{formatMoney(r.amount)} đ</p>
                  </div>
                </div>
                <p className="text-xs text-scale-muted-fg mt-2">
                  {fmtDate(r.weighedAt)} · cân {fmtNum(r.grossWeight)} kg, {r.trayCount} khay, trừ bì {fmtNum(r.tareWeight)} kg
                </p>
                <div className="mt-2 pt-2 border-t border-scale-border">
                  <Link href={`/can-dien-tu?id=${r.ticket.id}`} className={cx(buttonClass({ variant: 'ghost' }), '-mx-3 text-scale-primary')}>
                    Mở phiếu #{r.ticket.ticketNo}
                  </Link>
                </div>
              </li>
            ))}
          </ul>

          {pages > 1 && (
            <nav aria-label="Phân trang bản ghi" className="mt-4 flex items-center justify-between gap-3 flex-wrap">
              <p className="text-sm text-scale-muted-fg">
                Trang {page} / {pages} · {fmtNum(total)} lượt cân
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loading} className={buttonClass()}>
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Trang trước
                </button>
                <button type="button" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages || loading} className={buttonClass()}>
                  Trang sau <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </nav>
          )}
        </div>
      ) : null}
    </div>
  );
}

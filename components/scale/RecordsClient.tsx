'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, Loader2, ClipboardList, ChevronLeft, ChevronRight, Scale, FileSpreadsheet } from 'lucide-react';

interface Record {
  id: number;
  productCode: string;
  productName: string;
  weight: number;
  unit: string;
  employeeName: string | null;
  note: string | null;
  weighedAt: string;
}

const fmtNum = (n: number) => n.toLocaleString('vi-VN', { maximumFractionDigits: 3 });
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

/**
 * Danh sách bản ghi cân của khách đang đăng nhập.
 *
 * Máy chủ luôn lọc theo tài khoản (xem app/api/scale/records), nên trang này
 * không bao giờ nhận được dữ liệu của khách khác dù có sửa tham số trên URL.
 */
export default function RecordsClient() {
  const [records, setRecords] = useState<Record[]>([]);
  const [totalWeight, setTotalWeight] = useState(0);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
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

  const remove = async (id: number) => {
    setDeleting(id);
    try {
      const res = await fetch('/api/scale/records', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) load();
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Tổng hợp: tổng khối lượng tính trên TOÀN BỘ kết quả lọc, không chỉ
          trang đang xem — nếu không, đổi trang là con số nhảy lung tung. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-scale-card rounded-xl border border-scale-border p-4 flex items-center gap-4">
          <span className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-5 h-5 text-blue-700" aria-hidden="true" />
          </span>
          <div>
            <div className="text-2xl font-bold text-scale-fg">{fmtNum(total)}</div>
            <div className="text-xs text-scale-muted-fg">Lần cân</div>
          </div>
        </div>
        <div className="bg-scale-card rounded-xl border border-scale-border p-4 flex items-center gap-4">
          <span className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Scale className="w-5 h-5 text-scale-success" aria-hidden="true" />
          </span>
          <div>
            <div className="text-2xl font-bold text-scale-fg">{fmtNum(totalWeight)} kg</div>
            <div className="text-xs text-scale-muted-fg">Tổng khối lượng</div>
          </div>
        </div>
      </div>

      {/* Bộ lọc */}
      <form
        onSubmit={(e) => { e.preventDefault(); setPage(1); load(); }}
        className="bg-scale-card rounded-xl border border-scale-border p-4 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]"
      >
        <div className="relative">
          <label htmlFor="rec-search" className="sr-only">Tìm theo mặt hàng</label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-scale-muted-fg pointer-events-none" aria-hidden="true" />
          <input
            id="rec-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hàng, mã hàng, người cân…"
            className="w-full min-h-touch pl-9 pr-3 rounded-lg border border-scale-input text-sm focus:outline-none focus:ring-2 focus:ring-scale-ring"
          />
        </div>
        <div>
          <label htmlFor="rec-from" className="sr-only">Từ ngày</label>
          <input
            id="rec-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            className="min-h-touch px-3 rounded-lg border border-scale-input text-sm w-full focus:outline-none focus:ring-2 focus:ring-scale-ring"
          />
        </div>
        <div>
          <label htmlFor="rec-to" className="sr-only">Đến ngày</label>
          <input
            id="rec-to" type="date" value={to} onChange={(e) => setTo(e.target.value)}
            className="min-h-touch px-3 rounded-lg border border-scale-input text-sm w-full focus:outline-none focus:ring-2 focus:ring-scale-ring"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 sm:flex-none inline-flex items-center justify-center min-h-touch px-5 rounded-lg bg-scale-primary text-white text-sm font-semibold hover:bg-scale-primary-hover transition-colors"
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
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 min-h-touch px-4 rounded-lg border border-emerald-600 text-scale-success text-sm font-semibold hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
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
        <div className="bg-white rounded-xl border border-scale-border p-12 text-center">
          <ClipboardList className="w-10 h-10 text-scale-muted-fg mx-auto mb-3" aria-hidden="true" />
          <p className="font-semibold text-scale-fg">Chưa có bản ghi nào</p>
          <p className="text-sm text-scale-muted-fg mt-1">
            Vào <strong>Màn hình cân</strong> để kết nối cân và lưu lần cân đầu tiên.
          </p>
        </div>
      ) : (
        <>
          {/* Máy tính: bảng. Điện thoại: thẻ xếp dọc — bảng 6 cột trên màn
              hình 390px buộc phải cuộn ngang mới đọc được (tiêu chí 6). */}
          <div className="hidden md:block bg-scale-card rounded-xl border border-scale-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-scale-muted border-b border-scale-border">
                <tr className="text-left text-scale-muted-fg">
                  <th scope="col" className="px-4 py-3 font-semibold">Thời gian</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Mặt hàng</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right">Khối lượng</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Người cân</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Ghi chú</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-scale-border">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-scale-muted/70">
                    <td className="px-4 py-3 whitespace-nowrap text-scale-muted-fg">{fmtDate(r.weighedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-scale-fg">{r.productName}</div>
                      {r.productCode && <div className="text-xs text-scale-muted-fg">{r.productCode}</div>}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-scale-fg whitespace-nowrap">
                      {fmtNum(r.weight)} {r.unit}
                    </td>
                    <td className="px-4 py-3 text-scale-muted-fg">{r.employeeName || '—'}</td>
                    <td className="px-4 py-3 text-scale-muted-fg max-w-[200px] truncate">{r.note || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => remove(r.id)}
                        disabled={deleting === r.id}
                        aria-label={`Xoá bản ghi ${r.productName} lúc ${fmtDate(r.weighedAt)}`}
                        className="inline-flex items-center justify-center min-w-touch min-h-touch rounded-lg text-scale-muted-fg hover:text-scale-danger hover:bg-scale-danger-soft disabled:opacity-40 transition-colors"
                      >
                        {deleting === r.id
                          ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                          : <Trash2 className="w-4 h-4" aria-hidden="true" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="md:hidden space-y-3">
            {records.map((r) => (
              <li key={r.id} className="bg-scale-card rounded-xl border border-scale-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-scale-fg">{r.productName}</div>
                    {r.productCode && <div className="text-xs text-scale-muted-fg">{r.productCode}</div>}
                  </div>
                  <div className="font-mono font-bold text-scale-fg whitespace-nowrap">
                    {fmtNum(r.weight)} {r.unit}
                  </div>
                </div>
                <div className="text-xs text-scale-muted-fg mt-2">{fmtDate(r.weighedAt)}</div>
                {(r.employeeName || r.note) && (
                  <div className="text-xs text-scale-muted-fg mt-1">
                    {r.employeeName && <span>Người cân: {r.employeeName}</span>}
                    {r.employeeName && r.note && <span> · </span>}
                    {r.note && <span>{r.note}</span>}
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-scale-border">
                  <button
                    type="button"
                    onClick={() => remove(r.id)}
                    disabled={deleting === r.id}
                    className="inline-flex items-center gap-1.5 min-h-touch px-3 rounded-lg text-sm text-scale-danger hover:bg-scale-danger-soft disabled:opacity-40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" /> Xoá
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {pages > 1 && (
            <nav aria-label="Phân trang bản ghi" className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-sm text-scale-muted-fg">Trang {page} / {pages} · {fmtNum(total)} bản ghi</p>
              <div className="flex gap-2">
                <button
                  type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="inline-flex items-center gap-1 min-h-touch px-4 rounded-lg border border-scale-input bg-white text-sm font-medium text-scale-fg hover:border-slate-400 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Trước
                </button>
                <button
                  type="button" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages}
                  className="inline-flex items-center gap-1 min-h-touch px-4 rounded-lg border border-scale-input bg-white text-sm font-medium text-scale-fg hover:border-slate-400 disabled:opacity-40 disabled:cursor-not-allowed"
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

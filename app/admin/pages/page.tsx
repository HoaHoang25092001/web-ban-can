'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { useToast } from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import {
  FileText, Plus, Search, Pencil, Trash2, ExternalLink,
  Eye, EyeOff, Loader2, ChevronLeft, ChevronRight,
} from 'lucide-react';

interface PageRow {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  image: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

const PER_PAGE = 20;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

/**
 * Danh sách trang nội dung.
 *
 * Website cũ (WordPress) quản lý hơn 1.600 trang kiểu "Bán cân điện tử tại
 * [tỉnh]" ở đây. Bản React trước đó không có màn hình này: mọi trang đều viết
 * cứng trong mã nguồn, muốn thêm một trang mới phải nhờ lập trình viên.
 */
export default function AdminPagesPage() {
  const toast = useToast();
  const [rows, setRows] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<PageRow | null>(null);
  const [counts, setCounts] = useState({ all: 0, published: 0, draft: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PER_PAGE) });
      if (filter === 'published') params.set('published', 'true');
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/pages?${params}`);
      if (res.status === 401) { setSessionExpired(true); return; }
      if (!res.ok) { toast.error('Không tải được danh sách trang'); return; }

      const data = await res.json();
      let list: PageRow[] = data.pages ?? [];
      /*
       * API chỉ lọc được "đã đăng" (published=true). Lọc "bản nháp" làm ở đây
       * vì thêm một tham số ngược nữa vào API sẽ khiến phân trang phía máy chủ
       * đếm sai. Số trang nháp thực tế rất ít nên không ảnh hưởng hiệu năng.
       */
      if (filter === 'draft') list = list.filter((p) => !p.published);

      setRows(list);
      setTotal(data.pagination?.total ?? list.length);
      setTotalPages(Math.max(1, data.pagination?.pages ?? 1));
    } catch {
      toast.error('Không tải được danh sách trang', 'Kiểm tra kết nối rồi thử lại');
    } finally {
      setLoading(false);
    }
  }, [page, filter, search, toast]);

  useEffect(() => { load(); }, [load]);

  /* Số đếm trên các tab lấy riêng, không phụ thuộc trang đang xem — nếu đếm
     theo `rows` thì sang trang 2 con số sẽ nhảy lung tung. */
  useEffect(() => {
    (async () => {
      try {
        const [allRes, pubRes] = await Promise.all([
          fetch('/api/pages?limit=1'),
          fetch('/api/pages?published=true&limit=1'),
        ]);
        if (!allRes.ok || !pubRes.ok) return;
        const all = (await allRes.json()).pagination?.total ?? 0;
        const published = (await pubRes.json()).pagination?.total ?? 0;
        setCounts({ all, published, draft: all - published });
      } catch { /* số đếm chỉ để tham khảo, lỗi thì bỏ qua */ }
    })();
  }, [rows]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/pages/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Đã xoá trang', deleteTarget.title);
        setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error('Không xoá được', err.error || 'Vui lòng thử lại');
      }
    } catch {
      toast.error('Không xoá được', 'Không kết nối được tới máy chủ');
    } finally {
      setDeleteTarget(null);
    }
  };

  const changeFilter = (f: typeof filter) => { setFilter(f); setPage(1); };

  if (sessionExpired) {
    return (
      <AdminLayout>
        <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl border border-amber-200 p-8 text-center">
          <h1 className="text-lg font-bold text-gray-900 mb-2">Phiên đăng nhập đã hết hạn</h1>
          <p className="text-sm text-gray-600 mb-6">
            Dữ liệu vẫn còn nguyên. Bạn chỉ cần đăng nhập lại để tiếp tục.
          </p>
          <a
            href="/admin/login"
            className="inline-flex items-center justify-center min-h-touch px-5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Đăng nhập lại
          </a>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Trang</h1>
            <p className="text-sm text-gray-500 mt-1">
              Trang nội dung tự tạo, ví dụ trang giới thiệu dịch vụ hoặc khu vực bán hàng.
            </p>
          </div>
          <Link
            href="/admin/pages/new"
            className="inline-flex items-center justify-center gap-2 min-h-touch px-5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors flex-shrink-0"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Thêm trang mới
          </Link>
        </div>

        {/* Bộ lọc trạng thái + tìm kiếm */}
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc theo trạng thái">
            {([
              ['all', 'Tất cả', counts.all],
              ['published', 'Đã xuất bản', counts.published],
              ['draft', 'Bản nháp', counts.draft],
            ] as const).map(([key, label, count]) => (
              <button
                key={key}
                onClick={() => changeFilter(key)}
                aria-pressed={filter === key}
                className={`inline-flex items-center gap-2 min-h-touch px-4 rounded-lg text-sm font-medium border transition-colors ${
                  filter === key
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                {label}
                <span className={`text-xs ${filter === key ? 'text-blue-100' : 'text-gray-500'}`}>
                  ({count})
                </span>
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); setPage(1); load(); }}
            className="relative lg:w-80"
          >
            <label htmlFor="page-search" className="sr-only-text">Tìm kiếm trang</label>
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="page-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tiêu đề hoặc đường dẫn"
              className="w-full min-h-touch pl-9 pr-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </form>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-500 gap-3">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            <span className="text-sm">Đang tải danh sách trang…</span>
          </div>
        ) : rows.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" aria-hidden="true" />
            <h2 className="font-semibold text-gray-900">
              {search.trim() ? 'Không tìm thấy trang nào' : 'Chưa có trang nào'}
            </h2>
            <p className="text-sm text-gray-500 mt-1 mb-6">
              {search.trim()
                ? 'Thử từ khoá khác hoặc xoá ô tìm kiếm.'
                : 'Tạo trang đầu tiên để giới thiệu dịch vụ hoặc khu vực bán hàng.'}
            </p>
            {!search.trim() && (
              <Link
                href="/admin/pages/new"
                className="inline-flex items-center gap-2 min-h-touch px-5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Thêm trang mới
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Máy tính: bảng. Điện thoại: thẻ xếp dọc — bảng 5 cột trên màn
                hình 390px buộc người dùng cuộn ngang để đọc (tiêu chí 6). */}
            <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-left text-gray-600">
                    <th scope="col" className="px-5 py-3 font-semibold">Tiêu đề</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Đường dẫn</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Trạng thái</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Ngày tạo</th>
                    <th scope="col" className="px-5 py-3 font-semibold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/70">
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/pages/edit/${row.id}`}
                          className="font-medium text-gray-900 hover:text-blue-700 hover:underline"
                        >
                          {row.title}
                        </Link>
                        {row.excerpt && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-md">
                            {row.excerpt}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs text-gray-600 break-all">
                          /trang/{row.slug}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge published={row.published} />
                      </td>
                      <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                        {formatDate(row.createdAt)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <RowActions row={row} onDelete={() => setDeleteTarget(row)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="md:hidden space-y-3">
              {rows.map((row) => (
                <li key={row.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/admin/pages/edit/${row.id}`}
                      className="font-semibold text-gray-900 hover:text-blue-700 leading-snug"
                    >
                      {row.title}
                    </Link>
                    <StatusBadge published={row.published} />
                  </div>
                  <p className="font-mono text-xs text-gray-500 mt-1.5 break-all">
                    /trang/{row.slug}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Tạo ngày {formatDate(row.createdAt)}</p>
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
                    <RowActions row={row} onDelete={() => setDeleteTarget(row)} withLabels />
                  </div>
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <nav
                aria-label="Phân trang danh sách trang"
                className="flex items-center justify-between gap-3 flex-wrap"
              >
                <p className="text-sm text-gray-600">
                  Trang {page} trên {totalPages} · {total} mục
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="inline-flex items-center gap-1 min-h-touch px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    Trước
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="inline-flex items-center gap-1 min-h-touch px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Sau
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </nav>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Xoá trang này?"
        message={
          deleteTarget
            ? `Trang "${deleteTarget.title}" sẽ bị xoá vĩnh viễn. Khách truy cập đường dẫn /trang/${deleteTarget.slug} sẽ gặp lỗi không tìm thấy.`
            : ''
        }
        confirmText="Xoá trang"
        cancelText="Giữ lại"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        variant="danger"
      />
    </AdminLayout>
  );
}

function StatusBadge({ published }: { published: boolean }) {
  /* Kèm biểu tượng và chữ, không chỉ dùng màu: người mù màu vẫn phân biệt được
     đã đăng hay còn nháp (tiêu chí 5). */
  return published ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
      Đã xuất bản
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
      <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
      Bản nháp
    </span>
  );
}

function RowActions({
  row, onDelete, withLabels = false,
}: {
  row: PageRow;
  onDelete: () => void;
  withLabels?: boolean;
}) {
  const base =
    'inline-flex items-center justify-center gap-1.5 min-h-touch min-w-touch px-2.5 rounded-lg text-sm transition-colors';
  return (
    <>
      <Link
        href={`/admin/pages/edit/${row.id}`}
        className={`${base} text-gray-600 hover:text-blue-700 hover:bg-blue-50`}
      >
        <Pencil className="h-4 w-4" aria-hidden="true" />
        {withLabels ? <span>Sửa</span> : <span className="sr-only-text">Sửa {row.title}</span>}
      </Link>

      {/* Chỉ xem được trang đã đăng: bản nháp mở ra sẽ báo lỗi 404, khiến chủ
          shop tưởng trang bị hỏng. */}
      {row.published && (
        <a
          href={`/trang/${row.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${base} text-gray-600 hover:text-emerald-700 hover:bg-emerald-50`}
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          {withLabels ? <span>Xem</span> : <span className="sr-only-text">Xem {row.title} trên website</span>}
        </a>
      )}

      <button
        onClick={onDelete}
        className={`${base} text-gray-600 hover:text-red-700 hover:bg-red-50`}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        {withLabels ? <span>Xoá</span> : <span className="sr-only-text">Xoá {row.title}</span>}
      </button>
    </>
  );
}

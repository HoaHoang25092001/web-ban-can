'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { useToast } from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import { isOptimizableImage } from '@/lib/image';
import {
  Images, Search, Trash2, Copy, ExternalLink, ImageOff,
  Loader2, HardDrive, Link2,
} from 'lucide-react';

interface MediaFile {
  key: string;
  name: string;
  size: number;
  url: string;
  uploadedAt: number;
  usedBy: { type: string; id: number; label: string }[];
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const TYPE_LABEL: Record<string, string> = {
  product: 'Sản phẩm',
  news: 'Bài viết',
  category: 'Danh mục',
};

/** Đường dẫn tới trang đang dùng ảnh, để bấm là xem được ngay. */
const linkTo = (u: { type: string; id: number }) =>
  u.type === 'product'
    ? `/admin/products/edit/${u.id}`
    : u.type === 'news'
    ? `/admin/news/edit/${u.id}`
    : `/admin/categories/edit/${u.id}`;

/**
 * Thư viện ảnh.
 *
 * Trước đây không có chỗ nào xem được toàn bộ ảnh đã tải lên: muốn biết ảnh
 * nào còn dùng, ảnh nào bỏ không, phải mở từng sản phẩm ra kiểm tra. Trang này
 * liệt kê tất cả kèm thông tin ảnh đang nằm ở đâu (tiêu chí 1 & 4).
 */
export default function MediaPage() {
  const toast = useToast();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'used' | 'unused'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; file: MediaFile | null }>({
    isOpen: false,
    file: null,
  });

  const load = useCallback(async (p: number) => {
    if (p === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const res = await fetch(`/api/media?page=${p}&limit=48`);
      if (res.status === 401) {
        setSessionExpired(true);
        return;
      }
      if (!res.ok) {
        toast.error('Không tải được thư viện', 'Vui lòng thử lại.');
        return;
      }
      const data = await res.json();
      setFiles((prev) => (p === 1 ? data.files : [...prev, ...data.files]));
      setHasMore(data.pagination?.hasMore ?? false);
    } catch {
      toast.error('Không tải được thư viện', 'Kiểm tra kết nối rồi thử lại.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [toast]);

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Đã sao chép đường dẫn ảnh');
    } catch {
      toast.error('Không sao chép được', 'Trình duyệt không cho phép truy cập clipboard.');
    }
  };

  const confirmDelete = async () => {
    const file = deleteConfirm.file;
    if (!file) return;
    try {
      const res = await fetch('/api/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: file.key, url: file.url }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.key !== file.key));
        toast.success('Đã xoá ảnh', file.name);
      } else {
        toast.error('Không xoá được', data.error || 'Vui lòng thử lại.');
      }
    } catch {
      toast.error('Không xoá được', 'Không kết nối được tới máy chủ.');
    } finally {
      setDeleteConfirm({ isOpen: false, file: null });
    }
  };

  const visible = files
    .filter((f) => (filter === 'used' ? f.usedBy.length > 0 : filter === 'unused' ? f.usedBy.length === 0 : true))
    .filter((f) => !search.trim() || f.name.toLowerCase().includes(search.toLowerCase().trim()));

  const counts = {
    all: files.length,
    used: files.filter((f) => f.usedBy.length > 0).length,
    unused: files.filter((f) => f.usedBy.length === 0).length,
  };
  const totalSize = files.reduce((s, f) => s + f.size, 0);

  if (sessionExpired) {
    return (
      <AdminLayout>
        <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl border border-amber-200 p-8 text-center">
          <h1 className="text-lg font-bold text-gray-900 mb-2">Phiên đăng nhập đã hết hạn</h1>
          <p className="text-sm text-gray-600 mb-6">
            Ảnh vẫn còn nguyên. Bạn chỉ cần đăng nhập lại để tiếp tục.
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
        {/* Tiêu đề */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thư viện ảnh</h1>
          <p className="text-sm text-gray-500 mt-1">
            Toàn bộ ảnh đã tải lên website. Bấm vào ảnh để xem nơi đang sử dụng.
          </p>
        </div>

        {/* Thống kê */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Images className="h-5 w-5 text-blue-600" aria-hidden="true" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{counts.all}</div>
              <div className="text-xs text-gray-500 whitespace-nowrap">Ảnh đã tải lên</div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Link2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{counts.used}</div>
              <div className="text-xs text-gray-500 whitespace-nowrap">Đang được sử dụng</div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <HardDrive className="h-5 w-5 text-amber-600" aria-hidden="true" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{formatSize(totalSize)}</div>
              <div className="text-xs text-gray-500 whitespace-nowrap">Dung lượng đã dùng</div>
            </div>
          </div>
        </div>

        {/* Tìm kiếm + lọc */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <label htmlFor="media-search" className="sr-only">
              Tìm ảnh theo tên tệp
            </label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" aria-hidden="true" />
            <input
              id="media-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên tệp…"
              className="w-full pl-9 pr-4 min-h-touch bg-white border border-gray-200 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div role="group" aria-label="Lọc ảnh" className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm flex-shrink-0">
            {([
              { key: 'all', label: 'Tất cả' },
              { key: 'used', label: 'Đang dùng' },
              { key: 'unused', label: 'Chưa dùng' },
            ] as const).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setFilter(t.key)}
                aria-pressed={filter === t.key}
                className={`inline-flex items-center justify-center min-h-touch px-4 rounded-md text-sm font-medium transition-all ${
                  filter === t.key ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t.label}
                <span className="ml-1.5 text-xs">({counts[t.key]})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Lưới ảnh */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4" aria-busy="true">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
            <ImageOff className="h-12 w-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-gray-700 mb-1">
              {search ? 'Không tìm thấy ảnh nào khớp' : filter === 'unused' ? 'Mọi ảnh đều đang được dùng' : 'Thư viện chưa có ảnh'}
            </h2>
            <p className="text-sm text-gray-500">
              {search ? 'Thử từ khoá khác.' : 'Ảnh tải lên khi thêm sản phẩm hoặc bài viết sẽ hiện ở đây.'}
            </p>
          </div>
        ) : (
          <>
            <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {visible.map((f) => (
                <li key={f.key} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group">
                  <div className="relative aspect-square bg-gray-50">
                    <Image
                      src={f.url}
                      alt=""
                      fill
                      sizes="200px"
                      loading="lazy"
                      unoptimized={!isOptimizableImage(f.url)}
                      className="object-contain p-2"
                    />
                    {/* Nhãn trạng thái: dùng cả chữ lẫn màu, không chỉ dựa vào
                        màu sắc để truyền đạt thông tin (tiêu chí 5). */}
                    <span
                      className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        f.usedBy.length > 0
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {f.usedBy.length > 0 ? 'Đang dùng' : 'Chưa dùng'}
                    </span>
                  </div>

                  <div className="p-3 space-y-2">
                    <p className="text-xs text-gray-500">{formatSize(f.size)}</p>

                    {f.usedBy.length > 0 ? (
                      <div className="space-y-1">
                        {f.usedBy.slice(0, 2).map((u, i) => (
                          <Link
                            key={i}
                            href={linkTo(u)}
                            className="flex items-start gap-1 min-h-touch sm:min-h-0 py-1.5 sm:py-0 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                            title={`${TYPE_LABEL[u.type] ?? u.type}: ${u.label}`}
                          >
                            <ExternalLink className="h-3 w-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                            <span className="line-clamp-1">{u.label}</span>
                          </Link>
                        ))}
                        {f.usedBy.length > 2 && (
                          <p className="text-xs text-gray-500">+{f.usedBy.length - 2} nơi khác</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">Không nơi nào dùng</p>
                    )}

                    <div className="flex items-center gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => copyUrl(f.url)}
                        aria-label={`Sao chép đường dẫn ảnh ${f.name}`}
                        className="inline-flex items-center justify-center w-11 h-11 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Copy className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Mở ảnh ${f.name} trong tab mới`}
                        className="inline-flex items-center justify-center w-11 h-11 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm({ isOpen: true, file: f })}
                        disabled={f.usedBy.length > 0}
                        aria-label={
                          f.usedBy.length > 0
                            ? `Không xoá được ${f.name} vì đang được sử dụng`
                            : `Xoá ảnh ${f.name}`
                        }
                        title={f.usedBy.length > 0 ? 'Ảnh đang được dùng, không xoá được' : 'Xoá ảnh'}
                        className="ml-auto inline-flex items-center justify-center w-11 h-11 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {hasMore && !search && filter === 'all' && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    const next = page + 1;
                    setPage(next);
                    load(next);
                  }}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 min-h-touch px-5 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Đang tải…
                    </>
                  ) : (
                    'Tải thêm ảnh'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onCancel={() => setDeleteConfirm({ isOpen: false, file: null })}
        onConfirm={confirmDelete}
        title="Xoá ảnh khỏi thư viện?"
        message={
          deleteConfirm.file
            ? `Ảnh "${deleteConfirm.file.name}" sẽ bị xoá vĩnh viễn khỏi máy chủ lưu trữ và không khôi phục được.`
            : ''
        }
        confirmText="Xoá vĩnh viễn"
        cancelText="Giữ lại"
        variant="danger"
      />
    </AdminLayout>
  );
}

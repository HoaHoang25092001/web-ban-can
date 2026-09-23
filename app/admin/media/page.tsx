'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { useToast } from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import { isOptimizableImage } from '@/lib/image';
import {
  Images, Search, Trash2, Copy, ExternalLink, ImageOff,
  Loader2, HardDrive, Link2, Upload, X, ChevronLeft, ChevronRight,
  LayoutGrid, Grid2x2, Rows3,
} from 'lucide-react';
import { useUploadThing } from '@/lib/uploadthing-client';

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

/**
 * Số cột theo cỡ hiển thị.
 *
 * Nhỏ: xem lướt nhiều ảnh cùng lúc để tìm nhanh.
 * Vừa: mặc định, cân bằng giữa số lượng và độ rõ.
 * Lớn: nhìn rõ chi tiết, hợp khi cần so sánh hoặc kiểm tra chất lượng ảnh.
 */
const GRID_COLS: Record<'S' | 'M' | 'L', string> = {
  S: 'grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10',
  M: 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
  L: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  /* Hiện "Đang tải 3/8…" thay vì chỉ một vòng xoay: tải 20 ảnh mất khá lâu,
     không có tiến độ thì người dùng tưởng máy treo và bấm lại (tiêu chí 8). */
  const [uploadTotal, setUploadTotal] = useState(0);
  const [uploadDone, setUploadDone] = useState(0);
  /* Vị trí ảnh đang xem phóng to trong danh sách `visible`; null = đang đóng.
     Lưu VỊ TRÍ chứ không lưu cả object ảnh để bấm mũi tên chuyển sang ảnh
     kế tiếp mà không phải dò lại danh sách. */
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  /* Cỡ hiển thị: ảnh nhỏ thì thấy được nhiều tấm một lúc, ảnh lớn thì nhìn
     rõ chi tiết. Nhớ lựa chọn để lần sau vào không phải chỉnh lại. */
  const [size, setSize] = useState<'S' | 'M' | 'L'>('M');

  useEffect(() => {
    const saved = localStorage.getItem('media-size');
    if (saved === 'S' || saved === 'M' || saved === 'L') setSize(saved);
  }, []);
  const changeSize = (s: 'S' | 'M' | 'L') => {
    setSize(s);
    try { localStorage.setItem('media-size', s); } catch { /* chế độ riêng tư */ }
  };

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

  const { startUpload } = useUploadThing('libraryUploader');

  const MAX_MB = 4;
  const MAX_FILES = 20;
  const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  /**
   * Tải một loạt ảnh lên kho.
   *
   * Lọc bỏ file không hợp lệ TRƯỚC khi gửi đi và nói rõ từng file sai ở đâu.
   * Nếu để máy chủ từ chối thì người dùng chỉ nhận một lỗi chung chung, không
   * biết tấm nào có vấn đề trong 20 tấm vừa chọn (tiêu chí 8).
   */
  const uploadFiles = useCallback(
    async (fileList: File[]) => {
      if (!fileList.length || uploading) return;

      const tooMany = fileList.length > MAX_FILES;
      const batch = tooMany ? fileList.slice(0, MAX_FILES) : fileList;
      if (tooMany) {
        toast.error(
          `Chỉ tải được ${MAX_FILES} ảnh một lượt`,
          `Bạn chọn ${fileList.length} ảnh. Hệ thống sẽ tải ${MAX_FILES} ảnh đầu, phần còn lại hãy tải tiếp sau.`
        );
      }

      const wrongType = batch.filter((f) => !ALLOWED.includes(f.type));
      const tooBig = batch.filter((f) => ALLOWED.includes(f.type) && f.size > MAX_MB * 1024 * 1024);
      const ok = batch.filter((f) => ALLOWED.includes(f.type) && f.size <= MAX_MB * 1024 * 1024);

      if (wrongType.length) {
        toast.error(
          `${wrongType.length} tệp không phải ảnh`,
          `${wrongType.slice(0, 3).map((f) => f.name).join(', ')}${wrongType.length > 3 ? '…' : ''} — chỉ nhận JPG, PNG, WebP, GIF.`
        );
      }
      if (tooBig.length) {
        toast.error(
          `${tooBig.length} ảnh vượt quá ${MAX_MB}MB`,
          `${tooBig.slice(0, 3).map((f) => `${f.name} (${(f.size / 1048576).toFixed(1)}MB)`).join(', ')}${tooBig.length > 3 ? '…' : ''}`
        );
      }
      if (!ok.length) return;

      setUploading(true);
      setUploadTotal(ok.length);
      setUploadDone(0);
      try {
        const res = await startUpload(ok);
        if (!res) {
          toast.error('Tải ảnh thất bại', 'Máy chủ không nhận được ảnh. Vui lòng thử lại.');
          return;
        }
        setUploadDone(res.length);
        toast.success(
          `Đã tải lên ${res.length} ảnh`,
          res.length === 1 ? ok[0].name : 'Ảnh đã có trong thư viện.'
        );
        // Đọc lại từ máy chủ để thấy ảnh mới, thay vì tự chèn vào danh sách.
        setPage(1);
        await load(1);
      } catch (err) {
        toast.error(
          'Tải ảnh thất bại',
          err instanceof Error ? err.message : 'Vui lòng kiểm tra kết nối rồi thử lại.'
        );
      } finally {
        setUploading(false);
        setUploadTotal(0);
        setUploadDone(0);
      }
    },
    [startUpload, toast, uploading, load]
  );

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []);
    // Xoá giá trị để chọn LẠI đúng tệp vừa rồi vẫn kích hoạt onChange.
    e.target.value = '';
    uploadFiles(list);
  };

  const onDropFiles = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(Array.from(e.dataTransfer.files ?? []));
  };

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
        /*
         * Tải lại danh sách từ máy chủ sau khi xoá.
         *
         * Trước đây chỉ gỡ thẻ ảnh khỏi màn hình rồi thôi. Nếu máy chủ không
         * thực sự xoá được, người dùng vẫn thấy "đã xoá" cho tới khi tải lại
         * trang — lúc đó ảnh hiện lại và không hiểu vì sao. Đọc lại từ nguồn
         * thật để màn hình luôn khớp với dữ liệu trên máy chủ (tiêu chí 8).
         */
        load(1);
        setPage(1);
      } else {
        toast.error('Không xoá được', data.error || 'Vui lòng thử lại.');
        // Xoá hụt thì danh sách hiện tại có thể đã sai — đọc lại cho chắc.
        load(1);
        setPage(1);
      }
    } catch {
      toast.error('Không xoá được', 'Không kết nối được tới máy chủ.');
    } finally {
      setDeleteConfirm({ isOpen: false, file: null });
    }
  };

  /**
   * Đóng/chuyển ảnh trong khung xem phóng to bằng bàn phím.
   *
   * Người quản trị duyệt hàng chục ảnh liên tiếp — bắt họ đóng khung rồi bấm
   * sang tấm kế tiếp là thừa một thao tác mỗi lần. Mũi tên trái/phải chuyển
   * ảnh, Esc đóng (tiêu chí 5).
   */
  const visible = files
    .filter((f) => (filter === 'used' ? f.usedBy.length > 0 : filter === 'unused' ? f.usedBy.length === 0 : true))
    .filter((f) => !search.trim() || f.name.toLowerCase().includes(search.toLowerCase().trim()));

  const viewing = viewerIndex !== null ? visible[viewerIndex] : null;

  useEffect(() => {
    if (viewerIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewerIndex(null);
      if (e.key === 'ArrowLeft') setViewerIndex((i) => (i === null || i <= 0 ? i : i - 1));
      if (e.key === 'ArrowRight')
        setViewerIndex((i) => (i === null || i >= visible.length - 1 ? i : i + 1));
    };
    document.addEventListener('keydown', onKey);
    // Khoá cuộn nền để cuộn chuột tác động vào khung xem, không phải trang sau.
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [viewerIndex, visible.length]);

  /*
   * Lọc/tìm kiếm làm danh sách ngắn lại — vị trí đang xem có thể trỏ ra ngoài
   * mảng và khung xem hiện trắng trơn. Đóng khung khi điều đó xảy ra.
   */
  useEffect(() => {
    if (viewerIndex !== null && viewerIndex >= visible.length) setViewerIndex(null);
  }, [viewerIndex, visible.length]);

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
        {/* Tiêu đề + nút tải lên */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Thư viện ảnh</h1>
            <p className="text-sm text-gray-500 mt-1">
              Toàn bộ ảnh đã tải lên website. Bấm vào ảnh để xem nơi đang sử dụng.
            </p>
          </div>

          {/* Nút tải lên là hành động chính của trang này → đặt nổi bật ở góc
              phải trên, đúng chỗ người dùng quen tìm (tiêu chí 1). */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center justify-center gap-2 min-h-touch px-5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Đang tải {uploadDone}/{uploadTotal}…
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" aria-hidden="true" />
                Tải ảnh lên
              </>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            multiple
            hidden
            onChange={onPickFiles}
          />
        </div>

        {/* Vùng kéo-thả: người dùng quen kéo cả thư mục ảnh vào thay vì bấm
            nút rồi tìm lại trong hộp thoại chọn tệp. */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDropFiles}
          className={`rounded-xl border-2 border-dashed p-5 text-center transition-colors ${
            dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
          }`}
        >
          <p className="text-sm text-gray-600">
            Kéo ảnh vào đây để tải lên, hoặc{' '}
            {/* py-2.5 nới vùng chạm cho đủ 44px: đây là chữ nằm giữa câu nên
                không đặt thành khối vuông được, nhưng vẫn phải bấm trúng
                bằng ngón tay (tiêu chí 5). */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center min-h-touch px-1 font-semibold text-blue-700 hover:underline"
            >
              chọn từ máy tính
            </button>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            JPG, PNG, WebP, GIF · tối đa 4MB mỗi ảnh · tối đa 20 ảnh một lượt
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

          {/* Chọn cỡ ảnh hiển thị */}
          <div
            role="group"
            aria-label="Cỡ ảnh hiển thị"
            className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm flex-shrink-0"
          >
            {([
              { key: 'S', label: 'Nhỏ', Icon: LayoutGrid },
              { key: 'M', label: 'Vừa', Icon: Grid2x2 },
              { key: 'L', label: 'Lớn', Icon: Rows3 },
            ] as const).map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => changeSize(key)}
                aria-pressed={size === key}
                title={`Ảnh cỡ ${label.toLowerCase()}`}
                /* min-w-touch: trên điện thoại nhãn chữ bị ẩn, chỉ còn biểu
                   tượng 16px nên nút co lại 40px — hụt so với vùng chạm 44px. */
                className={`inline-flex items-center justify-center gap-1.5 min-h-touch min-w-touch px-3 rounded-md text-sm font-medium transition-all ${
                  size === key ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{label}</span>
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
            {/*
              Lưới ảnh.

              Bản trước mỗi thẻ cao 301px mà vùng ảnh chỉ 174px — hơn 40%
              chiều cao dành cho chữ và ba nút bấm luôn hiện. Ảnh nhỏ, lại
              không bấm xem to được, nên muốn nhìn rõ phải mở từng tab mới.

              Nay ảnh chiếm gần trọn thẻ; thông tin và nút chỉ hiện khi rê
              chuột (máy tính) hoặc nằm trong khung xem phóng to. Bấm vào ảnh
              là phóng to ngay tại chỗ (tiêu chí 1 & 3).
            */}
            <ul className={`grid gap-3 ${GRID_COLS[size]}`}>
              {visible.map((f, idx) => (
                <li
                  key={f.key}
                  className="relative group bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setViewerIndex(idx)}
                    aria-label={`Xem lớn ảnh ${f.name}`}
                    className="block w-full relative aspect-square bg-gray-50 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset"
                  >
                    <Image
                      src={f.url}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 50vw, 300px"
                      loading="lazy"
                      unoptimized={!isOptimizableImage(f.url)}
                      className="object-contain p-1.5"
                    />
                  </button>

                  {/* Chấm trạng thái nhỏ, kèm title để biết nghĩa khi rê chuột.
                      Nhãn chữ đầy đủ nằm trong khung xem phóng to. */}
                  <span
                    title={f.usedBy.length > 0 ? 'Đang được sử dụng' : 'Chưa dùng ở đâu'}
                    className={`pointer-events-none absolute top-2 left-2 flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
                      f.usedBy.length > 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {f.usedBy.length > 0 ? 'Đang dùng' : 'Chưa dùng'}
                  </span>

                  {/* Thanh nút: ẩn cho tới khi rê chuột trên máy tính, nhưng
                      LUÔN hiện trên cảm ứng — màn hình cảm ứng không có trạng
                      thái "rê chuột" nên ẩn đi là không bấm được (tiêu chí 5). */}
                  {/* Không dùng padding ngang: thẻ trên điện thoại chỉ rộng
                      173px, thêm padding là ba nút 44px bị bóp còn 40px. */}
                  <div className="absolute inset-x-0 bottom-0 flex items-center bg-gradient-to-t from-black/70 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => copyUrl(f.url)}
                      aria-label={`Sao chép đường dẫn ảnh ${f.name}`}
                      title="Sao chép đường dẫn"
                      className="inline-flex items-center justify-center min-w-touch min-h-touch rounded-lg text-white hover:bg-white/25 transition-colors"
                    >
                      <Copy className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Mở ảnh ${f.name} trong tab mới`}
                      title="Mở trong tab mới"
                      className="inline-flex items-center justify-center min-w-touch min-h-touch rounded-lg text-white hover:bg-white/25 transition-colors"
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
                      className="ml-auto inline-flex items-center justify-center min-w-touch min-h-touch rounded-lg text-red-300 hover:text-white hover:bg-red-600/80 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
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

      {/*
        Khung xem ảnh phóng to.

        Bản trước muốn nhìn rõ một tấm phải bấm "mở tab mới" — xem xong đóng
        tab, quay lại, tìm tấm kế tiếp. Với vài chục ảnh thì đó là hàng chục
        lần chuyển tab. Nay bấm vào ảnh là xem ngay tại chỗ, mũi tên hoặc
        phím ←/→ chuyển tấm, Esc đóng (tiêu chí 1 & 5).
      */}
      {viewing && viewerIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Xem ảnh ${viewing.name}`}
          /*
           * `grid-rows-[auto_1fr_auto]` thay cho flex-1: trong một khối
           * `fixed`, `flex-1 min-h-0` không chốt được chiều cao nên ảnh tràn
           * quá đáy màn hình và nền tối không phủ hết. Lưới ba hàng cố định
           * ràng buộc hàng giữa đúng bằng phần còn lại của màn hình.
           *
           * `h-screen w-screen` viết tường minh thay vì chỉ dựa vào inset-0
           * để kích thước không phụ thuộc vào cách cha định vị.
           */
          /* Nền ĐỤC hoàn toàn, không dùng độ mờ. Ở mức /90 hay /95, chữ đen
             của menu quản trị phía sau vẫn đọc được xuyên qua, làm nền ảnh
             trông lem nhem và khó nhìn rõ chi tiết ảnh (tiêu chí 3). */
          className="fixed inset-0 h-screen w-screen z-[70] bg-slate-900 grid grid-cols-[100%] grid-rows-[auto_1fr_auto] overflow-hidden"
          onClick={() => setViewerIndex(null)}
        >
          {/* Thanh trên: tên ảnh + vị trí + nút đóng */}
          <div
            className="flex items-center gap-3 px-3 py-2 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{viewing.name}</p>
              <p className="text-xs text-white/70">
                Ảnh {viewerIndex + 1}/{visible.length} · {formatSize(viewing.size)} ·{' '}
                {viewing.usedBy.length > 0
                  ? `Đang dùng ở ${viewing.usedBy.length} nơi`
                  : 'Chưa dùng ở đâu'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => copyUrl(viewing.url)}
              title="Sao chép đường dẫn"
              aria-label="Sao chép đường dẫn ảnh"
              className="inline-flex items-center justify-center min-w-touch min-h-touch rounded-lg hover:bg-white/15 transition-colors"
            >
              <Copy className="h-5 w-5" aria-hidden="true" />
            </button>
            <a
              href={viewing.url}
              target="_blank"
              rel="noopener noreferrer"
              title="Mở ảnh gốc trong tab mới"
              aria-label="Mở ảnh gốc trong tab mới"
              className="inline-flex items-center justify-center min-w-touch min-h-touch rounded-lg hover:bg-white/15 transition-colors"
            >
              <ExternalLink className="h-5 w-5" aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={() => setViewerIndex(null)}
              aria-label="Đóng khung xem ảnh"
              className="inline-flex items-center justify-center min-w-touch min-h-touch rounded-lg hover:bg-white/15 transition-colors"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Ảnh + hai nút chuyển */}
          {/* min-w-0 bắt buộc: hàng lưới mặc định rộng theo nội dung (auto),
              nên ảnh đẩy hàng ra 602px trên màn hình 390px và tràn khỏi mép. */}
          <div className="relative min-h-0 min-w-0 flex items-center justify-center px-2 pb-2">
            {viewerIndex > 0 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setViewerIndex(viewerIndex - 1); }}
                aria-label="Ảnh trước"
                className="absolute left-2 z-10 inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/15 text-white hover:bg-white/30 transition-colors"
              >
                <ChevronLeft className="h-7 w-7" aria-hidden="true" />
              </button>
            )}

            {/* max-w/max-h chặn ảnh tràn: trên điện thoại `fill` cho ra ảnh
                rộng 602px trong màn hình 390px, phần thừa bị cắt mất. */}
            <div
              className="relative w-full h-full max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={viewing.url}
                alt={viewing.name}
                fill
                sizes="100vw"
                unoptimized={!isOptimizableImage(viewing.url)}
                className="object-contain"
                priority
              />
            </div>

            {viewerIndex < visible.length - 1 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setViewerIndex(viewerIndex + 1); }}
                aria-label="Ảnh tiếp theo"
                className="absolute right-2 z-10 inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/15 text-white hover:bg-white/30 transition-colors"
              >
                <ChevronRight className="h-7 w-7" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Nơi đang dùng ảnh: bấm được để sang thẳng sản phẩm/bài viết đó */}
          {viewing.usedBy.length > 0 && (
            <div
              className="px-3 pb-3 flex flex-wrap gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {viewing.usedBy.slice(0, 4).map((u, i) => (
                <Link
                  key={i}
                  href={linkTo(u)}
                  className="inline-flex items-center gap-1.5 min-h-touch px-3 rounded-lg bg-white/15 text-white text-xs hover:bg-white/25 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate max-w-[220px]">
                    {TYPE_LABEL[u.type] ?? u.type}: {u.label}
                  </span>
                </Link>
              ))}
              {viewing.usedBy.length > 4 && (
                <span className="inline-flex items-center px-3 text-xs text-white/70">
                  +{viewing.usedBy.length - 4} nơi khác
                </span>
              )}
            </div>
          )}
        </div>
      )}

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

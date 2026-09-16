'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { X, Check, Loader2, ImageOff, Search } from 'lucide-react';
import { isOptimizableImage } from '@/lib/image';

interface MediaFile {
  key: string;
  name: string;
  size: number;
  url: string;
  uploadedAt: number;
  usedBy: { type: string; id: number; label: string }[];
}

interface MediaLibraryPickerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Gọi khi người dùng bấm "Chọn". Nhận danh sách URL đã chọn. */
  onSelect: (urls: string[]) => void;
  /** Số ảnh tối đa được chọn. 1 = chỉ chọn một ảnh. */
  maxSelect?: number;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

/**
 * Hộp thoại chọn ảnh từ thư viện đã tải lên.
 *
 * Trước đây muốn dùng lại một ảnh đã có, người quản trị phải tải lên lần nữa —
 * vừa tốn dung lượng, vừa tạo ra nhiều bản trùng của cùng một tấm ảnh. Nay chọn
 * thẳng từ kho ảnh sẵn có (tiêu chí 1 & 8).
 */
export default function MediaLibraryPicker({
  isOpen,
  onClose,
  onSelect,
  maxSelect = 1,
}: MediaLibraryPickerProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/media?page=${p}&limit=40`);
      if (res.status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        return;
      }
      if (!res.ok) {
        setError('Không tải được thư viện ảnh. Vui lòng thử lại.');
        return;
      }
      const data = await res.json();
      setFiles(p === 1 ? data.files : (prev) => [...prev, ...data.files]);
      setHasMore(data.pagination?.hasMore ?? false);
    } catch {
      setError('Không kết nối được tới máy chủ.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Mở hộp thoại thì nạp ảnh và xoá lựa chọn cũ.
  useEffect(() => {
    if (!isOpen) return;
    setSelected([]);
    setPage(1);
    load(1);
  }, [isOpen, load]);

  // Đóng bằng phím Esc, khoá cuộn nền (tiêu chí 5).
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggle = (url: string) => {
    setSelected((prev) => {
      if (prev.includes(url)) return prev.filter((u) => u !== url);
      if (prev.length >= maxSelect) {
        // Chỉ cho chọn 1 thì bấm ảnh khác là thay ảnh cũ, không báo lỗi.
        return maxSelect === 1 ? [url] : prev;
      }
      return [...prev, url];
    });
  };

  const visible = search.trim()
    ? files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase().trim()))
    : files;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-picker-title"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[88vh] flex flex-col overflow-hidden"
      >
        {/* Đầu hộp thoại */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-200">
          <div>
            <h2 id="media-picker-title" className="text-lg font-bold text-gray-900">
              Thư viện ảnh
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {maxSelect === 1
                ? 'Chọn một ảnh đã tải lên trước đó.'
                : `Chọn tối đa ${maxSelect} ảnh. Đã chọn ${selected.length}.`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng thư viện ảnh"
            className="inline-flex items-center justify-center w-11 h-11 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Tìm kiếm */}
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="relative">
            <label htmlFor="media-search" className="sr-only">
              Tìm ảnh theo tên tệp
            </label>
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
              aria-hidden="true"
            />
            <input
              id="media-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên tệp…"
              className="w-full pl-9 pr-4 min-h-touch bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Lưới ảnh */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error ? (
            <div className="py-16 text-center">
              <ImageOff className="h-10 w-10 text-gray-400 mx-auto mb-3" aria-hidden="true" />
              <p className="text-sm text-gray-600">{error}</p>
            </div>
          ) : loading && files.length === 0 ? (
            // Khung xương thay vì màn trắng (tiêu chí 7)
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="py-16 text-center">
              <ImageOff className="h-10 w-10 text-gray-400 mx-auto mb-3" aria-hidden="true" />
              <p className="text-sm font-semibold text-gray-700">
                {search ? 'Không tìm thấy ảnh nào khớp' : 'Thư viện chưa có ảnh'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {search ? 'Thử từ khoá khác.' : 'Hãy tải ảnh lên từ máy tính trước.'}
              </p>
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {visible.map((f) => {
                  const isSelected = selected.includes(f.url);
                  return (
                    <li key={f.key}>
                      <button
                        type="button"
                        onClick={() => toggle(f.url)}
                        aria-pressed={isSelected}
                        aria-label={`${f.name}${f.usedBy.length ? ` — đang dùng ở ${f.usedBy[0].label}` : ''}`}
                        className={`group relative w-full aspect-square rounded-lg overflow-hidden border-2 bg-gray-50 transition-all ${
                          isSelected
                            ? 'border-blue-600 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <Image
                          src={f.url}
                          alt=""
                          fill
                          sizes="160px"
                          loading="lazy"
                          unoptimized={!isOptimizableImage(f.url)}
                          className="object-contain p-1.5"
                        />
                        {isSelected && (
                          <span className="absolute top-1.5 right-1.5 inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white shadow">
                            <Check className="h-4 w-4" aria-hidden="true" />
                          </span>
                        )}
                        {/* Nhãn cho biết ảnh đang được dùng — giúp nhận ra ảnh
                            nào là của sản phẩm nào mà không phải mở từng cái. */}
                        {f.usedBy.length > 0 && (
                          <span className="absolute inset-x-0 bottom-0 bg-slate-900/75 text-white text-xs px-1.5 py-1 truncate">
                            {f.usedBy[0].label}
                          </span>
                        )}
                      </button>
                      <p className="mt-1 text-xs text-gray-500 truncate" title={f.name}>
                        {formatSize(f.size)}
                      </p>
                    </li>
                  );
                })}
              </ul>

              {hasMore && !search && (
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      const next = page + 1;
                      setPage(next);
                      load(next);
                    }}
                    disabled={loading}
                    className="inline-flex items-center gap-2 min-h-touch px-5 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    {loading ? (
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

        {/* Chân hộp thoại */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            {selected.length > 0
              ? `Đã chọn ${selected.length} ảnh`
              : 'Chưa chọn ảnh nào'}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center min-h-touch px-4 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Huỷ
            </button>
            <button
              type="button"
              onClick={() => {
                onSelect(selected);
                onClose();
              }}
              disabled={selected.length === 0}
              className="inline-flex items-center justify-center min-h-touch px-5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Dùng ảnh đã chọn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

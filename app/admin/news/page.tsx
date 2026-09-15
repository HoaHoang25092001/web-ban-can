'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { isOptimizableImage } from '@/lib/image';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/admin/FormComponents';
import { useToast } from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import {
  Plus, Edit, Trash2, Eye, EyeOff,
  Newspaper, BookOpen, BookMarked, LayoutList, Grid3X3, Search, X,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface News {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function NewsPage() {
  const toast = useToast();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [page, setPage] = useState(1);

  // Màn hình hẹp: mở dạng thẻ thay vì bảng. Đặt trong effect để HTML dựng trên
  // server và trên trình duyệt khớp nhau, tránh lỗi hydration.
  useEffect(() => {
    if (window.matchMedia('(max-width: 767px)').matches) setViewMode('grid');
  }, []);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Đổi từ khoá hoặc bộ lọc thì quay về trang đầu: nếu giữ nguyên trang hiện
  // tại, kết quả lọc ít hơn sẽ cho ra một trang trống.
  useEffect(() => { setPage(1); }, [search, statusFilter]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; newsId: number | null }>({
    isOpen: false,
    newsId: null,
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/news?limit=100');
      const data = await response.json();
      setNews(data.news || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleteConfirm({ isOpen: true, newsId: id });
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.newsId;
    if (!id) return;

    try {
      const response = await fetch(`/api/news/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setNews(news.filter(item => item.id !== id));
        toast.success('Xóa thành công!', 'Bài viết đã được xóa');
      } else {
        const error = await response.json();
        toast.error('Có lỗi xảy ra', error.error || 'Không thể xóa tin tức');
      }
    } catch {
      toast.error('Có lỗi xảy ra', 'Không thể kết nối đến server');
    } finally {
      setDeleteConfirm({ isOpen: false, newsId: null });
    }
  };

  const togglePublished = async (id: number, published: boolean) => {
    try {
      const newsItem = news.find(n => n.id === id);
      if (!newsItem) return;

      const response = await fetch(`/api/news/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newsItem, published: !published }),
      });

      if (response.ok) {
        setNews(news.map(n => n.id === id ? { ...n, published: !published } : n));
        toast.success(
          !published ? 'Đã xuất bản' : 'Đã chuyển về nháp',
          newsItem.title
        );
      }
    } catch {
      // silent
    }
  };

  // Filtered list
  const filteredNews = news.filter(item => {
    const matchSearch = !search.trim() || item.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && item.published) ||
      (statusFilter === 'draft' && !item.published);
    return matchSearch && matchStatus;
  });

  /*
   * Phân trang danh sách.
   * Trước đây dựng hết 69 bài một lượt: ở dạng thẻ trên điện thoại, trang dài
   * tới 29,7 màn hình — cuộn mãi không tới cuối, và trình duyệt phải dựng 69
   * ảnh cùng lúc (tiêu chí 3 & 7).
   */
  const PER_PAGE = 12;
  const totalPages = Math.max(1, Math.ceil(filteredNews.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pagedNews = filteredNews.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const publishedCount = news.filter(n => n.published).length;
  const draftCount = news.filter(n => !n.published).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý tin tức</h1>
            <p className="text-sm text-gray-500 mt-1">Quản lý tất cả bài viết và tin tức</p>
          </div>
          <Link href="/admin/news/new" className="inline-flex items-center justify-center gap-2 min-h-touch px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Viết tin tức mới
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Newspaper className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{news.length}</div>
              <div className="text-xs text-gray-500 whitespace-nowrap">Tổng bài viết</div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{publishedCount}</div>
              <div className="text-xs text-gray-500 whitespace-nowrap">Đã xuất bản</div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookMarked className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{draftCount}</div>
              <div className="text-xs text-gray-500 whitespace-nowrap">Bản nháp</div>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search */}
          <div className="flex-1 relative w-full">
            <label htmlFor="news-search" className="sr-only">
              Tìm kiếm bài viết theo tiêu đề
            </label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" aria-hidden="true" />
            <input
              id="news-search"
              type="search"
              placeholder="Tìm kiếm theo tiêu đề..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Xoá từ khoá tìm kiếm"
                className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-11 h-11 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Status filter tabs */}
          <div role="group" aria-label="Lọc theo trạng thái" className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm flex-shrink-0">
            {(['all', 'published', 'draft'] as const).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                aria-pressed={statusFilter === s}
                className={`inline-flex items-center justify-center min-h-touch px-4 rounded-md text-sm font-medium transition-all ${
                  statusFilter === s
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {s === 'all' ? 'Tất cả' : s === 'published' ? 'Xuất bản' : 'Nháp'}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm flex-shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              aria-label="Xem dạng bảng"
              aria-pressed={viewMode === 'table'}
              className={`inline-flex items-center justify-center w-11 h-11 rounded-md transition-all ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-600 hover:bg-gray-50'}`}
            >
              <LayoutList className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Xem dạng lưới"
              aria-pressed={viewMode === 'grid'}
              className={`inline-flex items-center justify-center w-11 h-11 rounded-md transition-all ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-600 hover:bg-gray-50'}`}
            >
              <Grid3X3 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Newspaper className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {search || statusFilter !== 'all' ? 'Không tìm thấy bài viết' : 'Chưa có bài viết nào'}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {search || statusFilter !== 'all'
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                : 'Bắt đầu bằng cách viết bài đầu tiên'}
            </p>
            <Link href="/admin/news/new" className="inline-flex items-center justify-center gap-2 min-h-touch px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Viết tin tức đầu tiên
            </Link>
          </div>
        ) : viewMode === 'table' ? (
          /* TABLE VIEW */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Bài viết</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tóm tắt</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Ngày tạo</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pagedNews.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/60 transition-colors group">
                      {/* Article cell */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt=""
                                width={80}
                                height={56}
                                loading="lazy"
                                unoptimized={!isOptimizableImage(item.image)}
                                className="h-14 w-20 object-cover rounded-xl border border-gray-100 shadow-sm"
                              />
                            ) : (
                              <div className="h-14 w-20 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-100">
                                <Newspaper className="h-5 w-5 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 max-w-[260px]">
                              {item.title}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">ID #{item.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Excerpt */}
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-500 line-clamp-2 max-w-[240px]">
                          {item.excerpt || <span className="text-gray-500 italic">Chưa có tóm tắt</span>}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => togglePublished(item.id, item.published)}
                          aria-label={
                            item.published
                              ? `Chuyển bài "${item.title}" về nháp`
                              : `Xuất bản bài "${item.title}"`
                          }
                          className={`inline-flex items-center justify-center gap-1.5 px-4 min-h-touch rounded-full text-sm font-semibold transition-all border ${
                            item.published
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {item.published
                            ? <><Eye className="h-3 w-3" /> Xuất bản</>
                            : <><EyeOff className="h-3 w-3" /> Nháp</>
                          }
                        </button>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4">
                        <div className="text-sm text-gray-600">
                          {new Date(item.createdAt).toLocaleDateString('vi-VN', {
                            day: '2-digit', month: '2-digit', year: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {new Date(item.createdAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/news/edit/${item.id}`}
                            className="w-11 h-11 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 transition-all"
                            title="Chỉnh sửa"
                            aria-label={`Chỉnh sửa bài viết ${item.title}`}
                          >
                            <Edit className="h-4 w-4" aria-hidden="true" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            aria-label={`Xoá bài viết ${item.title}`}
                            className="inline-flex items-center justify-center w-11 h-11 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-all"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-500">
                Hiển thị <span className="font-medium text-gray-600">{filteredNews.length}</span> bài viết
              </p>
            </div>
          </div>
        ) : (
          /* GRID VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagedNews.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* Cover image */}
                <div className="relative aspect-video bg-gray-50 overflow-hidden">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 320px"
                      loading="lazy"
                      unoptimized={!isOptimizableImage(item.image)}
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Newspaper className="h-10 w-10 text-gray-500" />
                    </div>
                  )}
                  {/* Status badge */}
                  <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    item.published
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-400 text-white'
                  }`}>
                    {item.published ? <Eye className="h-2.5 w-2.5" /> : <EyeOff className="h-2.5 w-2.5" />}
                    {item.published ? 'Xuất bản' : 'Nháp'}
                  </span>
                  {/* Hover actions */}
                  <div className="absolute inset-x-0 bottom-0 pt-8 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-center pb-3 gap-2">
                    <Link
                      href={`/admin/news/edit/${item.id}`}
                      className="bg-white text-blue-600 text-sm font-medium min-h-touch px-4 inline-flex items-center justify-center gap-1 rounded-lg hover:bg-blue-50 transition-colors inline-flex items-center gap-1"
                      aria-label={`Chỉnh sửa bài viết ${item.title}`}
                    >
                      <Edit className="h-3 w-3" aria-hidden="true" /> Sửa
                    </Link>
                    <button
                      onClick={() => togglePublished(item.id, item.published)}
                      className="bg-white text-gray-700 text-sm font-medium px-4 min-h-touch inline-flex items-center justify-center gap-1 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                    >
                      {item.published ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      {item.published ? 'Ẩn' : 'Đăng'}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-white text-red-500 text-sm font-medium px-4 min-h-touch inline-flex items-center justify-center gap-1 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" /> Xóa
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-2">
                    {item.title}
                  </h3>
                  {item.excerpt && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{item.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    <Link
                      href={`/admin/news/edit/${item.id}`}
                      aria-label={`Chỉnh sửa bài viết ${item.title}`}
                      className="inline-flex items-center gap-1 min-h-touch px-2 -mr-2 text-sm text-blue-600 hover:text-blue-800 font-medium rounded-md hover:bg-blue-50 transition-colors"
                    >
                      <Edit className="h-3.5 w-3.5" aria-hidden="true" /> Chỉnh sửa
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Phân trang ── */}
        {totalPages > 1 && (
          <nav
            aria-label="Phân trang danh sách bài viết"
            className="mt-6 flex flex-wrap items-center justify-center gap-2"
          >
            <button
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 min-h-touch px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Trước
            </button>

            <span className="inline-flex items-center min-h-touch px-3 text-sm text-gray-600">
              Trang <strong className="mx-1 text-gray-900">{currentPage}</strong> / {totalPages}
              <span className="ml-2 text-gray-500 hidden sm:inline">({filteredNews.length} bài)</span>
            </span>

            <button
              type="button"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 min-h-touch px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Tiếp
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, newsId: null })}
        variant="danger"
      />
    </AdminLayout>
  );
}

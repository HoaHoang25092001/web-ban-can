'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/admin/FormComponents';
import { useToast } from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import {
  Plus, Edit, Trash2, Eye, EyeOff,
  Newspaper, BookOpen, BookMarked, LayoutList, Grid3X3, Search, X
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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
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
          <Link href="/admin/news/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Viết tin tức mới
            </Button>
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Newspaper className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{news.length}</div>
              <div className="text-xs text-gray-500">Tổng bài viết</div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{publishedCount}</div>
              <div className="text-xs text-gray-500">Đã xuất bản</div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookMarked className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{draftCount}</div>
              <div className="text-xs text-gray-500">Bản nháp</div>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search */}
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm flex-shrink-0">
            {(['all', 'published', 'draft'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  statusFilter === s
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {s === 'all' ? 'Tất cả' : s === 'published' ? 'Xuất bản' : 'Nháp'}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm flex-shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="Xem dạng bảng"
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="Xem dạng lưới"
            >
              <Grid3X3 className="h-4 w-4" />
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
              <p className="text-sm text-gray-400">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Newspaper className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {search || statusFilter !== 'all' ? 'Không tìm thấy bài viết' : 'Chưa có bài viết nào'}
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              {search || statusFilter !== 'all'
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                : 'Bắt đầu bằng cách viết bài đầu tiên'}
            </p>
            <Link href="/admin/news/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Viết tin tức đầu tiên
              </Button>
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
                  {filteredNews.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/60 transition-colors group">
                      {/* Article cell */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.title}
                                className="h-14 w-20 object-cover rounded-xl border border-gray-100 shadow-sm"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            ) : (
                              <div className="h-14 w-20 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-100">
                                <Newspaper className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 max-w-[260px]">
                              {item.title}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">ID #{item.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Excerpt */}
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-500 line-clamp-2 max-w-[240px]">
                          {item.excerpt || <span className="text-gray-300 italic">Chưa có tóm tắt</span>}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => togglePublished(item.id, item.published)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                            item.published
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          }`}
                          title={item.published ? 'Click để chuyển về nháp' : 'Click để xuất bản'}
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
                        <div className="text-xs text-gray-400 mt-0.5">
                          {new Date(item.createdAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/admin/news/edit/${item.id}`}>
                            <button className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-all" title="Chỉnh sửa">
                              <Edit className="h-4 w-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
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
              <p className="text-xs text-gray-400">
                Hiển thị <span className="font-medium text-gray-600">{filteredNews.length}</span> bài viết
              </p>
            </div>
          </div>
        ) : (
          /* GRID VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNews.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* Cover image */}
                <div className="relative aspect-video bg-gray-50 overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Newspaper className="h-10 w-10 text-gray-300" />
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
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3 gap-2">
                    <Link href={`/admin/news/edit/${item.id}`}>
                      <button className="bg-white text-blue-600 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1">
                        <Edit className="h-3 w-3" /> Sửa
                      </button>
                    </Link>
                    <button
                      onClick={() => togglePublished(item.id, item.published)}
                      className="bg-white text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                    >
                      {item.published ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      {item.published ? 'Ẩn' : 'Đăng'}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-white text-red-500 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1"
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
                    <span className="text-xs text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    <Link href={`/admin/news/edit/${item.id}`}>
                      <button className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                        <Edit className="h-3 w-3" /> Chỉnh sửa
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
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

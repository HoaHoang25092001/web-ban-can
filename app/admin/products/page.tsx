'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import ProductFilter from '@/components/admin/ProductFilter';
import { Button } from '@/components/admin/FormComponents';
import { useToast } from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import {
  Plus, Edit, Trash2, Star, Package, Images,
  TrendingUp, Grid3X3, LayoutList, ChevronLeft, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  description: string;
  capacity: string;
  accuracy: string;
  price: string;
  image: string;
  images: string[];
  featured: boolean;
  category: {
    id: number;
    name: string;
  };
  createdAt: string;
}

interface FilterState {
  search: string;
  categoryId: string;
}

export default function ProductsPage() {
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; productId: number | null }>({
    isOpen: false,
    productId: null,
  });
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categoryId: 'all',
  });

  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    pages: 1,
  });
  const [stats, setStats] = useState({
    totalProducts: 0,
    featuredProducts: 0,
    multiImageProducts: 0,
  });

  // Debounce search input
  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);
    setSearchTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [filters.search]);

  // Reset page to 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.categoryId, debouncedSearch]);

  const fetchProducts = useCallback(async (activeFilters: { search: string; categoryId: string }, page: number) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (activeFilters.search.trim()) {
        params.append('search', activeFilters.search.trim());
      }
      if (activeFilters.categoryId !== 'all') {
        params.append('categoryId', activeFilters.categoryId);
      }
      params.append('limit', '15');
      params.append('page', page.toString());

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();
      setProducts(data.products || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
      if (data.stats) {
        setStats(data.stats);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch products when filters or page changes
  useEffect(() => {
    fetchProducts({ search: debouncedSearch, categoryId: filters.categoryId }, currentPage);
  }, [debouncedSearch, filters.categoryId, currentPage, fetchProducts]);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const handleDelete = async (id: number) => {
    setDeleteConfirm({ isOpen: true, productId: id });
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.productId;
    if (!id) return;

    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Xóa thành công!', 'Sản phẩm đã được xóa');
        // Refetch current page to update data and stats
        fetchProducts({ search: debouncedSearch, categoryId: filters.categoryId }, currentPage);
      } else {
        const error = await response.json();
        toast.error('Có lỗi xảy ra', error.error || 'Không thể xóa sản phẩm');
      }
    } catch {
      toast.error('Có lỗi xảy ra', 'Không thể kết nối đến server');
    } finally {
      setDeleteConfirm({ isOpen: false, productId: null });
    }
  };

  const toggleFeatured = async (id: number, featured: boolean) => {
    try {
      const product = products.find(p => p.id === id);
      if (!product) return;

      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, featured: !featured }),
      });

      if (response.ok) {
        setProducts(products.map(p => p.id === id ? { ...p, featured: !featured } : p));
        setStats(prev => ({
          ...prev,
          featuredProducts: !featured ? prev.featuredProducts + 1 : prev.featuredProducts - 1
        }));
        toast.success(
          !featured ? 'Đã đặt nổi bật' : 'Đã bỏ nổi bật',
          product.name
        );
      }
    } catch {
      // silent
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
            <p className="text-sm text-gray-500 mt-1">Quản lý tất cả sản phẩm của website</p>
          </div>
          <Link href="/admin/products/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Thêm sản phẩm
            </Button>
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalProducts}</div>
              <div className="text-xs text-gray-500">Tổng sản phẩm</div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.featuredProducts}</div>
              <div className="text-xs text-gray-500">Sản phẩm nổi bật</div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 col-span-2 sm:col-span-1">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Images className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.multiImageProducts}
              </div>
              <div className="text-xs text-gray-500">Có nhiều ảnh</div>
            </div>
          </div>
        </div>

        {/* Filter + View toggle */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex-1 w-full">
            <ProductFilter onFilterChange={handleFilterChange} initialFilters={filters} />
          </div>
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
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {filters.search.trim() || filters.categoryId !== 'all'
                ? 'Không tìm thấy sản phẩm'
                : 'Chưa có sản phẩm nào'}
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              {filters.search.trim() || filters.categoryId !== 'all'
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                : 'Bắt đầu bằng cách thêm sản phẩm đầu tiên'}
            </p>
            <Link href="/admin/products/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Thêm sản phẩm đầu tiên
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
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Sản phẩm</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Danh mục</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Thông số</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Giá</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Nổi bật</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((product) => {
                    const primaryImage = product.image || (product.images?.[0] ?? '');
                    const extraImgs = (product.images?.length ?? 0);
                    return (
                      <tr key={product.id} className="hover:bg-gray-50/60 transition-colors group">
                        {/* Product cell */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative flex-shrink-0">
                              {primaryImage ? (
                                <img
                                  src={primaryImage.startsWith('/') ? `http://localhost:3000${primaryImage}` : primaryImage}
                                  alt={product.name}
                                  className="h-14 w-14 object-cover rounded-xl border border-gray-100 shadow-sm"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Crect width='56' height='56' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='10'%3E?%3C/text%3E%3C/svg%3E";
                                  }}
                                />
                              ) : (
                                <div className="h-14 w-14 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-100">
                                  <Package className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                              {extraImgs > 1 && (
                                <span className="absolute -bottom-1 -right-1 bg-purple-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow">
                                  {extraImgs}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 max-w-[220px]">
                                {product.name}
                              </div>
                              <div className="text-xs text-gray-400 mt-0.5">ID #{product.id}</div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {product.category.name}
                          </span>
                        </td>

                        {/* Specs */}
                        <td className="px-5 py-4">
                          <div className="space-y-0.5">
                            {product.capacity && (
                              <div className="text-xs text-gray-600">
                                <span className="text-gray-400">KL:</span> {product.capacity}
                              </div>
                            )}
                            {product.accuracy && (
                              <div className="text-xs text-gray-600">
                                <span className="text-gray-400">Chính xác:</span> {product.accuracy}
                              </div>
                            )}
                            {!product.capacity && !product.accuracy && (
                              <span className="text-xs text-gray-300">—</span>
                            )}
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-5 py-4">
                          {product.price ? (
                            <span className="font-semibold text-sm text-emerald-600">
                              {product.price}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-300">Liên hệ</span>
                          )}
                        </td>

                        {/* Featured */}
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => toggleFeatured(product.id, product.featured)}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                              product.featured
                                ? 'bg-amber-100 text-amber-500 hover:bg-amber-200'
                                : 'bg-gray-100 text-gray-300 hover:bg-amber-50 hover:text-amber-400'
                            }`}
                            title={product.featured ? 'Bỏ nổi bật' : 'Đặt nổi bật'}
                          >
                            <Star className="h-4 w-4" fill={product.featured ? 'currentColor' : 'none'} />
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link href={`/admin/products/edit/${product.id}`}>
                              <button
                                className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-all"
                                title="Chỉnh sửa"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </Link>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                              title="Xóa"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-400">
                Hiển thị <span className="font-medium text-gray-600">{products.length}</span> sản phẩm (trên tổng số <span className="font-medium text-gray-600">{pagination.total}</span>)
              </p>
            </div>
          </div>
        ) : (
          /* GRID VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => {
              const primaryImage = product.image || (product.images?.[0] ?? '');
              const extraImgs = product.images?.length ?? 0;
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                    {primaryImage ? (
                      <img
                        src={primaryImage.startsWith('/') ? `http://localhost:3000${primaryImage}` : primaryImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-10 w-10 text-gray-300" />
                      </div>
                    )}
                    {/* Overlays */}
                    {product.featured && (
                      <span className="absolute top-2 left-2 bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star className="h-2.5 w-2.5 fill-white" />
                        Nổi bật
                      </span>
                    )}
                    {extraImgs > 1 && (
                      <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Images className="h-2.5 w-2.5" />
                        {extraImgs} ảnh
                      </span>
                    )}
                    {/* Action overlay */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3 gap-2">
                      <Link href={`/admin/products/edit/${product.id}`}>
                        <button className="bg-white text-blue-600 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1">
                          <Edit className="h-3 w-3" />
                          Sửa
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="bg-white text-red-500 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        Xóa
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug flex-1">
                        {product.name}
                      </h3>
                      <button
                        onClick={() => toggleFeatured(product.id, product.featured)}
                        className={`flex-shrink-0 p-1 rounded-md transition-all ${
                          product.featured ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400'
                        }`}
                        title={product.featured ? 'Bỏ nổi bật' : 'Đặt nổi bật'}
                      >
                        <Star className="h-4 w-4" fill={product.featured ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <span className="inline-block text-[11px] font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md mb-2">
                      {product.category.name}
                    </span>
                    {product.price && (
                      <p className="text-sm font-bold text-emerald-600">{product.price}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Pagination ── */}
        {pagination.pages > 1 && (
          <div className="flex flex-col items-center gap-4 mt-8">
            <nav className="flex items-center gap-1.5">
              {/* Prev */}
              {currentPage === 1 ? (
                <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 text-slate-300 cursor-not-allowed select-none border border-gray-200">
                  <ChevronLeft className="w-4 h-4" />
                  Trước
                </span>
              ) : (
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 shadow-sm cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Trước
                </button>
              )}

              {/* Page numbers */}
              {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                .filter(page => page === 1 || page === pagination.pages || Math.abs(page - currentPage) <= 1)
                .map((page, index, array) => {
                  const showEllipsis = index > 0 && page - array[index - 1] > 1;
                  return (
                    <div key={page} className="flex items-center gap-1.5">
                      {showEllipsis && <span className="px-1 text-slate-400 font-bold">…</span>}
                      {currentPage === page ? (
                        <span className="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold bg-blue-600 text-white shadow-md shadow-blue-500/30 select-none border border-blue-600">
                          {page}
                        </span>
                      ) : (
                        <button
                          onClick={() => setCurrentPage(page)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 shadow-sm cursor-pointer"
                        >
                          {page}
                        </button>
                      )}
                    </div>
                  );
                })
              }

              {/* Next */}
              {currentPage === pagination.pages ? (
                <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 text-slate-300 cursor-not-allowed select-none border border-gray-200">
                  Tiếp
                  <ChevronRight className="w-4 h-4" />
                </span>
              ) : (
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 shadow-sm cursor-pointer"
                >
                  Tiếp
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </nav>

            <p className="text-xs text-slate-400 font-medium">
              Trang {currentPage}/{pagination.pages} · Hiển thị {products.length}/{pagination.total} sản phẩm
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, productId: null })}
        variant="danger"
      />
    </AdminLayout>
  );
}

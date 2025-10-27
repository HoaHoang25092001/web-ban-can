'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import ProductFilter from '@/components/admin/ProductFilter';
import { Table, TableRow, TableCell } from '@/components/admin/Table';
import { Button } from '@/components/admin/FormComponents';
import { useToast } from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Plus, Edit, Trash2, Star } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  description: string;
  capacity: string;
  accuracy: string;
  price: string;
  image: string;
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
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; productId: number | null }>({
    isOpen: false,
    productId: null,
  });
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categoryId: 'all',
  });

  // Debounce function for search
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []); // Only fetch on mount initially

  const fetchProducts = useCallback(async (searchFilters?: FilterState) => {
    try {
      setLoading(true);
      const filtersToUse = searchFilters || filters;
      const params = new URLSearchParams();
      
      if (filtersToUse.search.trim()) {
        params.append('search', filtersToUse.search.trim());
      }
      
      if (filtersToUse.categoryId !== 'all') {
        params.append('categoryId', filtersToUse.categoryId);
      }

      // Remove pagination for now, show all results
      params.append('limit', '100');

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Debounce search requests
    const timeout = setTimeout(() => {
      fetchProducts(newFilters);
    }, 300);
    
    setSearchTimeout(timeout);
  }, [searchTimeout, fetchProducts]);

  const handleDelete = async (id: number) => {
    setDeleteConfirm({ isOpen: true, productId: id });
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.productId;
    if (!id) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(products.filter(product => product.id !== id));
        toast.success('Xóa thành công!', 'Sản phẩm đã được xóa');
      } else {
        const error = await response.json();
        toast.error('Có lỗi xảy ra', error.error || 'Không thể xóa sản phẩm');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...product,
          featured: !featured,
        }),
      });

      if (response.ok) {
        setProducts(products.map(p => 
          p.id === id ? { ...p, featured: !featured } : p
        ));
      }
    } catch (error) {
      // Error handled silently
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
            <p className="text-gray-600">Quản lý tất cả sản phẩm của website</p>
          </div>
          <Link href="/admin/products/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Thêm sản phẩm mới
            </Button>
          </Link>
        </div>

        {/* Filter and Search Component */}
        <ProductFilter
          onFilterChange={handleFilterChange}
          initialFilters={filters}
        />

        <div className="bg-white shadow rounded-lg">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Đang tải dữ liệu...</div>
            </div>
          ) : (
            <>
              <Table headers={['Hình ảnh', 'Tên sản phẩm', 'Danh mục', 'Thông số', 'Giá', 'Trạng thái', 'Thao tác']}>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.image && product.image.trim() !== '' ? (
                        <img
                          src={product.image.startsWith('/') ? `http://localhost:3000${product.image}` : product.image}
                          alt={product.name}
                          className="h-12 w-12 object-cover rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <i className="ri-image-line text-gray-400 text-lg"></i>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {product.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {product.category.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Khối lượng: {product.capacity}</div>
                        <div>Độ chính xác: {product.accuracy}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-blue-600">
                        {product.price} 
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleFeatured(product.id, product.featured)}
                          className={`${product.featured ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-600`}
                          title={product.featured ? 'Bỏ nổi bật' : 'Đặt nổi bật'}
                        >
                          <Star className="h-4 w-4" fill={product.featured ? 'currentColor' : 'none'} />
                        </button>
                        {product.featured && (
                          <span className="text-xs text-yellow-600">Nổi bật</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Link href={`/admin/products/edit/${product.id}`}>
                          <button className="text-blue-600 hover:text-blue-800">
                            <Edit className="h-4 w-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>

              {products.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">
                    {filters.search.trim() || filters.categoryId !== 'all' 
                      ? 'Không tìm thấy sản phẩm nào phù hợp với bộ lọc'
                      : 'Chưa có sản phẩm nào'
                    }
                  </div>
                  <Link href="/admin/products/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm sản phẩm đầu tiên
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
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

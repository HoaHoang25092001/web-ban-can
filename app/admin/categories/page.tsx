'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Table, TableRow, TableCell } from '@/components/admin/Table';
import { Button } from '@/components/admin/FormComponents';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  products: any[];
  createdAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?includeProducts=true');
      const data = await response.json();
      setCategories(data.categories || []); // Sửa từ data thành data.categories
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCategories(categories.filter(cat => cat.id !== id));
      } else {
        const error = await response.json();
        alert(error.error || 'Có lỗi xảy ra khi xóa danh mục');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Có lỗi xảy ra khi xóa danh mục');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục sản phẩm</h1>
            <p className="text-gray-600">Quản lý các danh mục sản phẩm của website</p>
          </div>
          <Link href="/admin/categories/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Thêm danh mục mới
            </Button>
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg">
          <Table headers={['Icon', 'Tên danh mục', 'Mô tả', 'Số sản phẩm', 'Ngày tạo', 'Thao tác']}>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className={`${category.icon || 'ri-image-line'} text-2xl text-blue-600`}></i>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{category.name}</span>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs truncate" title={category.description}>
                    {category.description}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {category.products?.length || 0} sản phẩm
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(category.createdAt).toLocaleDateString('vi-VN')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Link href={`/admin/categories/edit/${category.id}`}>
                      <button className="text-blue-600 hover:text-blue-800">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>

          {categories.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">Chưa có danh mục nào</div>
              <Link href="/admin/categories/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm danh mục đầu tiên
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

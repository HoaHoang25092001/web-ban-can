'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button, Input, Textarea } from '@/components/admin/FormComponents';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const iconOptions = [
  { value: 'ri-scales-line', label: 'Cân điện tử' },
  { value: 'ri-flask-line', label: 'Phòng thí nghiệm' },
  { value: 'ri-table-line', label: 'Cân bàn' },
  { value: 'ri-building-2-line', label: 'Công nghiệp' },
  { value: 'ri-truck-line', label: 'Xe tải' },
  { value: 'ri-hammer-line', label: 'Móc cẩu' },
  { value: 'ri-hang-line', label: 'Cân treo' },
  { value: 'ri-plant-line', label: 'Nông sản' },
  { value: 'ri-bear-smile-line', label: 'Động vật' },
  { value: 'ri-ship-line', label: 'Thủy sản' },
  { value: 'ri-shopping-cart-line', label: 'Siêu thị' },
  { value: 'ri-calculator-line', label: 'Cân đếm' },
  { value: 'ri-armchair-line', label: 'Cân ghế' },
  { value: 'ri-restaurant-line', label: 'Nhà bếp' },
  { value: 'ri-medal-line', label: 'Cân vàng' },
  { value: 'ri-roadster-line', label: 'Xe tải/Trạm cân' },
];

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
  });

  const fetchCategory = useCallback(async () => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.name || '',
          description: data.description || '',
          icon: data.icon || '',
        });
      } else {
        alert('Không tìm thấy danh mục');
        router.push('/admin/categories');
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      alert('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setFetchLoading(false);
    }
  }, [categoryId, router]);

  useEffect(() => {
    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId, fetchCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin/categories');
      } else {
        const error = await response.json();
        alert(error.error || 'Có lỗi xảy ra khi cập nhật danh mục');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Có lỗi xảy ra khi cập nhật danh mục');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-600">Đang tải...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin/categories">
            <button className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa danh mục</h1>
            <p className="text-gray-600">Cập nhật thông tin danh mục</p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Tên danh mục"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              placeholder="Nhập tên danh mục"
              required
            />

            <Textarea
              label="Mô tả"
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              placeholder="Nhập mô tả cho danh mục"
              rows={3}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon
              </label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Chọn icon...</option>
                {iconOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/admin/categories">
                <Button variant="secondary">Hủy</Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? 'Đang cập nhật...' : 'Cập nhật danh mục'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

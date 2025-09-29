'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button, Input, Textarea } from '@/components/admin/FormComponents';
import ImageUpload from '@/components/admin/ImageUpload';
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

export default function NewCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    image: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin/categories');
      } else {
        const error = await response.json();
        alert(error.error || 'Có lỗi xảy ra khi tạo danh mục');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Có lỗi xảy ra khi tạo danh mục');
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Thêm danh mục mới</h1>
            <p className="text-gray-600">Tạo danh mục sản phẩm mới</p>
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

            <ImageUpload
              label="Hình ảnh danh mục"
              value={formData.image}
              onChange={(imageUrl) => setFormData({ ...formData, image: imageUrl })}
            />

            <div className="flex justify-end space-x-4">
              <Link href="/admin/categories">
                <Button variant="secondary">Hủy</Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? 'Đang tạo...' : 'Tạo danh mục'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

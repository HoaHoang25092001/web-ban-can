'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button, Input, Textarea, Select } from '@/components/admin/FormComponents';
import ImageUpload from '@/components/admin/ImageUpload';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    capacity: '',
    accuracy: '',
    price: '',
    image: '',
    featured: false,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin/products');
      } else {
        const error = await response.json();
        alert(error.error || 'Có lỗi xảy ra khi tạo sản phẩm');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Có lỗi xảy ra khi tạo sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin/products">
            <button className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Thêm sản phẩm mới</h1>
            <p className="text-gray-600">Tạo sản phẩm mới cho website</p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Tên sản phẩm"
                value={formData.name}
                onChange={(value) => setFormData({ ...formData, name: value })}
                placeholder="Nhập tên sản phẩm"
                required
              />

              <Select
                label="Danh mục"
                value={formData.categoryId}
                onChange={(value) => setFormData({ ...formData, categoryId: value })}
                options={categories.map(cat => ({ value: cat.id.toString(), label: cat.name }))}
                required
              />
            </div>

            <Textarea
              label="Mô tả sản phẩm"
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              placeholder="Nhập mô tả chi tiết về sản phẩm"
              rows={4}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Khối lượng tối đa"
                value={formData.capacity}
                onChange={(value) => setFormData({ ...formData, capacity: value })}
                placeholder="vd: 30kg, 500g"
              />

              <Input
                label="Độ chính xác"
                value={formData.accuracy}
                onChange={(value) => setFormData({ ...formData, accuracy: value })}
                placeholder="vd: 1g, 0.1mg"
              />

              <Input
                label="Giá (VNĐ)"
                value={formData.price}
                onChange={(value) => setFormData({ ...formData, price: value })}
                placeholder="vd: 2,500,000"
              />
            </div>

            <ImageUpload
              label="Hình ảnh sản phẩm"
              value={formData.image}
              onChange={(imageUrl) => setFormData({ ...formData, image: imageUrl })}
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                Đặt làm sản phẩm nổi bật
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/admin/products">
                <Button variant="secondary">Hủy</Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? 'Đang tạo...' : 'Tạo sản phẩm'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

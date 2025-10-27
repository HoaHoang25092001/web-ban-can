'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button, Input, Textarea } from '@/components/admin/FormComponents';
import TiptapEditor from '@/components/admin/TiptapEditor';
import ImageUpload from '@/components/admin/ImageUpload';
import { useToast } from '@/components/Toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewNewsPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    image: '',
    published: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Thành công!', 'Tin tức đã được tạo thành công');
        router.push('/admin/news');
      } else {
        const error = await response.json();
        toast.error('Có lỗi xảy ra', error.error || 'Không thể tạo tin tức');
      }
    } catch (error) {
      console.error('Error creating news:', error);
      toast.error('Có lỗi xảy ra', 'Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin/news">
            <button className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Viết tin tức mới</h1>
            <p className="text-gray-600">Tạo bài viết tin tức mới</p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <Input
              label="Tiêu đề"
              value={formData.title}
              onChange={(value) => setFormData({ ...formData, title: value })}
              placeholder="Nhập tiêu đề tin tức"
              required
            />

            <Textarea
              label="Tóm tắt"
              value={formData.excerpt}
              onChange={(value) => setFormData({ ...formData, excerpt: value })}
              placeholder="Nhập tóm tắt ngắn gọn về tin tức"
              rows={3}
            />

            <TiptapEditor
              label="Nội dung"
              value={formData.content}
              onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
              placeholder="Nhập nội dung chi tiết của tin tức"
              height={500}
              required
            />

            <ImageUpload
              label="Hình ảnh tin tức"
              value={formData.image}
              onChange={(imageUrl) => setFormData({ ...formData, image: imageUrl })}
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
                Xuất bản ngay lập tức
              </label>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link href="/admin/news">
                <Button variant="secondary">Hủy</Button>
              </Link>
              <Button 
                type="submit" 
                disabled={loading}
                onClick={() => setFormData({ ...formData, published: false })}
                variant="secondary"
              >
                Lưu nháp
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                onClick={() => setFormData({ ...formData, published: true })}
              >
                {loading ? 'Đang đăng...' : 'Đăng tin tức'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

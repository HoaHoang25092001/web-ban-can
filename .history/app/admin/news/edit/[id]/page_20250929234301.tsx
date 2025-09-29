'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button, Input, Textarea } from '@/components/admin/FormComponents';
import ImageUpload from '@/components/admin/ImageUpload';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditNewsPage() {
  const router = useRouter();
  const params = useParams();
  const newsId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    image: '',
    published: false,
  });

  useEffect(() => {
    if (newsId) {
      fetchNews();
    }
  }, [newsId]);

  const fetchNews = async () => {
    try {
      const response = await fetch(`/api/news/${newsId}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          title: data.title || '',
          content: data.content || '',
          excerpt: data.excerpt || '',
          image: data.image || '',
          published: data.published || false,
        });
      } else {
        alert('Không tìm thấy tin tức');
        router.push('/admin/news');
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      alert('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, publish?: boolean) => {
    e.preventDefault();
    setLoading(true);

    const submitData = { 
      ...formData, 
      published: publish !== undefined ? publish : formData.published 
    };

    try {
      const response = await fetch(`/api/news/${newsId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        router.push('/admin/news');
      } else {
        const error = await response.json();
        alert(error.error || 'Có lỗi xảy ra khi cập nhật tin tức');
      }
    } catch (error) {
      console.error('Error updating news:', error);
      alert('Có lỗi xảy ra khi cập nhật tin tức');
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
          <Link href="/admin/news">
            <button className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa tin tức</h1>
            <p className="text-gray-600">Cập nhật nội dung tin tức</p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <Textarea
              label="Nội dung"
              value={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value })}
              placeholder="Nhập nội dung chi tiết của tin tức"
              rows={12}
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

            <div className="flex justify-end space-x-4">
              <Link href="/admin/news">
                <Button variant="secondary">Hủy</Button>
              </Link>
              <Button 
                type="button" 
                disabled={loading}
                onClick={() => handleSubmit(new Event('submit') as any, false)}
                variant="secondary"
              >
                {loading ? 'Đang lưu...' : 'Lưu nháp'}
              </Button>
              <Button 
                type="button" 
                disabled={loading}
                onClick={() => handleSubmit(new Event('submit') as any, true)}
              >
                {loading ? 'Đang cập nhật...' : 'Cập nhật & Xuất bản'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

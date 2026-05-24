'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button, Input, Textarea } from '@/components/admin/FormComponents';
import TiptapEditor from '@/components/admin/TiptapEditor';
import ImageUpload from '@/components/admin/ImageUpload';
import { useToast } from '@/components/Toast';
import {
  ArrowLeft, FileText, Image as ImageIcon,
  Eye, EyeOff, Send, Save, Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function EditNewsPage() {
  const router = useRouter();
  const params = useParams();
  const newsId = params.id as string;
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [publishMode, setPublishMode] = useState<'draft' | 'publish' | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    image: '',
    published: false,
  });

  useEffect(() => {
    if (newsId) fetchNews();
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
        toast.error('Không tìm thấy', 'Bài viết không tồn tại');
        router.push('/admin/news');
      }
    } catch {
      toast.error('Có lỗi xảy ra', 'Không thể tải dữ liệu tin tức');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (published: boolean) => {
    if (!formData.title.trim()) {
      toast.error('Thiếu tiêu đề', 'Vui lòng nhập tiêu đề bài viết');
      return;
    }

    setPublishMode(published ? 'publish' : 'draft');
    setLoading(true);

    try {
      const response = await fetch(`/api/news/${newsId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, published }),
      });

      if (response.ok) {
        toast.success(
          published ? 'Đã cập nhật & xuất bản!' : 'Đã lưu nháp!',
          published ? 'Bài viết hiện đang hiển thị trên website' : 'Bài viết đã được lưu nháp'
        );
        router.push('/admin/news');
      } else {
        const error = await response.json();
        toast.error('Có lỗi xảy ra', error.error || 'Không thể cập nhật tin tức');
      }
    } catch {
      toast.error('Có lỗi xảy ra', 'Không thể kết nối đến server');
    } finally {
      setLoading(false);
      setPublishMode(null);
    }
  };

  if (fetchLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh] flex-col gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-500 text-sm">Đang tải dữ liệu bài viết...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/news">
            <button className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa bài viết</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              ID: <span className="font-mono text-blue-600">#{newsId}</span> ·{' '}
              <span className={`font-medium ${formData.published ? 'text-emerald-600' : 'text-amber-600'}`}>
                {formData.published ? 'Đã xuất bản' : 'Bản nháp'}
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Section 1: Nội dung */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Nội dung bài viết</h2>
                <p className="text-xs text-gray-500">Tiêu đề, tóm tắt và nội dung chi tiết</p>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <Input
                label="Tiêu đề bài viết"
                value={formData.title}
                onChange={(value) => setFormData({ ...formData, title: value })}
                placeholder="Nhập tiêu đề hấp dẫn cho bài viết"
                required
              />

              <Textarea
                label="Tóm tắt"
                value={formData.excerpt}
                onChange={(value) => setFormData({ ...formData, excerpt: value })}
                placeholder="Mô tả ngắn gọn (hiển thị trong danh sách bài viết)"
                rows={3}
              />

              <TiptapEditor
                label="Nội dung chi tiết"
                value={formData.content}
                onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                placeholder="Nhập nội dung chi tiết của tin tức..."
                height={480}
              />
            </div>
          </div>

          {/* Section 2: Hình ảnh bìa */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Hình ảnh bìa</h2>
                <p className="text-xs text-gray-500">Ảnh hiển thị đại diện cho bài viết</p>
              </div>
            </div>
            <div className="p-6">
              <ImageUpload
                label="Tải lên hình ảnh bìa"
                value={formData.image}
                onChange={(imageUrl) => setFormData({ ...formData, image: imageUrl })}
              />
            </div>
          </div>

          {/* Section 3: Trạng thái */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Eye className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Trạng thái xuất bản</h2>
                <p className="text-xs text-gray-500">Kiểm soát trạng thái hiển thị bài viết</p>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Draft */}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, published: false }))}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    !formData.published
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    !formData.published ? 'bg-amber-200' : 'bg-gray-100'
                  }`}>
                    <EyeOff className={`h-5 w-5 ${!formData.published ? 'text-amber-700' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <div className={`text-sm font-semibold ${!formData.published ? 'text-amber-800' : 'text-gray-700'}`}>
                      Lưu nháp
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">Chỉ admin mới thấy</div>
                  </div>
                  {!formData.published && (
                    <div className="ml-auto w-4 h-4 bg-amber-400 rounded-full flex-shrink-0" />
                  )}
                </button>

                {/* Published */}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, published: true }))}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    formData.published
                      ? 'border-emerald-400 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    formData.published ? 'bg-emerald-200' : 'bg-gray-100'
                  }`}>
                    <Eye className={`h-5 w-5 ${formData.published ? 'text-emerald-700' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <div className={`text-sm font-semibold ${formData.published ? 'text-emerald-800' : 'text-gray-700'}`}>
                      Xuất bản
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">Hiển thị trên website</div>
                  </div>
                  {formData.published && (
                    <div className="ml-auto w-4 h-4 bg-emerald-400 rounded-full flex-shrink-0" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 pb-6">
            <Link href="/admin/news">
              <Button variant="secondary">Hủy bỏ</Button>
            </Link>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                disabled={loading}
                onClick={() => handleSubmit(false)}
              >
                {loading && publishMode === 'draft' ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang lưu...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Lưu nháp
                  </span>
                )}
              </Button>
              <Button
                disabled={loading}
                onClick={() => handleSubmit(true)}
              >
                {loading && publishMode === 'publish' ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang cập nhật...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Cập nhật & Xuất bản
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

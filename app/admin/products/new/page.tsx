'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button, Input, Select } from '@/components/admin/FormComponents';
import { useToast } from '@/components/Toast';
import { ArrowLeft, Package, Ruler, DollarSign, Images, Star, Save, FileCheck } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamic imports to optimize initial page loading (from customers feedback)
const TiptapEditor = dynamic(() => import('@/components/admin/TiptapEditor'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-gray-50 border border-gray-200 rounded-xl h-[300px] flex flex-col items-center justify-center gap-2">
      <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      <span className="text-xs text-gray-400 font-medium">Đang tải trình soạn thảo mô tả...</span>
    </div>
  ),
});

const MultiImageUpload = dynamic(() => import('@/components/admin/MultiImageUpload'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-gray-50 border border-gray-200 rounded-xl h-[200px] flex flex-col items-center justify-center gap-2">
      <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      <span className="text-xs text-gray-400 font-medium">Đang tải khung tải ảnh...</span>
    </div>
  ),
});

interface Category {
  id: number;
  name: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    capacity: '',
    accuracy: '',
    price: '',
    featured: false,
    dialSize: '',
    scaleSize: '',
    manufacturer: '',
    origin: '',
  });
  const [images, setImages] = useState<string[]>([]);
  
  // Draft States
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [draftData, setDraftData] = useState<any>(null);
  const [autosaveTime, setAutosaveTime] = useState<string>('');

  useEffect(() => {
    fetchCategories();

    // Check if draft exists on mount
    const savedDraft = localStorage.getItem('product_draft_new');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.formData && (parsed.formData.name || parsed.formData.description || parsed.images?.length > 0)) {
          setDraftData(parsed);
          setShowDraftBanner(true);
        }
      } catch (e) {
        console.error('Error loading draft:', e);
      }
    }
  }, []);

  // Autosave when changes occur
  useEffect(() => {
    const hasContent = formData.name.trim() !== '' || 
                       (formData.description && formData.description !== '<p></p>') || 
                       images.length > 0 || 
                       formData.price.trim() !== '' ||
                       formData.capacity.trim() !== '';

    if (hasContent) {
      const draftObj = {
        formData,
        images,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('product_draft_new', JSON.stringify(draftObj));
      
      const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setAutosaveTime(timeStr);
    }
  }, [formData, images]);

  const restoreDraft = () => {
    if (draftData) {
      setFormData(draftData.formData);
      setImages(draftData.images);
      toast.success('Khôi phục bản nháp thành công!', 'Dữ liệu trước đó của bạn đã được điền lại.');
      setShowDraftBanner(false);
    }
  };

  const discardDraft = () => {
    localStorage.removeItem('product_draft_new');
    setShowDraftBanner(false);
    toast.info('Đã xóa bản nháp', 'Bản nháp đã được dọn dẹp khỏi trình duyệt.');
  };

  const handleManualSave = () => {
    const draftObj = {
      formData,
      images,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('product_draft_new', JSON.stringify(draftObj));
    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setAutosaveTime(timeStr);
    toast.success('Đã lưu bản nháp!', 'Bản nháp sản phẩm đã được lưu trữ an toàn.');
  };

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
      const payload = {
        ...formData,
        image: images[0] || '',
        images,
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('Thành công!', 'Sản phẩm đã được tạo thành công');
        localStorage.removeItem('product_draft_new'); // Clear draft on successful submit
        router.push('/admin/products');
      } else {
        const error = await response.json();
        toast.error('Có lỗi xảy ra', error.error || 'Không thể tạo sản phẩm');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Có lỗi xảy ra', 'Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            aria-label="Quay lại danh sách sản phẩm"
            className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Thêm sản phẩm mới</h1>
            <p className="text-sm text-gray-500 mt-0.5">Điền đầy đủ thông tin để tạo sản phẩm</p>
          </div>
        </div>

        {/* Draft Notification Banner */}
        {showDraftBanner && draftData && (
          <div className="bg-amber-50 border-2 border-amber-200 text-amber-900 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 text-amber-600">
                <Save className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-800">Phát hiện bản nháp chưa hoàn thành!</h3>
                <p className="text-xs text-amber-700 mt-0.5">
                  Hệ thống tìm thấy một bản nháp sản phẩm được lưu tự động vào lúc{' '}
                  <span className="font-semibold">
                    {new Date(draftData.updatedAt).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    ngày{' '}
                    {new Date(draftData.updatedAt).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </span>
                  . Bạn có muốn tiếp tục làm việc trên bản nháp này không?
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end md:self-center">
              <button
                type="button"
                onClick={discardDraft}
                className="px-3.5 py-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 hover:bg-amber-100 rounded-lg transition-colors border border-transparent cursor-pointer"
              >
                Xóa nháp
              </button>
              <button
                type="button"
                onClick={restoreDraft}
                className="px-4 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all shadow shadow-amber-500/20 cursor-pointer"
              >
                Khôi phục bản nháp
              </button>
            </div>
          </div>
        )}

        {/*
          Bố cục 2 cột từ 1280px trở lên: nội dung nhập bên trái, ảnh bên phải.
          Bản trước dùng max-w-5xl canh trái nên trên màn hình 1920px bỏ trống
          hơn 600px bên phải, còn người dùng phải cuộn dài mới tới phần ảnh.
          Dưới 1280px tự xếp dọc một cột (tiêu chí 6).
        */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-6 items-start">
          <div className="space-y-6 min-w-0">
          {/* Section 1: Thông tin cơ bản */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Thông tin cơ bản</h2>
                <p className="text-xs text-gray-500">Tên, danh mục và mô tả sản phẩm</p>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

              <TiptapEditor
                label="Mô tả sản phẩm"
                value={formData.description}
                onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                placeholder="Nhập mô tả chi tiết về sản phẩm"
                height={280}
              />

              {/* Nổi bật toggle */}
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.featured}
                  aria-label="Đánh dấu là sản phẩm nổi bật, hiển thị ưu tiên trên trang chủ"
                  onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 ${
                    formData.featured ? 'bg-amber-400' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      formData.featured ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <div className="flex items-center gap-2">
                  <Star className={`h-4 w-4 ${formData.featured ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium text-gray-700">Sản phẩm nổi bật</span>
                  <span className="text-xs text-gray-500">— hiển thị ưu tiên trên trang chủ</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Thông số kỹ thuật */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Ruler className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Thông số kỹ thuật</h2>
                <p className="text-xs text-gray-500">Thông số đo lường và kích thước</p>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá <span className="text-gray-400 font-normal">(VNĐ)</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="vd: 2,500,000"
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Kích thước dia"
                  value={formData.dialSize}
                  onChange={(value) => setFormData({ ...formData, dialSize: value })}
                  placeholder="vd: Φ280mm"
                />
                <Input
                  label="Kích thước cân"
                  value={formData.scaleSize}
                  onChange={(value) => setFormData({ ...formData, scaleSize: value })}
                  placeholder="vd: 400x500mm"
                />
                <Input
                  label="Sản xuất"
                  value={formData.manufacturer}
                  onChange={(value) => setFormData({ ...formData, manufacturer: value })}
                  placeholder="vd: Nhà máy ABC"
                />
                <Input
                  label="Xuất xứ"
                  value={formData.origin}
                  onChange={(value) => setFormData({ ...formData, origin: value })}
                  placeholder="vd: Việt Nam, Nhật Bản"
                />
              </div>
            </div>
          </div>

          </div>

          {/* ── Cột phải: ảnh sản phẩm, dính theo khi cuộn ── */}
          <div className="space-y-6 xl:sticky xl:top-20 min-w-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Images className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Hình ảnh sản phẩm</h2>
                <p className="text-xs text-gray-500">Tối đa 10 ảnh — ảnh đầu tiên là ảnh chính</p>
              </div>
            </div>
            <div className="p-6">
              <MultiImageUpload
                values={images}
                onChange={setImages}
                maxImages={10}
              />
            </div>
          </div>

          </div>

          {/* Thanh hành động trải hết chiều ngang, luôn ở cuối form */}
          <div className="xl:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-6 border-t border-gray-100">
            <div className="flex items-center gap-2">
              {autosaveTime ? (
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 font-medium">
                  <FileCheck className="w-3.5 h-3.5" />
                  Đã tự động lưu nháp lúc {autosaveTime}
                </span>
              ) : (
                <span className="text-xs text-gray-400 italic">
                  Thay đổi sẽ được tự động lưu nháp dưới trình duyệt
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Link
                href="/admin/products"
                className="w-full sm:w-auto inline-flex items-center justify-center min-h-touch px-4 rounded-lg bg-white text-gray-700 border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Hủy bỏ
              </Link>
              <Button
                type="button"
                variant="secondary"
                onClick={handleManualSave}
                className="w-full sm:w-auto bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 flex items-center justify-center gap-1.5 cursor-pointer font-medium"
              >
                <Save className="w-4 h-4" />
                Lưu nháp
              </Button>
              <Button type="submit" disabled={loading} className="w-full sm:w-auto cursor-pointer">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang tạo...
                  </span>
                ) : (
                  'Tạo sản phẩm'
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

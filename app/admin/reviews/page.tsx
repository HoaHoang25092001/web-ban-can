'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Table, TableRow, TableCell } from '@/components/admin/Table';
import { Button } from '@/components/admin/FormComponents';
import { useToast } from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Plus, Edit, Trash2, Eye, EyeOff, Star, X, Check } from 'lucide-react';

interface Review {
  id: number;
  reviewerName: string;
  content: string;
  rating: number;
  isVisible: boolean;
  createdAt: string;
}

interface FormState {
  reviewerName: string;
  content: string;
  rating: number;
  isVisible: boolean;
}

const emptyForm: FormState = {
  reviewerName: '',
  content: '',
  rating: 5,
  isVisible: true,
};

function StarSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none"
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              star <= (hovered || value)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-500 fill-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewsAdminPage() {
  const toast = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews?all=true');
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch {
      toast.error('Lỗi', 'Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (review: Review) => {
    setEditId(review.id);
    setForm({
      reviewerName: review.reviewerName,
      content: review.content,
      rating: review.rating,
      isVisible: review.isVisible,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.reviewerName.trim() || !form.content.trim()) {
      toast.error('Thiếu thông tin', 'Vui lòng nhập tên và nội dung đánh giá');
      return;
    }
    setSaving(true);
    try {
      const url = editId ? `/api/reviews/${editId}` : '/api/reviews';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success('Thành công', editId ? 'Đã cập nhật đánh giá' : 'Đã thêm đánh giá mới');
      setShowForm(false);
      fetchReviews();
    } catch {
      toast.error('Lỗi', 'Không thể lưu đánh giá');
    } finally {
      setSaving(false);
    }
  };

  const toggleVisible = async (review: Review) => {
    try {
      await fetch(`/api/reviews/${review.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !review.isVisible }),
      });
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, isVisible: !r.isVisible } : r))
      );
    } catch {
      toast.error('Lỗi', 'Không thể cập nhật trạng thái');
    }
  };

  const handleDelete = (id: number) => setDeleteConfirm({ isOpen: true, id });

  const confirmDelete = async () => {
    const id = deleteConfirm.id;
    if (!id) return;
    try {
      await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success('Đã xóa', 'Đánh giá đã được xóa');
    } catch {
      toast.error('Lỗi', 'Không thể xóa đánh giá');
    } finally {
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-8 text-gray-500">Đang tải dữ liệu...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Đánh Giá Khách Hàng</h1>
            <p className="text-gray-600">Quản lý mục &ldquo;Khách Hàng Nói Gì?&rdquo; trên trang chủ</p>
          </div>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm đánh giá
          </Button>
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold text-gray-900">
                  {editId ? 'Chỉnh sửa đánh giá' : 'Thêm đánh giá mới'}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên khách hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.reviewerName}
                    onChange={(e) => setForm((f) => ({ ...f, reviewerName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Vd: Trần Thị Lan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nội dung đánh giá <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                    placeholder="Nhập nội dung đánh giá..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số sao</label>
                  <StarSelector value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, isVisible: !f.isVisible }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      form.isVisible ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        form.isVisible ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-gray-700">Hiển thị trên trang chủ</span>
                </div>
              </div>

              <div className="flex gap-3 mt-6 justify-end">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {editId ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white shadow rounded-lg">
          <Table headers={['Khách hàng', 'Nội dung', 'Số sao', 'Hiển thị', 'Ngày tạo', 'Thao tác']}>
            {reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>
                  <span className="font-medium text-gray-900">{review.reviewerName}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600 max-w-xs line-clamp-2">{review.content}</span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500 fill-gray-300'}`}
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => toggleVisible(review)}
                    className={`${review.isVisible ? 'text-green-600' : 'text-gray-500'} hover:text-green-700`}
                    title={review.isVisible ? 'Ẩn đánh giá' : 'Hiện đánh giá'}
                  >
                    {review.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <span
                    className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      review.isVisible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {review.isVisible ? 'Hiển thị' : 'Ẩn'}
                  </span>
                </TableCell>
                <TableCell>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(review)} className="text-blue-600 hover:text-blue-800">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(review.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>

          {reviews.length === 0 && (
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">Chưa có đánh giá nào</p>
              <Button onClick={openAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm đánh giá đầu tiên
              </Button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa đánh giá này?"
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
        variant="danger"
      />
    </AdminLayout>
  );
}

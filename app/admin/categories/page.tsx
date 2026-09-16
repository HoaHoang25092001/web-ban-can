'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Table, TableRow, TableCell } from '@/components/admin/Table';
import { Button } from '@/components/admin/FormComponents';
import { useToast } from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Plus, Edit, Trash2, Tag, X, Check } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  showOnHome: boolean;
  homeOrder: number;
  _count?: { products: number };
  products?: { id: number }[];
  createdAt: string;
}

interface FormState {
  name: string;
  description: string;
  icon: string;
}

const emptyForm: FormState = {
  name: '',
  description: '',
  icon: '',
};

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

export default function CategoriesPage() {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
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
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories?includeProducts=true');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      toast.error('Lỗi', 'Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (category: Category) => {
    setEditId(category.id);
    setForm({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Thiếu thông tin', 'Vui lòng nhập tên danh mục');
      return;
    }
    setSaving(true);
    try {
      const url = editId ? `/api/categories/${editId}` : '/api/categories';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success('Thành công', editId ? 'Đã cập nhật danh mục' : 'Đã thêm danh mục mới');
      setShowForm(false);
      fetchCategories();
    } catch {
      toast.error('Lỗi', 'Không thể lưu danh mục');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => setDeleteConfirm({ isOpen: true, id });

  const confirmDelete = async () => {
    const id = deleteConfirm.id;
    if (!id) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        toast.error('Không thể xóa', err.error === 'Cannot delete category with existing products'
          ? 'Danh mục đang có sản phẩm. Hãy xóa hoặc chuyển sản phẩm trước.'
          : 'Có lỗi xảy ra khi xóa danh mục');
        return;
      }
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success('Đã xóa', 'Danh mục đã được xóa thành công');
    } catch {
      toast.error('Lỗi', 'Không thể xóa danh mục');
    } finally {
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  /**
   * Bật/tắt hiển thị danh mục trên trang chủ, hoặc đổi thứ tự.
   *
   * Cập nhật giao diện trước rồi mới gọi API: người dùng thấy phản hồi ngay,
   * không phải chờ mạng. Nếu lưu thất bại thì trả lại giá trị cũ (tiêu chí 7).
   */
  const updateHomeSetting = async (
    cat: Category,
    patch: { showOnHome?: boolean; homeOrder?: number }
  ) => {
    const prev = { showOnHome: cat.showOnHome, homeOrder: cat.homeOrder };
    setCategories((list) =>
      list.map((c) => (c.id === cat.id ? { ...c, ...patch } : c))
    );
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cat.name,
          description: cat.description,
          icon: cat.icon,
          ...prev,
          ...patch,
        }),
      });
      if (!res.ok) throw new Error();
      if (patch.showOnHome !== undefined) {
        toast.success(
          patch.showOnHome
            ? `Đã hiện "${cat.name}" trên trang chủ`
            : `Đã ẩn "${cat.name}" khỏi trang chủ`
        );
      }
    } catch {
      // Trả lại trạng thái cũ để giao diện không nói dối về dữ liệu đã lưu.
      setCategories((list) =>
        list.map((c) => (c.id === cat.id ? { ...c, ...prev } : c))
      );
      toast.error('Chưa lưu được', 'Vui lòng thử lại.');
    }
  };

  const getProductCount = (cat: Category) => cat.products?.length ?? cat._count?.products ?? 0;

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
            <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục sản phẩm</h1>
            <p className="text-gray-600">Quản lý các danh mục sản phẩm của website</p>
          </div>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm danh mục mới
          </Button>
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold text-gray-900">
                  {editId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Tên danh mục */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên danh mục <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Vd: Cân điện tử"
                  />
                </div>

                {/* Mô tả */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                    placeholder="Nhập mô tả cho danh mục..."
                  />
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <div className="flex gap-2 items-center">
                    <select
                      value={form.icon}
                      onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">Chọn icon...</option>
                      {iconOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {/* Preview icon */}
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {form.icon ? (
                        <i className={`${form.icon} text-2xl text-blue-600`} />
                      ) : (
                        <Tag className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                  </div>
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
          <Table headers={['Icon', 'Tên danh mục', 'Số sản phẩm', 'Hiện trang chủ', 'Thứ tự', 'Thao tác']}>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    {category.icon ? (
                      <i className={`${category.icon} text-xl text-blue-600`} />
                    ) : (
                      <Tag className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-gray-900">{category.name}</span>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getProductCount(category)} sản phẩm
                  </span>
                </TableCell>

                {/* Bật/tắt hiển thị trên trang chủ */}
                <TableCell>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={category.showOnHome}
                    onClick={() =>
                      updateHomeSetting(category, { showOnHome: !category.showOnHome })
                    }
                    aria-label={`${category.showOnHome ? 'Ẩn' : 'Hiện'} danh mục ${category.name} trên trang chủ`}
                    className="inline-flex items-center gap-2 min-h-touch"
                  >
                    <span
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
                        category.showOnHome ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform mt-0.5 ${
                          category.showOnHome ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </span>
                    {/* Kèm chữ, không chỉ dựa vào màu để truyền đạt trạng thái. */}
                    <span className={`text-sm font-medium ${category.showOnHome ? 'text-emerald-700' : 'text-gray-500'}`}>
                      {category.showOnHome ? 'Đang hiện' : 'Đang ẩn'}
                    </span>
                  </button>
                </TableCell>

                {/* Thứ tự hiển thị */}
                <TableCell>
                  <label className="sr-only" htmlFor={`order-${category.id}`}>
                    Thứ tự hiển thị của {category.name}
                  </label>
                  <input
                    id={`order-${category.id}`}
                    type="number"
                    min={0}
                    max={99}
                    defaultValue={category.homeOrder}
                    disabled={!category.showOnHome}
                    onBlur={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (Number.isFinite(v) && v !== category.homeOrder) {
                        updateHomeSetting(category, { homeOrder: v });
                      }
                    }}
                    title="Số nhỏ hiện trước. Bấm ra ngoài để lưu."
                    className="w-20 min-h-touch px-3 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {/* Nút chỉ có icon: cần vùng chạm đủ lớn và aria-label mô tả
                        rõ thao tác trên mục nào, vì screen reader không đọc được
                        icon và title chỉ hiện khi rê chuột (tiêu chí 5). */}
                    <button
                      onClick={() => openEdit(category)}
                      className="w-11 h-11 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Chỉnh sửa"
                      aria-label={`Chỉnh sửa danh mục ${category.name}`}
                    >
                      <Edit className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="w-11 h-11 flex items-center justify-center rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      title="Xóa"
                      aria-label={`Xóa danh mục ${category.name}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>

          {categories.length === 0 && (
            <div className="text-center py-12">
              <Tag className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">Chưa có danh mục nào</p>
              <Button onClick={openAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm danh mục đầu tiên
              </Button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
        variant="danger"
      />
    </AdminLayout>
  );
}

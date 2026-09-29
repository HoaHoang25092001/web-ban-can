'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Loader2, Package, X, Check } from 'lucide-react';

interface Product {
  id: number;
  code: string;
  name: string;
}

/**
 * Danh mục mặt hàng của khách.
 *
 * Khai báo sẵn mặt hàng để lúc cân chỉ việc chọn từ danh sách — nhanh hơn và
 * không sai chính tả so với gõ tay mỗi lần (tiêu chí 8).
 */
export default function ProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ code: '', name: '' });
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/scale/products');
      if (res.ok) setProducts((await res.json()).products ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setEditing(null);
    setForm({ code: '', name: '' });
    setError('');
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ code: p.code, name: p.name });
    setError('');
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/scale/products', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing ? { ...form, id: editing.id } : form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setShowForm(false);
        load();
      } else {
        setError(data.error ?? 'Không lưu được.');
      }
    } catch {
      setError('Không kết nối được tới máy chủ.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: Product) => {
    /* Cảnh báo rõ hậu quả: xoá mặt hàng KHÔNG xoá bản ghi cân cũ — sổ sách
       phải giữ nguyên thông tin tại thời điểm cân. */
    if (!confirm(`Xoá mặt hàng "${p.name}"?\n\nCác bản ghi cân cũ vẫn được giữ nguyên.`)) return;
    const res = await fetch('/api/scale/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id }),
    });
    if (res.ok) load();
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-2 min-h-touch px-5 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4" aria-hidden="true" /> Thêm mặt hàng
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900">
              {editing ? 'Sửa mặt hàng' : 'Thêm mặt hàng mới'}
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              aria-label="Đóng biểu mẫu"
              className="inline-flex items-center justify-center min-w-touch min-h-touch rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="p-code" className="block text-sm font-medium text-slate-700 mb-1.5">
                Mã hàng
              </label>
              <input
                id="p-code" required value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="VD: SP001"
                className="w-full min-h-touch px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label htmlFor="p-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                Tên hàng
              </label>
              <input
                id="p-name" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="VD: Gạo ST25"
                className="w-full min-h-touch px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button" onClick={() => setShowForm(false)}
              className="inline-flex items-center min-h-touch px-4 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Huỷ
            </button>
            <button
              type="submit" disabled={saving}
              className="inline-flex items-center gap-2 min-h-touch px-5 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Check className="w-4 h-4" aria-hidden="true" />}
              {saving ? 'Đang lưu…' : 'Lưu'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
          <span className="text-sm">Đang tải…</span>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" aria-hidden="true" />
          <p className="font-semibold text-slate-900">Chưa có mặt hàng nào</p>
          <p className="text-sm text-slate-600 mt-1">
            Khai báo mặt hàng để lúc cân chỉ việc chọn từ danh sách.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <li key={p.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="font-semibold text-slate-900 truncate">{p.name}</div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">{p.code}</div>
              <div className="flex gap-1 mt-3 pt-3 border-t border-slate-100">
                <button
                  type="button" onClick={() => openEdit(p)}
                  className="inline-flex items-center gap-1.5 min-h-touch px-3 rounded-lg text-sm text-slate-600 hover:text-brand-700 hover:bg-brand-50 transition-colors"
                >
                  <Pencil className="w-4 h-4" aria-hidden="true" /> Sửa
                </button>
                <button
                  type="button" onClick={() => remove(p)}
                  className="inline-flex items-center gap-1.5 min-h-touch px-3 rounded-lg text-sm text-slate-600 hover:text-red-700 hover:bg-red-50 ml-auto transition-colors"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" /> Xoá
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

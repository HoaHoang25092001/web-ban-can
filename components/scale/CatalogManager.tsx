'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Loader2, X, Check, Search } from 'lucide-react';

interface Item {
  id: number;
  code: string;
  name: string;
}

/**
 * Quản lý một danh mục đơn giản (mã + tên).
 *
 * Dùng chung cho Sản phẩm và Nhân viên: hai màn hình này giống nhau tới từng
 * ô nhập, chỉ khác nhãn chữ. Viết hai bản riêng thì mỗi lần sửa một chi tiết
 * lại phải nhớ sửa cả hai nơi — quên một chỗ là hai màn hình lệch nhau.
 *
 * Dự án gốc cũng dùng đúng cách này (components/catalog-manager.tsx).
 */
export default function CatalogManager({
  endpoint,
  labels,
}: {
  /** Địa chỉ API, ví dụ '/api/scale/products'. */
  endpoint: string;
  labels: {
    /** Tên loại mục, số ít — dùng trong câu "Thêm {singular}". */
    singular: string;
    codeLabel: string;
    nameLabel: string;
    codePlaceholder: string;
    namePlaceholder: string;
    emptyTitle: string;
    emptyHint: string;
    /** Cảnh báo khi xoá — nói rõ bản ghi cũ có mất theo không. */
    deleteNote: string;
    /** Khoá trong JSON trả về, ví dụ 'products' hoặc 'employees'. */
    listKey: string;
  };
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState({ code: '', name: '' });
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(endpoint);
      if (res.ok) setItems((await res.json())[labels.listKey] ?? []);
    } finally {
      setLoading(false);
    }
  }, [endpoint, labels.listKey]);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setEditing(null);
    setForm({ code: '', name: '' });
    setError('');
    setShowForm(true);
  };

  const openEdit = (it: Item) => {
    setEditing(it);
    setForm({ code: it.code, name: it.name });
    setError('');
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch(endpoint, {
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

  const remove = async (it: Item) => {
    if (!confirm(`Xoá "${it.name}"?\n\n${labels.deleteNote}`)) return;
    setDeleting(it.id);
    try {
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: it.id }),
      });
      if (res.ok) load();
    } finally {
      setDeleting(null);
    }
  };

  // Lọc ngay trên trình duyệt: danh sách tối đa 500 mục nên không cần gọi lại
  // máy chủ mỗi lần gõ một chữ.
  const visible = items.filter(
    (it) =>
      !search.trim() ||
      it.name.toLowerCase().includes(search.toLowerCase().trim()) ||
      it.code.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <label htmlFor="cat-search" className="sr-only">
            Tìm kiếm
          </label>
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-scale-muted-fg pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="cat-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Tìm ${labels.singular.toLowerCase()}…`}
            className="w-full min-h-touch pl-9 pr-3 rounded-lg bg-scale-card border border-scale-input text-scale-fg text-sm focus:outline-none focus:ring-2 focus:ring-scale-ring"
          />
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center justify-center gap-2 min-h-touch px-5 rounded-lg bg-scale-primary text-scale-primary-fg text-sm font-semibold hover:bg-scale-primary-hover transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden="true" /> Thêm {labels.singular.toLowerCase()}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-scale-card rounded-xl border border-scale-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-scale-fg">
              {editing ? `Sửa ${labels.singular.toLowerCase()}` : `Thêm ${labels.singular.toLowerCase()}`}
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              aria-label="Đóng biểu mẫu"
              className="inline-flex items-center justify-center min-w-touch min-h-touch rounded-lg text-scale-muted-fg hover:bg-scale-muted transition-colors"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {error && (
            <p
              role="alert"
              className="text-sm text-scale-danger bg-scale-danger-soft border border-scale-danger rounded-lg p-3"
            >
              {error}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="cat-code" className="block text-sm font-medium text-scale-fg mb-1.5">
                {labels.codeLabel}
              </label>
              <input
                id="cat-code"
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder={labels.codePlaceholder}
                className="w-full min-h-touch px-3 rounded-lg bg-scale-card border border-scale-input text-scale-fg text-sm focus:outline-none focus:ring-2 focus:ring-scale-ring"
              />
            </div>
            <div>
              <label htmlFor="cat-name" className="block text-sm font-medium text-scale-fg mb-1.5">
                {labels.nameLabel}
              </label>
              <input
                id="cat-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={labels.namePlaceholder}
                className="w-full min-h-touch px-3 rounded-lg bg-scale-card border border-scale-input text-scale-fg text-sm focus:outline-none focus:ring-2 focus:ring-scale-ring"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="inline-flex items-center min-h-touch px-4 rounded-lg border border-scale-border text-sm font-medium text-scale-fg hover:bg-scale-muted transition-colors"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 min-h-touch px-5 rounded-lg bg-scale-primary text-scale-primary-fg text-sm font-semibold hover:bg-scale-primary-hover disabled:opacity-60 transition-colors"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Check className="w-4 h-4" aria-hidden="true" />
              )}
              {saving ? 'Đang lưu…' : 'Lưu'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-scale-muted-fg">
          <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
          <span className="text-sm">Đang tải…</span>
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-scale-card rounded-xl border border-scale-border p-12 text-center">
          <p className="font-semibold text-scale-fg">
            {search.trim() ? 'Không tìm thấy kết quả nào' : labels.emptyTitle}
          </p>
          <p className="text-sm text-scale-muted-fg mt-1">
            {search.trim() ? 'Thử từ khoá khác.' : labels.emptyHint}
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((it) => (
            <li key={it.id} className="bg-scale-card rounded-xl border border-scale-border p-4">
              <div className="font-semibold text-scale-fg truncate">{it.name}</div>
              <div className="text-xs text-scale-muted-fg font-mono mt-0.5">{it.code}</div>
              <div className="flex gap-1 mt-3 pt-3 border-t border-scale-border">
                <button
                  type="button"
                  onClick={() => openEdit(it)}
                  className="inline-flex items-center gap-1.5 min-h-touch px-3 rounded-lg text-sm text-scale-muted-fg hover:text-scale-primary hover:bg-scale-accent transition-colors"
                >
                  <Pencil className="w-4 h-4" aria-hidden="true" /> Sửa
                </button>
                <button
                  type="button"
                  onClick={() => remove(it)}
                  disabled={deleting === it.id}
                  className="inline-flex items-center gap-1.5 min-h-touch px-3 rounded-lg text-sm text-scale-muted-fg hover:text-scale-danger hover:bg-scale-danger-soft ml-auto disabled:opacity-40 transition-colors"
                >
                  {deleting === it.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  )}
                  Xoá
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

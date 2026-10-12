'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Loader2, X, Check, Search, Phone, MapPin, FileText } from 'lucide-react';

export interface Customer {
  id: number;
  code: string;
  name: string;
  phone: string | null;
  address: string | null;
  note: string | null;
  _count?: { tickets: number };
}

const EMPTY = { code: '', name: '', phone: '', address: '', note: '' };

const INPUT =
  'w-full min-h-touch px-3 rounded-lg bg-scale-card border border-scale-input text-scale-fg text-sm focus:outline-none focus:ring-2 focus:ring-scale-ring';

/**
 * Danh bạ khách hàng của phần cân.
 *
 * Tách riêng khỏi CatalogManager vì khách có thêm số điện thoại, địa chỉ,
 * ghi chú — nhét vào bộ quản lý mã + tên dùng chung thì bộ đó phải mọc thêm
 * cả chục tuỳ chọn chỉ để phục vụ một màn hình.
 */
export default function CustomerManager() {
  const [items, setItems] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/scale/customers');
      if (res.ok) setItems((await res.json()).customers ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY);
    setError('');
    setShowForm(true);
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({
      code: c.code,
      name: c.name,
      phone: c.phone ?? '',
      address: c.address ?? '',
      note: c.note ?? '',
    });
    setError('');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/scale/customers', {
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

  const remove = async (c: Customer) => {
    if (!confirm(`Xoá khách "${c.name}" khỏi danh bạ?\n\nCác phiếu cũ vẫn giữ nguyên tên, số điện thoại và địa chỉ đã in.`)) return;
    setDeleting(c.id);
    try {
      const res = await fetch('/api/scale/customers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c.id }),
      });
      if (res.ok) load();
    } finally {
      setDeleting(null);
    }
  };

  const q = search.toLowerCase().trim();
  const visible = items.filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      (c.phone ?? '').includes(q) ||
      (c.address ?? '').toLowerCase().includes(q)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <label htmlFor="cus-search" className="sr-only">
            Tìm khách hàng
          </label>
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-scale-muted-fg pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="cus-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, mã, số điện thoại, địa chỉ…"
            className={`${INPUT} pl-9`}
          />
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center justify-center gap-2 min-h-touch px-5 rounded-lg bg-scale-primary text-scale-primary-fg text-sm font-semibold hover:bg-scale-primary-hover transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden="true" /> Thêm khách hàng
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-scale-card rounded-xl border border-scale-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-scale-fg">{editing ? 'Sửa khách hàng' : 'Thêm khách hàng'}</h2>
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
            <p role="alert" className="text-sm text-scale-danger bg-scale-danger-soft border border-scale-danger rounded-lg p-3">
              {error}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="cus-name" className="block text-sm font-medium text-scale-fg mb-1.5">
                Tên khách hàng
              </label>
              <input
                id="cus-name"
                required
                autoFocus
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="VD: Chị Hoa – vựa cá Bến Tre"
                className={INPUT}
              />
            </div>
            <div>
              <label htmlFor="cus-code" className="block text-sm font-medium text-scale-fg mb-1.5">
                Mã khách{' '}
                <span className="text-scale-muted-fg font-normal">
                  {editing ? '' : '(để trống để tự đánh mã)'}
                </span>
              </label>
              <input
                id="cus-code"
                required={Boolean(editing)}
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="VD: KH00001"
                className={INPUT}
              />
            </div>
            <div>
              <label htmlFor="cus-phone" className="block text-sm font-medium text-scale-fg mb-1.5">
                Điện thoại
              </label>
              <input
                id="cus-phone"
                type="tel"
                inputMode="tel"
                autoComplete="off"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="VD: 0909 123 456"
                className={INPUT}
              />
            </div>
            <div>
              <label htmlFor="cus-address" className="block text-sm font-medium text-scale-fg mb-1.5">
                Địa chỉ
              </label>
              <input
                id="cus-address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className={INPUT}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="cus-note" className="block text-sm font-medium text-scale-fg mb-1.5">
                Ghi chú <span className="text-scale-muted-fg font-normal">(không in ra phiếu)</span>
              </label>
              <input
                id="cus-note"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="VD: Hay lấy khay nhựa xanh, giao trước 6 giờ sáng"
                className={INPUT}
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
              {saving ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Check className="w-4 h-4" aria-hidden="true" />}
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
          <p className="font-semibold text-scale-fg">{q ? 'Không tìm thấy khách nào' : 'Chưa có khách hàng nào'}</p>
          <p className="text-sm text-scale-muted-fg mt-1">
            {q
              ? 'Thử từ khoá khác.'
              : 'Thêm khách ở đây, hoặc gõ tên khách mới ngay lúc lập phiếu — hệ thống tự lưu vào danh bạ.'}
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-scale-muted-fg">{visible.length} khách hàng</p>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((c) => (
              <li key={c.id} className="bg-scale-card rounded-xl border border-scale-border p-4 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-scale-fg truncate">{c.name}</div>
                    <div className="text-xs text-scale-muted-fg font-mono mt-0.5">{c.code}</div>
                  </div>
                  {c._count && c._count.tickets > 0 && (
                    <span className="flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-scale-accent text-scale-accent-fg">
                      {c._count.tickets} phiếu
                    </span>
                  )}
                </div>

                <div className="mt-2 space-y-1 text-sm flex-1">
                  {c.phone && (
                    <a
                      href={`tel:${c.phone.replace(/[^\d+]/g, '')}`}
                      className="inline-flex items-center gap-1.5 min-h-touch -my-2 text-scale-fg hover:text-scale-primary"
                    >
                      <Phone className="w-3.5 h-3.5 text-scale-muted-fg flex-shrink-0" aria-hidden="true" />
                      {c.phone}
                    </a>
                  )}
                  {c.address && (
                    <p className="flex items-start gap-1.5 text-scale-muted-fg">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="line-clamp-2">{c.address}</span>
                    </p>
                  )}
                  {c.note && <p className="text-xs text-scale-muted-fg italic line-clamp-2">{c.note}</p>}
                </div>

                <div className="flex gap-1 mt-3 pt-3 border-t border-scale-border">
                  <Link
                    href={`/can-dien-tu?khach=${c.id}`}
                    className="inline-flex items-center gap-1.5 min-h-touch px-3 rounded-lg text-sm font-medium text-scale-primary hover:bg-scale-accent transition-colors"
                  >
                    <FileText className="w-4 h-4" aria-hidden="true" /> Lập phiếu
                  </Link>
                  <button
                    type="button"
                    onClick={() => openEdit(c)}
                    className="inline-flex items-center gap-1.5 min-h-touch px-3 rounded-lg text-sm text-scale-muted-fg hover:text-scale-primary hover:bg-scale-accent transition-colors"
                  >
                    <Pencil className="w-4 h-4" aria-hidden="true" /> Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(c)}
                    disabled={deleting === c.id}
                    aria-label={`Xoá ${c.name}`}
                    className="inline-flex items-center justify-center min-h-touch min-w-touch rounded-lg text-sm text-scale-muted-fg hover:text-scale-danger hover:bg-scale-danger-soft ml-auto disabled:opacity-40 transition-colors"
                  >
                    {deleting === c.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Loader2, Check, Search, Phone, MapPin, FileText, Users } from 'lucide-react';
import { useConfirm } from '@/components/scale/confirm';
import { Badge, Card, EmptyState, Field, Notice, buttonClass, cx, inputClass } from '@/components/scale/ui';

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
type FieldName = 'code' | 'name' | 'phone';

/**
 * Danh bạ khách hàng của phần cân.
 *
 * Tách riêng khỏi CatalogManager vì khách có thêm số điện thoại, địa chỉ,
 * ghi chú — nhét vào bộ quản lý mã + tên dùng chung thì bộ đó phải mọc thêm
 * cả chục tuỳ chọn chỉ để phục vụ một màn hình. Nhưng dùng cùng bộ thành
 * phần giao diện (components/scale/ui.tsx) nên trông và thao tác y hệt.
 */
export default function CustomerManager() {
  const confirm = useConfirm();
  const [items, setItems] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);

  const refs = { code: useRef<HTMLInputElement>(null), name: useRef<HTMLInputElement>(null), phone: useRef<HTMLInputElement>(null) };
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/scale/customers');
      if (!res.ok) throw new Error();
      setItems((await res.json()).customers ?? []);
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openForm = (c: Customer | null) => {
    setEditing(c);
    setForm(c ? { code: c.code, name: c.name, phone: c.phone ?? '', address: c.address ?? '', note: c.note ?? '' } : EMPTY);
    setFormError('');
    setFieldErrors({});
    setNotice(null);
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      refs.name.current?.focus({ preventScroll: true });
    }, 0);
  };

  const closeForm = () => {
    setShowForm(false);
    addButtonRef.current?.focus();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Partial<Record<FieldName, string>> = {};
    if (!form.name.trim()) errs.name = 'Nhập tên khách hàng.';
    if (editing && !form.code.trim()) errs.code = 'Nhập mã khách, ví dụ KH00001.';
    // Số điện thoại: chỉ kiểm tra có đủ chữ số, vẫn cho gõ dấu cách, dấu chấm cho dễ đọc.
    const digits = form.phone.replace(/\D/g, '');
    if (form.phone.trim() && (digits.length < 9 || digits.length > 12)) errs.phone = 'Số điện thoại cần 9–12 chữ số, ví dụ 0909 123 456.';
    setFieldErrors(errs);
    const first = (['name', 'code', 'phone'] as FieldName[]).find((f) => errs[f]);
    if (first) {
      refs[first].current?.focus();
      return;
    }

    setFormError('');
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
        setNotice({ tone: 'success', text: `${editing ? 'Đã cập nhật' : 'Đã thêm'} khách "${form.name.trim()}"${editing ? '' : ` — mã ${data.code}`}.` });
        load();
        addButtonRef.current?.focus();
      } else if (data.field && data.field in refs) {
        setFieldErrors({ [data.field]: data.error });
        refs[data.field as FieldName].current?.focus();
      } else {
        setFormError(data.error ?? 'Không lưu được. Thử lại sau ít phút.');
      }
    } catch {
      setFormError('Không kết nối được tới máy chủ. Kiểm tra mạng rồi thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: Customer) => {
    const ok = await confirm({
      title: `Xoá khách "${c.name}" khỏi danh bạ?`,
      message: 'Các phiếu cũ vẫn giữ nguyên tên, số điện thoại và địa chỉ đã in.',
      confirmLabel: 'Xoá khách hàng',
      tone: 'danger',
    });
    if (!ok) return;
    setDeleting(c.id);
    try {
      const res = await fetch('/api/scale/customers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c.id }),
      });
      if (res.ok) {
        setNotice({ tone: 'success', text: `Đã xoá khách "${c.name}".` });
        load();
      } else setNotice({ tone: 'danger', text: `Không xoá được khách "${c.name}".` });
    } catch {
      setNotice({ tone: 'danger', text: 'Không kết nối được tới máy chủ. Chưa xoá được.' });
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
      (c.phone ?? '').replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
      (c.address ?? '').toLowerCase().includes(q)
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <Field id="cus-search" label="Tìm khách hàng" className="flex-1">
          {(p) => (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-scale-muted-fg pointer-events-none" aria-hidden="true" />
              <input {...p} type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Theo tên, mã, số điện thoại, địa chỉ" className={cx(inputClass(), 'pl-9')} />
            </div>
          )}
        </Field>
        <button ref={addButtonRef} type="button" onClick={() => openForm(null)} className={buttonClass({ variant: 'primary' })}>
          <Plus className="w-4 h-4" aria-hidden="true" /> Thêm khách hàng
        </button>
      </div>

      <div aria-live="polite">{notice && <Notice tone={notice.tone}>{notice.text}</Notice>}</div>

      {showForm && (
        <div ref={formRef} className="scroll-mt-24">
          <Card title={editing ? 'Sửa khách hàng' : 'Thêm khách hàng'} titleId="cus-form-title">
            <form onSubmit={submit} noValidate className="space-y-4">
              {formError && <Notice tone="danger">{formError}</Notice>}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="cus-name" label="Tên khách hàng" error={fieldErrors.name}>
                  {(p) => (
                    <input ref={refs.name} {...p} autoComplete="off" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ví dụ: Chị Hoa – vựa cá Bến Tre" className={inputClass(Boolean(p['aria-invalid']))} />
                  )}
                </Field>
                <Field id="cus-code" label="Mã khách" optional={!editing} error={fieldErrors.code} hint={editing ? undefined : 'Để trống, hệ thống tự đánh mã KH00001, KH00002…'}>
                  {(p) => (
                    <input ref={refs.code} {...p} autoComplete="off" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="KH00001" className={inputClass(Boolean(p['aria-invalid']))} />
                  )}
                </Field>
                <Field id="cus-phone" label="Điện thoại" optional error={fieldErrors.phone}>
                  {(p) => (
                    <input ref={refs.phone} {...p} type="tel" inputMode="tel" autoComplete="off" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0909 123 456" className={inputClass(Boolean(p['aria-invalid']))} />
                  )}
                </Field>
                <Field id="cus-address" label="Địa chỉ" optional>
                  {(p) => <input {...p} autoComplete="off" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputClass()} />}
                </Field>
                <Field id="cus-note" label="Ghi chú" optional hint="Chỉ để bạn xem, không in ra phiếu." className="sm:col-span-2">
                  {(p) => (
                    <input {...p} autoComplete="off" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Ví dụ: hay lấy khay nhựa xanh, giao trước 6 giờ sáng" className={inputClass()} />
                  )}
                </Field>
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <button type="button" onClick={closeForm} className={buttonClass()}>
                  Huỷ
                </button>
                <button type="submit" disabled={saving} className={buttonClass({ variant: 'primary' })}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Check className="w-4 h-4" aria-hidden="true" />}
                  {saving ? 'Đang lưu…' : editing ? 'Lưu thay đổi' : 'Thêm khách hàng'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {loadError ? (
        <Notice
          tone="danger"
          title="Không tải được danh bạ khách hàng"
          action={
            <button type="button" onClick={load} className={buttonClass({ variant: 'ghost' })}>
              Thử lại
            </button>
          }
        >
          Kiểm tra kết nối mạng rồi thử lại.
        </Notice>
      ) : loading ? (
        <div role="status" className="flex items-center justify-center py-16 gap-3 text-scale-muted-fg">
          <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
          <span className="text-sm">Đang tải…</span>
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-scale-card rounded-2xl border border-scale-border">
          <EmptyState
            icon={<Users className="w-9 h-9" aria-hidden="true" />}
            title={q ? 'Không tìm thấy khách nào' : 'Chưa có khách hàng nào'}
            action={
              q ? (
                <button type="button" onClick={() => setSearch('')} className={buttonClass()}>
                  Xoá từ khoá tìm
                </button>
              ) : (
                <button type="button" onClick={() => openForm(null)} className={buttonClass({ variant: 'primary' })}>
                  <Plus className="w-4 h-4" aria-hidden="true" /> Thêm khách đầu tiên
                </button>
              )
            }
          >
            {q ? 'Thử từ khoá khác.' : 'Thêm khách ở đây, hoặc gõ tên khách mới ngay lúc lập phiếu — hệ thống tự lưu vào danh bạ.'}
          </EmptyState>
        </div>
      ) : (
        <>
          <p className="text-sm text-scale-muted-fg" aria-live="polite">
            {q ? `${visible.length} / ${items.length}` : items.length} khách hàng
          </p>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((c) => (
              <li key={c.id} className="bg-scale-card rounded-2xl border border-scale-border p-4 flex flex-col shadow-sm min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-scale-fg break-words">{c.name}</p>
                    <p className="text-xs text-scale-muted-fg tabular-nums mt-0.5">{c.code}</p>
                  </div>
                  {c._count && c._count.tickets > 0 && <Badge tone="info">{c._count.tickets} phiếu</Badge>}
                </div>

                <div className="mt-2 space-y-1 text-sm flex-1 min-w-0">
                  {c.phone && (
                    <a
                      href={`tel:${c.phone.replace(/[^\d+]/g, '')}`}
                      aria-label={`Gọi ${c.name}: ${c.phone}`}
                      className="inline-flex items-center gap-1.5 min-h-touch -my-2 rounded text-scale-fg hover:text-scale-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scale-ring"
                    >
                      <Phone className="w-3.5 h-3.5 text-scale-muted-fg flex-shrink-0" aria-hidden="true" />
                      {c.phone}
                    </a>
                  )}
                  {c.address && (
                    <p className="flex items-start gap-1.5 text-scale-muted-fg">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-1" aria-hidden="true" />
                      <span className="line-clamp-2 break-words">{c.address}</span>
                    </p>
                  )}
                  {c.note && <p className="text-xs text-scale-muted-fg italic line-clamp-2 break-words">{c.note}</p>}
                </div>

                <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-scale-border">
                  <Link href={`/can-dien-tu?khach=${c.id}`} aria-label={`Lập phiếu cho ${c.name}`} className={cx(buttonClass({ variant: 'ghost' }), 'text-scale-primary')}>
                    <FileText className="w-4 h-4" aria-hidden="true" /> Lập phiếu
                  </Link>
                  <button type="button" onClick={() => openForm(c)} aria-label={`Sửa khách ${c.name}`} className={buttonClass({ variant: 'ghost' })}>
                    <Pencil className="w-4 h-4" aria-hidden="true" /> Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(c)}
                    disabled={deleting === c.id}
                    aria-label={`Xoá khách ${c.name}`}
                    className={cx(buttonClass({ variant: 'danger-ghost', iconOnly: true }), 'ml-auto')}
                  >
                    {deleting === c.id ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Trash2 className="w-4 h-4" aria-hidden="true" />}
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

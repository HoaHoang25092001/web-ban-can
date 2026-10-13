'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Pencil, Trash2, Loader2, Check, Search, PackageOpen } from 'lucide-react';
import { useConfirm } from '@/components/scale/confirm';
import { Card, EmptyState, Field, Notice, buttonClass, cx, inputClass } from '@/components/scale/ui';

interface Item {
  id: number;
  code: string;
  name: string;
  unitPrice?: number | null;
}

type FieldName = 'code' | 'name' | 'unitPrice';

const priceFormat = new Intl.NumberFormat('vi-VN');

/**
 * Quản lý một danh mục đơn giản (mã + tên, tuỳ chọn đơn giá).
 *
 * Dùng chung cho Sản phẩm và Nhân viên: hai màn hình này giống nhau tới từng
 * ô nhập, chỉ khác nhãn chữ. Viết hai bản riêng thì mỗi lần sửa một chi tiết
 * lại phải nhớ sửa cả hai nơi — quên một chỗ là hai màn hình lệch nhau.
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
    /**
     * Có thì hiện thêm ô đơn giá mặc định (chỉ Sản phẩm dùng). Chọn mặt hàng
     * lúc lập phiếu là điền sẵn giá này, khỏi gõ lại từng lượt cân.
     */
    priceLabel?: string;
  };
}) {
  const confirm = useConfirm();
  const singular = labels.singular.toLowerCase();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState({ code: '', name: '', unitPrice: '' });
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);

  const refs = {
    code: useRef<HTMLInputElement>(null),
    name: useRef<HTMLInputElement>(null),
    unitPrice: useRef<HTMLInputElement>(null),
  };
  const addButtonRef = useRef<HTMLButtonElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error();
      setItems((await res.json())[labels.listKey] ?? []);
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [endpoint, labels.listKey]);

  useEffect(() => {
    load();
  }, [load]);

  const openForm = (it: Item | null) => {
    setEditing(it);
    setForm(it ? { code: it.code, name: it.name, unitPrice: it.unitPrice == null ? '' : String(it.unitPrice) } : { code: '', name: '', unitPrice: '' });
    setFormError('');
    setFieldErrors({});
    setNotice(null);
    setShowForm(true);
    // Đưa con trỏ vào ô đầu tiên để gõ ngay, không phải bấm chuột thêm lần nữa.
    setTimeout(() => refs.code.current?.focus(), 0);
  };

  const closeForm = () => {
    setShowForm(false);
    addButtonRef.current?.focus();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Kiểm tra trước ngay trên máy, báo đúng ô thiếu.
    const errs: Partial<Record<FieldName, string>> = {};
    if (!form.code.trim()) errs.code = `Nhập ${labels.codeLabel.toLowerCase()}.`;
    if (!form.name.trim()) errs.name = `Nhập ${labels.nameLabel.toLowerCase()}.`;
    if (labels.priceLabel && form.unitPrice.trim() && !/^\d+$/.test(form.unitPrice.trim()))
      errs.unitPrice = 'Đơn giá chỉ gồm chữ số, không dấu chấm, ví dụ 28500.';
    setFieldErrors(errs);
    const first = (['code', 'name', 'unitPrice'] as FieldName[]).find((f) => errs[f]);
    if (first) {
      refs[first].current?.focus();
      return;
    }

    setFormError('');
    setSaving(true);
    try {
      const res = await fetch(endpoint, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code,
          name: form.name,
          ...(labels.priceLabel ? { unitPrice: form.unitPrice } : {}),
          ...(editing ? { id: editing.id } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setShowForm(false);
        setNotice({ tone: 'success', text: `${editing ? 'Đã cập nhật' : 'Đã thêm'} ${singular} "${form.name.trim()}".` });
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

  const remove = async (it: Item) => {
    const ok = await confirm({
      title: `Xoá ${singular} "${it.name}"?`,
      message: labels.deleteNote,
      confirmLabel: `Xoá ${singular}`,
      tone: 'danger',
    });
    if (!ok) return;
    setDeleting(it.id);
    try {
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: it.id }),
      });
      if (res.ok) {
        setNotice({ tone: 'success', text: `Đã xoá ${singular} "${it.name}".` });
        load();
      } else setNotice({ tone: 'danger', text: `Không xoá được ${singular} "${it.name}".` });
    } catch {
      setNotice({ tone: 'danger', text: 'Không kết nối được tới máy chủ. Chưa xoá được.' });
    } finally {
      setDeleting(null);
    }
  };

  // Lọc ngay trên trình duyệt: danh sách tối đa 500 mục nên không cần gọi lại
  // máy chủ mỗi lần gõ một chữ.
  const q = search.toLowerCase().trim();
  const visible = items.filter((it) => !q || it.name.toLowerCase().includes(q) || it.code.toLowerCase().includes(q));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <Field id="cat-search" label={`Tìm ${singular}`} className="flex-1">
          {(p) => (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-scale-muted-fg pointer-events-none" aria-hidden="true" />
              <input {...p} type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Theo ${labels.codeLabel.toLowerCase()} hoặc ${labels.nameLabel.toLowerCase()}`} className={cx(inputClass(), 'pl-9')} />
            </div>
          )}
        </Field>
        <button ref={addButtonRef} type="button" onClick={() => openForm(null)} className={buttonClass({ variant: 'primary' })}>
          <Plus className="w-4 h-4" aria-hidden="true" /> Thêm {singular}
        </button>
      </div>

      <div aria-live="polite">{notice && <Notice tone={notice.tone}>{notice.text}</Notice>}</div>

      {showForm && (
        <Card title={editing ? `Sửa ${singular}` : `Thêm ${singular}`} titleId="cat-form-title">
          <form onSubmit={submit} noValidate className="space-y-4">
            {formError && <Notice tone="danger">{formError}</Notice>}
            <div className={cx('grid gap-4', labels.priceLabel ? 'sm:grid-cols-3' : 'sm:grid-cols-2')}>
              <Field id="cat-code" label={labels.codeLabel} error={fieldErrors.code}>
                {(p) => (
                  <input ref={refs.code} {...p} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder={labels.codePlaceholder} autoComplete="off" className={inputClass(Boolean(p['aria-invalid']))} />
                )}
              </Field>
              <Field id="cat-name" label={labels.nameLabel} error={fieldErrors.name}>
                {(p) => (
                  <input ref={refs.name} {...p} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={labels.namePlaceholder} autoComplete="off" className={inputClass(Boolean(p['aria-invalid']))} />
                )}
              </Field>
              {labels.priceLabel && (
                <Field id="cat-price" label={`${labels.priceLabel} (đ/kg)`} optional error={fieldErrors.unitPrice} hint="Tự điền khi chọn hàng lúc cân.">
                  {(p) => (
                    <input ref={refs.unitPrice} {...p} inputMode="numeric" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} placeholder="28500" autoComplete="off" className={cx(inputClass(Boolean(p['aria-invalid'])), 'text-right tabular-nums')} />
                  )}
                </Field>
              )}
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button type="button" onClick={closeForm} className={buttonClass()}>
                Huỷ
              </button>
              <button type="submit" disabled={saving} className={buttonClass({ variant: 'primary' })}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Check className="w-4 h-4" aria-hidden="true" />}
                {saving ? 'Đang lưu…' : editing ? 'Lưu thay đổi' : `Thêm ${singular}`}
              </button>
            </div>
          </form>
        </Card>
      )}

      {loadError ? (
        <Notice
          tone="danger"
          title="Không tải được danh sách"
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
            icon={<PackageOpen className="w-9 h-9" aria-hidden="true" />}
            title={q ? 'Không tìm thấy kết quả nào' : labels.emptyTitle}
            action={
              q ? (
                <button type="button" onClick={() => setSearch('')} className={buttonClass()}>
                  Xoá từ khoá tìm
                </button>
              ) : (
                <button type="button" onClick={() => openForm(null)} className={buttonClass({ variant: 'primary' })}>
                  <Plus className="w-4 h-4" aria-hidden="true" /> Thêm {singular} đầu tiên
                </button>
              )
            }
          >
            {q ? 'Thử từ khoá khác.' : labels.emptyHint}
          </EmptyState>
        </div>
      ) : (
        <>
          <p className="text-sm text-scale-muted-fg" aria-live="polite">
            {q ? `${visible.length} / ${items.length}` : items.length} {singular}
          </p>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((it) => (
              <li key={it.id} className="bg-scale-card rounded-2xl border border-scale-border p-4 flex flex-col shadow-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-scale-fg break-words">{it.name}</p>
                  <p className="text-xs text-scale-muted-fg tabular-nums mt-0.5">{it.code}</p>
                  {labels.priceLabel && (
                    <p className="text-sm mt-1.5">
                      {it.unitPrice != null ? (
                        <>
                          <span className="tabular-nums font-semibold text-scale-fg">{priceFormat.format(it.unitPrice)}</span>{' '}
                          <span className="text-scale-muted-fg">đ/kg</span>
                        </>
                      ) : (
                        <span className="text-scale-muted-fg">Chưa đặt giá</span>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 mt-3 pt-3 border-t border-scale-border">
                  <button type="button" onClick={() => openForm(it)} aria-label={`Sửa ${singular} ${it.name}`} className={buttonClass({ variant: 'ghost' })}>
                    <Pencil className="w-4 h-4" aria-hidden="true" /> Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(it)}
                    disabled={deleting === it.id}
                    aria-label={`Xoá ${singular} ${it.name}`}
                    className={cx(buttonClass({ variant: 'danger-ghost' }), 'ml-auto')}
                  >
                    {deleting === it.id ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Trash2 className="w-4 h-4" aria-hidden="true" />}
                    Xoá
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

'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useToast } from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import {
  Plus, Search, Pencil, KeyRound, Trash2, Loader2, Users,
  ShieldCheck, ShieldOff, X, Check,
} from 'lucide-react';

interface ScaleUser {
  id: number;
  username: string;
  fullName: string;
  phone: string | null;
  note: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  _count: { records: number; products: number };
}

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('vi-VN') : 'Chưa đăng nhập';

/**
 * Quản lý tài khoản khách hàng dùng phần cân điện tử.
 *
 * Chủ shop cấp tài khoản cho khách đã mua cân, đặt lại mật khẩu khi khách
 * quên, và khoá lại khi hết hạn dịch vụ.
 *
 * Trang này KHÔNG hiện số liệu cân của khách — chỉ hiện số lượng bản ghi để
 * biết tài khoản nào đang dùng thật. Sản lượng là bí mật kinh doanh của khách.
 */
export default function ScaleAccountsPage() {
  const toast = useToast();
  const [users, setUsers] = useState<ScaleUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ScaleUser | null>(null);
  const [form, setForm] = useState({ username: '', password: '', fullName: '', phone: '', note: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ScaleUser | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
      const res = await fetch(`/api/scale-users${params}`);
      if (res.status === 401) { setSessionExpired(true); return; }
      if (!res.ok) { toast.error('Không tải được danh sách tài khoản'); return; }
      setUsers((await res.json()).users ?? []);
    } catch {
      toast.error('Không tải được danh sách', 'Kiểm tra kết nối rồi thử lại.');
    } finally {
      setLoading(false);
    }
  }, [search, toast]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setEditing(null);
    setForm({ username: '', password: '', fullName: '', phone: '', note: '' });
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (u: ScaleUser) => {
    setEditing(u);
    // Mật khẩu để trống = giữ nguyên mật khẩu cũ.
    setForm({ username: u.username, password: '', fullName: u.fullName, phone: u.phone ?? '', note: u.note ?? '' });
    setFormError('');
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const body = editing
        ? { id: editing.id, fullName: form.fullName, phone: form.phone, note: form.note,
            ...(form.password ? { password: form.password } : {}) }
        : form;
      const res = await fetch('/api/scale-users', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(editing ? 'Đã cập nhật tài khoản' : 'Đã cấp tài khoản mới', form.fullName);
        setShowForm(false);
        load();
      } else {
        setFormError(data.error ?? 'Không lưu được.');
      }
    } catch {
      setFormError('Không kết nối được tới máy chủ.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (u: ScaleUser) => {
    const res = await fetch('/api/scale-users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: u.id, isActive: !u.isActive }),
    });
    if (res.ok) {
      toast.success(u.isActive ? 'Đã khoá tài khoản' : 'Đã mở lại tài khoản', u.fullName);
      load();
    } else {
      toast.error('Không đổi được trạng thái');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch('/api/scale-users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteTarget.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success('Đã xoá tài khoản', `${deleteTarget.fullName} · ${data.deletedRecords ?? 0} bản ghi`);
        load();
      } else {
        toast.error('Không xoá được', data.error);
      }
    } finally {
      setDeleteTarget(null);
    }
  };

  if (sessionExpired) {
    return (
      <AdminLayout>
        <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl border border-amber-200 p-8 text-center">
          <h1 className="text-lg font-bold text-gray-900 mb-2">Phiên đăng nhập đã hết hạn</h1>
          <a href="/dang-nhap" className="inline-flex items-center justify-center min-h-touch px-5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
            Đăng nhập lại
          </a>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tài khoản cân điện tử</h1>
            <p className="text-sm text-gray-500 mt-1">
              Cấp tài khoản cho khách đã mua cân. Bạn không xem được số liệu cân của họ.
            </p>
          </div>
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center justify-center gap-2 min-h-touch px-5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors flex-shrink-0"
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Cấp tài khoản
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="relative max-w-md">
          <label htmlFor="u-search" className="sr-only">Tìm tài khoản</label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" aria-hidden="true" />
          <input
            id="u-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, tên đăng nhập hoặc số điện thoại"
            className="w-full min-h-touch pl-9 pr-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        {showForm && (
          <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">
                {editing ? `Sửa tài khoản: ${editing.username}` : 'Cấp tài khoản mới'}
              </h2>
              <button type="button" onClick={() => setShowForm(false)} aria-label="Đóng"
                className="inline-flex items-center justify-center min-w-touch min-h-touch rounded-lg text-gray-500 hover:bg-gray-100">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {formError && (
              <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                {formError}
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="f-username" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tên đăng nhập
                </label>
                <input
                  id="f-username" required={!editing} disabled={!!editing}
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })}
                  placeholder="vd: xuong-abc"
                  className="w-full min-h-touch px-3 rounded-lg border border-gray-300 text-sm disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {!editing && (
                  <p className="text-xs text-gray-500 mt-1">Chữ thường, số, dấu _ hoặc -. Không đổi được sau khi tạo.</p>
                )}
              </div>

              <div>
                <label htmlFor="f-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  {editing ? 'Mật khẩu mới' : 'Mật khẩu'}
                </label>
                <input
                  id="f-password" type="text" required={!editing}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={editing ? 'Để trống nếu không đổi' : 'Ít nhất 8 ký tự'}
                  className="w-full min-h-touch px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {/* Hiện mật khẩu dạng chữ thường (type="text") có chủ đích: chủ
                    shop cần đọc lại để đọc cho khách qua điện thoại. */}
                <p className="text-xs text-gray-500 mt-1">Ghi lại để gửi cho khách — sau này không xem lại được.</p>
              </div>

              <div>
                <label htmlFor="f-fullname" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tên khách hàng
                </label>
                <input
                  id="f-fullname" required value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="vd: Xưởng gạo ABC"
                  className="w-full min-h-touch px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="f-phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Số điện thoại <span className="text-gray-500 font-normal">(không bắt buộc)</span>
                </label>
                <input
                  id="f-phone" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full min-h-touch px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="f-note" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Ghi chú nội bộ <span className="text-gray-500 font-normal">(khách không thấy)</span>
                </label>
                <input
                  id="f-note" value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="vd: Mua cân sàn 2 tấn, hết hạn 12/2027"
                  className="w-full min-h-touch px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)}
                className="inline-flex items-center min-h-touch px-4 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Huỷ
              </button>
              <button type="submit" disabled={saving}
                className="inline-flex items-center gap-2 min-h-touch px-5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
                {saving ? 'Đang lưu…' : editing ? 'Lưu thay đổi' : 'Cấp tài khoản'}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            <span className="text-sm">Đang tải danh sách…</span>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" aria-hidden="true" />
            <h2 className="font-semibold text-gray-900">
              {search.trim() ? 'Không tìm thấy tài khoản nào' : 'Chưa cấp tài khoản nào'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {search.trim() ? 'Thử từ khoá khác.' : 'Cấp tài khoản cho khách đã mua cân để họ tự ghi số liệu.'}
            </p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {users.map((u) => (
              <li key={u.id} className={`bg-white rounded-xl border shadow-sm p-4 ${u.isActive ? 'border-gray-200' : 'border-amber-200 bg-amber-50/30'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{u.fullName}</div>
                    <div className="text-xs text-gray-500 font-mono">{u.username}</div>
                  </div>
                  {/* Trạng thái dùng cả biểu tượng lẫn chữ, không chỉ màu sắc */}
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                    u.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                               : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                    {u.isActive ? <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> : <ShieldOff className="h-3.5 w-3.5" aria-hidden="true" />}
                    {u.isActive ? 'Đang dùng' : 'Đã khoá'}
                  </span>
                </div>

                {u.phone && <div className="text-sm text-gray-600 mt-2">{u.phone}</div>}
                {u.note && <div className="text-xs text-gray-500 mt-1 line-clamp-2">{u.note}</div>}

                <div className="text-xs text-gray-500 mt-2 space-y-0.5">
                  <div>{u._count.records} bản ghi · {u._count.products} mặt hàng</div>
                  <div>Đăng nhập gần nhất: {fmtDate(u.lastLoginAt)}</div>
                </div>

                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
                  <button type="button" onClick={() => openEdit(u)}
                    className="inline-flex items-center gap-1.5 min-h-touch px-2.5 rounded-lg text-sm text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-colors">
                    <Pencil className="h-4 w-4" aria-hidden="true" /> Sửa
                  </button>
                  <button type="button" onClick={() => toggleActive(u)}
                    className="inline-flex items-center gap-1.5 min-h-touch px-2.5 rounded-lg text-sm text-gray-600 hover:text-amber-700 hover:bg-amber-50 transition-colors">
                    <KeyRound className="h-4 w-4" aria-hidden="true" /> {u.isActive ? 'Khoá' : 'Mở'}
                  </button>
                  <button type="button" onClick={() => setDeleteTarget(u)}
                    className="inline-flex items-center justify-center min-w-touch min-h-touch rounded-lg text-gray-600 hover:text-red-700 hover:bg-red-50 ml-auto transition-colors"
                    aria-label={`Xoá tài khoản ${u.fullName}`}>
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Xoá tài khoản này?"
        message={
          deleteTarget
            ? `Tài khoản "${deleteTarget.fullName}" và TOÀN BỘ ${deleteTarget._count.records} bản ghi cân của họ sẽ bị xoá vĩnh viễn. Nếu chỉ muốn ngừng cho dùng, hãy chọn "Khoá" thay vì xoá.`
            : ''
        }
        confirmText="Xoá vĩnh viễn"
        cancelText="Giữ lại"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        variant="danger"
      />
    </AdminLayout>
  );
}

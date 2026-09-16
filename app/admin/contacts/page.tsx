'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useToast } from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import {
  Mail, Phone, MessageSquare, Clock, CheckCircle, Trash2,
  PhoneCall, StickyNote, PackageSearch, Inbox,
} from 'lucide-react';

interface Contact {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  product: string | null;
  message: string | null;
  status: string;
  note: string | null;
  handledAt: string | null;
  createdAt: string;
}

type Status = 'new' | 'processing' | 'resolved';

const STATUS_META: Record<Status, { label: string; badge: string; dot: string }> = {
  new:        { label: 'Mới',         badge: 'bg-red-50 text-red-700 border-red-200',        dot: 'bg-red-500' },
  processing: { label: 'Đang xử lý',  badge: 'bg-amber-50 text-amber-700 border-amber-200',  dot: 'bg-amber-500' },
  resolved:   { label: 'Đã xử lý',    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
};

/** "0369.759.187" → "0369759187" cho href="tel:" và link Zalo. */
const digits = (phone: string) => phone.replace(/[^\d+]/g, '');

/** Khoảng thời gian đã trôi qua, ví dụ "2 giờ trước". */
function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return new Date(iso).toLocaleDateString('vi-VN');
}

/**
 * Trang xử lý yêu cầu báo giá.
 *
 * Bản trước chỉ là một bảng để XEM: muốn gọi khách phải bôi đen số rồi tự bấm
 * lại, đổi trạng thái sang "Đã xử lý" mà không lưu được đã trao đổi những gì —
 * người khác tiếp nhận không biết đã tư vấn tới đâu và dễ gọi lại trùng.
 *
 * Nay mỗi yêu cầu là một thẻ đi theo đúng quy trình làm việc: gọi hoặc nhắn
 * Zalo ngay bằng một chạm, ghi lại kết quả tư vấn, rồi đánh dấu hoàn tất
 * (tiêu chí 1 & 8).
 */
export default function ContactsPage() {
  const toast = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [noteDrafts, setNoteDrafts] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; contact: Contact | null }>({
    isOpen: false,
    contact: null,
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts?limit=200');
      /*
       * Phiên đăng nhập hết hạn thì API trả 401. Bản trước không phân biệt
       * trường hợp này nên trang hiện "Chưa có yêu cầu nào" — người dùng tưởng
       * mất hết dữ liệu, trong khi thực ra chỉ cần đăng nhập lại (tiêu chí 7).
       */
      if (response.status === 401) {
        setSessionExpired(true);
        return;
      }
      if (!response.ok) {
        toast.error('Không tải được danh sách', 'Máy chủ trả về lỗi, vui lòng thử lại');
        return;
      }
      const data = await response.json();
      setContacts(data.contacts || []);
    } catch {
      toast.error('Không tải được danh sách', 'Kiểm tra kết nối rồi thử lại');
    } finally {
      setLoading(false);
    }
  };

  /** Cập nhật trạng thái và/hoặc ghi chú của một yêu cầu. */
  const update = async (id: number, payload: { status?: Status; note?: string }) => {
    setSavingId(id);
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.status === 401) {
        setSessionExpired(true);
        return false;
      }
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        toast.error('Chưa lưu được', err.error || 'Vui lòng thử lại');
        return false;
      }
      const updated: Contact = await response.json();
      setContacts(prev => prev.map(c => (c.id === id ? { ...c, ...updated } : c)));
      return true;
    } catch {
      toast.error('Chưa lưu được', 'Không kết nối được tới máy chủ');
      return false;
    } finally {
      setSavingId(null);
    }
  };

  const changeStatus = async (contact: Contact, status: Status) => {
    const ok = await update(contact.id, { status });
    if (ok) toast.success(`Đã chuyển sang "${STATUS_META[status].label}"`, contact.name);
  };

  const saveNote = async (contact: Contact) => {
    const note = noteDrafts[contact.id] ?? '';
    const ok = await update(contact.id, { note });
    if (ok) {
      toast.success('Đã lưu ghi chú', contact.name);
      setNoteDrafts(prev => {
        const next = { ...prev };
        delete next[contact.id];
        return next;
      });
    }
  };

  const confirmDelete = async () => {
    const contact = deleteConfirm.contact;
    if (!contact) return;
    try {
      const response = await fetch(`/api/contacts/${contact.id}`, { method: 'DELETE' });
      if (response.ok) {
        setContacts(prev => prev.filter(c => c.id !== contact.id));
        toast.success('Đã xoá yêu cầu', contact.name);
      } else {
        toast.error('Không xoá được', 'Vui lòng thử lại');
      }
    } catch {
      toast.error('Không xoá được', 'Không kết nối được tới máy chủ');
    } finally {
      setDeleteConfirm({ isOpen: false, contact: null });
    }
  };

  const counts = {
    all: contacts.length,
    new: contacts.filter(c => c.status === 'new').length,
    processing: contacts.filter(c => c.status === 'processing').length,
    resolved: contacts.filter(c => c.status === 'resolved').length,
  };

  /*
   * Yêu cầu CHƯA xử lý luôn nằm trên cùng, bất kể gửi lúc nào: đây là việc cần
   * làm ngay, còn các yêu cầu đã xong chỉ để tra cứu lại.
   */
  const ORDER: Record<string, number> = { new: 0, processing: 1, resolved: 2 };
  const visible = contacts
    .filter(c => filter === 'all' || c.status === filter)
    .sort((a, b) =>
      (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9) ||
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  if (sessionExpired) {
    return (
      <AdminLayout>
        <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl border border-amber-200 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <Clock className="h-7 w-7 text-amber-600" aria-hidden="true" />
          </div>
          <h1 className="text-lg font-bold text-gray-900 mb-2">Phiên đăng nhập đã hết hạn</h1>
          <p className="text-sm text-gray-600 mb-6">
            Dữ liệu vẫn còn nguyên trong hệ thống. Bạn chỉ cần đăng nhập lại để tiếp tục xử lý.
          </p>
          <a
            href="/admin/login"
            className="inline-flex items-center justify-center min-h-touch px-5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Đăng nhập lại
          </a>
        </div>
      </AdminLayout>
    );
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-4" aria-busy="true" aria-live="polite">
          <span className="sr-only-text">Đang tải danh sách yêu cầu…</span>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="h-4 w-40 bg-gray-200 rounded mb-3" />
              <div className="h-3 w-64 bg-gray-100 rounded mb-2" />
              <div className="h-3 w-52 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* ── Tiêu đề ── */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yêu cầu báo giá</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gọi lại cho khách, ghi kết quả tư vấn rồi đánh dấu hoàn tất.
          </p>
        </div>

        {/* ── Nhắc việc cần làm ── */}
        {counts.new > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <PhoneCall className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-red-800">
              Có <strong>{counts.new} yêu cầu</strong> khách gửi chưa được liên hệ.
              Gọi lại sớm giúp tăng khả năng chốt đơn.
            </p>
          </div>
        )}

        {/* ── Lọc theo trạng thái ── */}
        <div role="group" aria-label="Lọc theo trạng thái" className="flex flex-wrap gap-2">
          {([
            { key: 'all', label: 'Tất cả' },
            { key: 'new', label: 'Chưa liên hệ' },
            { key: 'processing', label: 'Đang xử lý' },
            { key: 'resolved', label: 'Đã xử lý' },
          ] as const).map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              aria-pressed={filter === tab.key}
              className={`inline-flex items-center gap-2 min-h-touch px-4 rounded-lg text-sm font-medium border transition-colors ${
                filter === tab.key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              <span className={`inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-bold ${
                filter === tab.key ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-700'
              }`}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {/* ── Danh sách ── */}
        {visible.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
            <Inbox className="h-12 w-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-gray-700 mb-1">
              {filter === 'all' ? 'Chưa có yêu cầu nào' : 'Không có yêu cầu ở mục này'}
            </h2>
            <p className="text-sm text-gray-500">
              {filter === 'all'
                ? 'Yêu cầu khách gửi từ form trên website sẽ hiện ở đây.'
                : 'Thử chọn mục khác để xem các yêu cầu còn lại.'}
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {visible.map(contact => {
              const status = (contact.status as Status) ?? 'new';
              const meta = STATUS_META[status] ?? STATUS_META.new;
              const draft = noteDrafts[contact.id];
              const noteChanged = draft !== undefined && draft !== (contact.note ?? '');
              const busy = savingId === contact.id;

              return (
                <li
                  key={contact.id}
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                    status === 'new' ? 'border-red-200' : 'border-gray-100'
                  }`}
                >
                  <div className="p-5">
                    {/* Dòng đầu: tên khách + trạng thái */}
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div className="min-w-0">
                        <h2 className="text-base font-bold text-gray-900">{contact.name}</h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                          Gửi {timeAgo(contact.createdAt)}
                          {contact.handledAt && (
                            <> · Xử lý xong {timeAgo(contact.handledAt)}</>
                          )}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${meta.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} aria-hidden="true" />
                        {meta.label}
                      </span>
                    </div>

                    {/* Liên hệ: bấm là gọi / nhắn ngay */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <a
                        href={`tel:${digits(contact.phone)}`}
                        className="inline-flex items-center gap-2 min-h-touch px-4 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
                      >
                        <Phone className="h-4 w-4" aria-hidden="true" />
                        {contact.phone}
                        <span className="sr-only-text">— gọi cho {contact.name}</span>
                      </a>
                      <a
                        href={`https://zalo.me/${digits(contact.phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 min-h-touch px-4 rounded-lg border border-gray-200 text-sm font-semibold text-[#0068FF] hover:bg-blue-50 transition-colors"
                      >
                        <MessageSquare className="h-4 w-4" aria-hidden="true" />
                        Nhắn Zalo
                      </a>
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="inline-flex items-center gap-2 min-h-touch px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Mail className="h-4 w-4" aria-hidden="true" />
                          <span className="truncate max-w-[200px]">{contact.email}</span>
                        </a>
                      )}
                    </div>

                    {/* Khách cần gì */}
                    {(contact.product || contact.message) && (
                      <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 mb-4 space-y-2">
                        {contact.product && (
                          <p className="flex items-start gap-2 text-sm">
                            <PackageSearch className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                            <span>
                              <span className="text-gray-500">Quan tâm: </span>
                              <span className="font-medium text-gray-900">{contact.product}</span>
                            </span>
                          </p>
                        )}
                        {contact.message && (
                          <p className="flex items-start gap-2 text-sm">
                            <MessageSquare className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                            <span className="text-gray-700 whitespace-pre-wrap">{contact.message}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Ghi chú kết quả tư vấn */}
                    <div className="mb-4">
                      <label
                        htmlFor={`note-${contact.id}`}
                        className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5"
                      >
                        <StickyNote className="h-4 w-4 text-gray-500" aria-hidden="true" />
                        Kết quả tư vấn
                      </label>
                      <textarea
                        id={`note-${contact.id}`}
                        rows={2}
                        value={draft ?? contact.note ?? ''}
                        onChange={e =>
                          setNoteDrafts(prev => ({ ...prev, [contact.id]: e.target.value }))
                        }
                        placeholder="Ví dụ: Đã báo giá cân bàn 100kg, khách hẹn gọi lại thứ 5."
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {noteChanged && (
                        <button
                          type="button"
                          onClick={() => saveNote(contact)}
                          disabled={busy}
                          className="mt-2 inline-flex items-center gap-2 min-h-touch px-4 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors"
                        >
                          {busy ? 'Đang lưu…' : 'Lưu ghi chú'}
                        </button>
                      )}
                    </div>

                    {/* Chuyển bước xử lý */}
                    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100">
                      {status === 'new' && (
                        <button
                          type="button"
                          onClick={() => changeStatus(contact, 'processing')}
                          disabled={busy}
                          className="inline-flex items-center gap-2 min-h-touch px-4 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-50 transition-colors"
                        >
                          <Clock className="h-4 w-4" aria-hidden="true" />
                          Bắt đầu xử lý
                        </button>
                      )}
                      {status !== 'resolved' && (
                        <button
                          type="button"
                          onClick={() => changeStatus(contact, 'resolved')}
                          disabled={busy}
                          className="inline-flex items-center gap-2 min-h-touch px-4 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                        >
                          <CheckCircle className="h-4 w-4" aria-hidden="true" />
                          Đánh dấu đã xử lý
                        </button>
                      )}
                      {status === 'resolved' && (
                        <button
                          type="button"
                          onClick={() => changeStatus(contact, 'processing')}
                          disabled={busy}
                          className="inline-flex items-center gap-2 min-h-touch px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                          <Clock className="h-4 w-4" aria-hidden="true" />
                          Mở lại
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setDeleteConfirm({ isOpen: true, contact })}
                        aria-label={`Xoá yêu cầu của ${contact.name}`}
                        className="ml-auto inline-flex items-center justify-center w-11 h-11 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onCancel={() => setDeleteConfirm({ isOpen: false, contact: null })}
        onConfirm={confirmDelete}
        title="Xoá yêu cầu báo giá?"
        message={
          deleteConfirm.contact
            ? `Yêu cầu của ${deleteConfirm.contact.name} (${deleteConfirm.contact.phone}) sẽ bị xoá vĩnh viễn, không khôi phục được.`
            : ''
        }
        confirmText="Xoá vĩnh viễn"
        cancelText="Giữ lại"
        variant="danger"
      />
    </AdminLayout>
  );
}

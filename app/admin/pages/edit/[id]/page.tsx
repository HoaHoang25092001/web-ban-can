'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import PageForm, { PageFormData } from '@/components/admin/PageForm';
import { useToast } from '@/components/Toast';
import { Loader2 } from 'lucide-react';

export default function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const toast = useToast();
  const [initial, setInitial] = useState<PageFormData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingMode, setSavingMode] = useState<'draft' | 'publish' | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/pages/${id}`);
        if (!res.ok) {
          if (!cancelled) {
            setLoadError(
              res.status === 404 ? 'Không tìm thấy trang này' : 'Không tải được nội dung trang'
            );
          }
          return;
        }
        const p = await res.json();
        if (cancelled) return;
        setInitial({
          title: p.title ?? '',
          slug: p.slug ?? '',
          content: p.content ?? '',
          excerpt: p.excerpt ?? '',
          image: p.image ?? '',
          metaTitle: p.metaTitle ?? '',
          metaDescription: p.metaDescription ?? '',
          published: Boolean(p.published),
        });
      } catch {
        if (!cancelled) setLoadError('Không kết nối được tới máy chủ');
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const handleSubmit = async (data: PageFormData, published: boolean) => {
    if (!data.title.trim()) {
      toast.error('Thiếu tiêu đề', 'Vui lòng nhập tiêu đề trang');
      return;
    }
    if (!data.content.trim() || data.content === '<p></p>') {
      toast.error('Thiếu nội dung', 'Vui lòng nhập nội dung trang');
      return;
    }

    setSavingMode(published ? 'publish' : 'draft');
    setSaving(true);
    try {
      const res = await fetch(`/api/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, published }),
      });
      if (res.status === 401) {
        toast.error('Phiên đã hết hạn', 'Vui lòng đăng nhập lại');
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error('Không lưu được', err.error || 'Vui lòng thử lại');
        return;
      }
      toast.success(published ? 'Đã cập nhật và đăng' : 'Đã lưu nháp', data.title);
      router.push('/admin/pages');
    } catch {
      toast.error('Không lưu được', 'Không kết nối được tới máy chủ');
    } finally {
      setSaving(false);
      setSavingMode(null);
    }
  };

  if (loadError) {
    return (
      <AdminLayout>
        <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl border border-amber-200 p-8 text-center">
          <h1 className="text-lg font-bold text-gray-900 mb-2">{loadError}</h1>
          <p className="text-sm text-gray-600 mb-6">
            Trang có thể đã bị xoá, hoặc đường dẫn không đúng.
          </p>
          <Link
            href="/admin/pages"
            className="inline-flex items-center justify-center min-h-touch px-5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Về danh sách trang
          </Link>
        </div>
      </AdminLayout>
    );
  }

  if (!initial) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20 text-gray-500 gap-3">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          <span className="text-sm">Đang tải nội dung trang…</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <PageForm
        mode="edit"
        initial={initial}
        onSubmit={handleSubmit}
        saving={saving}
        savingMode={savingMode}
      />
    </AdminLayout>
  );
}

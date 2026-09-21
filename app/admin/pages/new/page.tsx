'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import PageForm, { PageFormData } from '@/components/admin/PageForm';
import { useToast } from '@/components/Toast';

const EMPTY: PageFormData = {
  title: '', slug: '', content: '', excerpt: '',
  image: '', metaTitle: '', metaDescription: '', published: false,
};

export default function NewPagePage() {
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [savingMode, setSavingMode] = useState<'draft' | 'publish' | null>(null);

  const handleSubmit = async (data: PageFormData, published: boolean) => {
    if (!data.title.trim()) {
      toast.error('Thiếu tiêu đề', 'Vui lòng nhập tiêu đề trang');
      return;
    }
    // Tiptap để lại '<p></p>' khi ô soạn thảo rỗng — coi đó là chưa nhập gì.
    if (!data.content.trim() || data.content === '<p></p>') {
      toast.error('Thiếu nội dung', 'Vui lòng nhập nội dung trang');
      return;
    }

    setSavingMode(published ? 'publish' : 'draft');
    setSaving(true);
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, published }),
      });
      if (res.status === 401) {
        toast.error('Phiên đã hết hạn', 'Vui lòng đăng nhập lại');
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error('Không tạo được trang', err.error || 'Vui lòng thử lại');
        return;
      }
      const created = await res.json();
      toast.success(
        published ? 'Đã xuất bản!' : 'Đã lưu nháp!',
        published ? `Trang đang hiển thị tại /trang/${created.slug}` : 'Trang đã được lưu nháp'
      );
      router.push('/admin/pages');
    } catch {
      toast.error('Không tạo được trang', 'Không kết nối được tới máy chủ');
    } finally {
      setSaving(false);
      setSavingMode(null);
    }
  };

  return (
    <AdminLayout>
      <PageForm
        mode="create"
        initial={EMPTY}
        onSubmit={handleSubmit}
        saving={saving}
        savingMode={savingMode}
      />
    </AdminLayout>
  );
}

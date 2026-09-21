'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Textarea } from '@/components/admin/FormComponents';
import TiptapEditor from '@/components/admin/TiptapEditor';
import ImageUpload from '@/components/admin/ImageUpload';
import { slugify } from '@/lib/slug';
import {
  ArrowLeft, FileText, Image as ImageIcon, Eye, EyeOff,
  Send, Save, Search, Link2,
} from 'lucide-react';

export interface PageFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image: string;
  metaTitle: string;
  metaDescription: string;
  published: boolean;
}

/** Giới hạn Google thường cắt chữ. Vượt quá thì phần đuôi bị thay bằng "…". */
const TITLE_LIMIT = 60;
const DESC_LIMIT = 155;

/**
 * Biểu mẫu soạn trang, dùng chung cho cả tạo mới và chỉnh sửa.
 *
 * Tách riêng thay vì chép hai bản: hai màn hình này giống nhau tới từng ô nhập,
 * để rời nhau thì mỗi lần thêm một trường là phải nhớ sửa cả hai nơi — chỉ cần
 * quên một chỗ là dữ liệu nhập ở màn hình kia lặng lẽ không được lưu.
 */
export default function PageForm({
  mode,
  initial,
  onSubmit,
  saving,
  savingMode,
}: {
  mode: 'create' | 'edit';
  initial: PageFormData;
  onSubmit: (data: PageFormData, published: boolean) => void;
  saving: boolean;
  savingMode: 'draft' | 'publish' | null;
}) {
  const [data, setData] = useState<PageFormData>(initial);
  /*
   * Khi TẠO MỚI, đường dẫn tự chạy theo tiêu đề cho tới khi người dùng tự sửa
   * nó. Khi SỬA trang cũ thì không tự đổi nữa: trang đã đăng có thể đã được
   * Google lập chỉ mục và khách đã lưu link — âm thầm đổi đường dẫn vì sửa một
   * chữ trong tiêu đề sẽ làm hỏng mọi link cũ.
   */
  const [slugTouched, setSlugTouched] = useState(mode === 'edit');

  const set = <K extends keyof PageFormData>(key: K, value: PageFormData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const onTitleChange = (title: string) => {
    setData((prev) => ({
      ...prev,
      title,
      slug: slugTouched ? prev.slug : slugify(title),
    }));
  };

  const effectiveTitle = data.metaTitle.trim() || data.title;
  const effectiveDesc = data.metaDescription.trim() || data.excerpt.trim();

  const backHref = '/admin/pages';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href={backHref}>
          <button className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all">
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only-text">Quay lại danh sách trang</span>
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Thêm trang mới' : 'Chỉnh sửa trang'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {mode === 'create'
              ? 'Tạo trang nội dung mới cho website'
              : 'Cập nhật nội dung trang đã có'}
          </p>
        </div>
      </div>

      {/* Nội dung */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="h-4 w-4 text-blue-600" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Nội dung trang</h2>
            <p className="text-xs text-gray-500">Tiêu đề, đường dẫn và nội dung chi tiết</p>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <Input
            label="Tiêu đề trang"
            value={data.title}
            onChange={onTitleChange}
            placeholder="Ví dụ: Bán cân điện tử giá rẻ tại Quy Nhơn"
            required
          />

          <div>
            <Input
              label="Đường dẫn"
              value={data.slug}
              onChange={(v) => {
                setSlugTouched(true);
                set('slug', v);
              }}
              placeholder="ban-can-dien-tu-tai-quy-nhon"
            />
            <p className="mt-1.5 text-xs text-gray-500 flex items-start gap-1.5">
              <Link2 className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <span>
                Địa chỉ trang:{' '}
                <span className="font-mono text-gray-700 break-all">
                  /trang/{data.slug || '…'}
                </span>
                {mode === 'edit' && (
                  <>
                    {' '}— đổi đường dẫn sẽ làm hỏng các liên kết cũ đã được chia sẻ.
                  </>
                )}
              </span>
            </p>
          </div>

          <Textarea
            label="Tóm tắt"
            value={data.excerpt}
            onChange={(v) => set('excerpt', v)}
            placeholder="Mô tả ngắn, hiển thị ở danh sách trang và trên kết quả tìm kiếm Google"
            rows={3}
          />

          <TiptapEditor
            label="Nội dung chi tiết"
            value={data.content}
            onChange={(v) => set('content', v)}
            placeholder="Nhập nội dung chi tiết của trang..."
            height={480}
          />
        </div>
      </div>

      {/* Tối ưu tìm kiếm */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
            <Search className="h-4 w-4 text-amber-700" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Tối ưu tìm kiếm (SEO)</h2>
            <p className="text-xs text-gray-500">
              Để trống sẽ tự lấy tiêu đề và tóm tắt ở trên
            </p>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <Input
              label="Tiêu đề trên Google"
              value={data.metaTitle}
              onChange={(v) => set('metaTitle', v)}
              placeholder={data.title || 'Để trống sẽ dùng tiêu đề trang'}
            />
            <CharCount current={effectiveTitle.length} limit={TITLE_LIMIT} />
          </div>

          <div>
            <Textarea
              label="Mô tả trên Google"
              value={data.metaDescription}
              onChange={(v) => set('metaDescription', v)}
              placeholder={data.excerpt || 'Để trống sẽ dùng phần tóm tắt'}
              rows={3}
            />
            <CharCount current={effectiveDesc.length} limit={DESC_LIMIT} />
          </div>

          {/* Xem trước đúng như Google hiển thị: chủ shop thấy ngay tiêu đề có
              bị cắt cụt không, thay vì đăng rồi mới phát hiện (tiêu chí 8). */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Xem trước trên Google
            </p>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-emerald-700 truncate">
                cangiare.com › trang › {data.slug || '…'}
              </div>
              <div className="text-base text-blue-800 font-medium mt-0.5 line-clamp-1">
                {truncate(effectiveTitle, TITLE_LIMIT) || 'Tiêu đề trang'}
              </div>
              <div className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                {truncate(effectiveDesc, DESC_LIMIT) ||
                  'Phần mô tả sẽ hiện ở đây. Nhập tóm tắt để khách biết trang nói về gì.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hình ảnh */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <ImageIcon className="h-4 w-4 text-purple-600" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Hình ảnh đại diện</h2>
            <p className="text-xs text-gray-500">Ảnh hiện ở danh sách trang và khi chia sẻ link</p>
          </div>
        </div>
        <div className="p-6">
          <ImageUpload
            label="Tải lên hình ảnh"
            value={data.image}
            onChange={(url) => set('image', url)}
          />
        </div>
      </div>

      {/* Xuất bản */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Eye className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Xuất bản</h2>
            <p className="text-xs text-gray-500">Kiểm soát trạng thái hiển thị của trang</p>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatusOption
              selected={!data.published}
              onClick={() => set('published', false)}
              icon={EyeOff}
              title="Lưu nháp"
              detail="Chỉ quản trị viên thấy"
              tone="amber"
            />
            <StatusOption
              selected={data.published}
              onClick={() => set('published', true)}
              icon={Eye}
              title="Xuất bản"
              detail="Hiển thị công khai trên website"
              tone="emerald"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between gap-3 pt-2 pb-6">
        <Link href={backHref}>
          <Button variant="secondary">Hủy bỏ</Button>
        </Link>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="secondary" disabled={saving} onClick={() => onSubmit(data, false)}>
            <span className="flex items-center justify-center gap-2">
              {saving && savingMode === 'draft' ? <Spinner /> : <Save className="h-4 w-4" />}
              {saving && savingMode === 'draft' ? 'Đang lưu...' : 'Lưu nháp'}
            </span>
          </Button>
          <Button disabled={saving} onClick={() => onSubmit(data, true)}>
            <span className="flex items-center justify-center gap-2">
              {saving && savingMode === 'publish' ? <Spinner /> : <Send className="h-4 w-4" />}
              {saving && savingMode === 'publish'
                ? 'Đang đăng...'
                : mode === 'create'
                ? 'Đăng trang'
                : 'Lưu và đăng'}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}

function truncate(s: string, limit: number) {
  return s.length > limit ? `${s.slice(0, limit - 1)}…` : s;
}

/** Đếm ký tự, chuyển sang màu cảnh báo khi vượt giới hạn Google. */
function CharCount({ current, limit }: { current: number; limit: number }) {
  const over = current > limit;
  return (
    <p className={`mt-1.5 text-xs ${over ? 'text-amber-700 font-medium' : 'text-gray-500'}`}>
      {current}/{limit} ký tự
      {over && ' — Google sẽ cắt bớt phần cuối'}
    </p>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function StatusOption({
  selected, onClick, icon: Icon, title, detail, tone,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail: string;
  tone: 'amber' | 'emerald';
}) {
  const on = tone === 'amber'
    ? { border: 'border-amber-400 bg-amber-50', chip: 'bg-amber-200', icon: 'text-amber-700', text: 'text-amber-800', dot: 'bg-amber-400' }
    : { border: 'border-emerald-400 bg-emerald-50', chip: 'bg-emerald-200', icon: 'text-emerald-700', text: 'text-emerald-800', dot: 'bg-emerald-400' };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left min-h-touch ${
        selected ? on.border : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${selected ? on.chip : 'bg-gray-100'}`}>
        <Icon className={`h-5 w-5 ${selected ? on.icon : 'text-gray-500'}`} />
      </div>
      <div>
        <div className={`text-sm font-semibold ${selected ? on.text : 'text-gray-700'}`}>{title}</div>
        <div className="text-xs text-gray-500 mt-0.5">{detail}</div>
      </div>
      {selected && <div className={`ml-auto w-4 h-4 rounded-full flex-shrink-0 ${on.dot}`} />}
    </button>
  );
}

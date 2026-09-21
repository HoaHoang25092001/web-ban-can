import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronRight, Phone, MessageCircle } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import RichContentDisplay from '@/components/RichContentDisplay';
import {
  SITE_URL, PRIMARY_PHONE, ZALO_URL, telHref, buildBreadcrumbJsonLd,
} from '@/lib/site';

/*
 * Làm mới sau 10 phút. Nội dung trang SEO gần như không đổi sau khi đăng, nên
 * dựng sẵn và phục vụ tức thì thay vì truy vấn database mỗi lượt xem — Neon
 * đặt ở Mỹ, mỗi truy vấn tốn ~0,5s độ trễ (tiêu chí 7).
 */
export const revalidate = 600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Bỏ thẻ HTML để lấy chữ thuần, dùng cho mô tả tìm kiếm. */
function toPlainText(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.page.findUnique({
    where: { slug },
    select: {
      title: true, slug: true, excerpt: true, content: true,
      image: true, metaTitle: true, metaDescription: true, published: true,
    },
  });

  if (!page || !page.published) {
    return { title: 'Không tìm thấy trang' };
  }

  const title = page.metaTitle?.trim() || page.title;
  /* Mô tả ưu tiên ô SEO riêng, rồi tới tóm tắt, cuối cùng mới cắt từ nội dung.
   * Cắt ~155 ký tự vì Google chỉ hiển thị chừng đó. */
  const description =
    page.metaDescription?.trim() ||
    page.excerpt?.trim() ||
    `${toPlainText(page.content).slice(0, 155)}…`;

  return {
    title,
    description,
    alternates: { canonical: `/trang/${page.slug}` },
    openGraph: {
      type: 'article',
      title,
      description,
      url: `${SITE_URL}/trang/${page.slug}`,
      ...(page.image ? { images: [{ url: page.image }] } : {}),
    },
  };
}

export default async function ContentPage({ params }: PageProps) {
  const { slug } = await params;

  const page = await prisma.page.findUnique({ where: { slug } });

  /*
   * Trang nháp coi như không tồn tại với khách. Nếu chỉ ẩn khỏi danh sách mà
   * vẫn mở được bằng đường dẫn trực tiếp thì nội dung chưa duyệt vẫn lọt ra
   * ngoài và bị Google lập chỉ mục.
   */
  if (!page || !page.published) notFound();

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Trang chủ', path: '/' },
    { name: 'Trang', path: '/trang' },
    { name: page.title, path: `/trang/${page.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="bg-surface-muted">
        <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          {/* Đường dẫn phân cấp: khách biết mình đang ở đâu và quay lại được
              bằng một chạm (tiêu chí 4). */}
          {/* Link có padding dọc để đạt vùng chạm 44px trên điện thoại: chữ
              breadcrumb chỉ cao 18px, ngón tay rất dễ bấm trượt (tiêu chí 5). */}
          <nav aria-label="Đường dẫn" className="mb-3 -ml-2">
            <ol className="flex flex-wrap items-center text-sm text-slate-600">
              <li>
                <Link
                  href="/"
                  className="inline-flex items-center min-h-touch px-2 hover:text-brand-700 hover:underline"
                >
                  Trang chủ
                </Link>
              </li>
              <li aria-hidden="true"><ChevronRight className="w-4 h-4 text-slate-400" /></li>
              <li>
                <Link
                  href="/trang"
                  className="inline-flex items-center min-h-touch px-2 hover:text-brand-700 hover:underline"
                >
                  Trang
                </Link>
              </li>
              <li aria-hidden="true"><ChevronRight className="w-4 h-4 text-slate-400" /></li>
              <li className="px-2 font-medium text-slate-900" aria-current="page">
                {page.title}
              </li>
            </ol>
          </nav>

          <article className="bg-white rounded-card shadow-card overflow-hidden">
            <header className="px-5 sm:px-8 pt-7 pb-5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                {page.title}
              </h1>
              {page.excerpt && (
                <p className="mt-3 text-base text-slate-600 leading-relaxed max-w-prose">
                  {page.excerpt}
                </p>
              )}
            </header>

            {page.image && (
              <div className="px-5 sm:px-8 pb-2">
                <div className="relative w-full aspect-[16/9] rounded-card overflow-hidden bg-surface-sunken">
                  <Image
                    src={page.image}
                    alt={page.title}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 800px"
                    priority
                  />
                </div>
              </div>
            )}

            <div className="px-5 sm:px-8 py-6">
              <RichContentDisplay content={page.content} />
            </div>

            {/* Khách đọc xong trang giới thiệu dịch vụ thường muốn hỏi giá ngay.
                Không có lối liên hệ ở cuối thì họ phải cuộn ngược lên tìm
                (tiêu chí 1: một hành động chính rõ ràng). */}
            <footer className="border-t border-surface-border bg-surface-muted px-5 sm:px-8 py-6">
              <h2 className="text-lg font-bold text-slate-900">
                Cần tư vấn thêm?
              </h2>
              <p className="mt-1.5 text-sm text-slate-600 max-w-prose">
                Gọi trực tiếp để được báo giá và tư vấn chọn loại cân phù hợp với công việc của bạn.
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <a
                  href={telHref(PRIMARY_PHONE)}
                  className="inline-flex items-center justify-center gap-2 min-h-touch px-5 rounded-lg bg-accent-600 text-white font-semibold hover:bg-accent-700 transition-colors"
                >
                  <Phone className="w-5 h-5" aria-hidden="true" />
                  Gọi ngay {PRIMARY_PHONE}
                </a>
                <a
                  href={ZALO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-touch px-5 rounded-lg border-2 border-brand-600 text-brand-700 font-semibold hover:bg-brand-50 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" aria-hidden="true" />
                  Nhắn tin qua Zalo
                </a>
              </div>
            </footer>
          </article>
        </div>
      </div>
    </>
  );
}

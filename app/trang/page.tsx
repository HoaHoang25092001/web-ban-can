import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { FileText, ChevronRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Trang thông tin',
  description:
    'Các trang thông tin về sản phẩm, dịch vụ và khu vực bán hàng của Cân Vạn Thịnh Phát.',
  alternates: { canonical: '/trang' },
};

export default async function PagesIndex() {
  const pages = await prisma.page.findMany({
    where: { published: true },
    // Không lấy `content`: danh sách chỉ hiện tiêu đề và tóm tắt.
    select: { id: true, title: true, slug: true, excerpt: true, image: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return (
    <div className="bg-surface-muted min-h-[60vh]">
      <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Vùng chạm 44px cho link breadcrumb — xem ghi chú ở trang chi tiết. */}
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
            <li className="px-2 font-medium text-slate-900" aria-current="page">Trang</li>
          </ol>
        </nav>

        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Trang thông tin</h1>
          <p className="mt-2 text-base text-slate-600 max-w-prose">
            Thông tin về sản phẩm, dịch vụ và khu vực chúng tôi phục vụ.
          </p>
        </header>

        {pages.length === 0 ? (
          <div className="bg-white rounded-card shadow-card p-10 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" aria-hidden="true" />
            <p className="text-slate-600">Chưa có trang nào được đăng.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pages.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/trang/${p.slug}`}
                  className="group block h-full bg-white rounded-card shadow-card overflow-hidden hover:shadow-card-hover transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                >
                  {p.image && (
                    <div className="relative w-full aspect-[16/9] bg-surface-sunken">
                      <Image
                        src={p.image}
                        alt=""
                        fill
                        className="object-contain"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h2 className="font-semibold text-slate-900 leading-snug group-hover:text-brand-700">
                      {p.title}
                    </h2>
                    {p.excerpt && (
                      <p className="mt-1.5 text-sm text-slate-600 leading-relaxed line-clamp-3">
                        {p.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ChevronRight, Newspaper, ArrowRight, ChevronLeft } from 'lucide-react';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface NewsPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Tin Tức & Kiến Thức Ngành Cân - Vạn Thịnh Phát',
  description: 'Cập nhật thông tin mới nhất về sản phẩm, công nghệ cân điện tử và xu hướng đo lường thị trường Việt Nam.',
};

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const resolvedSearchParams = await searchParams;
  const currentPage = parseInt(resolvedSearchParams.page || '1');
  const limit = 6;
  const skip = (currentPage - 1) * limit;

  // Thực hiện truy vấn trực tiếp trên Server qua Prisma
  const [newsRaw, total] = await Promise.all([
    prisma.news.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.news.count({
      where: { published: true },
    })
  ]);

  const totalPages = Math.ceil(total / limit);

  // Chuẩn hóa dữ liệu News để hiển thị
  const news = newsRaw.map(item => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const estimateReadTime = (content: string) =>
    Math.max(1, Math.ceil(content.replace(/<[^>]+>/g, '').length / 1000));

  const getImageSrc = (image: string | null) => {
    if (image && image.trim() !== '') {
      return image.startsWith('/') ? `http://localhost:3000${image}` : image;
    }
    return null;
  };

  const featuredArticle = news[0];
  const restArticles = news.slice(1);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Hero Banner ── */}
      <div className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          {/* breadcrumb */}
          <nav className="flex items-center gap-2 text-blue-200 text-sm mb-8 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <ChevronRight className="w-4 h-4 text-blue-300" />
            <span className="text-white font-semibold">Tin tức</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm mb-4">
                <Newspaper className="w-3.5 h-3.5" />
                Tin tức &amp; Cập nhật
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
                Tin Tức &amp; Kiến Thức<br className="hidden md:block" />
                <span className="text-blue-200"> Ngành Cân</span>
              </h1>
              <p className="mt-3 text-blue-100 text-base md:text-lg max-w-xl leading-relaxed">
                Cập nhật thông tin mới nhất về sản phẩm, công nghệ cân điện tử và xu hướng thị trường
              </p>
            </div>
            {total > 0 && (
              <div className="flex-shrink-0 bg-white/10 border border-white/20 rounded-2xl px-5 py-3 backdrop-blur-sm text-right">
                <p className="text-2xl font-extrabold text-white">{total}</p>
                <p className="text-xs text-blue-200 font-semibold mt-0.5">Bài viết đã đăng</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">

        {news.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-28 text-center bg-white rounded-2xl border shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-5">
              <Newspaper className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Chưa có bài viết nào</h3>
            <p className="text-slate-500 text-sm max-w-xs">Hãy quay lại sau để xem những cập nhật mới nhất từ chúng tôi.</p>
            <Link href="/" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-blue-500/20">
              Về trang chủ
            </Link>
          </div>

        ) : (
          <>
            {/* ── Featured Article ── */}
            {featuredArticle && currentPage === 1 && (
              <Link
                href={`/news/${featuredArticle.id}`}
                className="group block bg-white rounded-2xl overflow-hidden border border-slate-200/70 shadow-md hover:shadow-xl transition-all duration-300 mb-10"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="relative h-64 lg:h-full min-h-[280px] bg-slate-100 overflow-hidden">
                    {getImageSrc(featuredArticle.image) ? (
                      <Image
                        src={getImageSrc(featuredArticle.image)!}
                        alt={featuredArticle.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        priority
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                        <Newspaper className="w-20 h-20 text-white/30" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        Tin mới nhất
                      </span>
                    </div>
                  </div>

                  <div className="p-7 md:p-9 flex flex-col justify-center">
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mb-4">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(featuredArticle.createdAt)}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {estimateReadTime(featuredArticle.content)} phút đọc
                      </span>
                    </div>

                    <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-tight mb-3 group-hover:text-blue-600 transition-colors line-clamp-3">
                      {featuredArticle.title}
                    </h2>

                    {featuredArticle.excerpt && (
                      <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-6">
                        {featuredArticle.excerpt}
                      </p>
                    )}

                    <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 group-hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors self-start shadow-md shadow-blue-500/20">
                      Đọc bài viết
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* ── Section heading ── */}
            {currentPage === 1 && restArticles.length > 0 && (
              <div className="flex items-center gap-3 mb-7 animate-fade-in">
                <div className="w-1 h-6 bg-blue-600 rounded-full" />
                <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Tất cả bài viết</h2>
                <span className="text-sm text-slate-400 font-medium">({total} bài)</span>
              </div>
            )}

            {/* ── News Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {(currentPage === 1 ? restArticles : news).map((article) => (
                <article
                  key={article.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
                >
                  {/* Thumbnail */}
                  <Link href={`/news/${article.id}`} className="block relative h-52 bg-slate-100 overflow-hidden flex-shrink-0">
                    {getImageSrc(article.image) ? (
                      <Image
                        src={getImageSrc(article.image)!}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <Newspaper className="w-12 h-12 text-white/40" />
                      </div>
                    )}
                    {/* overlay on hover */}
                    <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/10 transition-colors duration-300" />
                  </Link>

                  {/* Body */}
                  <div className="p-5 flex flex-col flex-1">
                    {/* Meta */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-semibold mb-3">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(article.createdAt)}
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {estimateReadTime(article.content)} phút
                      </span>
                    </div>

                    {/* Title */}
                    <Link href={`/news/${article.id}`}>
                      <h3 className="text-sm font-extrabold text-slate-800 leading-snug line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                        {article.title}
                      </h3>
                    </Link>

                    {/* Excerpt */}
                    {(article.excerpt || article.content) && (
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4 flex-1">
                        {article.excerpt || article.content.replace(/<[^>]+>/g, '').substring(0, 120) + '...'}
                      </p>
                    )}

                    {/* CTA */}
                    <Link
                      href={`/news/${article.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 group/cta mt-auto transition-colors"
                    >
                      Đọc thêm
                      <ArrowRight className="w-3.5 h-3.5 group-hover/cta:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-4 mt-8">
                <nav className="flex items-center gap-1.5">
                  {/* Prev */}
                  {currentPage === 1 ? (
                    <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 text-slate-300 cursor-not-allowed select-none">
                      <ChevronLeft className="w-4 h-4" />
                      Trước
                    </span>
                  ) : (
                    <Link
                      href={`/news?page=${currentPage - 1}`}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Trước
                    </Link>
                  )}

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                    .map((page, index, array) => {
                      const showEllipsis = index > 0 && page - array[index - 1] > 1;
                      return (
                        <div key={page} className="flex items-center gap-1.5">
                          {showEllipsis && <span className="px-1 text-slate-400 font-bold">…</span>}
                          {currentPage === page ? (
                            <span className="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold bg-blue-600 text-white shadow-md shadow-blue-500/30 select-none">
                              {page}
                            </span>
                          ) : (
                            <Link
                              href={`/news?page=${page}`}
                              className="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 shadow-sm"
                            >
                              {page}
                            </Link>
                          )}
                        </div>
                      );
                    })
                  }

                  {/* Next */}
                  {currentPage === totalPages ? (
                    <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 text-slate-300 cursor-not-allowed select-none">
                      Tiếp
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  ) : (
                    <Link
                      href={`/news?page=${currentPage + 1}`}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 shadow-sm"
                    >
                      Tiếp
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </nav>

                <p className="text-xs text-slate-400 font-medium">
                  Trang {currentPage}/{totalPages} · Hiển thị {(currentPage === 1 ? restArticles : news).length}/{total} bài viết
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

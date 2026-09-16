'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { isOptimizableImage } from '@/lib/image';
import { BUSINESS, telHref } from '@/lib/site';
import {
  ArrowLeft, Calendar, Clock, ChevronRight, Newspaper, Share2, 
  Facebook, Twitter, LinkIcon, Phone, Mail, CheckCircle2
} from 'lucide-react';
import RichContentDisplay from '@/components/RichContentDisplay';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  excerpt: string | null;
  image: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NewsDetailClientProps {
  news: NewsItem;
  relatedNews: NewsItem[];
}

export default function NewsDetailClient({ news, relatedNews }: NewsDetailClientProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

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
      return image;
    }
    return null;
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  const imageSrc = getImageSrc(news.image);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* ── Sticky Breadcrumb Header ── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav className="flex items-center gap-2 text-xs md:text-sm font-medium text-slate-500 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-blue-600 transition-colors flex-shrink-0">Trang chủ</Link>
            <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
            <Link href="/news" className="hover:text-blue-600 transition-colors flex-shrink-0">Tin tức</Link>
            <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
            <span className="text-slate-900 font-semibold truncate max-w-[200px] md:max-w-sm">{news.title}</span>
          </nav>
        </div>
      </div>

      {/* ── Hero Image ── */}
      <div className="relative w-full h-64 md:h-[420px] bg-slate-900 overflow-hidden">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={news.title}
            fill
            priority
            className="object-cover opacity-85"
            sizes="100vw"
            unoptimized={!isOptimizableImage(imageSrc)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700" />
        )}
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

        {/* Title on image */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 text-xs text-white/70 font-semibold mb-3">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(news.createdAt)}
              </span>
              <span className="text-white/40">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {estimateReadTime(news.content)} phút đọc
              </span>
            </div>
            <h1 className="text-xl md:text-3xl lg:text-4xl font-extrabold text-white leading-snug drop-shadow-md line-clamp-3">
              {news.title}
            </h1>
          </div>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* ── Article Body ── */}
          <article className="lg:col-span-8">

            {/* Back link */}
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-6 group transition-colors"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Quay lại
            </button>

            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-md overflow-hidden">

              {/* Excerpt highlight */}
              {news.excerpt && (
                <div className="px-7 pt-7 pb-5">
                  <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-xl p-5">
                    <p className="text-blue-800 font-semibold text-sm md:text-base leading-relaxed">
                      {news.excerpt}
                    </p>
                  </div>
                </div>
              )}

              {/* Rich content */}
              <div className={`px-7 py-7 ${news.excerpt ? 'pt-3' : ''}`}>
                <RichContentDisplay
                  content={news.content}
                  className="prose-article"
                />
              </div>

              {/* Divider + Share bar */}
              <div className="px-7 py-5 border-t border-slate-100 bg-slate-50/80">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5" />
                      Chia sẻ bài viết
                    </span>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 rounded-xl transition-colors shadow-sm"
                        title="Chia sẻ Facebook"
                      >
                        <Facebook className="w-4 h-4" />
                      </a>
                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(news.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white border border-slate-200 text-sky-500 hover:bg-sky-50 hover:border-sky-300 rounded-xl transition-colors shadow-sm"
                        title="Chia sẻ Twitter/X"
                      >
                        <Twitter className="w-4 h-4" />
                      </a>
                      <button
                        onClick={handleCopyLink}
                        className={`p-2 border rounded-xl transition-all shadow-sm ${copied ? 'bg-emerald-50 border-emerald-300 text-emerald-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                        title="Sao chép liên kết"
                      >
                        {copied ? <CheckCircle2 className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                      </button>
                    </div>
                    {copied && <span className="text-xs font-semibold text-emerald-600">Đã sao chép!</span>}
                  </div>

                  <Link
                    href="/news"
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Tất cả tin tức
                  </Link>
                </div>
              </div>

            </div>

            {/* ── Related News (mobile - below article) ── */}
            {relatedNews.length > 0 && (
              <section className="mt-10 lg:hidden">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-6 bg-blue-600 rounded-full" />
                  <h2 className="text-base font-extrabold text-slate-800">Bài viết liên quan</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedNews.slice(0, 4).map(article => (
                    <RelatedCard key={article.id} article={article} formatDate={formatDate} getImageSrc={getImageSrc} estimateReadTime={estimateReadTime} />
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* ── Sidebar ── */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">

            {/* Contact CTA Card */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              <h3 className="text-base font-extrabold mb-1.5 flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400" />
                Cần tư vấn sản phẩm?
              </h3>
              <p className="text-xs text-slate-400 font-medium mb-4 leading-relaxed">
                Đội ngũ kỹ thuật sẵn sàng hỗ trợ bạn 24/7 về thiết bị đo lường.
              </p>
              <div className="space-y-2.5 mb-4">
                <a href={telHref(BUSINESS.phones[0])} className="flex items-center gap-3 bg-slate-800/70 border border-slate-700/50 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors group">
                  <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold">Hotline tư vấn</p>
                    <p className="text-sm font-extrabold text-white group-hover:text-blue-300 transition-colors">{BUSINESS.phones[0]}</p>
                  </div>
                </a>
              </div>
              <Link
                href="/contact"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold transition-colors"
              >
                <Mail className="w-4 h-4" />
                Gửi yêu cầu tư vấn
              </Link>
            </div>

            {/* Related News sidebar */}
            {relatedNews.length > 0 && (
              <div className="hidden lg:block">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-blue-600 rounded-full" />
                    <h2 className="text-sm font-extrabold text-slate-800">Bài viết liên quan</h2>
                  </div>
                  <Link href="/news" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition-colors">
                    Tất cả <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {relatedNews.map(article => (
                    <Link
                      key={article.id}
                      href={`/news/${article.id}`}
                      className="group flex gap-3 bg-white rounded-xl border border-slate-200/60 p-3 hover:shadow-md hover:border-blue-200 transition-all"
                    >
                      <div className="relative w-16 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
                        {getImageSrc(article.image) ? (
                          <Image
                            src={getImageSrc(article.image)!}
                            alt={article.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="64px"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Newspaper className="w-5 h-5 text-white/50" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-slate-400 font-semibold mb-0.5 flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          {formatDate(article.createdAt)}
                        </p>
                        <h3 className="text-xs font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {article.title}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ── Related Card Component ── */
function RelatedCard({
  article,
  formatDate,
  getImageSrc,
  estimateReadTime,
}: {
  article: NewsItem;
  formatDate: (d: string) => string;
  getImageSrc: (img: string | null) => string | null;
  estimateReadTime: (c: string) => number;
}) {
  const imgSrc = getImageSrc(article.image);
  return (
    <Link
      href={`/news/${article.id}`}
      className="group flex gap-3 bg-white rounded-xl border border-slate-200/60 p-3 hover:shadow-md hover:border-blue-200 transition-all"
    >
      <div className="relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="80px"
            unoptimized={!isOptimizableImage(imgSrc)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Newspaper className="w-6 h-6 text-white/50" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold mb-1">
          <Calendar className="w-2.5 h-2.5" />
          {formatDate(article.createdAt)}
          <span>·</span>
          <Clock className="w-2.5 h-2.5" />
          {estimateReadTime(article.content)} phút
        </div>
        <h3 className="text-xs font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
          {article.title}
        </h3>
      </div>
    </Link>
  );
}

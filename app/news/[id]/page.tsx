import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import NewsDetailClient from './NewsDetailClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface NewsDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: NewsDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const news = await prisma.news.findUnique({
      where: { id: parseInt(id) }
    });
    if (!news) return { title: 'Không tìm thấy bài viết - Vạn Thịnh Phát' };
    return {
      title: `${news.title} - Tin tức Vạn Thịnh Phát`,
      description: news.excerpt || `${news.title}. Cập nhật tin tức công nghệ cân và xu hướng đo lường mới nhất từ Vạn Thịnh Phát.`
    };
  } catch {
    return { title: 'Tin tức chi tiết - Vạn Thịnh Phát' };
  }
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { id } = await params;
  const newsId = parseInt(id);

  if (isNaN(newsId)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full bg-white p-10 rounded-2xl shadow-xl border border-slate-100 animate-scale-in">
          <div className="inline-flex p-4 bg-red-50 text-red-500 rounded-full mb-6">
            <AlertCircle className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Bài viết không tồn tại</h1>
          <p className="text-slate-500 mb-6 text-sm">ID bài viết không hợp lệ.</p>
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Về danh sách tin tức
          </Link>
        </div>
      </div>
    );
  }

  // Tải trực tiếp dữ liệu từ database trên server
  const news = await prisma.news.findUnique({
    where: { id: newsId }
  });

  if (!news || !news.published) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full bg-white p-10 rounded-2xl shadow-xl border border-slate-100 animate-scale-in">
          <div className="inline-flex p-4 bg-red-50 text-red-500 rounded-full mb-6">
            <AlertCircle className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Bài viết không tồn tại</h1>
          <p className="text-slate-500 mb-6 text-sm">Bài viết bạn đang tìm kiếm có thể đã bị xóa hoặc chưa được xuất bản.</p>
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Về danh sách tin tức
          </Link>
        </div>
      </div>
    );
  }

  // Tải các bài viết liên quan (bài viết mới nhất được xuất bản khác)
  const relatedNewsRaw = await prisma.news.findMany({
    where: {
      published: true,
      id: { not: news.id }
    },
    orderBy: { createdAt: 'desc' },
    take: 4
  });

  // Serialize dữ liệu để truyền qua Client component boundary an toàn
  const newsSerialized = {
    ...news,
    createdAt: news.createdAt.toISOString(),
    updatedAt: news.updatedAt.toISOString(),
  };

  const relatedNewsSerialized = relatedNewsRaw.map(item => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  return (
    <NewsDetailClient 
      news={newsSerialized} 
      relatedNews={relatedNewsSerialized} 
    />
  );
}

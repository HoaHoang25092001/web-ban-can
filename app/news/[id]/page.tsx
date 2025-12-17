'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import RichContentDisplay from '@/components/RichContentDisplay';
import ProductCategorySidebar from '@/components/ProductCategorySidebar';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function NewsDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchNewsDetail(id as string);
      fetchRelatedNews();
    }
  }, [id]);

  const fetchNewsDetail = async (newsId: string) => {
    try {
      const response = await fetch(`/api/news/${newsId}`);
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/404');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setNews(data);
    } catch (error) {
      console.error('Error fetching news detail:', error);
      router.push('/news');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedNews = async () => {
    try {
      const response = await fetch('/api/news?published=true&limit=3');
      if (response.ok) {
        const data = await response.json();
        // Filter out current news from related
        const filtered = data.news?.filter((item: NewsItem) => item.id !== parseInt(id as string)) || [];
        setRelatedNews(filtered.slice(0, 3));
      }
    } catch (error) {
      // Error handled silently
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getImageSrc = (image: string, title: string) => {
    if (image && image.trim() !== '') {
      return image.startsWith('/') ? `http://localhost:3000${image}` : image;
    }
    return `https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=${encodeURIComponent(title.substring(0, 30))}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Bài viết không tồn tại</h1>
          <Link href="/news" className="text-blue-600 hover:text-blue-700">
            ← Quay lại danh sách tin tức
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="text-gray-700 hover:text-blue-600 inline-flex items-center">
                  <i className="ri-home-line w-4 h-4 mr-2"></i>
                  Trang chủ
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <i className="ri-arrow-right-s-line w-4 h-4 text-gray-400"></i>
                  <Link href="/news" className="ml-1 text-gray-700 hover:text-blue-600 md:ml-2">
                    Tin tức
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <i className="ri-arrow-right-s-line w-4 h-4 text-gray-400"></i>
                  <span className="ml-1 text-gray-500 md:ml-2 truncate max-w-xs">
                    {news.title}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content with Sidebar Layout */}
      <div className="flex gap-6 px-4 lg:px-6 py-6">
        {/* Fixed Sidebar - Categories */}
        <ProductCategorySidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 w-full min-w-0">
          <article className="max-w-4xl mx-auto py-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {news.title}
            </h1>
            
            <div className="flex items-center text-gray-600 text-sm mb-6">
              <i className="ri-calendar-line w-4 h-4 mr-2"></i>
              <span>{formatDate(news.createdAt)}</span>
              <span className="mx-2">•</span>
              <i className="ri-time-line w-4 h-4 mr-2"></i>
              <span>{Math.ceil(news.content.length / 1000)} phút đọc</span>
            </div>

            {/* Excerpt */}
            {news.excerpt && (
              <div className="text-lg text-gray-600 font-medium mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-md">
                {news.excerpt}
              </div>
            )}
          </div>

          {/* Featured Image */}
          <div className="relative h-64 md:h-96 bg-gray-200">
            <Image
              src={getImageSrc(news.image, news.title)}
              alt={news.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=${encodeURIComponent(news.title.substring(0, 30))}`;
              }}
            />
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            <RichContentDisplay content={news.content} className="prose-lg" />
          </div>

          {/* Share & Actions */}
          <div className="px-8 py-6 bg-gray-50 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Chia sẻ:</span>
                <div className="flex space-x-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors">
                    <i className="ri-facebook-fill w-5 h-5"></i>
                  </button>
                  <button className="p-2 text-blue-400 hover:bg-blue-100 rounded-full transition-colors">
                    <i className="ri-twitter-fill w-5 h-5"></i>
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                    <i className="ri-link w-5 h-5"></i>
                  </button>
                </div>
              </div>
              
              <Link
                href="/news"
                className="inline-flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <i className="ri-arrow-left-line w-4 h-4 mr-2"></i>
                Quay lại tin tức
              </Link>
            </div>
          </div>
        </div>
      </article>

      {/* Related News */}
      {relatedNews.length > 0 && (
        <section className="py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Tin tức liên quan
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedNews.map((article) => (
              <article key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-40 bg-gray-200">
                  <Image
                    src={getImageSrc(article.image, article.title)}
                    alt={article.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 300px"
                  />
                </div>
                
                <div className="p-4">
                  <div className="text-xs text-gray-500 mb-2">
                    {formatDate(article.createdAt)}
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                    <Link href={`/news/${article.id}`}>
                      {article.title}
                    </Link>
                  </h3>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {article.excerpt || article.content.substring(0, 100) + '...'}
                  </p>
                  
                  <Link 
                    href={`/news/${article.id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Đọc thêm →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
        </div>
      </div>
    </div>
  );
}

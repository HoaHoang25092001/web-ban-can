'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 6,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchNews(currentPage);
  }, [currentPage]);

  const fetchNews = async (page: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/news?published=true&page=${page}&limit=6`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setNews(data.news || []);
      setPagination(data.pagination || {
        page: 1,
        limit: 6,
        total: 0,
        pages: 0,
      });
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const getImageSrc = (image: string, title: string) => {
    if (image && image.trim() !== '') {
      return image.startsWith('/') ? `http://localhost:3000${image}` : image;
    }
    // Default placeholder cho news
    return `https://via.placeholder.com/400x250/4F46E5/FFFFFF?text=${encodeURIComponent(title.substring(0, 20))}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Tin Tức & Cập Nhật
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Cập nhật những thông tin mới nhất về sản phẩm, công nghệ cân điện tử và xu hướng thị trường
            </p>
          </div>
        </div>
      </div>

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
                  <span className="ml-1 text-gray-500 md:ml-2">Tin tức</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          // Loading state
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : news.length === 0 ? (
          // Empty state
          <div className="text-center py-20">
            <i className="ri-newspaper-line text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Chưa có tin tức nào
            </h3>
            <p className="text-gray-500">
              Hãy quay lại sau để xem những cập nhật mới nhất từ chúng tôi
            </p>
          </div>
        ) : (
          <>
            {/* News Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {news.map((article) => (
                <article key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  {/* Image */}
                  <div className="relative h-48 bg-gray-200">
                    <Image
                      src={getImageSrc(article.image, article.title)}
                      alt={article.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://via.placeholder.com/400x250/4F46E5/FFFFFF?text=${encodeURIComponent(article.title.substring(0, 20))}`;
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Date */}
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <i className="ri-calendar-line w-4 h-4 mr-2"></i>
                      {formatDate(article.createdAt)}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
                      <Link href={`/news/${article.id}`}>
                        {article.title}
                      </Link>
                    </h3>

                    {/* Excerpt */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {article.excerpt || truncateContent(article.content)}
                    </p>

                    {/* Read More */}
                    <Link 
                      href={`/news/${article.id}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                    >
                      Đọc thêm
                      <i className="ri-arrow-right-line w-4 h-4 ml-1"></i>
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center">
                <nav className="flex items-center space-x-2">
                  {/* Previous button */}
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-300'
                    }`}
                  >
                    <i className="ri-arrow-left-line w-4 h-4"></i>
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first page, last page, current page, and 1 page before/after current
                      return page === 1 || 
                             page === pagination.pages || 
                             Math.abs(page - currentPage) <= 1;
                    })
                    .map((page, index, array) => {
                      // Add ellipsis if there's a gap
                      const showEllipsis = index > 0 && page - array[index - 1] > 1;
                      
                      return (
                        <div key={page} className="flex items-center">
                          {showEllipsis && (
                            <span className="px-2 py-2 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-300'
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      );
                    })}

                  {/* Next button */}
                  <button
                    onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                    disabled={currentPage === pagination.pages}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentPage === pagination.pages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-300'
                    }`}
                  >
                    <i className="ri-arrow-right-line w-4 h-4"></i>
                  </button>
                </nav>
              </div>
            )}

            {/* Stats */}
            <div className="mt-8 text-center text-sm text-gray-500">
              Hiển thị {news.length} trên tổng số {pagination.total} bài viết
            </div>
          </>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface News {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  image?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function NewsSlider() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news?published=true&limit=6');
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const data = await response.json();
        setNews(data.news || []);
      } catch (error) {
        console.error('Error fetching news:', error);
        setError('Không thể tải tin tức');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Auto slide effect
  useEffect(() => {
    if (news.length === 0) return;

    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % news.length);
    }, 4000); // Chuyển slide mỗi 4 giây

    return () => clearInterval(slideInterval);
  }, [news.length]);

  // Smooth scroll to current slide
  useEffect(() => {
    if (sliderRef.current) {
      const slideWidth = sliderRef.current.scrollWidth / news.length;
      sliderRef.current.scrollTo({
        left: slideWidth * currentSlide,
        behavior: 'smooth'
      });
    }
  }, [currentSlide, news.length]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Tin Tức Mới Nhất
          </h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error || news.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Tin Tức Mới Nhất
          </h2>
          <div className="text-center text-gray-600">
            {error || 'Chưa có tin tức nào được đăng tải.'}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Tin Tức Mới Nhất
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Cập nhật những thông tin mới nhất về sản phẩm và ngành hàng
          </p>
        </div>

        <div className="relative">
          {/* Slider Container */}
          <div 
            ref={sliderRef}
            className="flex overflow-x-hidden scroll-smooth gap-4 md:gap-6"
            style={{ 
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {news.map((newsItem) => (
              <div
                key={newsItem.id}
                className="flex-shrink-0 w-72 sm:w-80 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                {/* News Image */}
                <div className="h-40 sm:h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                  {newsItem.image ? (
                    <img
                      src={newsItem.image}
                      alt={newsItem.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                      <svg
                        className="w-16 h-16 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* News Content */}
                <div className="p-4 sm:p-6">
                  <div className="text-sm text-blue-600 font-medium mb-2">
                    {formatDate(newsItem.createdAt)}
                  </div>
                  
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 leading-tight">
                    {truncateText(newsItem.title, 60)}
                  </h3>
                  
                  <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">
                    {newsItem.excerpt 
                      ? truncateText(newsItem.excerpt, 100)
                      : truncateText(newsItem.content.replace(/<[^>]*>/g, ''), 100)
                    }
                  </p>
                  
                  <Link
                    href={`/news/${newsItem.id}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                  >
                    Đọc thêm
                    <svg
                      className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {news.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                  currentSlide === index ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => setCurrentSlide(prev => prev === 0 ? news.length - 1 : prev - 1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow duration-200 text-gray-600 hover:text-blue-600"
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => setCurrentSlide(prev => (prev + 1) % news.length)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow duration-200 text-gray-600 hover:text-blue-600"
            aria-label="Next slide"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* View All News Link */}
        <div className="text-center mt-8 sm:mt-12">
          <Link
            href="/news"
            className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base"
          >
            Xem Tất Cả Tin Tức
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .flex::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
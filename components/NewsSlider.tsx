'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { isOptimizableImage } from '@/lib/image';
import { Calendar, Clock, ArrowRight, ChevronLeft, ChevronRight, BookOpen, Newspaper } from 'lucide-react';

interface News {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  image?: string;
  createdAt: string;
}

interface NewsSliderProps {
  initialNews?: News[];
}

export default function NewsSlider({ initialNews }: NewsSliderProps) {
  const [news, setNews] = useState<News[]>(initialNews || []);
  const [loading, setLoading] = useState(!initialNews);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    if (initialNews) return;
    
    let cancelled = false;

    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news?published=true&limit=6');
        if (!response.ok) {
          if (!cancelled) {
            setError('Không thể tải tin tức');
            setLoading(false);
          }
          return;
        }
        const data = await response.json();
        if (!cancelled) {
          setNews(data.news || []);
        }
      } catch (err) {
        console.error('Error fetching news:', err);
        if (!cancelled) setError('Không thể tải tin tức');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchNews();

    return () => { cancelled = true; };
  }, [initialNews]);

  // Cuộn mượt đến slide chỉ định
  const scrollToSlide = (index: number) => {
    if (sliderRef.current) {
      const container = sliderRef.current;
      const card = container.querySelector('.snap-start');
      if (card) {
        const cardWidth = card.getBoundingClientRect().width;
        const gap = 24; // gap-6 trong Tailwind là 24px
        container.scrollTo({
          left: index * (cardWidth + gap),
          behavior: 'smooth'
        });
        setCurrentSlide(index);
      }
    }
  };

  // Auto slide hiệu ứng
  useEffect(() => {
    if (news.length === 0) return;

    const slideInterval = setInterval(() => {
      if (!isPausedRef.current) {
        setCurrentSlide(prev => {
          const nextIndex = (prev + 1) % news.length;
          scrollToSlide(nextIndex);
          return nextIndex;
        });
      }
    }, 5000); // Chuyển slide mỗi 5 giây

    return () => clearInterval(slideInterval);
  }, [news.length]);

  // Lắng nghe hành vi cuộn tự nhiên (swipe trên mobile hoặc scroll chuột) để cập nhật Dot tương ứng
  const handleScroll = () => {
    if (sliderRef.current) {
      const container = sliderRef.current;
      const scrollLeft = container.scrollLeft;
      const card = container.querySelector('.snap-start');
      if (card) {
        const cardWidth = card.getBoundingClientRect().width;
        const gap = 24;
        const index = Math.round(scrollLeft / (cardWidth + gap));
        if (index >= 0 && index < news.length && index !== currentSlide) {
          setCurrentSlide(index);
        }
      }
    }
  };

  const handlePrev = () => {
    const nextIndex = currentSlide === 0 ? news.length - 1 : currentSlide - 1;
    scrollToSlide(nextIndex);
  };

  const handleNext = () => {
    const nextIndex = (currentSlide + 1) % news.length;
    scrollToSlide(nextIndex);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const estimateReadTime = (content: string) => {
    return Math.max(1, Math.ceil(content.replace(/<[^>]+>/g, '').length / 1000));
  };

  // Hàm tự động phân tích category dựa trên tiêu đề bài viết
  const getCategoryTag = (title: string) => {
    const lowercaseTitle = title.toLowerCase();
    if (lowercaseTitle.includes('hướng dẫn') || lowercaseTitle.includes('cách') || lowercaseTitle.includes('sử dụng')) {
      return 'Cẩm nang';
    }
    if (lowercaseTitle.includes('công nghệ') || lowercaseTitle.includes('kỹ thuật') || lowercaseTitle.includes('tiêu chuẩn')) {
      return 'Kỹ thuật';
    }
    return 'Tin tức';
  };

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-b from-slate-50/50 to-white rounded-3xl border border-slate-100/80 shadow-sm relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-slate-500 text-sm font-medium animate-pulse">Đang tải tin tức mới nhất...</p>
          </div>
        </div>
      </section>
    );
  }

  /**
   * Chưa có bài viết thì ẩn hẳn khối này.
   *
   * Bản trước vẫn dựng một khung cao ~200px chỉ để thông báo "chưa có tin tức" —
   * với khách hàng đây là khoảng trắng vô nghĩa chen giữa đánh giá và phần giới
   * thiệu, đẩy nội dung quan trọng xuống thấp mà không mang lại thông tin gì.
   */
  if (error || news.length === 0) {
    return null;
  }

  return (
    <section 
      className="py-12 bg-gradient-to-b from-slate-50/50 to-white rounded-3xl border border-slate-100/80 shadow-sm relative overflow-hidden"
      onMouseEnter={() => { isPausedRef.current = true; }}
      onMouseLeave={() => { isPausedRef.current = false; }}
    >
      {/* Các hình tròn màu mờ trang trí phía sau (Subtle glow) */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-50/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 px-6 sm:px-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              Góc chia sẻ & tin tức
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
              Tin Tức Mới Nhất
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-2xl leading-relaxed">
              Cập nhật kiến thức đo lường, cẩm nang sử dụng cân điện tử và các tin tức sự kiện mới nhất từ chúng tôi.
            </p>
          </div>
          <div className="hidden md:block">
            <Link
              href="/news"
              className="group inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 text-sm font-bold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Xem tất cả tin tức
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Slider Wrapper */}
        <div className="relative group/slider px-4 sm:px-6">
          {/* Slider Container (CSS Snap) */}
          <div 
            ref={sliderRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-6 pb-6 scrollbar-none"
            style={{ 
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {news.map((newsItem) => (
              <div
                key={newsItem.id}
                className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[350px] snap-start bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col group overflow-hidden"
              >
                {/* News Image */}
                <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden flex-shrink-0">
                  {newsItem.image ? (
                    <Image
                      src={newsItem.image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 280px, 350px"
                      className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      /* Ảnh tin tức cũ có thể trỏ tới host chưa khai báo trong
                         next.config.ts. next/image sẽ ném lỗi và làm sập cả trang
                         chủ, nên bỏ qua tối ưu với những URL đó. */
                      unoptimized={!isOptimizableImage(newsItem.image ?? null)}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <Newspaper className="w-12 h-12 text-white/30" />
                    </div>
                  )}
                  {/* Category Pill Tag */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                      {getCategoryTag(newsItem.title)}
                    </span>
                  </div>
                </div>

                {/* News Content Body */}
                <div className="p-5 flex flex-col flex-1">
                  {/* Meta Data */}
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-semibold mb-3">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      {formatDate(newsItem.createdAt)}
                    </span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      {estimateReadTime(newsItem.content)} phút đọc
                    </span>
                  </div>
                  
                  {/* Title */}
                  <Link href={`/news/${newsItem.id}`}>
                    <h3 className="text-base font-extrabold text-slate-800 leading-snug line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                      {newsItem.title}
                    </h3>
                  </Link>
                  
                  {/* Excerpt */}
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4 flex-grow">
                    {newsItem.excerpt 
                      ? truncateText(newsItem.excerpt, 100)
                      : truncateText(newsItem.content.replace(/<[^>]*>/g, ''), 100)
                    }
                  </p>
                  
                  {/* Action link */}
                  <div className="mt-auto pt-2">
                    <Link
                      href={`/news/${newsItem.id}`}
                      className="inline-flex items-center gap-1.5 min-h-touch text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors group/link"
                    >
                      Đọc chi tiết
                      <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 bg-white/90 hover:bg-blue-600 hover:text-white backdrop-blur-md rounded-full p-2.5 shadow-md border border-slate-200/50 transition-all duration-300 text-slate-600 hover:scale-105 z-10 opacity-0 group-hover/slider:opacity-100 cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 bg-white/90 hover:bg-blue-600 hover:text-white backdrop-blur-md rounded-full p-2.5 shadow-md border border-slate-200/50 transition-all duration-300 text-slate-600 hover:scale-105 z-10 opacity-0 group-hover/slider:opacity-100 cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Slide Indicators / Dots */}
        <div className="flex justify-center mt-6 space-x-2">
          {news.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToSlide(index)}
              /* Vùng chạm 44px dù chấm hiển thị chỉ cao 8px (tiêu chí 5) */
              className="min-w-touch min-h-touch flex items-center justify-center"
              aria-label={`Chuyển tới tin thứ ${index + 1}`}
              aria-current={currentSlide === index}
            >
              <span
                className={`block h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index ? 'w-6 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Mobile View All Link */}
        <div className="text-center mt-8 md:hidden px-6">
          <Link
            href="/news"
            className="inline-flex items-center justify-center w-full px-5 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 font-bold rounded-xl text-sm transition-all"
          >
            Xem tất cả tin tức
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}
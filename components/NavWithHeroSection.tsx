'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CATEGORY_WIDTH } from './CategoryNavBar';

// ─── SLIDES ──────────────────────────────────────────────────────────────────
const slides = [
  {
    id: 1,
    title: 'Cân Bàn Điện Tử',
    subtitle: 'Độ chính xác cao – Bền bỉ theo năm tháng',
    image: '/slide1.png',
    badge: 'Hàng chính hãng',
  },
  {
    id: 2,
    title: 'Cân Sàn Công Nghiệp',
    subtitle: 'Giải pháp cân lý tưởng cho nhà kho & sản xuất',
    image: '/slide2.png',
    badge: 'Tải trọng lớn',
  },
  {
    id: 3,
    title: 'Cân Phân Tích & Kỹ Thuật',
    subtitle: 'Độ phân giải cao – Chuẩn mực phòng thí nghiệm',
    image: '/slide3.png',
    badge: 'Độ chính xác cao',
  },
];

/**
 * HeroSlideSection – Chỉ dùng trên trang chủ.
 * Phần nav bar + danh mục đã được đặt trong CategoryNavBar (ConditionalLayout).
 * Component này chỉ render phần slide hero, căn lề trái theo đúng CATEGORY_WIDTH
 * để slide nằm bên phải của cột "Danh Mục Sản Phẩm".
 */
export default function NavWithHeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full bg-white">
      {/* ── Hero Row ── */}
      <div className="max-w-[1280px] mx-auto flex relative">

        {/* Placeholder giữ chỗ để slide bắt đầu từ sau cột danh mục */}
        <div
          className="flex-shrink-0 bg-gray-50 border-r border-gray-200"
          style={{ width: CATEGORY_WIDTH, minHeight: 420 }}
        >
          {/* Intentionally empty – category list shown via CategoryNavBar dropdown */}
          <div className="h-full flex flex-col items-center justify-center opacity-20 select-none">
            <i className="ri-list-unordered text-4xl text-gray-400 mb-2"></i>
            <span className="text-xs text-gray-400 uppercase tracking-wide">Danh mục</span>
          </div>
        </div>

        {/* ── Hero Slide ── */}
        <div className="flex-1 relative overflow-hidden bg-[#0D3B6E]" style={{ minHeight: 420 }}>
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0D3B6E]/85 via-[#0D3B6E]/50 to-transparent" />

              {/* Text content */}
              <div className="absolute inset-0 flex flex-col justify-center px-10 lg:px-14 z-10">
                <span className="inline-block bg-blue-400/80 text-white text-xs font-bold uppercase px-3 py-1 rounded-full mb-3 w-fit">
                  {slide.badge}
                </span>
                <h2 className="text-white text-2xl lg:text-4xl font-extrabold drop-shadow-lg mb-3 leading-tight max-w-md">
                  {slide.title}
                </h2>
                <p className="text-blue-100 text-base lg:text-lg font-medium italic mb-6 max-w-sm">
                  {slide.subtitle}
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Link
                    href="/contact"
                    className="bg-white text-blue-700 font-bold px-5 py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors shadow-lg"
                  >
                    Liên hệ tư vấn
                  </Link>
                  <Link
                    href="/"
                    className="border-2 border-white text-white font-bold px-5 py-2 rounded-lg text-sm hover:bg-white hover:text-blue-700 transition-colors shadow-lg"
                  >
                    Xem sản phẩm
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Slide indicator dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? 'bg-white w-7' : 'bg-white/50 w-2.5 hover:bg-white/80'
                }`}
              />
            ))}
          </div>

          {/* Prev / Next arrows */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          >
            <i className="ri-arrow-left-s-line text-xl"></i>
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          >
            <i className="ri-arrow-right-s-line text-xl"></i>
          </button>
        </div>
      </div>
    </section>
  );
}

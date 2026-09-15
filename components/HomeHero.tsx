'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Category {
  id: number;
  name: string;
}

const slides = [
  {
    id: 1,
    title: 'Cân bàn điện tử',
    subtitle: 'Độ chính xác cao, khung thép sơn tĩnh điện, dùng bền nhiều năm',
    image: '/slide1.png',
    badge: 'Hàng chính hãng',
  },
  {
    id: 2,
    title: 'Cân sàn công nghiệp',
    subtitle: 'Tải trọng đến 5 tấn, phù hợp nhà kho và xưởng sản xuất',
    image: '/slide2.png',
    badge: 'Tải trọng lớn',
  },
  {
    id: 3,
    title: 'Cân phân tích & kỹ thuật',
    subtitle: 'Bước nhảy tới 0,0001g, đạt chuẩn phòng thí nghiệm',
    image: '/slide3.png',
    badge: 'Độ chính xác cao',
  },
];

const AUTOPLAY_MS = 6000;

interface HomeHeroProps {
  categories: Category[];
}

/**
 * Khối hero trang chủ: cột danh mục (trái) + slide (phải) trong CÙNG một lưới.
 *
 * Bản trước tách làm hai: danh mục `position: absolute` trong CategoryNavBar,
 * còn hero chừa chỗ bằng một div rỗng. Hai phần tử không liên quan nhau nên
 * chiều cao và chiều rộng không khớp — sinh ra mảng trắng lớn bên trái và danh
 * mục tràn đè lên khối bên dưới. Dùng một grid duy nhất thì hai cột luôn bằng
 * nhau về chiều cao và không thể lệch.
 */
export default function HomeHero({ categories }: HomeHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback((index: number) => {
    setCurrentSlide((index + slides.length) % slides.length);
  }, []);

  const next = useCallback(() => goTo(currentSlide + 1), [currentSlide, goTo]);
  const prev = useCallback(() => goTo(currentSlide - 1), [currentSlide, goTo]);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isPaused || prefersReducedMotion) return;

    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        setCurrentSlide((p) => (p + 1) % slides.length);
      }
    }, AUTOPLAY_MS);

    return () => clearInterval(timer);
  }, [isPaused]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    }
  };

  return (
    <section className="w-full bg-white" aria-label="Danh mục và sản phẩm tiêu biểu">
      <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        {/* Mỗi trang phải có đúng một <h1> nói rõ trang này về cái gì — vừa là
            yêu cầu của screen reader, vừa là tín hiệu chính cho Google
            (tiêu chí 1 & 5). Trang chủ trước đây không hề có h1. */}
        <h1 className="sr-only-text">
          Cân Vạn Thịnh Phát – Cung cấp cân điện tử chính hãng tại TP. Hồ Chí Minh
        </h1>

        {/* Một lưới duy nhất: cột danh mục cố định 264px + slide chiếm phần còn lại.
            Dưới 1024px danh mục đã hiển thị dạng cuộn ngang ở CategoryNavBar nên
            chỉ còn slide, tràn hết chiều ngang (tiêu chí 6 – mobile first). */}
        {/* items-stretch: hai cột LUÔN cao bằng nhau. Trước đây dùng
            items-start cộng max-h khác nhau, nên khi danh mục tăng từ 11 lên 15
            mục thì cột trái cao hơn slide 120px, thò xuống dưới trông lệch hẳn. */}
        <div className="grid grid-cols-1 lg:grid-cols-[264px_1fr] gap-4 lg:gap-5 items-stretch">

          {/* ── Cột danh mục (chỉ desktop) ── */}
          <nav
            aria-label="Danh mục sản phẩm"
            /* Chiều cao khớp đúng slide bên phải; danh sách dài hơn thì cuộn
               bên trong, không đội khối hero cao lên. */
            className="hidden lg:flex flex-col h-[440px] rounded-card border border-surface-border overflow-hidden bg-white"
          >
            <h2 className="flex items-center gap-2 bg-brand-700 text-white font-bold uppercase text-sm px-4 py-3 flex-shrink-0">
              <i className="ri-menu-line text-lg" aria-hidden="true"></i>
              Danh mục sản phẩm
            </h2>
            {/* Danh sách tự cuộn trong cột, không bao giờ tràn ra ngoài khối hero */}
            <ul className="flex-1 overflow-y-auto scrollable-content">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/category/${cat.id}`}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 border-b border-slate-100 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                  >
                    <i className="ri-arrow-right-s-line text-slate-400 flex-shrink-0" aria-hidden="true"></i>
                    <span className="leading-snug">{cat.name}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Cho biết còn danh mục bên dưới: nếu danh sách chỉ bị cắt ngang
                giữa chừng, khách tưởng đã hết và bỏ lỡ các danh mục sau
                (tiêu chí 1). Đây là nhãn chỉ dẫn, không phải link — không có
                trang "tất cả danh mục" riêng để trỏ tới. */}
            <p className="flex-shrink-0 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-slate-500 bg-surface-muted border-t border-surface-border">
              Cuộn để xem đủ {categories.length} danh mục
              <i className="ri-arrow-down-line" aria-hidden="true"></i>
            </p>
          </nav>

          {/* ── Slide ── */}
          <div
            role="region"
            aria-roledescription="carousel"
            aria-label="Giới thiệu sản phẩm"
            onKeyDown={onKeyDown}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
            className="relative overflow-hidden rounded-card bg-brand-800
                       h-[240px] sm:h-[320px] lg:h-[440px]"
          >
            {slides.map((slide, idx) => {
              const isActive = idx === currentSlide;
              return (
                <div
                  key={slide.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${idx + 1} / ${slides.length}: ${slide.title}`}
                  aria-hidden={!isActive}
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <Image
                    src={slide.image}
                    alt=""
                    fill
                    /* Khung slide rộng tối đa 980px (1280px trừ cột danh mục
                       264px và lề). Khai báo đúng để trình duyệt không tải bản
                       1920px nặng gấp 4 lần cho một khung nhỏ hơn (tiêu chí 7). */
                    sizes="(max-width: 1024px) 100vw, 980px"
                    className="object-cover"
                    priority={idx === 0}
                    quality={80}
                  />

                  {/* Lớp phủ: nửa trái gần như đục để chữ trắng luôn đạt tương
                      phản ≥4.5:1 dù ảnh nền sáng hay tối (tiêu chí 5). Bản trước
                      quá nhạt nên tiêu đề chìm vào ảnh máy cân, không đọc được. */}
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-900 via-brand-900/85 to-transparent lg:to-brand-900/5" />

                  {/* Chữ giới hạn trong nửa trái, không đè lên phần ảnh sản phẩm */}
                  {/* pb-16 chừa chỗ cho hàng chấm + nút điều hướng ở đáy */}
                  <div className="absolute inset-y-0 left-0 w-full lg:w-[58%] flex flex-col justify-center px-5 sm:px-8 lg:px-10 pb-16 z-10">
                    <span className="inline-block bg-accent-600 text-white text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-3 w-fit">
                      {slide.badge}
                    </span>
                    <h2 className="text-white text-xl sm:text-3xl lg:text-[2.5rem] lg:leading-[1.15] font-bold mb-3 max-w-md">
                      {slide.title}
                    </h2>
                    <p className="text-brand-100 text-sm sm:text-base mb-6 max-w-sm leading-relaxed">
                      {slide.subtitle}
                    </p>
                    <div className="flex gap-3 flex-wrap">
                      <Link href="/contact" className="btn-primary" tabIndex={isActive ? 0 : -1}>
                        <i className="ri-phone-line" aria-hidden="true"></i>
                        Nhận báo giá
                      </Link>
                      <Link
                        href="/introduce"
                        className="btn border-2 border-white text-white hover:bg-white hover:text-brand-700"
                        tabIndex={isActive ? 0 : -1}
                      >
                        Tìm hiểu thêm
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Chấm chỉ báo */}
            {/* Chấm chỉ báo canh trái, cùng lề với nội dung chữ phía trên */}
            <div className="absolute bottom-4 left-5 sm:left-8 lg:left-10 z-20 flex gap-1">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goTo(idx)}
                  aria-label={`Chuyển tới slide ${idx + 1}: ${slide.title}`}
                  aria-current={idx === currentSlide}
                  /* Vùng chạm đủ 44×44px dù chấm nhìn thấy chỉ cao 2.5px */
                  className="min-w-touch min-h-touch flex items-center justify-center"
                >
                  <span
                    className={`block h-2.5 rounded-full transition-all duration-300 ${
                      idx === currentSlide ? 'bg-white w-7' : 'bg-white/60 w-2.5'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Nút chuyển slide đặt ở đáy phải, cạnh chấm chỉ báo.
                Đặt giữa hai cạnh như trước khiến nút trái đè lên phần mô tả,
                che mất chữ ở mọi slide. */}
            <div className="absolute bottom-3 right-3 z-20 flex gap-2">
              <button
                type="button"
                onClick={prev}
                aria-label="Slide trước"
                className="bg-black/45 hover:bg-black/75 text-white w-11 h-11 rounded-full flex items-center justify-center transition-colors"
              >
                <i className="ri-arrow-left-s-line text-2xl" aria-hidden="true"></i>
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Slide tiếp theo"
                className="bg-black/45 hover:bg-black/75 text-white w-11 h-11 rounded-full flex items-center justify-center transition-colors"
              >
                <i className="ri-arrow-right-s-line text-2xl" aria-hidden="true"></i>
              </button>
            </div>

            <div aria-live="polite" className="sr-only-text">
              Slide {currentSlide + 1} trên {slides.length}: {slides[currentSlide].title}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

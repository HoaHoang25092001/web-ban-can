'use client';

import { useState, useEffect, useRef } from 'react';

interface Review {
  id: number;
  reviewerName: string;
  content: string;
  rating: number;
  isVisible: boolean;
  createdAt: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const initials = review.reviewerName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const colors = [
    'bg-green-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-rose-500',
  ];
  const colorIndex = review.id % colors.length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="flex-shrink-0 w-72 bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-5 border border-gray-100 mx-3">
      {/* Stars */}
      <StarRating rating={review.rating} />

      {/* Content */}
      <p className="mt-3 text-gray-700 text-sm leading-relaxed line-clamp-4 min-h-[72px]">
        &ldquo;{review.content}&rdquo;
      </p>

      {/* Reviewer */}
      <div className="mt-4 flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
        >
          {initials}
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm">{review.reviewerName}</p>
          <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}

interface CustomerReviewsProps {
  initialReviews?: Review[];
}

export default function CustomerReviews({ initialReviews }: CustomerReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews || []);
  const [loading, setLoading] = useState(!initialReviews);
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
  const positionRef = useRef(0);
  const isPausedRef = useRef(false);

  useEffect(() => {
    if (initialReviews) return;

    const fetchReviews = async () => {
      try {
        const res = await fetch('/api/reviews');
        const data = await res.json();
        setReviews(data.reviews || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Infinite scroll animation: right → left
  useEffect(() => {
    if (reviews.length === 0) return;
    const track = trackRef.current;
    if (!track) return;

    const CARD_WIDTH = 312; // 288px card + 24px margin
    const totalWidth = CARD_WIDTH * reviews.length;
    const speed = 0.6; // px per frame

    const animate = () => {
      if (!isPausedRef.current) {
        positionRef.current += speed;
        // Reset khi đã cuộn qua đúng 1 bộ clone
        if (positionRef.current >= totalWidth) {
          positionRef.current = 0;
        }
        if (track) {
          track.style.transform = `translateX(-${positionRef.current}px)`;
        }
      }
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [reviews]);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-blue-50 to-white overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Khách Hàng Nói Gì?</h2>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return null; // Ẩn section nếu chưa có đánh giá nào
  }

  // Nhân đôi list để tạo vòng lặp liền mạch
  const doubled = [...reviews, ...reviews];

  return (
    <section className="py-16 pb-6 bg-gradient-to-b from-blue-50 to-white overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 mb-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Khách Hàng Nói Gì?</h2>
          <p className="text-blue-600 font-medium text-sm">
            Đánh giá thực tế từ khách hàng của chúng tôi
          </p>
        </div>
      </div>

      {/* Carousel wrapper */}
      <div
        className="relative w-full overflow-hidden py-4"
        style={{
          maskImage:
            'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        }}
        onMouseEnter={() => { isPausedRef.current = true; }}
        onMouseLeave={() => { isPausedRef.current = false; }}
      >
        <div
          ref={trackRef}
          className="flex will-change-transform"
          style={{ width: 'max-content' }}
        >
          {doubled.map((review, index) => (
            <ReviewCard key={`${review.id}-${index}`} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}

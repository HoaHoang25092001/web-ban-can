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
    // Tiêu chí 5: không chỉ dùng màu để truyền tải thông tin – có nhãn chữ kèm theo
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-amber-500' : 'text-slate-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-xs font-semibold text-slate-600">{rating}/5</span>
    </div>
  );
}

const AVATAR_COLORS = [
  'bg-emerald-600',
  'bg-blue-600',
  'bg-purple-600',
  'bg-orange-600',
  'bg-teal-600',
  'bg-rose-600',
];

function ReviewCard({ review, ariaHidden }: { review: Review; ariaHidden?: boolean }) {
  const initials = review.reviewerName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const colorIndex = review.id % AVATAR_COLORS.length;

  const formattedDate = new Date(review.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <figure
      // Bản sao dùng để cuộn liền mạch bị ẩn khỏi screen reader để khỏi đọc lặp
      aria-hidden={ariaHidden}
      className="flex-shrink-0 w-[280px] card p-5 flex flex-col"
    >
      <StarRating rating={review.rating} />

      <blockquote className="mt-3 flex-1">
        <p className="text-slate-700 text-sm leading-relaxed line-clamp-4 min-h-[72px]">
          {review.content}
        </p>
      </blockquote>

      <figcaption className="mt-4 flex items-center gap-3 pt-3 border-t border-surface-border">
        <span
          className={`w-9 h-9 rounded-full ${AVATAR_COLORS[colorIndex]} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
          aria-hidden="true"
        >
          {initials}
        </span>
        <span className="min-w-0">
          <span className="block font-semibold text-slate-900 text-sm truncate">
            {review.reviewerName}
          </span>
          <time className="block text-xs text-slate-500" dateTime={review.createdAt}>
            {formattedDate}
          </time>
        </span>
      </figcaption>
    </figure>
  );
}

interface CustomerReviewsProps {
  initialReviews: Review[];
}

/**
 * Băng chuyền đánh giá khách hàng – Server Component.
 *
 * Bản trước chạy vòng lặp requestAnimationFrame ghi trực tiếp vào style.transform
 * mỗi khung hình, kể cả khi tab đang ẩn hoặc người dùng đã bật "giảm chuyển động".
 * Nay chuyển sang CSS animation: trình duyệt tự dừng khi tab ẩn, chạy trên
 * compositor (không chiếm main thread) và tự tắt theo prefers-reduced-motion
 * nhờ quy tắc trong globals.css.
 */
export default function CustomerReviews({ initialReviews }: CustomerReviewsProps) {
  const reviews = initialReviews?.filter((r) => r.isVisible) ?? [];

  if (reviews.length === 0) {
    return null;
  }

  const averageRating =
    Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10;

  /**
   * Băng chuyền dịch -50%, nghĩa là NỬA đầu danh sách phải đủ rộng để phủ kín
   * màn hình — nếu không sẽ lộ khoảng trống và thẻ bị cắt ở mép trái.
   *
   * Với 4 đánh giá, nhân đôi chỉ được 8 × 304px = 2432px; nửa đầu 1216px hẹp
   * hơn màn hình 1920px nên bị hở. Ở đây nhân bản đủ để một nửa luôn ≥ 2000px
   * (rộng hơn màn hình desktop thông thường), rồi nhân đôi khối đó.
   */
  // 280px thẻ + 24px gap. Dùng gap trên <ul> thay cho margin trên từng thẻ:
  // margin ở thẻ đầu/cuối làm lệch mốc -50% khiến băng chuyền hở mép trái.
  const CARD_WIDTH = 304;
  const MIN_TRACK_WIDTH = 2400;
  const repeats = Math.max(2, Math.ceil(MIN_TRACK_WIDTH / (reviews.length * CARD_WIDTH)));

  const oneSet = Array.from({ length: repeats }, () => reviews).flat();
  const duplicated = [...oneSet, ...oneSet];

  // Giữ tốc độ trượt ổn định (~50px/giây) bất kể số thẻ nhiều hay ít
  const durationSeconds = Math.round((oneSet.length * CARD_WIDTH) / 50);

  return (
    <section
      className="py-12 bg-gradient-to-b from-brand-50 to-white overflow-hidden"
      aria-labelledby="reviews-heading"
    >
      <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="text-center">
          <h2 id="reviews-heading" className="section-title">
            Khách hàng nói gì về chúng tôi
          </h2>
          {/* Bằng chứng xã hội cụ thể, có số liệu (tiêu chí 9) */}
          <p className="section-subtitle mx-auto">
            {averageRating}/5 sao từ {reviews.length} đánh giá thực tế của khách hàng đã mua hàng
          </p>
        </div>
      </div>

      <div
        className="relative w-full overflow-hidden py-2 group"
        style={{
          maskImage:
            'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
        }}
      >
        <ul
          className="flex w-max gap-6 pl-6 items-stretch animate-marquee group-hover:[animation-play-state:paused]"
          style={{ '--marquee-duration': `${durationSeconds}s` } as React.CSSProperties}
        >
          {duplicated.map((review, index) => (
            // flex để mọi thẻ cao bằng nhau dù nội dung đánh giá dài ngắn khác
            // nhau — thẻ so le nhau trông như lỗi hiển thị (tiêu chí 2)
            <li key={`${review.id}-${index}`} className="flex">
              {/* Chỉ bộ đầu tiên được screen reader đọc; các bản sao dùng để
                  cuộn liền mạch nên ẩn đi, tránh đọc lặp cùng một đánh giá. */}
              <ReviewCard review={review} ariaHidden={index >= reviews.length} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

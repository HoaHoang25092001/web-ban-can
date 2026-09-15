import Link from 'next/link';
import Image from 'next/image';
import { resolveImageUrl, isOptimizableImage, IMAGE_PLACEHOLDER, BLUR_DATA_URL } from '@/lib/image';

interface Product {
  id: number;
  name: string;
  category: {
    id: number;
    name: string;
  };
  capacity: string;
  accuracy: string;
  price: string;
  image: string;
  featured?: boolean;
}

interface ProductCardProps {
  product: Product;
  showCategory?: boolean;
  /** Ảnh đầu tiên trong viewport nên đặt priority để cải thiện LCP (tiêu chí 7). */
  priority?: boolean;
  /**
   * Cấp heading của tên sản phẩm, đặt theo ngữ cảnh trang để không nhảy cấp
   * (tiêu chí 5). Trang danh mục: h1 tiêu đề danh mục → card dùng h2.
   * Trang chủ: h2 "Sản phẩm bán chạy" → h3 tên danh mục → card dùng h4.
   */
  headingLevel?: 2 | 3 | 4;
}

/** Giá hiển thị: luôn có nhãn rõ ràng, không bao giờ để trống (tiêu chí 1). */
function formatPrice(price: string): { label: string; isContact: boolean } {
  const value = price?.trim();
  if (!value || value.toLowerCase() === 'liên hệ') {
    return { label: 'Liên hệ báo giá', isContact: true };
  }
  return { label: value.includes('VNĐ') ? value : `${value} VNĐ`, isContact: false };
}

/**
 * Card sản phẩm – Server Component (không cần 'use client').
 * Trước đây component này là client component chỉ để dùng onError của <img>;
 * chuyển sang next/image + server render giúp giảm JS gửi xuống trình duyệt.
 */
export default function ProductCard({
  product,
  showCategory = false,
  priority = false,
  headingLevel = 3,
}: ProductCardProps) {
  const imageUrl = resolveImageUrl(product.image);
  const { label: priceLabel, isContact } = formatPrice(product.price);
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';

  return (
    <article className="card-interactive group h-full overflow-hidden flex flex-col">
      <Link
        href={`/product/${product.id}`}
        className="flex flex-col h-full focus:outline-none focus-visible:outline-none"
        /* Nhãn đầy đủ cho screen reader vì card chứa nhiều mẩu text rời rạc */
        aria-label={`${product.name} – ${priceLabel}`}
      >
        {/* Vùng ảnh: aspect-ratio cố định nên không gây nhảy layout (CLS ~ 0) */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-surface-sunken">
          <Image
            src={imageUrl || IMAGE_PLACEHOLDER}
            alt={imageUrl ? product.name : ''}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            priority={priority}
            loading={priority ? undefined : 'lazy'}
            /* Ảnh placeholder và ảnh từ host chưa khai báo thì bỏ qua tối ưu,
               tránh lỗi cấu hình làm hỏng cả trang danh sách sản phẩm. */
            unoptimized={!isOptimizableImage(imageUrl)}
          />

          {product.featured && (
            <span className="absolute top-2 left-2 bg-accent-600 text-white text-xs font-bold uppercase tracking-wide px-2 py-1 rounded">
              Nổi bật
            </span>
          )}
        </div>

        {/* Vùng thông tin – phân cấp: tên > thông số > giá (tiêu chí 3) */}
        <div className="flex flex-col flex-1 p-3">
          {showCategory && (
            <p className="text-xs font-medium text-brand-600 uppercase tracking-wide mb-1">
              {product.category.name}
            </p>
          )}

          <Heading className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug min-h-[2.5rem]">
            {product.name}
          </Heading>

          {/* Thông số kỹ thuật – thông tin quyết định mua hàng, hiện ngay trên card */}
          {(product.capacity || product.accuracy) && (
            <dl className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500">
              {product.capacity && (
                <div className="flex gap-1">
                  <dt>Mức cân:</dt>
                  <dd className="font-medium text-slate-700">{product.capacity}</dd>
                </div>
              )}
              {product.accuracy && (
                <div className="flex gap-1">
                  <dt>Bước nhảy:</dt>
                  <dd className="font-medium text-slate-700">{product.accuracy}</dd>
                </div>
              )}
            </dl>
          )}

          {/* Giá đẩy xuống đáy để mọi card cùng chiều cao dù tên dài ngắn khác nhau */}
          <p
            className={`mt-auto pt-2 font-bold ${
              isContact ? 'text-base text-brand-700' : 'text-lg text-accent-600'
            }`}
          >
            {priceLabel}
          </p>
        </div>
      </Link>
    </article>
  );
}

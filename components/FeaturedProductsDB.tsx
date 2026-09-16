import Link from 'next/link';
import ProductCard from './ProductCard';

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

interface CategoryWithProducts {
  id: number;
  name: string;
  products: Product[];
}

interface FeaturedProductsProps {
  initialData: CategoryWithProducts[];
}

/**
 * Sản phẩm nổi bật theo danh mục – Server Component.
 *
 * Bản trước là client component kèm một nhánh fetch lại dữ liệu ở trình duyệt và
 * một bộ dữ liệu mẫu hardcode dùng khi API lỗi. Trang chủ đã truyền sẵn dữ liệu
 * từ server (app/page.tsx), nên nhánh đó chưa từng chạy mà vẫn phải tải xuống
 * kèm JS. Bỏ đi giúp giảm bundle và loại nguy cơ hiện dữ liệu giả cho khách.
 */
export default function FeaturedProducts({ initialData }: FeaturedProductsProps) {
  if (!initialData || initialData.length === 0) {
    return null;
  }

  return (
    <section className="py-8" aria-labelledby="featured-heading">
      {/* Tiêu chí 1 & 3: tiêu đề nói rõ đây là gì, phụ đề bổ sung ngữ cảnh */}
      <div className="text-center mb-8">
        <h2 id="featured-heading" className="section-title">
          Sản phẩm nổi bật
        </h2>
        <p className="section-subtitle mx-auto">
          Các dòng cân điện tử chính hãng, có sẵn hàng và bảo hành 12 tháng
        </p>
      </div>

      <div className="space-y-10">
        {initialData.map((category, categoryIndex) => (
          <div key={category.id}>
            {/* Đầu mục danh mục – khoảng trắng tách nhóm rõ ràng (tiêu chí 3) */}
            <div className="flex items-end justify-between gap-4 mb-4 pb-3 border-b border-surface-border">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  {category.name}
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  {category.products.length} sản phẩm nổi bật
                </p>
              </div>
              <Link
                href={`/category/${category.id}`}
                className="inline-flex items-center gap-1 min-h-touch px-3 text-sm font-semibold text-brand-700 hover:text-brand-800 hover:underline whitespace-nowrap"
              >
                Xem tất cả
                <i className="ri-arrow-right-s-line text-base" aria-hidden="true"></i>
                <span className="sr-only-text">sản phẩm thuộc {category.name}</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {category.products.map((product, productIndex) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  /* Vài card đầu tiên nằm trong viewport → ưu tiên tải, cải thiện LCP */
                  priority={categoryIndex === 0 && productIndex < 4}
                  headingLevel={4}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

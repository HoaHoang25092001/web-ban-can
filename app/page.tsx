import { prisma } from '@/lib/prisma';
import HomeHero from '../components/HomeHero';
import FeatureBadges from '../components/FeatureBadges';
import FeaturedProductsDB from '../components/FeaturedProductsDB';
import NewsSlider from '../components/NewsSlider';
import AboutSection from '../components/AboutSection';
import ContactSection from '../components/ContactSection';
import FloatingContactIcons from '../components/FloatingContactIcons';

/**
 * Cache trang chủ 5 phút.
 *
 * Trước đây dùng 'force-dynamic': mọi lượt truy cập đều chạy lại 4 truy vấn
 * database. Neon là Postgres serverless đặt ở Mỹ nên mỗi truy vấn tốn ~0,5s độ
 * trễ mạng và chúng bị xếp hàng — trang chủ mất ~3 giây dù dữ liệu gần như
 * không đổi giữa các lượt xem.
 *
 * Với revalidate, trang được dựng sẵn và phục vụ tức thì; sau 5 phút lượt truy
 * cập kế tiếp sẽ làm mới ở nền (tiêu chí 7). Sản phẩm mới thêm từ trang quản
 * trị sẽ xuất hiện chậm nhất sau 5 phút.
 */
export const revalidate = 300;

// Số sản phẩm nổi bật hiển thị mỗi danh mục trên trang chủ.
// Giới hạn để trang chủ không phình ra khi số sản phẩm tăng.
const PRODUCTS_PER_CATEGORY = 4;

/**
 * Số danh mục hiển thị ở khu "Sản phẩm bán chạy".
 * Có 15 danh mục; hiện hết × 4 sản phẩm = 60 thẻ kèm 60 ảnh khiến trang chủ
 * tải mất gần 10 giây. Giới hạn 6 danh mục (24 thẻ) giữ trang nhẹ, khách vẫn
 * bấm "Xem tất cả" để vào từng danh mục đầy đủ (tiêu chí 7).
 */
const CATEGORIES_ON_HOME = 6;

export default async function Home() {
  // Fetch song song toàn bộ dữ liệu trên Server
  const [products, newsData, allCategories] = await Promise.all([
    prisma.product.findMany({
      // Chỉ lấy sản phẩm featured CÓ ẢNH: card không ảnh trên trang chủ trông
      // như lỗi hiển thị, làm giảm độ tin cậy ngay từ màn hình đầu tiên.
      where: { featured: true, image: { not: null } },
      take: CATEGORIES_ON_HOME * PRODUCTS_PER_CATEGORY * 3,
      // Chỉ lấy đúng các cột cần dùng thay vì toàn bộ bản ghi kèm quan hệ:
      // giảm dữ liệu truyền từ database và kích thước payload gửi xuống client.
      select: {
        id: true,
        name: true,
        capacity: true,
        accuracy: true,
        price: true,
        image: true,
        featured: true,
        categoryId: true,
        category: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.news.findMany({
      where: { published: true },
      select: {
        id: true,
        title: true,
        // content dùng để ước tính thời gian đọc và làm excerpt dự phòng
        content: true,
        excerpt: true,
        image: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    // Danh mục render sẵn trên server: cột danh mục là nội dung chính của trang
    // chủ nên không để nó nhấp nháy chờ fetch ở trình duyệt (tiêu chí 7).
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  // Group products by category cho FeaturedProductsDB
  const categoriesMap = new Map<
    number,
    { id: number; name: string; products: Array<Record<string, unknown>> }
  >();

  for (const product of products) {
    const categoryId = product.categoryId;
    if (!categoriesMap.has(categoryId)) {
      categoriesMap.set(categoryId, {
        id: categoryId,
        name: product.category.name,
        products: [],
      });
    }
    const group = categoriesMap.get(categoryId)!;
    if (group.products.length >= PRODUCTS_PER_CATEGORY) continue;

    group.products.push({
      id: product.id,
      name: product.name,
      category: { id: product.category.id, name: product.category.name },
      capacity: product.capacity || '',
      accuracy: product.accuracy || '',
      price: product.price || '',
      image: product.image || '',
      featured: product.featured,
    });
  }
  const featuredProductsGrouped = Array.from(categoriesMap.values())
    // Ưu tiên danh mục có nhiều sản phẩm nhất, lấy đúng số đã giới hạn
    .sort((a, b) => b.products.length - a.products.length)
    .slice(0, CATEGORIES_ON_HOME) as never;

  // Chuẩn hóa DateTime thành ISO String để an toàn khi qua client boundary
  const news = newsData.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    excerpt: item.excerpt || undefined,
    image: item.image || undefined,
  }));

  return (
    <>
      {/* Hero: cột danh mục + slide giới thiệu, cùng một lưới (tiêu chí 1 & 3) */}
      <HomeHero categories={allCategories} />

      {/* Cam kết dịch vụ: vận chuyển / chính hãng / đổi trả / hỗ trợ */}
      <FeatureBadges />

      {/* Sản phẩm nổi bật theo danh mục */}
      <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-8">
        <FeaturedProductsDB initialData={featuredProductsGrouped} />
      </div>

      <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-8">
        <NewsSlider initialNews={news} />
      </div>

      <div className="bg-surface-muted">
        <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-8">
          <AboutSection />
        </div>
      </div>

      <div className="max-w-shell mx-auto px-4 sm:px-6 lg:px-8">
        <ContactSection />
      </div>

      <FloatingContactIcons />
    </>
  );
}

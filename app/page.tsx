import { prisma } from '@/lib/prisma';
import NavWithHeroSection from '../components/NavWithHeroSection';
import FeatureBadges from '../components/FeatureBadges';
import FeaturedProductsDB from '../components/FeaturedProductsDB';
import NewsSlider from '../components/NewsSlider';
import CustomerReviews from '../components/CustomerReviews';
import AboutSection from '../components/AboutSection';
import ContactSection from '../components/ContactSection';
import FloatingContactIcons from '../components/FloatingContactIcons';

export const dynamic = 'force-dynamic'; // Không prerender lúc build để tránh lỗi kết nối DB

export default async function Home() {
  // Fetch song song toàn bộ dữ liệu trên Server
  const [products, newsData, reviews] = await Promise.all([
    prisma.product.findMany({
      where: { featured: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.news.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 6
    }),
    prisma.review.findMany({
      where: { isVisible: true },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  // Group products by category cho FeaturedProductsDB
  const categoriesMap = new Map();
  products.forEach((product) => {
    const categoryId = product.categoryId;
    if (!categoriesMap.has(categoryId)) {
      categoriesMap.set(categoryId, {
        id: categoryId,
        name: product.category.name,
        products: []
      });
    }
    categoriesMap.get(categoryId).products.push({
      id: product.id,
      name: product.name,
      category: {
        id: product.category.id,
        name: product.category.name
      },
      capacity: product.capacity || '',
      accuracy: product.accuracy || '',
      price: product.price || '',
      image: product.image || '',
      featured: product.featured
    });
  });
  const featuredProductsGrouped = Array.from(categoriesMap.values());

  // Chuẩn hóa dữ liệu News cho NewsSlider (đổi DateTime thành ISO String để an toàn khi truyền qua client boundary)
  const news = newsData.map(item => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    excerpt: item.excerpt || undefined,
    image: item.image || undefined
  }));

  // Chuẩn hóa dữ liệu Reviews cho CustomerReviews
  const reviewsSerialized = reviews.map(item => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString()
  }));

  return (
    <div className="bg-white">
      {/* Nav Menu + Hero Slide Section (cùng hàng) */}
      <NavWithHeroSection />

      {/* Feature Badges: Vận chuyển / Chất lượng / Đổi trả / Hỗ trợ */}
      <FeatureBadges />

      {/* Featured Products - Full width, no container constraint */}
      <div className="w-full px-4 lg:px-8 py-6">
        <FeaturedProductsDB initialData={featuredProductsGrouped} />
      </div>

      {/* Customer Reviews - Full width carousel */}
      <CustomerReviews initialReviews={reviewsSerialized} />

      {/* Remaining sections in constrained container */}
      <div className="max-w-[1280px] mx-auto px-4 lg:px-6 mb-8">
        {/* News Slider */}
        <NewsSlider initialNews={news} />
      </div>

      <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
        {/* About Section */}
        <div className="mb-6 bg-blue-50 rounded-lg py-8 px-6">
          <AboutSection />
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-lg py-8 px-6 shadow-sm">
          <ContactSection />
        </div>
      </div>

      {/* Floating Contact Icons (Zalo / Email / Map) */}
      <FloatingContactIcons />
    </div>
  );
}
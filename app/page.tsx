
'use client';

import HeroSection from '../components/HeroSection';
import SearchProduct from '../components/SearchProduct';
import ProductCategoriesDB from '../components/ProductCategoriesDB';
import FeaturedProductsDB from '../components/FeaturedProductsDB';
import NewsSlider from '../components/NewsSlider';
import AboutSection from '../components/AboutSection';
import ContactSection from '../components/ContactSection';

export default function Home() {
  return (
    <div className="bg-white">
      <HeroSection />
      
      {/* Search Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tìm kiếm sản phẩm</h2>
            <p className="text-lg text-gray-600">
              Nhập tên sản phẩm bạn muốn tìm
            </p>
          </div>
          <SearchProduct />
        </div>
      </section>

      <ProductCategoriesDB />
      <FeaturedProductsDB />
      <NewsSlider />
      <AboutSection />
      <ContactSection />
    </div>
  );
}
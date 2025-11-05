
'use client';

import HeroSection from '../components/HeroSection';
import SearchProduct from '../components/SearchProduct';
import ProductCategorySidebar from '../components/ProductCategorySidebar';
import FeaturedProductsDB from '../components/FeaturedProductsDB';
import NewsSlider from '../components/NewsSlider';
import AboutSection from '../components/AboutSection';
import ContactSection from '../components/ContactSection';

export default function Home() {
  return (
    <div className="bg-white">
      <HeroSection />
      
      {/* Main Content with Sidebar Layout */}
      <div className="flex gap-6 px-4 lg:px-6 py-6">
        {/* Fixed Sidebar - Categories */}
        <ProductCategorySidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 w-full min-w-0">
          {/* Search Section */}
          <section className="py-8 bg-gray-50 rounded-lg mb-6">
            <div className="px-6 lg:px-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Tìm kiếm sản phẩm</h2>
                <p className="text-lg text-gray-600">
                  Nhập tên sản phẩm bạn muốn tìm
                </p>
              </div>
              <SearchProduct />
            </div>
          </section>

          {/* Featured Products */}
          <div className="mb-6">
            <FeaturedProductsDB />
          </div>

          {/* News Slider */}
          <div className="mb-6 bg-gray-50 rounded-lg py-8 px-6">
            <NewsSlider />
          </div>

          {/* About Section */}
          <div className="mb-6 bg-blue-50 rounded-lg py-8 px-6">
            <AboutSection />
          </div>

          {/* Contact Section */}
          <div className="bg-white rounded-lg py-8 px-6 shadow-sm">
            <ContactSection />
          </div>
        </div>
      </div>
    </div>
  );
}
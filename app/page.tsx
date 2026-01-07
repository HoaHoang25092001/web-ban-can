
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
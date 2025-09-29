
'use client';

import HeroSection from '../components/HeroSection';
import ProductCategoriesDB from '../components/ProductCategoriesDB';
import FeaturedProductsDB from '../components/FeaturedProductsDB';
import NewsSlider from '../components/NewsSlider';
import AboutSection from '../components/AboutSection';
import ContactSection from '../components/ContactSection';

export default function Home() {
  return (
    <div className="bg-white">
      <HeroSection />
      <ProductCategoriesDB />
      <FeaturedProductsDB />
      <NewsSlider />
      <AboutSection />
      <ContactSection />
    </div>
  );
}
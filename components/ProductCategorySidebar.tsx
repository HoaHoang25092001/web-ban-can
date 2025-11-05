'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export default function ProductCategorySidebar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories', {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        // Fallback data
        setCategories([
          { id: 1, name: 'CÂN PHÂN TÍCH', description: '', icon: 'ri-scales-line' },
          { id: 2, name: 'CÂN KỸ THUẬT', description: '', icon: 'ri-flask-line' },
          { id: 3, name: 'CÂN THÔNG DỤNG', description: '', icon: 'ri-shopping-cart-line' },
          { id: 4, name: 'CÂN ĐẾM MẪU', description: '', icon: 'ri-calculator-line' },
          { id: 5, name: 'CÂN BÀN ĐIỆN TỬ', description: '', icon: 'ri-table-line' },
          { id: 6, name: 'CÂN SÀN ĐIỆN TỬ', description: '', icon: 'ri-building-2-line' },
          { id: 7, name: 'CÂN THỦY SẢN', description: '', icon: 'ri-water-flash-line' },
          { id: 8, name: 'CÂN TREO MÓC CẨU', description: '', icon: 'ri-hammer-line' },
          { id: 9, name: 'CÂN TRANG SỨC', description: '', icon: 'ri-vip-diamond-line' },
          { id: 10, name: 'CÂN NHÀ BẾP', description: '', icon: 'ri-restaurant-line' },
          { id: 11, name: 'CÂN BỘ TÚI', description: '', icon: 'ri-briefcase-line' },
          { id: 12, name: 'CÂN TÍNH GIÁ', description: '', icon: 'ri-price-tag-3-line' },
          { id: 13, name: 'CÂN BÁN GHẾ CÂN NGANH VẢI', description: '', icon: 'ri-shirt-line' },
          { id: 14, name: 'CÂN Ô TÔ', description: '', icon: 'ri-truck-line' },
          { id: 15, name: 'CÂN PHÊ DUYỆT MẪU', description: '', icon: 'ri-medal-line' },
          { id: 16, name: 'CÂN XE NÂNG', description: '', icon: 'ri-truck-line' },
          { id: 17, name: 'CÂN THÚ CƯNG', description: '', icon: 'ri-bear-smile-line' },
          { id: 18, name: 'CÂN SẤY ẨM', description: '', icon: 'ri-drop-line' },
          { id: 19, name: 'CÂN Y TẾ', description: '', icon: 'ri-heart-pulse-line' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  if (loading) {
    return (
      <div className="w-64 bg-gray-50 text-gray-800 p-4 border border-gray-200 rounded-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 bg-gray-800 text-white p-3 rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
      >
        <i className={`ri-${isMobileOpen ? 'close' : 'menu'}-line text-xl`}></i>
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky lg:top-4 left-0 h-screen lg:h-[calc(100vh-6rem)] lg:max-h-[800px]
        w-64 bg-white border border-gray-200
        transition-transform duration-300 z-40
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:rounded-lg lg:shadow-lg flex flex-col
      `}>
        <div className="bg-blue-600 py-4 px-4 rounded-t-lg lg:rounded-t-lg">
          <h2 className="text-xl font-bold text-white uppercase text-center">
            Sản Phẩm Cân
          </h2>
        </div>

        <nav className="py-2 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {categories.map((category) => {
            const isExpanded = expandedCategories.includes(category.id);
            const hasSubmenu = false; // Có thể mở rộng sau nếu có submenu

            return (
              <div key={category.id} className="border-b border-gray-200">
                <Link
                  href={`/category/${category.id}`}
                  className={`
                    flex items-center justify-between px-4 py-3
                    text-gray-700 hover:bg-gray-100 transition-colors
                    ${pathname === `/category/${category.id}` ? 'bg-gray-200 font-semibold text-gray-900' : ''}
                  `}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <span className="text-sm font-medium uppercase">
                    {category.name}
                  </span>
                  {hasSubmenu && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleCategory(category.id);
                      }}
                      className="p-1"
                    >
                      <i className={`ri-arrow-${isExpanded ? 'down' : 'right'}-s-line`}></i>
                    </button>
                  )}
                </Link>
                
                {/* Submenu - có thể thêm sau */}
                {hasSubmenu && isExpanded && (
                  <div className="bg-gray-50 py-1">
                    {/* Submenu items here */}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

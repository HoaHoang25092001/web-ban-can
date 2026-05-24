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

// Phải đồng bộ với NavWithHeroSection.tsx
export const CATEGORY_WIDTH = 240; // px

const navLinks = [
  { label: 'Giới Thiệu', href: '/introduce' },
  { label: 'Tin Tức', href: '/news' },
  { label: 'Liên Hệ', href: '/contact' },
];

interface CategoryNavBarProps {
  initialCategories?: Category[];
}

export default function CategoryNavBar({ initialCategories }: CategoryNavBarProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [loadingCats, setLoadingCats] = useState(!initialCategories);
  const pathname = usePathname();

  // Trang chủ: danh mục luôn hiển thị. Các trang khác: ẩn, hiện khi hover.
  const isHome = pathname === '/';

  useEffect(() => {
    if (initialCategories) return;

    const fetchCategories = async () => {
      try {
        setLoadingCats(true);
        const res = await fetch('/api/categories', { next: { revalidate: 3600 } } as any);
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        setCategories(data.categories || []);
      } catch {
        setCategories([
          { id: 1, name: 'Cân Bàn Điện Tử', description: '', icon: '' },
          { id: 2, name: 'Cân Sàn Điện Tử', description: '', icon: '' },
          { id: 3, name: 'Cân Treo Điện Tử', description: '', icon: '' },
          { id: 4, name: 'Cân Lúa, Cân Nông Sản', description: '', icon: '' },
          { id: 5, name: 'Cân Động Vật', description: '', icon: '' },
          { id: 6, name: 'Cân Thủy Sản', description: '', icon: '' },
          { id: 7, name: 'Cân Siêu Thị, Tính Giá', description: '', icon: '' },
          { id: 8, name: 'Cân Đếm Điện Tử', description: '', icon: '' },
          { id: 9, name: 'Cân Ghế Điện Tử', description: '', icon: '' },
          { id: 10, name: 'Cân Nhà Bếp', description: '', icon: '' },
          { id: 11, name: 'Cân Vàng Điện Tử', description: '', icon: '' },
          { id: 12, name: 'Cân Xe Tải & Trạm Cân', description: '', icon: '' },
          { id: 13, name: 'Cân Phân Tích, Kỹ Thuật', description: '', icon: '' },
        ]);
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCategories();
  }, []);

  // ── Danh sách danh mục (dùng chung cho cả 2 chế độ) ──────────────────────
  const categoryList = (
    <nav
      style={{ width: CATEGORY_WIDTH }}
      className={`bg-white border border-gray-200 shadow-xl ${
        categories.length >= 10 ? 'max-h-[400px] overflow-y-auto scrollable-content' : ''
      }`}
    >
      {loadingCats
        ? [...Array(8)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 animate-pulse border-b border-gray-200" />
          ))
        : categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.id}`}
              className={`flex items-center px-4 py-[10px] text-sm font-medium border-b border-gray-100 transition-colors
                ${pathname === `/category/${cat.id}`
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
            >
              <span className="uppercase leading-snug">{cat.name}</span>
            </Link>
          ))}
    </nav>
  );

  return (
    <div className="w-full bg-[#1565C0] relative z-30">
      <div className="max-w-[1280px] mx-auto flex items-stretch relative">

        {/* ── Cột "Danh Mục Sản Phẩm" ── */}
        {isHome ? (
          // TRANG CHỦ: danh mục luôn hiển thị (absolute bên dưới, không đẩy layout)
          <div className="flex-shrink-0 relative" style={{ width: CATEGORY_WIDTH }}>
            <div
              style={{ width: CATEGORY_WIDTH }}
              className="flex items-center gap-2 bg-[#0D47A1] text-white font-bold uppercase text-sm px-5 py-3 h-full select-none"
            >
              <i className="ri-menu-line text-lg flex-shrink-0"></i>
              <span className="flex-1 text-left">Danh Mục Sản Phẩm</span>
            </div>
            {/* Luôn hiển thị – không hover */}
            <div className="absolute top-full left-0 z-30">
              {categoryList}
            </div>
          </div>
        ) : (
          // CÁC TRANG KHÁC: thu lại, hover để xổ xuống (CSS thuần, không JS)
          <div
            className="flex-shrink-0 relative group"
            style={{ width: CATEGORY_WIDTH }}
          >
            {/* Header – hover vào wrapper này để mở danh mục */}
            <div
              style={{ width: CATEGORY_WIDTH }}
              className="flex items-center gap-2 bg-[#0D47A1] text-white font-bold uppercase text-sm px-5 py-3 h-full select-none cursor-pointer"
            >
              <i className="ri-menu-line text-lg flex-shrink-0"></i>
              <span className="flex-1 text-left">Danh Mục Sản Phẩm</span>
              {/* Mũi tên trên header (không phải trong list) */}
              <i className="ri-arrow-down-s-line text-base flex-shrink-0 group-hover:hidden"></i>
              <i className="ri-arrow-up-s-line text-base flex-shrink-0 hidden group-hover:block"></i>
            </div>
            {/* Dropdown: ẩn mặc định, hiện khi hover vào wrapper */}
            <div className="absolute top-full left-0 z-30 hidden group-hover:block">
              {categoryList}
            </div>
          </div>
        )}

        {/* ── Nav links ── */}
        <nav className="flex items-center flex-1 overflow-x-auto">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-white text-sm font-semibold uppercase px-5 py-3 whitespace-nowrap transition-colors border-l border-blue-400/30 h-full flex items-center
                ${pathname === link.href ? 'bg-[#1976D2]' : 'hover:bg-[#1976D2]'}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

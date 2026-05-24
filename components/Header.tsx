
'use client';

import { useState } from 'react';
import Link from 'next/link';
import SearchProduct from './SearchProduct';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
        {/* Desktop layout: Search | Logo (center) | Phone */}
        <div className="hidden md:grid grid-cols-3 items-center h-16 gap-4">
          {/* Left: Search Bar */}
          <div className="flex items-center">
            <div className="w-full max-w-xs">
              <SearchProduct compact />
            </div>
          </div>

          {/* Center: Logo */}
          <div className="flex justify-center">
            <Link href="/" className="flex items-center">
              <div
                className="text-2xl font-bold text-blue-600 whitespace-nowrap"
                style={{ fontFamily: 'var(--font-pacifico)' }}
              >
                Cân Vạn Thịnh Phát
              </div>
            </Link>
          </div>

          {/* Right: Phone with pill border */}
          <div className="flex justify-end items-center">
            <a
              href="tel:0326711476"
              className="flex items-center gap-2 border-2 border-blue-600 text-blue-600 font-bold px-4 py-1.5 rounded-full hover:bg-blue-600 hover:text-white transition-colors text-sm whitespace-nowrap"
            >
              <i className="ri-phone-fill text-base"></i>
              <span>0326.711.476</span>
            </a>
          </div>
        </div>

        {/* Mobile layout */}
        <div className="md:hidden flex justify-between items-center h-14">
          <Link href="/" className="flex items-center">
            <div
              className="text-xl font-bold text-blue-600"
              style={{ fontFamily: 'var(--font-pacifico)' }}
            >
              Cân Vạn Thịnh Phát
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <a
              href="tel:0326711476"
              className="flex items-center gap-1 border-2 border-blue-600 text-blue-600 font-bold px-3 py-1 rounded-full text-xs"
            >
              <i className="ri-phone-fill"></i>
              <span>0326.711.476</span>
            </a>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700 hover:text-blue-600 cursor-pointer"
            >
              <i className={`ri-${isMenuOpen ? 'close' : 'menu'}-line text-xl`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-3">
            <nav className="flex flex-col space-y-3">
              <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Trang chủ
              </Link>
              <Link href="/introduce" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Giới thiệu
              </Link>
              <Link href="/news" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Tin tức
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Liên hệ
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
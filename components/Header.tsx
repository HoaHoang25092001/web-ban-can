
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="text-2xl font-bold text-blue-600" style={{ fontFamily: "var(--font-pacifico)" }}>
              Cân Vạn Thịnh Phát
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors cursor-pointer">
              Trang chủ
            </Link>
            {/* <Link href="/products" className="text-gray-700 hover:text-blue-600 font-medium transition-colors cursor-pointer">
              Sản phẩm
            </Link> */}
            <Link href="/introduce" className="text-gray-700 hover:text-blue-600 font-medium transition-colors cursor-pointer">
              Giới thiệu
            </Link>
            <Link href="/news" className="text-gray-700 hover:text-blue-600 font-medium transition-colors cursor-pointer">
              Tin tức
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors cursor-pointer">
              Liên hệ
            </Link>
          </nav>

          {/* Contact Info */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center text-blue-600">
              <i className="ri-phone-line w-5 h-5 flex items-center justify-center mr-2"></i>
              <span className="font-medium">0326.711.476</span>
            </div>
            <div className="flex items-center text-blue-600">
              <i className="ri-mail-line w-5 h-5 flex items-center justify-center mr-2"></i>
              <span className="font-medium">canvanthinhphat@gmail.com</span>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-blue-600 cursor-pointer"
          >
            <i className={`ri-${isMenuOpen ? 'close' : 'menu'}-line w-6 h-6 flex items-center justify-center`}></i>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors cursor-pointer">
                Trang chủ
              </Link>
              <Link href="/products" className="text-gray-700 hover:text-blue-600 font-medium transition-colors cursor-pointer">
                Sản phẩm
              </Link>
              <Link href="/introduce" className="text-gray-700 hover:text-blue-600 font-medium transition-colors cursor-pointer">
                Giới thiệu
              </Link>
              <Link href="/news" className="text-gray-700 hover:text-blue-600 font-medium transition-colors cursor-pointer">
                Tin tức
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors cursor-pointer">
                Liên hệ
              </Link>
              <div className="flex items-center text-blue-600 pt-2">
                <i className="ri-phone-line w-5 h-5 flex items-center justify-center mr-2"></i>
                <span className="font-medium">0123.456.789</span>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
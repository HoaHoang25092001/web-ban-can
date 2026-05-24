'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import CategoryNavBar from './CategoryNavBar';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  // Global scroll lock prevention
  useEffect(() => {
    const preventScrollLock = () => {
      // Force enable scroll periodically if something tries to disable it
      const observer = new MutationObserver(() => {
        if (document.body.style.overflow === 'hidden' && !document.querySelector('.cloudinary-widget-open')) {
          document.body.style.overflow = '';
        }
        if (document.documentElement.style.overflow === 'hidden' && !document.querySelector('.cloudinary-widget-open')) {
          document.documentElement.style.overflow = '';
        }
      });

      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['style', 'class']
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['style', 'class']
      });

      return () => observer.disconnect();
    };

    const cleanup = preventScrollLock();
    return cleanup;
  }, []);

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* CategoryNavBar – hiển thị trên mọi trang public */}
      <CategoryNavBar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

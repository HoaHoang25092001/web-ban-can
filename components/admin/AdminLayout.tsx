'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  Newspaper, 
  MessageSquare, 
  LogOut,
  Star
} from 'lucide-react';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/categories', label: 'Danh mục sản phẩm', icon: Tags },
  { href: '/admin/products', label: 'Sản phẩm', icon: Package },
  { href: '/admin/news', label: 'Tin tức', icon: Newspaper },
  { href: '/admin/reviews', label: 'Đánh giá KH', icon: Star },
  { href: '/admin/contacts', label: 'Liên hệ', icon: MessageSquare },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg flex flex-col">
        <div className="flex h-16 items-center justify-center border-b border-gray-200 flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        </div>
        
        <nav className="mt-8 flex-1 overflow-y-auto">
          <div className="space-y-1 px-4 pb-6">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          <div className="flex h-16 items-center justify-between px-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Quản lý website
            </h2>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Xin chào, {session?.user?.name}
              </span>
              <button
                onClick={() => signOut()}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto scrollable-content">
          {children}
        </main>
      </div>
    </div>
  );
}

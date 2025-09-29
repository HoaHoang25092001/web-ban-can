'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Package, Tags, Newspaper, MessageSquare } from 'lucide-react';

interface Stats {
  products: number;
  categories: number;
  news: number;
  contacts: number;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats>({
    products: 0,
    categories: 0,
    news: 0,
    contacts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, categoriesRes, newsRes, contactsRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
          fetch('/api/news'),
          fetch('/api/contacts'),
        ]);

        const [products, categories, news, contacts] = await Promise.all([
          productsRes.json(),
          categoriesRes.json(),
          newsRes.json(),
          contactsRes.json(),
        ]);

        setStats({
          products: products.pagination?.total || products.products?.length || 0,
          categories: categories.categories?.length || 0,
          news: news.pagination?.total || news.news?.length || 0,
          contacts: contacts.pagination?.total || contacts.contacts?.length || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Sản phẩm',
      value: stats.products,
      icon: Package,
      color: 'bg-blue-500',
      href: '/admin/products',
    },
    {
      title: 'Danh mục',
      value: stats.categories,
      icon: Tags,
      color: 'bg-green-500',
      href: '/admin/categories',
    },
    {
      title: 'Tin tức',
      value: stats.news,
      icon: Newspaper,
      color: 'bg-purple-500',
      href: '/admin/news',
    },
    {
      title: 'Liên hệ',
      value: stats.contacts,
      icon: MessageSquare,
      color: 'bg-orange-500',
      href: '/admin/contacts',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Tổng quan hệ thống quản lý website</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => window.location.href = card.href}
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`${card.color} rounded-md p-3`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {card.title}
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            {loading ? '...' : card.value}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Welcome Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Chào mừng, {session?.user?.name}!
            </h2>
            <div className="prose text-gray-600">
              <p>
                Bạn đang sử dụng hệ thống quản lý website bán cân điện tử. 
                Từ đây bạn có thể:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Quản lý danh mục sản phẩm</li>
                <li>Thêm, sửa, xóa sản phẩm</li>
                <li>Đăng và quản lý tin tức</li>
                <li>Xem và phản hồi liên hệ từ khách hàng</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Thao tác nhanh
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => window.location.href = '/admin/products/new'}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
              >
                <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Thêm sản phẩm mới
                </span>
              </button>
              
              <button
                onClick={() => window.location.href = '/admin/categories/new'}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
              >
                <Tags className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Thêm danh mục mới
                </span>
              </button>
              
              <button
                onClick={() => window.location.href = '/admin/news/new'}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center"
              >
                <Newspaper className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Viết tin tức mới
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

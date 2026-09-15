'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { Package, Tags, Newspaper, MessageSquare, Star, Plus } from 'lucide-react';

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
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchStats = async () => {
      try {
        // limit=1 vì chỉ cần con số tổng trong `pagination.total`, không cần
        // danh sách bản ghi. Bản trước gọi mặc định (10 bản ghi mỗi API kèm cả
        // quan hệ) chỉ để đếm — tải thừa dữ liệu ở mọi lần mở trang.
        const opts = { signal: controller.signal };
        const [productsRes, categoriesRes, newsRes, contactsRes] = await Promise.all([
          fetch('/api/products?limit=1', opts),
          fetch('/api/categories', opts),
          fetch('/api/news?limit=1', opts),
          fetch('/api/contacts?limit=1', opts),
        ]);

        const [products, categories, news, contacts] = await Promise.all([
          productsRes.json(),
          categoriesRes.json(),
          newsRes.json(),
          contactsRes.json(),
        ]);

        setStats({
          products: products.pagination?.total ?? 0,
          categories: categories.categories?.length ?? 0,
          news: news.pagination?.total ?? 0,
          contacts: contacts.pagination?.total ?? 0,
        });
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
        console.error('Error fetching stats:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    return () => controller.abort();
  }, []);

  const statCards = [
    { title: 'Sản phẩm', value: stats.products, icon: Package, color: 'bg-blue-600', href: '/admin/products' },
    { title: 'Danh mục', value: stats.categories, icon: Tags, color: 'bg-emerald-600', href: '/admin/categories' },
    { title: 'Tin tức', value: stats.news, icon: Newspaper, color: 'bg-purple-600', href: '/admin/news' },
    { title: 'Liên hệ', value: stats.contacts, icon: MessageSquare, color: 'bg-orange-600', href: '/admin/contacts' },
  ];

  const quickActions = [
    { label: 'Thêm sản phẩm mới', href: '/admin/products/new', icon: Package },
    { label: 'Thêm danh mục mới', href: '/admin/categories/new', icon: Tags },
    { label: 'Viết tin tức mới', href: '/admin/news/new', icon: Newspaper },
    { label: 'Thêm đánh giá', href: '/admin/reviews', icon: Star },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
          <p className="text-gray-600 mt-1">
            Xin chào{session?.user?.name ? `, ${session.user.name}` : ''}. Đây là tình hình
            hiện tại của website.
          </p>
        </div>

        {error && (
          <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            Không tải được số liệu thống kê. Vui lòng tải lại trang.
          </div>
        )}

        {/* Thẻ số liệu: dùng <Link> thay cho <div onClick> để bàn phím tới được
            và mở tab mới được (tiêu chí 5) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 hover:border-blue-400 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className={`${card.color} rounded-lg p-3 flex-shrink-0`}>
                    <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-gray-500 truncate">
                      {card.title}
                    </span>
                    <span className="block text-2xl font-bold text-gray-900 tabular-nums">
                      {loading ? (
                        // Skeleton thay cho "..." để không nhảy layout (tiêu chí 7)
                        <span className="inline-block h-7 w-10 bg-gray-200 rounded animate-pulse align-middle" />
                      ) : (
                        card.value
                      )}
                    </span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Thao tác nhanh */}
        <section className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Thao tác nhanh</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <li key={action.href}>
                  <Link
                    href={action.href}
                    className="flex items-center gap-3 min-h-touch p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors h-full"
                  >
                    <Icon className="h-5 w-5 text-gray-500 flex-shrink-0" aria-hidden="true" />
                    <span className="text-sm font-medium text-gray-900">{action.label}</span>
                    <Plus className="h-4 w-4 text-gray-500 ml-auto flex-shrink-0" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Hướng dẫn ngắn gọn (tiêu chí 9: đoạn ngắn, gạch đầu dòng) */}
        <section className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Việc bạn có thể làm ở đây</h2>
          <ul className="list-disc ml-5 space-y-1.5 text-gray-600 text-sm max-w-prose">
            <li>Thêm, sửa, xóa sản phẩm và đánh dấu sản phẩm nổi bật để hiện trên trang chủ</li>
            <li>Quản lý danh mục sản phẩm hiển thị ở thanh điều hướng</li>
            <li>Đăng tin tức (nhớ bật &ldquo;Xuất bản&rdquo; thì bài mới hiện ra ngoài)</li>
            <li>Xem liên hệ khách hàng gửi từ website và đánh giá hiển thị trên trang chủ</li>
          </ul>
        </section>
      </div>
    </AdminLayout>
  );
}

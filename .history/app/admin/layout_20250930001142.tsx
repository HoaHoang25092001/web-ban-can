import { Metadata } from 'next';
import { SessionProvider } from '@/components/SessionProvider';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Quản lý Website',
  description: 'Trang quản trị website bán cần câu',
  robots: 'noindex, nofollow',
};

// Force dynamic rendering for all admin pages
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
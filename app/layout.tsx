import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Geist_Mono } from "next/font/google";
import SessionProvider from "../components/SessionProvider";
import ConditionalLayout from "../components/ConditionalLayout";
import CategoryNavWrapper from "../components/CategoryNavWrapper";
import { ToastProvider } from "../components/Toast";
import { SITE_URL, PRIMARY_PHONE, buildLocalBusinessJsonLd } from "@/lib/site";
import "./globals.css";

/**
 * Be Vietnam Pro hỗ trợ đầy đủ dấu tiếng Việt (Geist không có subset 'vietnamese'
 * nên trước đây trình duyệt phải fallback khi gặp chữ có dấu → nhảy chữ, CLS cao).
 */
const sans = Be_Vietnam_Pro({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-sans',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: false,
});

// Tiêu chí 1 + 9: tiêu đề/mô tả nói rõ trang này làm gì, cho ai.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Cân Vạn Thịnh Phát – Cân điện tử chính hãng, bảo hành 12 tháng',
    template: '%s | Cân Vạn Thịnh Phát',
  },
  description: `Cung cấp cân bàn, cân sàn, cân treo, cân phân tích chính hãng. Có kiểm định, bảo hành 12 tháng, lắp đặt tận nơi tại TP. Hồ Chí Minh. Gọi ${PRIMARY_PHONE} để được báo giá.`,
  keywords: ['cân điện tử', 'cân bàn', 'cân sàn', 'cân treo', 'cân phân tích', 'cân công nghiệp', 'Vạn Thịnh Phát'],
  authors: [{ name: 'Cân Vạn Thịnh Phát' }],
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'Cân Vạn Thịnh Phát',
    title: 'Cân Vạn Thịnh Phát – Cân điện tử chính hãng',
    description:
      'Cân bàn, cân sàn, cân treo, cân phân tích chính hãng. Có kiểm định, bảo hành 12 tháng, lắp đặt tận nơi.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Tiêu chí 6: mobile-first, cho phép người dùng phóng to (không khóa zoom).
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0D47A1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning={true}>
      <head>
        {/* Remixicon nạp một lần duy nhất, không chặn render.
            Trước đây font icon được import ở cả layout.tsx lẫn globals.css
            từ hai CDN khác nhau → tải trùng và chặn first paint. */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/remixicon@4.3.0/fonts/remixicon.css"
        />
      </head>
      {/*
        suppressHydrationWarning trên <body>: nhiều tiện ích mở rộng trình duyệt
        (ColorZilla thêm `cz-shortcut-listen`, Grammarly thêm `data-gr-*`…) chèn
        thuộc tính vào <body> TRƯỚC khi React chạy. HTML từ server vì thế khác
        HTML trên máy người dùng, và React báo hydration mismatch — dù code hoàn
        toàn đúng và giao diện không hề sai.

        Thuộc tính này KHÔNG kế thừa từ <html> xuống, nên phải đặt riêng ở đây.
        Nó chỉ bỏ qua khác biệt về thuộc tính trên đúng thẻ <body>, không che
        giấu lỗi hydration thật ở các component bên trong.
      */}
      <body
        suppressHydrationWarning
        className={`${sans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {/* Tiêu chí 5: bỏ qua phần điều hướng lặp lại, tới thẳng nội dung */}
        <a href="#main-content" className="skip-link">
          Bỏ qua tới nội dung chính
        </a>

        {/* Structured data: giúp Google hiển thị đúng địa chỉ, giờ mở cửa và số
            điện thoại ngay trên kết quả tìm kiếm (tiêu chí 9). */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildLocalBusinessJsonLd()),
          }}
        />
        <SessionProvider session={null}>
          <ToastProvider>
            <ConditionalLayout categoryNav={<CategoryNavWrapper />}>
              {children}
            </ConditionalLayout>
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

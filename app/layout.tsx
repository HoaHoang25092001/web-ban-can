import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Geist_Mono } from "next/font/google";
import SessionProvider from "../components/SessionProvider";
import ConditionalLayout from "../components/ConditionalLayout";
import CategoryNavWrapper from "../components/CategoryNavWrapper";
import { ToastProvider } from "../components/Toast";
import { SITE_URL, PRIMARY_PHONE, BUSINESS, buildLocalBusinessJsonLd } from "@/lib/site";
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
    default: 'Cân Điện Tử Giá Rẻ Chính Hãng – Cân Vạn Thịnh Phát',
    template: '%s | Cân Vạn Thịnh Phát',
  },
  description: `Cân điện tử giá rẻ chính hãng: cân bàn, cân sàn, cân treo, cân tính tiền. Bảo hành 12 tháng, hỗ trợ kiểm định, giao lắp tận nơi TP.HCM. Gọi ${PRIMARY_PHONE} báo giá ngay.`,
  keywords: [
    'cân điện tử giá rẻ', 'cân giá rẻ', 'cân điện tử', 'cân bàn điện tử',
    'cân sàn điện tử', 'cân treo điện tử', 'cân tính tiền', 'cân phân tích',
    'cân công nghiệp', 'cân điện tử chính hãng', 'bán cân điện tử TPHCM',
    'Cân Vạn Thịnh Phát',
  ],
  /*
   * Biểu tượng hiển thị cạnh tên miền trên kết quả tìm kiếm Google.
   *
   * Trước đây chỉ có icon.svg. Google Search KHÔNG đọc được SVG — tài liệu
   * chính thức chỉ liệt kê BMP, GIF, ICO, PNG, JPEG, PPM, TIFF — nên kết quả
   * tìm kiếm hiện biểu tượng quả địa cầu mặc định thay vì logo công ty.
   *
   * Thứ tự khai báo có chủ đích: SVG đứng trước cho trình duyệt (sắc nét ở
   * mọi kích thước), PNG 512px đứng sau cho Google và các máy không đọc SVG.
   */
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
      { url: '/favicon.ico', sizes: '48x48' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  authors: [{ name: BUSINESS.name }],
  creator: BUSINESS.name,
  publisher: BUSINESS.legalName,
  // Thẻ canonical cho Google biết đâu là địa chỉ chuẩn của mỗi trang, tránh
  // bị coi là nội dung trùng lặp khi truy cập qua www/không-www hay có tham số.
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: SITE_URL,
    siteName: BUSINESS.name,
    title: 'Cân Điện Tử Giá Rẻ Chính Hãng – Cân Vạn Thịnh Phát',
    description:
      'Cân bàn, cân sàn, cân treo, cân tính tiền giá rẻ chính hãng. Bảo hành 12 tháng, hỗ trợ kiểm định, giao lắp tận nơi.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cân Điện Tử Giá Rẻ Chính Hãng – Cân Vạn Thịnh Phát',
    description:
      'Cân bàn, cân sàn, cân treo giá rẻ chính hãng. Bảo hành 12 tháng, hỗ trợ kiểm định.',
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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

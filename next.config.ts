import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // UploadThing CDN (UFS — UploadThing File Storage)
        protocol: 'https',
        hostname: 'utfs.io',
      },
      {
        // UploadThing public files
        protocol: 'https',
        hostname: '*.ufs.sh',
      },
      {
        // Dữ liệu cũ (bao gồm prisma/seed.ts) còn chứa link ảnh sinh từ readdy.ai.
        // Giữ host này để ảnh cũ không vỡ; ảnh mới upload đều đi qua UploadThing.
        protocol: 'https',
        hostname: 'readdy.ai',
      },
      {
        // Ảnh mã QR chuyển khoản sinh động theo chuẩn VietQR / Napas 247
        protocol: 'https',
        hostname: 'img.vietqr.io',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    // AVIF/WebP nhỏ hơn JPEG/PNG đáng kể, giúp giảm LCP (tiêu chí 7)
    formats: ['image/avif', 'image/webp'],
    // Chỉ sinh đúng các kích thước thực sự dùng trong layout, tránh tạo thừa biến thể
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [56, 64, 96, 128, 256, 300, 384],
    // Ảnh sản phẩm ít thay đổi – giữ cache 30 ngày
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Next.js 16 sẽ bắt buộc khai báo trước các mức chất lượng được dùng.
    // 75 là mặc định, 80 dùng cho ảnh hero (slide trang chủ).
    qualities: [75, 80],
  },

  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  trailingSlash: false,

  // Gom import icon để bundler chỉ đóng gói icon thực sự dùng, không cả thư viện
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  async headers() {
    return [
      {
        // Header bảo mật cơ bản cho toàn site
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
      {
        // Ảnh tĩnh trong /public có tên cố định – cache dài phía trình duyệt/CDN
        source: '/:path*.(png|jpg|jpeg|gif|webp|avif|svg|ico)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' },
        ],
      },
    ];
  },
};

export default nextConfig;

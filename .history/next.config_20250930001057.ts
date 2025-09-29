import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  images: {
    domains: ['res.cloudinary.com', 'readdy.ai', 'localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  typescript: {
    // ignoreBuildErrors: true,
  },
  // Enable compression
  compress: true,
  // Optimize for Vercel
  poweredByHeader: false,
  // Strict mode for better performance
  reactStrictMode: true,
  
  // Fix Vercel routing issues
  trailingSlash: false,
  
  // Add rewrites for admin routes
  async rewrites() {
    return [
      {
        source: '/admin',
        destination: '/admin',
      },
      {
        source: '/admin/:path*',
        destination: '/admin/:path*',
      },
    ];
  },
  
  // Ensure admin routes are not statically generated
  exportPathMap: async function () {
    return {
      '/': { page: '/' },
      '/contact': { page: '/contact' },
      '/introduce': { page: '/introduce' },
      '/news': { page: '/news' },
    };
  },
};

export default nextConfig;

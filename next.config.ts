import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
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
        protocol: 'https',
        hostname: 'readdy.ai',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
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
};

export default nextConfig;

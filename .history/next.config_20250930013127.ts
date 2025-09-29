import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
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

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
};

export default nextConfig;

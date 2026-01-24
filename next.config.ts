import type { NextConfig } from 'next';

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // Optimize production build
  compress: true,
  productionBrowserSourceMaps: false,

  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },

  // Skip static generation for build (our app is fully dynamic)
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
};

export default withBundleAnalyzer(nextConfig);

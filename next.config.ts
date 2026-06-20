import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  reactStrictMode: true,
  // Use the prefix for GitHub Pages
  basePath: '',
  assetPrefix: '/',
  // Enable static export
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  experimental: {
    sri: {
      algorithm: 'sha256'
    }
  }
};

export default nextConfig;

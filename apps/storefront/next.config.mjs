/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/merchants/:path*',
        destination: '/merchant/:path*',
        permanent: false,
      },
      {
        source: '/merchant/dashboard',
        destination: '/merchant/products',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    const medusaBackendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
    return [
      {
        source: '/merchant/auth/:path*',
        destination: `${medusaBackendUrl}/merchant/auth/:path*`,
      },
      {
        source: '/admin/auth/:path*',
        destination: `${medusaBackendUrl}/admin/auth/:path*`,
      },
      {
        source: '/api/merchant/:path*',
        destination: `${medusaBackendUrl}/merchant/:path*`,
      },
      {
        source: '/api/admin/marketplace/:path*',
        destination: `${medusaBackendUrl}/admin/marketplace/:path*`,
      },
    ];
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  // Ensure proper routing
  trailingSlash: false,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  // Redirects for Vercel
  async redirects() {
    return [
      {
        source: '/api',
        destination: '/docs/api',
        permanent: true,
      },
      {
        source: '/security',
        destination: '/docs/security',
        permanent: true,
      },
    ];
  },
}

module.exports = nextConfig
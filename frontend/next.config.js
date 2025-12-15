/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  // Ensure proper routing
  trailingSlash: false,
  // Output configuration for static export (if needed)
  // output: 'export', // Uncomment for static export
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    return config;
  },
  // Redirects for both Vercel and Netlify
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
  // Ensure all routes are properly handled
  async rewrites() {
    return [];
  },
}

module.exports = nextConfig
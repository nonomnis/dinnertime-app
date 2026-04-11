// @ts-check
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  transpilePackages: ['next-auth', '@auth/core'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...config.externals,
        '@prisma/client',
        '.prisma/client',
        // Keep next/server external so NextRequest constructor survives bundling
        'next/server',
        'next/headers',
      ];
      // Disable server-side minification to prevent SWC from mangling
      // class constructor names (causes "on is not a constructor" error)
      config.optimization = {
        ...config.optimization,
        minimize: false,
      };
    }
    return config;
  },
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera()' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Content-Type', value: 'application/manifest+json' },
        ],
      },
      {
        source: '/service-worker.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
  compress: true,
};

module.exports = nextConfig;

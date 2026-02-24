/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development warnings
  reactStrictMode: true,

  // Optimize images
  images: {
    domains: ['firebasestorage.googleapis.com'],
    formats: ['image/avif', 'image/webp'],
  },

  // Optimize fonts
  optimizeFonts: true,

  // Enable SWC minification
  swcMinify: true,

  // Production source maps (optional, disable for smaller builds)
  productionBrowserSourceMaps: false,

  // Experimental features
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['framer-motion', 'recharts', 'firebase'],
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Handle canvas for MediaPipe (if needed)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };

      // Prevent webpack from parsing @mediapipe packages.
      // Without this, webpack's scope analysis replaces `Module.arguments`
      // with `arguments_` inside the MediaPipe WASM JS wrapper, causing:
      // "Aborted(Module.arguments has been replaced with plain arguments_)"
      const currentNoParse = config.module.noParse;
      config.module.noParse = currentNoParse
        ? [].concat(currentNoParse, [/@mediapipe\//])
        : [/@mediapipe\//];
    }

    return config;
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
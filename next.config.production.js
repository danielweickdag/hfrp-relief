/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    domains: ["files.stripe.com", "img.youtube.com"],
    formats: ["image/avif", "image/webp"],
  },
  
  // Experimental features
  experimental: {
    optimizeCss: true,
  },
  
  // Environment variables
  env: {
    NODE_ENV: process.env.NODE_ENV,
    DONORBOX_EMAIL: process.env.DONORBOX_EMAIL,
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
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
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

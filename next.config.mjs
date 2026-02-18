/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Optional: Add a base path if you are deploying to a subdirectory
  // basePath: '/hfrp-relief',
};

export default nextConfig;

/** @type {import("next").NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
  output: 'export',
  distDir: 'out',
  trailingSlash: true
};

module.exports = nextConfig;

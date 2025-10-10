/** @type {import("next").NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: './tsconfig.json'
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Configure allowed qualities to silence Next.js 16 requirement warning
    qualities: [95],
  },
  serverExternalPackages: ["nodemailer"],
  turbopack: {
    rules: {
      "*.md": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
    },
  },
};

module.exports = nextConfig;

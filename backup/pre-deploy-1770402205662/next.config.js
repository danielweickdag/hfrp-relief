/** @type {import("next").NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: './tsconfig.json'
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
  async redirects() {
    return [
      {
        source: '/success',
        destination: '/donation/success',
        permanent: true,
      },
      {
        source: '/cancel',
        destination: '/donation/cancelled',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;

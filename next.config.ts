import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.communitydragon.org",
      },
      {
        protocol: "https",
        hostname: "communitydragon.breadj.com",
      },
      {
        protocol: "https",
        hostname: "game.gtimg.cn",
      },
      {
        protocol: "https",
        hostname: "oss.breadj.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/rest/:path*",
        destination: "http://localhost:9527/rest/:path*",
      },
    ];
  },
};

export default nextConfig;

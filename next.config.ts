import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [];
  },
  env: {
    PORT: "3000",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

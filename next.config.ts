import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  /* config options here */
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
    ENVIRONMENT: process.env.ENVIRONMENT
  }
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
    ENVIRONMENT: process.env.ENVIRONMENT
  }
};

export default nextConfig;

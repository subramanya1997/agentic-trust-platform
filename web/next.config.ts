import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // API proxy is handled by /app/api/backend/[...path]/route.ts
  // This ensures cookies are properly forwarded to the backend
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "workoscdn.com",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;

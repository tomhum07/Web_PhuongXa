import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5265',
      },
      // Thêm domain thật khi bạn đưa lên production (Ví dụ)
      {
        protocol: 'https',
        hostname: 'api.tomhum07.me', 
      }
    ],
  },
};

export default nextConfig;

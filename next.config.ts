import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {domains: ['source.unsplash.com'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**", // Permite cualquier imagen dentro del dominio
      },
    ],
  },
};

export default nextConfig;

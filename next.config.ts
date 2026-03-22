import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'smhgbqurdbsqgintoxka.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Legacy support for hostnames
    domains: ['smhgbqurdbsqgintoxka.supabase.co'],
  },
};

export default nextConfig;

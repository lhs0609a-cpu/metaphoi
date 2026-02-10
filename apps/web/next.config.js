/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel 모노레포: Root Directory가 루트일 때 .next를 루트에 출력
  distDir: process.env.VERCEL ? '../../.next' : '.next',
  transpilePackages: ['shared'],
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
};

module.exports = nextConfig;

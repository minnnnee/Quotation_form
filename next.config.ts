import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // PWA를 위한 헤더 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
};

export default nextConfig;

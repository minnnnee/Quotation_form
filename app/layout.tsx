import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: '도배 견적서',
  description: '도배 견적서 작성 및 카카오톡 공유',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: '도배견적' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563eb',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-100">
        {/* 카카오 SDK */}
        <Script
          src="https://t1.kakaocdn.net/kakaojs/2.7.4/kakao.js"
          strategy="lazyOnload"
          onLoad={() => {
            const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
            if (key && key !== '여기에_앱키_입력' && typeof window !== 'undefined' && (window as any).Kakao) {
              (window as any).Kakao.init(key);
            }
          }}
        />
        <div className="max-w-md mx-auto min-h-screen bg-white shadow-sm relative">
          {children}
        </div>
      </body>
    </html>
  );
}

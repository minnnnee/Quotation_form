import type { Metadata, Viewport } from 'next';
import KakaoInit from '@/components/KakaoInit';
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
        <KakaoInit />
        <div className="max-w-md mx-auto min-h-screen bg-white shadow-sm relative">
          {children}
        </div>
      </body>
    </html>
  );
}

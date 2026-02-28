'use client';
import Script from 'next/script';

export default function KakaoInit() {
  return (
    <Script
      src="https://t1.kakaocdn.net/kakaojs/2.7.4/kakao.js"
      strategy="lazyOnload"
      onLoad={() => {
        const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
        if (key && key !== '여기에_앱키_입력' && (window as any).Kakao) {
          (window as any).Kakao.init(key);
        }
      }}
    />
  );
}

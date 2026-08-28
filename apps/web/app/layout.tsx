import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: {
    default: 'Metaphoi — 성격검사 7개를 겹쳐 능력치 30개로',
    template: '%s · Metaphoi',
  },
  description:
    'MBTI, DISC, 에니어그램, Holland, 사주, 사상체질, 혈액형. 서로 다른 7가지 관점을 한 사람 위에 겹쳐 능력치 30개로 환산합니다. 53문항, 약 12분, 회원가입 없이.',
  keywords: ['성격검사', 'MBTI', 'DISC', '에니어그램', 'Holland', '사주', '사상체질', '능력치', '적성검사', '채용'],
  openGraph: {
    title: 'Metaphoi — 성격검사 7개를 겹쳐 능력치 30개로',
    description: '53문항으로 7가지 검사를 한 번에. 취향이 아니라 수치가 남습니다.',
    type: 'website',
    locale: 'ko_KR',
    siteName: 'Metaphoi',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Metaphoi 종합 심리검사' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Metaphoi — 성격검사 7개를 겹쳐 능력치 30개로',
    description: '53문항으로 7가지 검사를 한 번에. 취향이 아니라 수치가 남습니다.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        {/*
          Pretendard 하나로 한글과 라틴을 모두 처리한다.
          두 벌을 섞으면 숫자와 한글의 골격이 달라져 표가 흔들린다.
          dynamic-subset은 쓰인 글자만 받아오므로 첫 화면이 빨라진다.
        */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {/* 카카오톡 공유 SDK */}
        <script src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js" async />
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

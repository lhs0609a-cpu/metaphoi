import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Metaphoi (메타포이) - 종합 인재 평가 플랫폼',
  description:
    '7가지 심리검사를 한 번에! MBTI, DISC, 에니어그램, Holland, 사주, 사상체질, 혈액형을 종합 분석하고 30가지 능력치를 확인하세요.',
  keywords: ['MBTI', 'DISC', '에니어그램', 'Holland', '사주', '사상체질', '성격검사', '심리검사', '인재평가', '능력치'],
  openGraph: {
    title: 'Metaphoi - 7가지 심리검사 종합 분석',
    description: 'MBTI + DISC + 에니어그램 + Holland + 사주 + 사상체질 + 혈액형 종합 분석. 53문항으로 30가지 능력치를 한 번에!',
    type: 'website',
    locale: 'ko_KR',
    siteName: 'Metaphoi',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Metaphoi 종합 심리검사',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Metaphoi - 7가지 심리검사 종합 분석',
    description: '53문항으로 MBTI, DISC, 에니어그램, Holland, 사주, 사상체질, 혈액형을 한 번에 분석!',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* 카카오톡 공유 SDK */}
        <script src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js" async />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

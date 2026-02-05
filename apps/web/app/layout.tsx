import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://metaphoi.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Metaphoi (메타포이) - 종합 인재 평가 플랫폼',
    template: '%s | Metaphoi',
  },
  description:
    '14가지 성격/심리 검사를 통합하여 30개 능력치 스탯을 산출하고, AI 분석 기반 리포트를 제공하는 종합 인재 평가 플랫폼',
  keywords: [
    'MBTI',
    'DISC',
    '에니어그램',
    'TCI',
    '갤럽',
    '홀랜드',
    '성격검사',
    '심리검사',
    '인재평가',
    'AI분석',
    '능력치',
    '직업적성',
  ],
  authors: [{ name: 'Metaphoi' }],
  creator: 'Metaphoi',
  publisher: 'Metaphoi',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: siteUrl,
    siteName: 'Metaphoi',
    title: 'Metaphoi (메타포이) - 종합 인재 평가 플랫폼',
    description:
      '14가지 성격/심리 검사로 나만의 30개 능력치를 확인하세요. AI가 분석하는 종합 인재 리포트.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Metaphoi - 종합 인재 평가 플랫폼',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Metaphoi (메타포이) - 종합 인재 평가 플랫폼',
    description:
      '14가지 성격/심리 검사로 나만의 30개 능력치를 확인하세요. AI가 분석하는 종합 인재 리포트.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    // naver: 'your-naver-verification-code',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Metaphoi (메타포이) - 종합 인재 평가 플랫폼',
  description:
    '14가지 성격/심리 검사를 통합하여 30개 능력치 스탯을 산출하고, AI 분석 기반 리포트를 제공하는 종합 인재 평가 플랫폼',
  keywords: ['MBTI', 'DISC', '에니어그램', '성격검사', '심리검사', '인재평가', 'AI분석'],
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

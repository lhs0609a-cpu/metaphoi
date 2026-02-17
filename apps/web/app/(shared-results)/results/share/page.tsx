import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Metaphoi - 나의 종합 심리검사 결과',
  description: '7가지 심리검사를 한 번에! MBTI, DISC, 에니어그램, Holland, 사주, 사상체질, 혈액형을 종합 분석하고 30가지 능력치를 확인하세요.',
  openGraph: {
    title: 'Metaphoi - 7가지 심리검사 종합 분석',
    description: '53문항으로 MBTI, DISC, 에니어그램, Holland, 사주, 사상체질, 혈액형을 한 번에 분석! 30가지 능력치를 확인하세요.',
    type: 'website',
    images: ['/api/og?title=7가지 심리검사 종합 분석'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Metaphoi - 7가지 심리검사 종합 분석',
    description: '53문항으로 7가지 심리검사를 한 번에! 나도 검사해보기',
    images: ['/api/og?title=7가지 심리검사 종합 분석'],
  },
};

export default function ShareLandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-md">
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🧠</span>
            </div>
            <h1 className="text-2xl font-bold mb-3">
              7가지 심리검사 종합 분석
            </h1>
            <p className="text-muted-foreground mb-2">
              MBTI + DISC + 에니어그램 + Holland + 사주 + 사상체질 + 혈액형
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              약 50문항으로 30가지 능력치를 한 번에 분석합니다
            </p>

            <div className="flex justify-center gap-4 mb-6">
              {['성격', '행동', '동기', '적성', '체질'].map((tag) => (
                <span key={tag} className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            <p className="text-xs text-muted-foreground mb-6">
              약 10~15분 소요 | 로그인 불필요 | 결과 즉시 확인
            </p>

            <div className="space-y-3">
              <Link href="/test">
                <Button size="lg" className="w-full text-lg py-6">
                  나도 검사해보기 (무료)
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  자세히 알아보기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

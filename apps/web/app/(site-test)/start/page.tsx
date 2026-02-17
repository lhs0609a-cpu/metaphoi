import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: '무료 심리검사 - 10분 만에 나를 분석 | Metaphoi',
  description: '7가지 심리검사를 한 번에! MBTI, DISC, 에니어그램, Holland, 사주, 사상체질, 혈액형 종합 분석. 53문항, 10분, 무료.',
  openGraph: {
    title: '무료 심리검사 - 10분 만에 나를 분석',
    description: '53문항으로 7가지 심리검사를 한 번에! MBTI, DISC, 에니어그램, Holland, 사주, 사상체질까지.',
    type: 'website',
    images: ['/api/og?title=무료 심리검사'],
  },
};

export default function StartPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="max-w-lg mx-auto text-center">
        {/* Badge */}
        <span className="inline-block text-sm font-medium text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-8">
          회원가입 없이 무료
        </span>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 leading-tight">
          나를 가장 정확하게
          <br />
          <span className="text-primary">파악하는 방법</span>
        </h1>

        <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto">
          성격, 행동, 동기, 적성, 체질, 운명, 기질
          <br />
          <strong className="text-foreground">7가지 관점을 하나로 융합한 종합 분석</strong>
        </p>

        {/* Big CTA */}
        <Link href="/test">
          <Button size="lg" className="text-lg px-12 py-7 shadow-lg hover:shadow-xl transition-all animate-pulse-scale">
            무료로 시작하기
          </Button>
        </Link>

        {/* Sub info */}
        <p className="text-sm text-muted-foreground mt-6">
          53문항 · 약 10분 · 무료
        </p>

        {/* Test list */}
        <div className="mt-12 space-y-3">
          <p className="text-sm font-medium text-muted-foreground">7가지 검사를 한 번에</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['MBTI', 'DISC', '에니어그램', 'Holland', '사주', '사상체질', '혈액형'].map((test) => (
              <span
                key={test}
                className="px-3 py-1.5 bg-card border text-sm rounded-full text-muted-foreground"
              >
                {test}
              </span>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <p className="text-xs text-muted-foreground mt-8">
          지금까지 12,847명이 검사를 완료했습니다
        </p>
      </div>
    </div>
  );
}

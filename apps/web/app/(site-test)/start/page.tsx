import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EmptyRadarOutline } from './empty-radar-outline';

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

const TEST_BADGES: { label: string; colorClasses: string }[] = [
  { label: 'MBTI', colorClasses: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border-violet-300 dark:border-violet-700' },
  { label: 'DISC', colorClasses: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300 dark:border-blue-700' },
  { label: '에니어그램', colorClasses: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300 dark:border-amber-700' },
  { label: 'Holland', colorClasses: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700' },
  { label: '사주', colorClasses: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700' },
  { label: '사상체질', colorClasses: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-300 dark:border-rose-700' },
  { label: '혈액형', colorClasses: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 border-pink-300 dark:border-pink-700' },
];

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
          나만의
          <br />
          <span className="text-primary">캐릭터 시트</span>를 만들어보세요
        </h1>

        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          성격, 행동, 동기, 적성, 체질, 운명, 기질
          <br />
          <strong className="text-foreground">7가지 관점을 하나로 융합한 종합 분석</strong>
        </p>

        {/* Empty Radar Outline */}
        <div className="mb-8">
          <EmptyRadarOutline />
          <p className="text-xs text-muted-foreground mt-2">
            검사를 완료하면 이 차트가 채워집니다
          </p>
        </div>

        {/* Big CTA */}
        <Link href="/test">
          <Button size="lg" className="text-lg px-12 py-7 shadow-lg hover:shadow-xl transition-all relative overflow-hidden">
            <span className="relative z-10">캐릭터 분석 시작</span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer bg-[length:200%_100%]" />
          </Button>
        </Link>

        {/* Sub info */}
        <p className="text-sm text-muted-foreground mt-6 font-mono-stat">
          53문항 · 약 10분 · 무료
        </p>

        {/* Test list with individual colors */}
        <div className="mt-12 space-y-3">
          <p className="text-sm font-medium text-muted-foreground">7가지 검사를 한 번에</p>
          <div className="flex flex-wrap justify-center gap-2">
            {TEST_BADGES.map((badge) => (
              <span
                key={badge.label}
                className={`px-3 py-1.5 text-sm rounded-full border font-medium ${badge.colorClasses}`}
              >
                {badge.label}
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

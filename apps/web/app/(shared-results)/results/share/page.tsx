import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StatPreview } from '@/app/(site-intro)/stat-preview';

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
    <div className="shell max-w-[40rem] py-14 lg:py-20">
      <div className="flex flex-col items-start gap-4">
        <p className="eyebrow">공유된 링크로 오셨네요</p>
        <h1 className="text-h1">
          성격검사 7개를 겹쳐
          <br />
          능력치 30개로
        </h1>
        <p className="max-w-[42ch] text-lead text-muted-foreground">
          MBTI, DISC, 에니어그램, Holland, 사주, 사상체질, 혈액형. 53문항으로 한 번에 봅니다.
        </p>
      </div>

      {/* 이 화면에 온 사람은 아직 아무것도 모른다. 무엇을 받는지 먼저 보여준다 */}
      <div className="mt-9 rounded-card border border-border p-6 sm:p-7">
        <StatPreview bare />
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <Button asChild size="lg" block>
          <Link href="/start">나도 검사해보기</Link>
        </Button>
        <p className="text-center text-small text-muted-foreground">
          무료 · 회원가입 없이 · 약 12분
        </p>
      </div>

      <p className="mt-10 max-w-[46ch] text-tiny leading-relaxed text-muted-foreground">
        규준 표본이 쌓이기 전까지 점수는 모집단 대비 백분위가 아니라 내부 상대 점수로
        표시됩니다. 사주와 혈액형은 보조 지표로만 반영합니다.
      </p>
    </div>
  );
}

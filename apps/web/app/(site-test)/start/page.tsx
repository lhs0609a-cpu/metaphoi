import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: '무료 심리검사 — 53문항, 약 12분',
  description:
    'MBTI, DISC, 에니어그램, Holland, 사주, 사상체질, 혈액형을 한 번에. 53문항으로 능력치 30개를 산출합니다. 회원가입 없이 무료.',
  openGraph: {
    title: '무료 심리검사 — 53문항, 약 12분',
    description: '7가지 검사를 한 번에. 능력치 30개로 정리해 드립니다.',
    type: 'website',
    images: ['/api/og?title=무료 심리검사'],
  },
};

/* 검사 7종. 색을 주지 않는다 — 일곱 개를 일곱 색으로 칠하면
   무엇을 하는지가 아니라 색이 몇 개인지만 보인다. */
const TESTS = ['MBTI', 'DISC', '에니어그램', 'Holland', '사주', '사상체질', '혈액형'];

const CATEGORIES = [
  { name: '정신력', token: 'cat-mental' },
  { name: '사회성', token: 'cat-social' },
  { name: '업무역량', token: 'cat-work' },
  { name: '신체/감각', token: 'cat-physical' },
  { name: '잠재력', token: 'cat-potential' },
];

const STEPS = [
  { n: '1', title: '기본 정보', detail: '이름과 생년월일시. 사주 분석에만 씁니다' },
  { n: '2', title: '문항 53개', detail: '고르는 데 걸리는 시간, 약 12분' },
  { n: '3', title: '결과 확인', detail: '능력치 30개가 바로 나옵니다' },
];

export default function StartPage() {
  return (
    <div className="shell max-w-[34rem] py-14 lg:py-20">
      <div className="anim-rise flex flex-col items-start">
        <p className="eyebrow">회원가입 없이 · 무료</p>

        <h1 className="mt-3 text-h1">
          53문항으로
          <br />
          내 능력치 30개를
        </h1>

        <p className="mt-5 text-lead text-muted-foreground">
          일곱 가지 검사를 한 번에 봅니다. 답이 겹치는 곳이 단단한 부분이고,
          어긋나는 곳이 상황을 타는 부분입니다.
        </p>
      </div>

      {/* 무엇을 받게 되는가 — 빈 차트를 띄우는 것보다 목록이 정확하다 */}
      <section className="mt-10 rounded-card border border-border p-6 sm:p-7">
        <p className="eyebrow">결과로 받는 것</p>
        <ul className="mt-4 flex flex-col gap-3">
          {CATEGORIES.map((c) => (
            <li key={c.name} className="flex items-center gap-3">
              {/* 색 점만 미리 보여준다. 막대까지 칠하면 없는 데이터를 있는 척하게 된다 */}
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: `hsl(var(--${c.token}))` }}
                aria-hidden="true"
              />
              <span className="w-16 shrink-0 text-tiny text-muted-foreground">{c.name}</span>
              <span className="sunk h-1.5 flex-1" aria-hidden="true" />
              <span className="w-12 shrink-0 text-right text-tiny text-muted-foreground">
                능력치 6
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-tiny text-muted-foreground">
          검사를 마치면 이 막대가 채워집니다
        </p>
      </section>

      {/* 진행 순서 — 무엇을 묻는지 미리 알려주면 중간에 나가지 않는다 */}
      <section className="mt-10">
        <p className="eyebrow">진행 순서</p>
        <ol className="mt-4 flex flex-col">
          {STEPS.map((s) => (
            <li key={s.n} className="flex items-baseline gap-4 border-t border-border py-4 last:border-b">
              <span className="stat-num w-4 shrink-0 text-small text-muted-foreground">{s.n}</span>
              <span className="w-24 shrink-0 text-body font-semibold">{s.title}</span>
              <span className="text-small text-muted-foreground">{s.detail}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-10 flex flex-col gap-3">
        <Button asChild size="lg" block>
          <Link href="/test">검사 시작하기</Link>
        </Button>
        <p className="text-center text-small text-muted-foreground">
          53문항 · 약 12분 · 이메일 없이 시작
        </p>
      </div>

      <section className="mt-12 border-t border-border pt-6">
        <p className="eyebrow">함께 보는 검사</p>
        <p className="mt-3 text-small leading-relaxed text-muted-foreground">
          {TESTS.join(' · ')}
        </p>
        {/* 랜딩에서 한 말을 여기서도 지킨다. 시작 직전이 가장 중요한 자리다 */}
        <p className="mt-4 max-w-[46ch] text-tiny leading-relaxed text-muted-foreground">
          사주와 혈액형은 보조 지표로만 반영합니다. 규준 표본이 쌓이기 전까지 점수는
          모집단 대비 백분위가 아니라 내부 상대 점수로 표시됩니다.
        </p>
      </section>
    </div>
  );
}

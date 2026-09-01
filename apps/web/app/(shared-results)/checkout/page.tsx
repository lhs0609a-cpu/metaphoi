'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ErrorState, PageLoading } from '@/components/ui/states';
import { RadarChart } from '@/components/results/radar-chart';
import { CATEGORY_COLORS } from '@/lib/design-tokens';
import { useAuthStore } from '@/lib/auth';
import { api } from '@/lib/api';

const PLANS = [
  {
    id: 'basic',
    name: '스탠다드 시트',
    price: 9900,
    priceLabel: '9,900원',
    features: [
      '30가지 능력치 전체 공개',
      '레이더 차트',
      '7가지 유형별 상세 해석',
      '핵심 강점 TOP 10',
    ],
  },
  {
    id: 'pro',
    name: '풀 시트',
    price: 29900,
    priceLabel: '29,900원',
    recommended: true,
    features: [
      '스탠다드 시트 포함 전체',
      'MBTI x DISC 교차 분석',
      '맞춤 직업 추천 TOP 10',
      '커리어 로드맵',
      'PDF 내보내기',
    ],
  },
  {
    id: 'premium',
    name: '마스터 시트',
    price: 59900,
    priceLabel: '59,900원',
    features: [
      '풀 시트 포함 전체',
      '성장 로드맵 & 액션플랜',
      '사주 + 사상체질 종합 해석',
      'AI 맞춤 인사이트',
      '기업용 리포트 생성',
    ],
  },
];

/*
 * 예시 점수는 고정값이다.
 *
 * 예전에는 모듈 스코프에서 Math.random() 으로 만들었는데, 서버에서 그린 값과
 * 클라이언트에서 그린 값이 달라 하이드레이션 불일치가 났다. 화면이 한 번
 * 깜빡이고 콘솔에 경고가 쌓이지만 눈에 잘 띄지 않아 오래 남아 있었다.
 */
const SAMPLE_SCORES = [72, 48, 65, 54, 81];
const CATEGORY_NAMES = ['정신력', '사회성', '업무역량', '신체/감각', '잠재력'];

const GRAY_RADAR = SAMPLE_SCORES.map((score) => ({
  name: '',
  score,
  color: 'hsl(var(--muted-foreground))',
}));

const COLOR_RADAR = Object.values(CATEGORY_COLORS).map((c, i) => ({
  name: CATEGORY_NAMES[i],
  score: SAMPLE_SCORES[i],
  color: `hsl(${c.hsl})`,
}));

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, isAuthenticated } = useAuthStore();

  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const plan = searchParams.get('plan');
    if (plan && PLANS.find((p) => p.id === plan)) {
      setSelectedPlan(plan);
    }
  }, [searchParams]);

  const handlePayment = async () => {
    if (!isAuthenticated || !token) {
      router.push(`/login?redirect=${encodeURIComponent('/checkout?plan=' + selectedPlan)}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.payments.prepare({
        reportType: selectedPlan,
        amount: PLANS.find((p) => p.id === selectedPlan)!.price,
      });

      if (response.error) {
        setError(response.error);
        setLoading(false);
        return;
      }

      const paymentData = response.data as any;

      if (typeof window !== 'undefined' && (window as any).TossPayments) {
        const tossPayments = (window as any).TossPayments(paymentData.client_key);
        await tossPayments.requestPayment('카드', {
          amount: paymentData.amount,
          orderId: paymentData.order_id,
          orderName: paymentData.order_name,
          successUrl: `${window.location.origin}/payment/success`,
          failUrl: `${window.location.origin}/payment/fail`,
        });
      } else {
        setError('토스페이먼츠 SDK를 로딩 중입니다. 잠시 후 다시 시도해주세요.');
      }
    } catch (err) {
      setError('결제 준비 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const plan = PLANS.find((p) => p.id === selectedPlan)!;

  return (
    <>
      <script src="https://js.tosspayments.com/v1/payment" />

      <div className="shell max-w-[46rem] py-10 lg:py-14">
        <header className="flex flex-col items-start gap-2">
          <p className="eyebrow">전체 분석</p>
          <h1 className="text-h1">잠긴 부분을 엽니다</h1>
          <p className="max-w-[46ch] text-lead text-muted-foreground">
            한 번 결제하면 계속 볼 수 있습니다. 구독이 아닙니다.
          </p>
        </header>

        {/* 무엇이 달라지는지 — 말보다 그림이 빠르다 */}
        <section className="mt-8 rounded-card border border-border p-6 sm:p-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col items-center gap-3">
              <p className="eyebrow">지금 (무료)</p>
              <div className="opacity-40">
                <RadarChart categories={GRAY_RADAR} size={140} showLabels={false} grayscale animate={false} />
              </div>
              <p className="text-tiny text-muted-foreground">일부 능력치만</p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <p className="eyebrow">전체 분석</p>
              <RadarChart categories={COLOR_RADAR} size={140} showLabels={false} animate />
              <p className="text-tiny text-muted-foreground">능력치 30개 전부</p>
            </div>
          </div>
        </section>

        {/* 플랜 — 전부 보여준다.
            가격을 클릭 뒤에 숨기면 비교하려는 사람이 먼저 의심한다 */}
        <section className="mt-10">
          <h2 className="text-h3">플랜</h2>

          <div className="mt-5 flex flex-col gap-3">
            {PLANS.map((p) => {
              const selected = selectedPlan === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlan(p.id)}
                  aria-pressed={selected}
                  className={[
                    'flex flex-col gap-3 rounded-card border px-6 py-5 text-left',
                    'transition-[border-color,background-color] duration-fast ease-std',
                    selected
                      ? 'border-action bg-sunk'
                      : 'border-border hover:border-border-strong',
                  ].join(' ')}
                >
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={[
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2',
                        selected ? 'border-action' : 'border-border-strong',
                      ].join(' ')}
                      aria-hidden="true"
                    >
                      {selected ? <span className="h-2 w-2 rounded-full bg-action" /> : null}
                    </span>
                    <span className="text-body font-semibold">{p.name}</span>
                    {p.recommended ? (
                      <Badge tone="ok" size="sm">
                        많이 선택
                      </Badge>
                    ) : null}
                    <span className="stat-num ml-auto text-h4" data-numeric>
                      {p.priceLabel}
                    </span>
                  </div>

                  <ul className="flex flex-wrap gap-x-4 gap-y-1 pl-7">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-1.5 text-small text-muted-foreground">
                        <span
                          className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-current opacity-50"
                          aria-hidden="true"
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
        </section>

        {error ? (
          <div className="mt-6">
            <ErrorState title="결제를 준비하지 못했습니다" detail={error} />
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3">
          {!isAuthenticated ? (
            <p className="text-small text-muted-foreground">
              결제하려면 먼저{' '}
              <Link
                href={`/login?redirect=${encodeURIComponent('/checkout?plan=' + selectedPlan)}`}
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                로그인
              </Link>
              이 필요합니다. 결과는 그대로 유지됩니다.
            </p>
          ) : null}

          <Button size="lg" block loading={loading} onClick={handlePayment}>
            {plan.priceLabel} 결제하기
          </Button>

          <p className="text-center text-tiny text-muted-foreground">
            토스페이먼츠를 통해 처리됩니다 · 카드 정보는 저장하지 않습니다
          </p>
        </div>
      </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<PageLoading label="불러오는 중" />}>
      <CheckoutContent />
    </Suspense>
  );
}

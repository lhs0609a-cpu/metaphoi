'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

const GRAY_RADAR = Object.values(CATEGORY_COLORS).map((c) => ({
  name: '',
  score: 40 + Math.round(Math.random() * 30),
  color: 'hsl(var(--muted-foreground))',
}));

const COLOR_RADAR = Object.values(CATEGORY_COLORS).map((c, i) => ({
  name: ['정신력', '사회성', '업무역량', '신체/감각', '잠재력'][i],
  score: GRAY_RADAR[i].score,
  color: `hsl(${c.hsl})`,
}));

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, isAuthenticated } = useAuthStore();

  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOtherPlans, setShowOtherPlans] = useState(false);

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

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">캐릭터 시트 해금</h1>
          <p className="text-muted-foreground">
            숨겨진 능력치와 상세 분석을 확인하세요
          </p>
        </div>

        {/* Before / After Comparison */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Before: grayscale */}
              <div className="text-center">
                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">무료 미리보기</p>
                <div className="opacity-40">
                  <RadarChart
                    categories={GRAY_RADAR}
                    size={140}
                    showLabels={false}
                    grayscale
                    animate={false}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">일부 능력치만 공개</p>
              </div>

              {/* After: full color */}
              <div className="text-center">
                <p className="text-xs font-medium text-primary mb-3 uppercase tracking-wider">전체 해금</p>
                <RadarChart
                  categories={COLOR_RADAR}
                  size={140}
                  showLabels={false}
                  animate
                />
                <p className="text-xs text-primary mt-2 font-medium">30개 능력치 완전 공개</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main CTA — Pro plan */}
        <Card className="mb-6 border-primary ring-2 ring-primary/20">
          <CardHeader className="text-center pb-3">
            <div className="inline-flex mx-auto mb-2">
              <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                추천
              </span>
            </div>
            <CardTitle className="text-xl">{PLANS[1].name}</CardTitle>
            <CardDescription className="text-3xl font-bold text-foreground stat-num">
              {PLANS[1].priceLabel}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              {PLANS[1].features.map((feature) => (
                <li key={feature} className="text-sm flex items-start gap-2">
                  <svg className="w-4 h-4 text-primary mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            {!isAuthenticated && (
              <p className="text-sm text-muted-foreground mb-4 text-center">
                결제하려면 먼저{' '}
                <Link href={`/login?redirect=${encodeURIComponent('/checkout?plan=pro')}`} className="text-primary hover:underline">
                  로그인
                </Link>이 필요합니다
              </p>
            )}

            {error && (
              <p className="text-sm text-destructive mb-4 text-center">{error}</p>
            )}

            <Button
              block
              size="lg"
              onClick={() => {
                setSelectedPlan('pro');
                handlePayment();
              }}
              disabled={loading}
            >
              {loading && selectedPlan === 'pro'
                ? '결제 준비 중'
                : `전체 분석 열기 · ${PLANS[1].priceLabel}`}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-3">
              결제는 토스페이먼츠를 통해 안전하게 처리됩니다
            </p>
          </CardContent>
        </Card>

        {/* Other plans — collapsed */}
        <div className="text-center mb-8">
          <button
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mx-auto"
            onClick={() => setShowOtherPlans(!showOtherPlans)}
          >
            다른 플랜 보기
            <svg
              className={`w-4 h-4 transition-transform ${showOtherPlans ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showOtherPlans && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {PLANS.filter((p) => p.id !== 'pro').map((p) => (
                <Card
                  key={p.id}
                  className={`cursor-pointer transition-all ${
                    selectedPlan === p.id
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedPlan(p.id)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      {p.name}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan === p.id ? 'border-primary' : 'border-muted-foreground/30'
                      }`}>
                        {selectedPlan === p.id && (
                          <div className="w-3 h-3 rounded-full bg-primary" />
                        )}
                      </div>
                    </CardTitle>
                    <CardDescription className="text-xl font-bold text-foreground stat-num">
                      {p.priceLabel}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1.5">
                      {p.features.map((feature) => (
                        <li key={feature} className="text-xs flex items-start gap-1.5">
                          <svg className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}

              {/* Payment button for selected non-pro plan */}
              {selectedPlan !== 'pro' && (
                <div className="sm:col-span-2">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePayment}
                    disabled={loading}
                  >
                    {loading ? '결제 준비 중...' : `${plan.priceLabel} 결제하기`}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

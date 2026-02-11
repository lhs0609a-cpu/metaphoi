'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/auth';
import { api } from '@/lib/api';

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
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
    name: 'Pro',
    price: 29900,
    priceLabel: '29,900원',
    recommended: true,
    features: [
      'Basic 포함 전체',
      'MBTI x DISC 교차 분석',
      '맞춤 직업 추천 TOP 10',
      '커리어 로드맵',
      'PDF 내보내기',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 59900,
    priceLabel: '59,900원',
    features: [
      'Pro 포함 전체',
      '성장 로드맵 & 액션플랜',
      '사주 + 사상체질 종합 해석',
      'AI 맞춤 인사이트',
      '기업용 리포트 생성',
    ],
  },
];

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
      router.push('/login');
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

      // 토스페이먼츠 SDK 호출
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
        // SDK 미로드 시 직접 결제 처리 (개발 환경)
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
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* 토스페이먼츠 SDK */}
      <script src="https://js.tosspayments.com/v1/payment" />

      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">Metaphoi</Link>
          <Link href="/results/preview">
            <Button variant="ghost" size="sm">결과로 돌아가기</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">종합 분석 리포트 구매</h1>
          <p className="text-muted-foreground">
            7가지 검사의 심층 분석과 맞춤 인사이트를 확인하세요
          </p>
        </div>

        {/* 플랜 선택 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {PLANS.map((p) => (
            <Card
              key={p.id}
              className={`cursor-pointer transition-all ${
                selectedPlan === p.id
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'hover:border-primary/50'
              } ${p.recommended ? 'relative' : ''}`}
              onClick={() => setSelectedPlan(p.id)}
            >
              {p.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    추천
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {p.name}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === p.id ? 'border-primary' : 'border-muted-foreground/30'
                  }`}>
                    {selectedPlan === p.id && (
                      <div className="w-3 h-3 rounded-full bg-primary" />
                    )}
                  </div>
                </CardTitle>
                <CardDescription className="text-2xl font-bold text-foreground">
                  {p.priceLabel}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {p.features.map((feature) => (
                    <li key={feature} className="text-sm flex items-start gap-2">
                      <svg className="w-4 h-4 text-primary mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 결제 버튼 */}
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground">선택한 플랜</span>
                <span className="font-bold">{plan.name} - {plan.priceLabel}</span>
              </div>

              {!isAuthenticated && (
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  결제하려면 먼저{' '}
                  <Link href="/login" className="text-primary hover:underline">로그인</Link>이 필요합니다
                </p>
              )}

              {error && (
                <p className="text-sm text-destructive mb-4 text-center">{error}</p>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? '결제 준비 중...' : `${plan.priceLabel} 결제하기`}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-3">
                결제는 토스페이먼츠를 통해 안전하게 처리됩니다
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
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

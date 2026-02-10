'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { getTestMeta } from '@/data/tests';

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9900,
    features: ['30개 능력치 점수', '레이더 차트', '검사별 결과 요약'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29900,
    features: ['Basic 전체 포함', '상세 분석', '직업 추천', 'PDF 내보내기'],
    recommended: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 59900,
    features: ['Pro 전체 포함', '성장 로드맵', 'AI 1:1 상담'],
  },
];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const testCode = searchParams.get('testCode');
  const { token, isAuthenticated } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const testMeta = testCode ? getTestMeta(testCode) : null;

  const handlePayment = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/checkout${testCode ? `?testCode=${testCode}` : ''}`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/payments/prepare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          report_type: selectedPlan,
        }),
      });

      if (response.ok) {
        const paymentData = await response.json();
        router.push(`/payment/success?orderId=${paymentData.order_id}${testCode ? `&testCode=${testCode}` : ''}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const plan = PLANS.find((p) => p.id === selectedPlan);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">
            Metaphoi
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 검사 컨텍스트 메시지 */}
        {testMeta && (
          <div className="text-center mb-6 p-4 bg-primary/5 rounded-lg">
            <p className="text-lg font-medium">
              {testMeta.name} 전체 분석을 잠금 해제하세요
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              상세 성격 분석, 강점/약점, 직업 추천 등 전체 결과를 확인할 수 있습니다
            </p>
          </div>
        )}

        <h1 className="text-3xl font-bold mb-8 text-center">
          {testMeta ? '전체 결과 잠금 해제' : '리포트 구매'}
        </h1>

        {/* 비로그인 안내 */}
        {!isAuthenticated && (
          <Card className="mb-8 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="text-sm font-medium">결제하려면 로그인이 필요합니다</p>
                  <p className="text-xs text-muted-foreground">결제 버튼을 누르면 로그인 페이지로 이동합니다. 결과는 계정에 영구 저장됩니다.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plan Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {PLANS.map((planItem) => (
            <Card
              key={planItem.id}
              className={`cursor-pointer transition-all ${
                selectedPlan === planItem.id
                  ? 'border-primary ring-2 ring-primary'
                  : 'hover:border-primary/50'
              } ${planItem.recommended ? 'md:-mt-2 md:mb-2' : ''}`}
              onClick={() => setSelectedPlan(planItem.id)}
            >
              <CardHeader>
                {planItem.recommended && (
                  <span className="text-xs font-semibold text-primary uppercase">
                    추천
                  </span>
                )}
                <CardTitle>{planItem.name}</CardTitle>
                <CardDescription className="text-2xl font-bold text-foreground">
                  {planItem.price.toLocaleString()}원
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {planItem.features.map((feature) => (
                    <li key={feature} className="text-sm flex items-center">
                      <svg
                        className="w-4 h-4 mr-2 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>주문 요약</CardTitle>
          </CardHeader>
          <CardContent>
            {testMeta && (
              <div className="flex justify-between items-center py-2 border-b text-sm text-muted-foreground">
                <span>검사</span>
                <span>{testMeta.name}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 border-b">
              <span>{plan?.name} 리포트</span>
              <span>{plan?.price.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between items-center py-2 font-bold text-lg">
              <span>총 결제 금액</span>
              <span className="text-primary">{plan?.price.toLocaleString()}원</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Button */}
        <div className="text-center">
          <Button
            size="lg"
            className="w-full max-w-md"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? '처리 중...' : `${plan?.price.toLocaleString()}원 결제하기`}
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            결제 시 <Link href="#" className="underline">이용약관</Link> 및{' '}
            <Link href="#" className="underline">개인정보처리방침</Link>에 동의하게 됩니다.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

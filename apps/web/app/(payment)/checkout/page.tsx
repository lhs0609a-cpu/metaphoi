'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';

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

export default function CheckoutPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const handlePayment = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      // Prepare payment with backend
      const response = await fetch(`${API_URL}/api/payments/prepare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          report_type: selectedPlan,
          success_url: `${window.location.origin}/success`,
          fail_url: `${window.location.origin}/checkout?error=true`,
        }),
      });

      if (!response.ok) {
        throw new Error('결제 준비에 실패했습니다.');
      }

      const paymentData = await response.json();

      // Check if Toss Payments SDK is available
      const tossClientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

      if (tossClientKey && typeof window !== 'undefined' && (window as any).TossPayments) {
        // Use Toss Payments SDK
        const tossPayments = (window as any).TossPayments(tossClientKey);
        await tossPayments.requestPayment('카드', {
          amount: paymentData.amount,
          orderId: paymentData.order_id,
          orderName: paymentData.order_name,
          successUrl: paymentData.success_url,
          failUrl: paymentData.fail_url,
        });
      } else {
        // Development mode - simulate success
        console.log('Payment prepared (dev mode):', paymentData);
        router.push(`/success?orderId=${paymentData.order_id}&paymentKey=dev_${Date.now()}&amount=${paymentData.amount}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert(error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const plan = PLANS.find((p) => p.id === selectedPlan);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-primary">
            Metaphoi
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center">리포트 구매</h1>

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

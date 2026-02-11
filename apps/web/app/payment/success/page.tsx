'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    if (!paymentKey || !orderId || !amount) {
      setStatus('error');
      setError('결제 정보가 올바르지 않습니다.');
      return;
    }

    api.payments
      .confirm({
        paymentKey,
        orderId,
        amount: Number(amount),
      })
      .then((res) => {
        if (res.error) {
          setStatus('error');
          setError(res.error);
        } else {
          setStatus('success');
        }
      });
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-md">
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            {status === 'loading' && (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">결제 확인 중...</h2>
                <p className="text-muted-foreground">잠시만 기다려주세요</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold mb-2">결제 완료!</h2>
                <p className="text-muted-foreground mb-6">
                  종합 분석 리포트가 잠금 해제되었습니다
                </p>
                <div className="flex flex-col gap-3">
                  <Link href="/results/preview">
                    <Button className="w-full" size="lg">전체 분석 결과 보기</Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full">대시보드로</Button>
                  </Link>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold mb-2">결제 실패</h2>
                <p className="text-muted-foreground mb-6">{error}</p>
                <div className="flex flex-col gap-3">
                  <Link href="/checkout">
                    <Button className="w-full">다시 시도하기</Button>
                  </Link>
                  <Link href="/results/preview">
                    <Button variant="outline" className="w-full">결과 페이지로</Button>
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}

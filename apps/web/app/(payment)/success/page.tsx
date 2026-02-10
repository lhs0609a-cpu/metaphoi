'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getTestMeta } from '@/data/tests';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const testCode = searchParams.get('testCode');
  const [loading, setLoading] = useState(true);

  const testMeta = testCode ? getTestMeta(testCode) : null;

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">결제를 확인하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
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
          </div>
          <CardTitle className="text-2xl">결제 완료</CardTitle>
          <CardDescription>
            {testMeta
              ? `${testMeta.name} 전체 분석이 잠금 해제되었습니다`
              : '리포트 구매가 완료되었습니다'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">주문번호</p>
            <p className="font-mono">{orderId}</p>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            리포트는 즉시 확인하실 수 있습니다.
          </p>

          <div className="flex flex-col gap-2">
            {testCode && (
              <Link href={`/results/${testCode}/preview`}>
                <Button className="w-full">
                  {testMeta?.name || testCode.toUpperCase()} 전체 결과 보기
                </Button>
              </Link>
            )}
            <Link href="/results/reports">
              <Button variant={testCode ? 'outline' : 'default'} className="w-full">
                리포트 보기
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                대시보드로 돌아가기
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}

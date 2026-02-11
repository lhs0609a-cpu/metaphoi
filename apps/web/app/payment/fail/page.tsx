'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const message = searchParams.get('message');

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-md">
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">결제가 취소되었습니다</h2>
            <p className="text-muted-foreground mb-2">
              {message || '결제를 진행하지 않았습니다.'}
            </p>
            {code && (
              <p className="text-xs text-muted-foreground mb-6">오류 코드: {code}</p>
            )}
            <div className="flex flex-col gap-3">
              <Link href="/checkout">
                <Button className="w-full">다시 시도하기</Button>
              </Link>
              <Link href="/results/preview">
                <Button variant="outline" className="w-full">결과 페이지로</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    }>
      <PaymentFailContent />
    </Suspense>
  );
}

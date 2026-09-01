'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import { Outcome } from '@/components/ui/outcome';
import { PageLoading } from '@/components/ui/states';

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const message = searchParams.get('message');

  return (
    <div className="shell max-w-[34rem] py-16 lg:py-24">
      <Outcome
        tone="warn"
        title="결제가 취소됐습니다"
        description={message || '결제를 진행하지 않았습니다. 결과는 그대로 남아 있습니다.'}
        detail={code ? `오류 코드 ${code}` : null}
        actions={[
          { label: '다시 시도하기', href: '/checkout' },
          { label: '결과로 돌아가기', href: '/results/preview', variant: 'outline' },
        ]}
      />
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<PageLoading label="불러오는 중" />}>
      <PaymentFailContent />
    </Suspense>
  );
}

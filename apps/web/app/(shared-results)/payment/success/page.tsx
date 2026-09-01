'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import { Outcome } from '@/components/ui/outcome';
import { PageLoading } from '@/components/ui/states';
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
    <div className="shell max-w-[34rem] py-16 lg:py-24">
      {status === 'loading' ? (
        <PageLoading label="결제를 확인하는 중" />
      ) : status === 'success' ? (
        <Outcome
          tone="ok"
          title="결제가 완료됐습니다"
          description="전체 분석이 열렸습니다. 결과를 보고 나면 채용 프로필을 만들어 기업 제안을 받아볼 수 있습니다."
          actions={[
            { label: '전체 결과 보기', href: '/results/preview' },
            { label: '대시보드로', href: '/dashboard', variant: 'outline' },
          ]}
        />
      ) : (
        <Outcome
          tone="danger"
          title="결제를 확인하지 못했습니다"
          description={error || '결제 정보가 올바르지 않습니다.'}
          actions={[
            { label: '다시 시도하기', href: '/checkout' },
            { label: '결과로 돌아가기', href: '/results/preview', variant: 'outline' },
          ]}
        />
      )}
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PageLoading label="불러오는 중" />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}

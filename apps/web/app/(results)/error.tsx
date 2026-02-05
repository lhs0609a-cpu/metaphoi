'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ResultsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Results error:', error);
  }, [error]);

  return (
    <div className="container mx-auto max-w-lg px-4 py-16">
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold">결과를 불러올 수 없습니다</h2>
        <p className="mb-6 text-muted-foreground">
          결과 데이터를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={() => reset()}>다시 시도</Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">대시보드로</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

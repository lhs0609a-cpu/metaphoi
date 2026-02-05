'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TestError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Test error:', error);
  }, [error]);

  return (
    <div className="container mx-auto max-w-lg px-4 py-16">
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold">검사 중 오류가 발생했습니다</h2>
        <p className="mb-6 text-muted-foreground">
          검사를 불러오는 중 문제가 발생했습니다. 다시 시도하거나 다른 검사를 선택해주세요.
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

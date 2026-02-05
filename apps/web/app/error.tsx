'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h2 className="mb-4 text-2xl font-bold">문제가 발생했습니다</h2>
        <p className="mb-6 text-muted-foreground">
          예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={() => reset()}>다시 시도</Button>
          <Button variant="outline" onClick={() => (window.location.href = '/')}>
            홈으로
          </Button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <pre className="mt-8 overflow-auto rounded bg-muted p-4 text-left text-xs">
            {error.message}
          </pre>
        )}
      </div>
    </div>
  );
}

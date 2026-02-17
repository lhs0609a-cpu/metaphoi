'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export function useSocialProof() {
  const [count, setCount] = useState<string | null>(null);

  useEffect(() => {
    api.results.getCompletionCount().then((res) => {
      if (res.data) {
        const n = (res.data as any).count as number;
        setCount(n.toLocaleString('ko-KR'));
      }
    }).catch(() => {});
  }, []);

  return count;
}

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface MilestoneFeedbackProps {
  message: string;
  progress: number;
  onContinue: () => void;
}

export function MilestoneFeedback({ message, progress, onContinue }: MilestoneFeedbackProps) {
  const [autoClose, setAutoClose] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAutoClose(true);
      onContinue();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onContinue]);

  if (autoClose) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
      <div className="animate-fade-in-up mx-4 w-full max-w-sm rounded-2xl border bg-card p-8 shadow-lg text-center">
        <div className="text-4xl mb-4">🎯</div>
        <p className="text-lg font-semibold mb-3">{message}</p>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground mb-5">{progress}% 완료</p>
        <Button onClick={onContinue} className="w-full">
          계속하기
        </Button>
      </div>
    </div>
  );
}

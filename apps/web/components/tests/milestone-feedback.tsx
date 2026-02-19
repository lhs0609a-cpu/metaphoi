'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { type TestType, getTestTypeInfoByType } from '@/lib/question-utils';

interface MilestoneFeedbackProps {
  message: string;
  progress: number;
  testCompleted?: TestType;
  testsRemaining?: number;
  onContinue: () => void;
}

export function MilestoneFeedback({
  message,
  progress,
  testCompleted,
  testsRemaining,
  onContinue,
}: MilestoneFeedbackProps) {
  const [autoClose, setAutoClose] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAutoClose(true);
      onContinue();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onContinue]);

  if (autoClose) return null;

  const typeInfo = testCompleted ? getTestTypeInfoByType(testCompleted) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
      <div className="animate-rank-reveal mx-4 w-full max-w-sm rounded-2xl border bg-card p-8 shadow-lg text-center">
        {/* Icon */}
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 ${
          typeInfo ? `${typeInfo.bgClass}` : 'bg-primary/10'
        }`}>
          {testCompleted ? (
            <svg className={`w-7 h-7 ${typeInfo?.textClass ?? 'text-primary'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          ) : (
            <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          )}
        </div>

        {testCompleted && (
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Level Up!
          </p>
        )}
        <p className="text-lg font-semibold mb-3">{message}</p>

        {/* Progress bar */}
        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              typeInfo
                ? `bg-gradient-to-r ${typeInfo.bgClass.replace('bg-', 'from-').replace('/30', '')} to-primary`
                : 'bg-primary'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground mb-5 font-mono-stat">
          {progress}% 완료
          {testsRemaining != null && testsRemaining > 0 && (
            <span className="ml-2">
              | {5 - testsRemaining}/5 검사 통과
            </span>
          )}
        </p>

        <Button onClick={onContinue} className="w-full">
          계속하기
        </Button>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { type TestType } from '@/lib/question-utils';

interface MilestoneFeedbackProps {
  message: string;
  progress: number;
  testCompleted?: TestType;
  testsRemaining?: number;
  onContinue: () => void;
}

/**
 * 구간을 통과할 때 잠깐 뜨는 알림.
 *
 * "Level Up!" 같은 말과 트로피 아이콘을 쓰지 않는다. 여기서 하려는 일은
 * 축하가 아니라 "얼마나 왔는지" 알려주고 흐름을 끊지 않는 것이다.
 * 2.5초 뒤 저절로 닫히므로 읽을 것은 한 줄이면 충분하다.
 */
export function MilestoneFeedback({
  message,
  progress,
  testCompleted,
  testsRemaining,
  onContinue,
}: MilestoneFeedbackProps) {
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setClosed(true);
      onContinue();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onContinue]);

  if (closed) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/20 p-4 backdrop-blur-[2px] sm:items-center"
      role="status"
      aria-live="polite"
    >
      <div className="anim-rise w-full max-w-sm rounded-card border border-border bg-card p-6 shadow-e3">
        {testCompleted ? <p className="eyebrow">검사 하나 통과</p> : <p className="eyebrow">진행 상황</p>}

        <p className="mt-2 text-h4">{message}</p>

        <div className="sunk mt-5 h-1.5 overflow-hidden">
          <div
            className="h-full rounded-pill bg-action transition-[width] duration-std ease-std"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-2 text-tiny text-muted-foreground">
          <span className="stat-num" data-numeric>
            {progress}%
          </span>{' '}
          완료
          {testsRemaining != null && testsRemaining > 0 && (
            <> · 검사 {5 - testsRemaining} / 5 통과</>
          )}
        </p>

        <Button block className="mt-5" onClick={onContinue}>
          계속하기
        </Button>
      </div>
    </div>
  );
}

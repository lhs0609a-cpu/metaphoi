'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface PaywallOverlayProps {
  testCode: string;
  children: React.ReactNode;
  /** 실제 해금 인원. 값을 못 받았으면 아무 말도 하지 않는다 */
  socialCount?: string | null;
}

/**
 * 결제 유도 영역.
 *
 * 잠긴 내용 위에 반투명 막을 덮어 "거의 보이는" 상태로 두지 않는다.
 * 무엇이 잠겨 있는지는 아래 목록이 글자로 말하고, 결정에 필요한 것
 * (무엇을 받고, 얼마인지)만 위에 둔다.
 */
export function PaywallOverlay({ testCode, children, socialCount }: PaywallOverlayProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-card bg-action px-6 py-7 text-action-foreground sm:px-8">
        <p className="text-h3">전체 분석 열기</p>
        <p className="mt-2 max-w-[42ch] text-body text-action-foreground/70">
          능력치 30개 전부와 유형별 상세 해석, 직업 추천까지. 한 번 결제하면 계속 볼 수 있습니다.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild size="lg" className="bg-action-foreground text-action hover:opacity-90">
            <Link href={`/checkout?testCode=${testCode}`}>9,900원부터 · 전체 분석 열기</Link>
          </Button>
          {socialCount ? (
            <p className="text-small text-action-foreground/60">
              지금까지 {socialCount}명이 열었습니다
            </p>
          ) : null}
        </div>
      </div>

      {children}
    </div>
  );
}

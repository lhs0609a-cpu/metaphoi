'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface PaywallOverlayProps {
  testCode: string;
  children: React.ReactNode;
}

export function PaywallOverlay({ testCode, children }: PaywallOverlayProps) {
  return (
    <div className="relative">
      {/* 블러 처리된 콘텐츠 */}
      <div className="select-none pointer-events-none" aria-hidden="true">
        {children}
      </div>

      {/* 오버레이 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-background via-background/80 to-transparent backdrop-blur-sm rounded-lg">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">전체 결과를 확인하세요</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            상세 성격 분석, 강점/약점, 직업 추천 등 전체 분석 결과를 확인할 수 있습니다.
          </p>
          <div className="flex flex-col gap-3">
            <Link href={`/checkout?testCode=${testCode}`}>
              <Button size="lg" className="w-full">
                전체 결과 보기 - 9,900원부터
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" size="sm" className="w-full">
                계정 만들기 (결과 영구 저장)
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

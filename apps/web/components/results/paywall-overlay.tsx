'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RadarChart } from './radar-chart';
import { CATEGORY_COLORS } from '@/lib/design-tokens';

interface PaywallOverlayProps {
  testCode: string;
  children: React.ReactNode;
  socialCount?: string | null;
}

const SILHOUETTE_DATA = Object.values(CATEGORY_COLORS).map((c) => ({
  name: '',
  score: 55 + Math.random() * 30,
  color: `hsl(${c.hsl})`,
}));

export function PaywallOverlay({ testCode, children, socialCount }: PaywallOverlayProps) {
  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="select-none pointer-events-none" aria-hidden="true">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-background via-background/90 to-transparent backdrop-blur-sm rounded-lg">
        <div className="text-center p-8 max-w-md">
          {/* Mini radar silhouette */}
          <div className="opacity-30 mb-4">
            <RadarChart
              categories={SILHOUETTE_DATA}
              size={120}
              showLabels={false}
              grayscale
              animate={false}
            />
          </div>

          {/* Shield icon */}
          <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          <h3 className="text-xl font-bold mb-2">전체 캐릭터 시트 잠금 해제</h3>
          <div className="space-y-1.5 mb-4">
            <p className="text-sm text-muted-foreground">
              30가지 능력치의 완전한 분석과 레이더 차트
            </p>
            <p className="text-sm text-muted-foreground">
              숨겨진 강점과 성장 포인트를 확인하세요
            </p>
          </div>

          <p className="text-xs text-muted-foreground mb-5">
            지금까지 {socialCount ?? '12,847'}명이 전체 시트를 해금했습니다
          </p>

          <Link href={`/checkout?testCode=${testCode}`}>
            <Button
              size="lg"
              className="w-full relative overflow-hidden"
            >
              <span className="relative z-10">전체 캐릭터 시트 해금 - 9,900원~</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer bg-[length:200%_100%]" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

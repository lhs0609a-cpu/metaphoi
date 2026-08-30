'use client';

import { cn } from '@/lib/utils';

interface TypeBadgeCardProps {
  label: string;
  value: string;
  sub?: string;
  /** 잠긴 항목이면 유형 이름을 가린다 */
  isPaid?: boolean;
  className?: string;
}

/**
 * 검사 유형 한 칸 (MBTI, DISC…).
 *
 * 검사마다 다른 색을 주지 않는다. 일곱 칸이 일곱 색이면 어느 유형이
 * 무엇인지가 아니라 색이 몇 개인지만 남는다. 값은 타이포로 세운다.
 */
export function TypeBadgeCard({ label, value, sub, isPaid, className }: TypeBadgeCardProps) {
  return (
    <div className={cn('flex flex-col gap-1 rounded-card bg-sunk px-4 py-3.5', className)}>
      <p className="text-micro text-muted-foreground">{label}</p>
      <p className="stat-num text-h4 leading-none">{value}</p>
      {sub ? (
        isPaid ? (
          <p className="truncate text-micro text-muted-foreground">{sub}</p>
        ) : (
          <p className="text-micro text-muted-foreground/60">전체 분석에서 공개</p>
        )
      ) : null}
    </div>
  );
}

'use client';

import { TEST_TYPE_COLORS, type TestType } from '@/lib/design-tokens';

interface TypeBadgeCardProps {
  label: string;
  value: string;
  sub?: string;
  testType?: TestType;
  isPaid?: boolean;
  animate?: boolean;
}

export function TypeBadgeCard({
  label,
  value,
  sub,
  testType,
  isPaid,
  animate = true,
}: TypeBadgeCardProps) {
  const colors = testType ? TEST_TYPE_COLORS[testType] : null;

  return (
    <div
      className={`
        text-center p-4 rounded-xl
        ${colors ? `${colors.bgClass} border-t-2 ${colors.borderClass}` : 'bg-muted/50'}
        ${animate ? 'animate-fade-in-up' : ''}
      `}
    >
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl stat-num font-bold ${colors?.textClass ?? 'text-primary'}`}>
        {value}
      </p>
      {sub && (
        <p
          className={`text-xs text-muted-foreground mt-1 ${!isPaid ? 'blur-[3px] select-none' : ''}`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

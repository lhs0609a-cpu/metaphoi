'use client';

import { getRank, RANK_CONFIG } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

interface RankBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

const SIZE = {
  sm: 'h-6 w-6 text-tiny',
  md: 'h-8 w-8 text-small',
  lg: 'h-11 w-11 text-h4',
} as const;

/**
 * 랭크 한 글자. 테두리를 두르지 않고 옅은 배경 위에 글자만 둔다 —
 * 목록에 스무 개가 늘어설 때 테두리가 있으면 격자가 먼저 보인다.
 */
export function RankBadge({ score, size = 'md', animate = true }: RankBadgeProps) {
  const cfg = RANK_CONFIG[getRank(score)];

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-control stat-num',
        SIZE[size],
        cfg.twBg,
        cfg.twColor,
        animate && 'anim-pop'
      )}
      aria-label={`랭크 ${cfg.label}`}
    >
      {cfg.label}
    </span>
  );
}

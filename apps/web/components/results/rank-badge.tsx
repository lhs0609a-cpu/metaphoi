'use client';

import { getRank, RANK_CONFIG } from '@/lib/design-tokens';

interface RankBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

const SIZE_MAP = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-lg',
};

export function RankBadge({ score, size = 'md', animate = true }: RankBadgeProps) {
  const rank = getRank(score);
  const cfg = RANK_CONFIG[rank];

  return (
    <div
      className={`
        ${SIZE_MAP[size]}
        ${cfg.twBg} ${cfg.twColor} ${cfg.twBorder}
        inline-flex items-center justify-center
        rounded-lg border-2 stat-num font-black
        ${animate ? 'animate-rank-reveal' : ''}
      `}
    >
      {cfg.label}
    </div>
  );
}

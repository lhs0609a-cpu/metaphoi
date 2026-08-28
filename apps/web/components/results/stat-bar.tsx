'use client';

import { getCategoryColor, getRank, RANK_CONFIG, type AbilityCategory } from '@/lib/design-tokens';
import { useInView } from '@/hooks/use-in-view';
import { useCountUp } from '@/hooks/use-count-up';

interface StatBarProps {
  label: string;
  score: number;
  maxScore?: number;
  color?: string;
  category?: string;
  rank?: number;
  animated?: boolean;
  delay?: number;
}

export function StatBar({
  label,
  score,
  maxScore = 100,
  color,
  category,
  rank,
  animated = true,
  delay = 0,
}: StatBarProps) {
  const [ref, isInView] = useInView({ threshold: 0.2 });
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const displayValue = useCountUp(score, 800, animated ? isInView : true);

  const catColor = category ? getCategoryColor(category) : null;
  const barColorStyle = color || (catColor ? `hsl(${catColor.hsl})` : undefined);
  const scoreRank = getRank(score);
  const rankCfg = RANK_CONFIG[scoreRank];

  return (
    <div
      ref={ref}
      className="flex items-center gap-3"
      style={{ animationDelay: `${delay}ms` }}
    >
      {rank != null && (
        <span className={`stat-num text-xs font-bold w-5 ${rankCfg.twColor}`}>
          {rank}
        </span>
      )}
      <span className="text-sm font-medium w-24 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${animated && isInView ? 'animate-bar-fill' : ''}`}
          style={{
            width: animated && !isInView ? '0%' : `${pct}%`,
            '--bar-width': `${pct}%`,
            backgroundColor: barColorStyle,
            animationDelay: `${delay}ms`,
          } as React.CSSProperties}
        />
      </div>
      <span className={`stat-num text-sm font-bold w-8 text-right ${rankCfg.twColor}`}>
        {animated ? displayValue : score}
      </span>
    </div>
  );
}

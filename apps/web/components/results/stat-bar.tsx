'use client';

import { getCategoryColor, getRank, RANK_CONFIG } from '@/lib/design-tokens';
import { useInView } from '@/hooks/use-in-view';
import { useCountUp } from '@/hooks/use-count-up';
import { cn } from '@/lib/utils';

interface StatBarProps {
  label: string;
  score: number;
  maxScore?: number;
  /** 막대 색을 직접 지정. 오행처럼 카테고리 밖 데이터에 쓴다 */
  color?: string;
  category?: string;
  /** 순위 번호. 상위 능력치 목록에서만 */
  rank?: number;
  animated?: boolean;
  delay?: number;
  className?: string;
}

/**
 * 능력치 한 줄.
 *
 * 숫자는 랭크 색으로 칠하지 않는다. 78이라는 값 자체가 이미 정보이고,
 * 거기에 색까지 얹으면 한 줄에 색이 둘(막대·숫자)이 되어 시끄러워진다.
 * 색은 막대 하나가 카테고리를 나타내는 데만 쓴다.
 */
export function StatBar({
  label,
  score,
  maxScore = 100,
  color,
  category,
  rank,
  animated = true,
  delay = 0,
  className,
}: StatBarProps) {
  const [ref, isInView] = useInView({ threshold: 0.2 });
  const pct = maxScore > 0 ? Math.max(0, Math.min(100, (score / maxScore) * 100)) : 0;
  const displayValue = useCountUp(score, 800, animated ? isInView : true);

  const catColor = category ? getCategoryColor(category) : null;
  const barColor = color || (catColor ? `hsl(${catColor.hsl})` : 'hsl(var(--primary))');

  return (
    <div ref={ref} className={cn('flex items-center gap-3', className)}>
      {rank != null && (
        <span className="stat-num w-4 shrink-0 text-tiny text-muted-foreground">{rank}</span>
      )}

      <span className="w-24 shrink-0 truncate text-small">{label}</span>

      <span className="sunk h-1.5 min-w-[4rem] flex-1 overflow-hidden">
        <span
          className={cn('block h-full rounded-pill', animated && isInView && 'anim-bar')}
          style={
            {
              width: animated && !isInView ? '0%' : `${pct}%`,
              '--bar-width': `${pct}%`,
              backgroundColor: barColor,
              animationDelay: `${delay}ms`,
            } as React.CSSProperties
          }
        />
      </span>

      <span className="stat-num w-8 shrink-0 text-right text-small" data-numeric>
        {animated ? displayValue : score}
      </span>
    </div>
  );
}

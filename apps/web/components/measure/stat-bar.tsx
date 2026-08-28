import { cn } from '@/lib/utils';
import { getCategoryColor } from '@/lib/design-tokens';

interface StatBarCompactProps {
  name: string;
  /** 0–100. 규준이 없을 때는 백분위가 아니라 내부 상대 점수다 */
  percentile: number;
  /** 능력 카테고리. 막대 색이 레이더 차트 축 색과 같아진다 */
  category?: string;
  className?: string;
}

/**
 * 목록·프로필에 줄줄이 들어가는 얇은 능력치 막대.
 * 폭은 --bar-width로 넘기고 애니메이션은 .anim-bar가 맡는다.
 * ops 모드에서는 --motion-scale이 작아 거의 즉시 차오른다.
 */
export function StatBarCompact({ name, percentile, category, className }: StatBarCompactProps) {
  const value = Math.max(0, Math.min(100, Math.round(percentile)));
  const color = category ? `hsl(${getCategoryColor(category).hsl})` : 'hsl(var(--primary))';

  return (
    // py-1: 부르는 쪽이 gap을 주지 않고 그냥 쌓아도 줄 간격이 생기도록
    <div className={cn('flex flex-col gap-1 py-1', className)}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate text-tiny text-foreground">{name}</span>
        <span className="stat-num shrink-0 text-tiny text-muted-foreground" data-numeric>
          {value}
        </span>
      </div>

      <div
        className="sunk h-1.5 w-full overflow-hidden"
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={name}
      >
        <span
          className="anim-bar block h-full rounded-pill"
          style={
            {
              '--bar-width': `${value}%`,
              width: `${value}%`,
              backgroundColor: color,
            } as React.CSSProperties
          }
        />
      </div>
    </div>
  );
}

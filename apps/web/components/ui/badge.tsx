import { cn } from '@/lib/utils';
import { getCategoryColor } from '@/lib/design-tokens';

export type BadgeTone =
  | 'neutral'
  | 'signal'
  | 'ok'
  | 'warn'
  | 'danger'
  | 'info'
  | 'outline';

const TONE: Record<BadgeTone, string> = {
  neutral: 'bg-secondary text-secondary-foreground border-transparent',
  signal: 'bg-accent text-accent-foreground border-primary/20',
  ok: 'bg-ok-soft text-ok border-ok/25',
  warn: 'bg-warn-soft text-warn border-warn/25',
  danger: 'bg-danger-soft text-danger border-danger/25',
  info: 'bg-info-soft text-info border-info/25',
  outline: 'bg-transparent text-muted-foreground border-border-strong',
};

/** 점 색은 배경이 아니라 글자색을 따라간다 — 배지 하나에 색이 둘이면 시끄럽다 */
const DOT: Record<BadgeTone, string> = {
  neutral: 'bg-muted-foreground',
  signal: 'bg-primary',
  ok: 'bg-ok',
  warn: 'bg-warn',
  danger: 'bg-danger',
  info: 'bg-info',
  outline: 'bg-muted-foreground',
};

const SIZE = {
  sm: 'text-micro px-2 py-0.5 gap-1',
  md: 'text-tiny px-2.5 py-1 gap-1.5',
} as const;

interface BadgeProps {
  tone?: BadgeTone;
  size?: keyof typeof SIZE;
  /** 앞에 상태 점을 찍는다. 진행 중/모집 중처럼 살아 있는 상태에만 */
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Badge({ tone = 'neutral', size = 'sm', dot, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-pill border font-semibold',
        TONE[tone],
        SIZE[size],
        className
      )}
    >
      {dot ? (
        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', DOT[tone])} aria-hidden="true" />
      ) : null}
      {children}
    </span>
  );
}

interface CategoryChipProps {
  /** 능력 카테고리 이름. 레이더 차트 축 라벨과 같은 문자열 */
  category: string;
  className?: string;
}

/**
 * 카테고리 칩 — 색은 design-tokens의 5색과 1:1. 레이더 차트 범례로 쓴다.
 */
export function CategoryChip({ category, className }: CategoryChipProps) {
  const color = getCategoryColor(category);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill border px-2 py-0.5 text-micro font-semibold',
        className
      )}
      style={{
        color: `hsl(${color.hsl})`,
        borderColor: `hsl(${color.hsl} / 0.3)`,
        backgroundColor: `hsl(${color.hsl} / 0.1)`,
      }}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: `hsl(${color.hsl})` }}
        aria-hidden="true"
      />
      {category}
    </span>
  );
}

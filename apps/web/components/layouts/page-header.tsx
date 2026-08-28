import { cn } from '@/lib/utils';

interface PageHeaderProps {
  /** 제목 위 작은 상위 맥락. 회사명·소속 공고 등 */
  eyebrow?: string | null;
  title: string;
  description?: string | null;
  /** 제목 옆에 붙는 상태 배지 */
  badge?: React.ReactNode;
  /** 오른쪽 정렬 동작 버튼 */
  actions?: React.ReactNode;
  /** 헤더 아래에 붙는 필터·검색 등 부속 UI */
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  badge,
  actions,
  children,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn('mb-6 flex flex-col gap-4', className)}>
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-h2">{title}</h1>
            {badge}
          </div>

          {description ? (
            <p className="max-w-prose text-small leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>

      {children}
    </header>
  );
}

type Tone = 'neutral' | 'ok' | 'warn' | 'danger' | 'info' | 'signal';

const TILE_TONE: Record<Tone, string> = {
  neutral: 'text-foreground',
  ok: 'text-ok',
  warn: 'text-warn',
  danger: 'text-danger',
  info: 'text-info',
  signal: 'text-primary',
};

interface StatTileProps {
  label: string;
  value: number | string;
  /** 값 뒤에 붙는 단위. 값보다 작게, 흐리게 나온다 */
  unit?: string;
  /** 이 숫자가 무엇을 센 것인지 한 줄 */
  hint?: string;
  tone?: Tone;
  className?: string;
}

/**
 * 지표 한 칸. 숫자는 고정폭(.stat-num)이라 값이 바뀌어도 폭이 흔들리지 않는다.
 */
export function StatTile({ label, value, unit, hint, tone = 'neutral', className }: StatTileProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded-card border border-border bg-card px-4 py-3.5 shadow-e1',
        className
      )}
    >
      <p className="eyebrow">{label}</p>

      <p className="flex items-baseline gap-1">
        <span className={cn('stat-num text-h2', TILE_TONE[tone])} data-numeric>
          {value}
        </span>
        {unit ? <span className="text-small text-muted-foreground">{unit}</span> : null}
      </p>

      {hint ? <p className="text-micro text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

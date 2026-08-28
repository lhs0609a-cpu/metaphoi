import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/* -------------------------------------------------------------------------
   로딩
   ------------------------------------------------------------------------- */

interface SkeletonProps {
  className?: string;
}

/** 뼈대 한 조각. 크기는 부르는 쪽이 className으로 정한다 */
export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton', className)} aria-hidden="true" />;
}

interface SkeletonRowsProps {
  rows?: number;
  className?: string;
}

/** 표/리스트 자리. 실제 행 높이(--row-h)를 그대로 써서 로딩 후 점프가 없다 */
export function SkeletonRows({ rows = 5, className }: SkeletonRowsProps) {
  return (
    <div className={cn('flex flex-col', className)} role="status" aria-label="불러오는 중">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-border px-4" style={{ height: 'var(--row-h)' }}>
          <Skeleton className="h-3.5 flex-1" />
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3.5 w-16" />
        </div>
      ))}
      <span className="sr-only">불러오는 중</span>
    </div>
  );
}

interface PageLoadingProps {
  /** 무엇을 기다리는지 말해 준다. 빈 스피너만 도는 화면을 만들지 않는다 */
  label?: string;
  className?: string;
}

export function PageLoading({ label = '불러오는 중', className }: PageLoadingProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3 py-20', className)}
      role="status"
      aria-live="polite"
    >
      <span
        className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary"
        aria-hidden="true"
      />
      <p className="text-small text-muted-foreground">{label}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------
   빈 상태 · 에러
   ------------------------------------------------------------------------- */

interface EmptyAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface EmptyStateProps {
  title: string;
  description?: string;
  /** 24×24 뷰박스 SVG를 기대한다. 없으면 아이콘 자리 자체를 비운다 */
  icon?: React.ReactNode;
  action?: EmptyAction;
  className?: string;
}

/**
 * 비어 있음은 실패가 아니다. 무엇이 없는지와 다음에 뭘 할 수 있는지를 같이 말한다.
 */
export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border px-6 py-14 text-center',
        className
      )}
    >
      {icon ? (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sunk text-muted-foreground">
          {icon}
        </span>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <p className="text-h4">{title}</p>
        {description ? (
          <p className="max-w-[42ch] text-small leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {action ? (
        action.href ? (
          <Button asChild size="sm" variant="outline" className="mt-1">
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="mt-1" onClick={action.onClick}>
            {action.label}
          </Button>
        )
      ) : null}
    </div>
  );
}

interface ErrorStateProps {
  title: string;
  /** 서버가 준 실제 사유. 사용자에게 숨기지 않는다 */
  detail?: string | null;
  action?: EmptyAction;
  className?: string;
}

export function ErrorState({ title, detail, action, className }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-card border border-danger/30 bg-danger-soft px-4 py-3.5',
        className
      )}
    >
      <svg
        className="mt-0.5 h-4 w-4 shrink-0 text-danger"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="6.25" />
        <path d="M8 5v3.5" strokeLinecap="round" />
        <path d="M8 11h.01" strokeLinecap="round" />
      </svg>

      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-small font-semibold text-foreground">{title}</p>
        {detail ? (
          <p className="text-tiny leading-relaxed text-muted-foreground">{detail}</p>
        ) : null}
        {action ? (
          action.href ? (
            <Button asChild size="sm" variant="ghost" className="mt-1 self-start px-0">
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button size="sm" variant="ghost" className="mt-1 self-start px-0" onClick={action.onClick}>
              {action.label}
            </Button>
          )
        ) : null}
      </div>
    </div>
  );
}

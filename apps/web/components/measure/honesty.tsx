import { cn } from '@/lib/utils';

export type NormStatus = 'none' | 'provisional' | 'established';

const COPY: Record<NormStatus, { label: string; title: string }> = {
  none: {
    label: '규준 없음',
    title:
      '규준 표본이 아직 없습니다. 표시되는 점수는 모집단 대비 백분위가 아니라 내부 상대 점수이며, 사람 간 비교에는 적합하지 않습니다.',
  },
  provisional: {
    label: '잠정 규준',
    title:
      '표본이 적어 규준이 잠정 상태입니다. 백분위는 앞으로 표본이 쌓이면서 달라질 수 있습니다.',
  },
  established: {
    label: '규준 적용',
    title: '규준 표본을 기준으로 산출한 백분위입니다.',
  },
};

interface NormStatusBadgeProps {
  status: NormStatus;
  className?: string;
}

/**
 * 측정 정직성 배지.
 * 규준이 없는 점수를 백분위인 것처럼 보이게 두지 않는다 — 이 배지는 숨길 수 없다.
 */
export function NormStatusBadge({ status, className }: NormStatusBadgeProps) {
  const copy = COPY[status];

  if (status === 'established') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-pill border border-ok/25 bg-ok-soft px-2 py-0.5 text-micro font-semibold text-ok',
          className
        )}
        title={copy.title}
      >
        {copy.label}
      </span>
    );
  }

  return (
    <span className={cn('provisional-tag', className)} title={copy.title}>
      <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <circle cx="6" cy="6" r="4.75" />
        <path d="M6 3.6V6.4" strokeLinecap="round" />
        <path d="M6 8.4h.01" strokeLinecap="round" />
      </svg>
      {copy.label}
    </span>
  );
}

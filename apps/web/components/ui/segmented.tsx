'use client';

import { cn } from '@/lib/utils';

interface SegmentedProps<T extends string> {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  /** 라벨을 대신할 접근성 이름. 시각적 라벨이 따로 있으면 그 id를 aria-labelledby로 */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  className?: string;
}

/**
 * 선택지가 네 개 이하일 때 쓰는 가로 선택 컨트롤.
 *
 * 선택 상태를 옅은 브랜드색 배경으로 칠하지 않는다. 그렇게 하면 화면의
 * 브랜드색이 "선택됨"과 "누를 수 있음" 두 뜻을 동시에 갖게 된다.
 * 여기서는 명도로만 구분한다 — 선택된 칸이 잉크로 차오른다.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  ...aria
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={aria['aria-label']}
      aria-labelledby={aria['aria-labelledby']}
      className={cn('sunk flex gap-1 p-1', className)}
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(o.value)}
            className={cn(
              'h-10 flex-1 rounded-[calc(var(--radius-control)-0.25rem)] text-small font-semibold',
              'transition-colors duration-fast ease-std',
              selected
                ? 'bg-action text-action-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

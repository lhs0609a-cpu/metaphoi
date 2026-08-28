import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * 표는 밀도가 전부다. 행 높이는 --row-h 하나로만 정하고,
 * 모드(play/ops)가 그 값을 바꾼다. 컴포넌트는 높이를 직접 쓰지 않는다.
 */

interface FrameProps {
  className?: string;
  children: React.ReactNode;
}

/** 표를 감싸는 카드. 좁은 화면에서 표가 자기 안에서만 가로 스크롤한다 */
export function TableFrame({ className, children }: FrameProps) {
  return (
    <div className={cn('overflow-hidden rounded-card border border-border bg-card', className)}>
      <div className="scroll-x">{children}</div>
    </div>
  );
}

export function Table({ className, children }: FrameProps) {
  return (
    <table className={cn('w-full min-w-max border-collapse text-body', className)}>{children}</table>
  );
}

export function THead({ className, children }: FrameProps) {
  return <thead className={cn('bg-sunk', className)}>{children}</thead>;
}

export function TBody({ className, children }: FrameProps) {
  return <tbody className={className}>{children}</tbody>;
}

interface TrProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** 행 전체가 링크처럼 동작할 때. 커서와 호버를 붙이고 키보드로도 열 수 있게 한다 */
  clickable?: boolean;
}

export function Tr({ clickable, className, onClick, children, ...props }: TrProps) {
  return (
    <tr
      className={cn(
        'border-b border-border last:border-0',
        clickable && 'cursor-pointer transition-colors duration-fast hover:bg-sunk',
        className
      )}
      onClick={onClick}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.(e as unknown as React.MouseEvent<HTMLTableRowElement>);
              }
            }
          : undefined
      }
      {...props}
    >
      {children}
    </tr>
  );
}

interface ThProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /** 숫자 열. 오른쪽 정렬 + 고정폭 숫자 */
  numeric?: boolean;
}

interface TdProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  numeric?: boolean;
}

export function Th({ numeric, className, children, ...props }: ThProps) {
  return (
    <th
      scope="col"
      className={cn(
        'eyebrow whitespace-nowrap px-4 text-left align-middle',
        numeric && 'text-right tabular-nums',
        className
      )}
      style={{ height: 'var(--row-h)' }}
      {...props}
    >
      {children}
    </th>
  );
}

export function Td({ numeric, className, children, ...props }: TdProps) {
  return (
    <td
      className={cn(
        'px-4 py-3 align-middle text-small',
        numeric && 'text-right tabular-nums',
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}

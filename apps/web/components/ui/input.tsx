import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** 입력칸 왼쪽 안에 놓이는 아이콘. 검색창 돋보기 등 */
  leading?: React.ReactNode;
  /** 오른쪽 안쪽 슬롯. 단위·초기화 버튼 등 */
  trailing?: React.ReactNode;
  invalid?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leading, trailing, invalid, ...props }, ref) => {
    const field = (
      <input
        type={type}
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          'h-11 w-full rounded-control border border-input bg-background px-3 py-2 text-body text-foreground',
          'placeholder:text-muted-foreground/70 transition-colors duration-fast',
          'hover:border-border-strong disabled:cursor-not-allowed disabled:opacity-55',
          invalid && 'border-danger',
          leading && 'pl-9',
          trailing && 'pr-9',
          !leading && !trailing && className
        )}
        {...props}
      />
    );

    if (!leading && !trailing) return field;

    return (
      <div className={cn('relative w-full', className)}>
        {leading ? (
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          >
            {leading}
          </span>
        ) : null}

        {field}

        {trailing ? (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {trailing}
          </span>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };

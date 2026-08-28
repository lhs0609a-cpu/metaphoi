import * as React from 'react';
import { cn } from '@/lib/utils';

interface FieldProps {
  label: string;
  /** 연결할 컨트롤의 id. 없으면 label이 감싸지 않고 텍스트로만 남는다 */
  htmlFor?: string;
  /** 라벨 오른쪽 끝에 붙는 보조 정보. 글자 수 카운터 등 */
  aside?: React.ReactNode;
  /** 컨트롤 아래 설명. 에러가 있으면 에러가 대신 나온다 */
  hint?: React.ReactNode;
  error?: string | null;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * 라벨 + 컨트롤 + 설명/에러 한 묶음.
 * 에러가 있을 때 hint를 함께 띄우지 않는다 — 고쳐야 할 것이 둘로 보이면 안 된다.
 */
export function Field({
  label,
  htmlFor,
  aside,
  hint,
  error,
  required,
  className,
  children,
}: FieldProps) {
  const describedBy = !htmlFor
    ? undefined
    : error
      ? `${htmlFor}-error`
      : hint
        ? `${htmlFor}-hint`
        : undefined;

  // 설명·에러를 컨트롤에 실제로 묶어 준다. id만 붙여 두면 스크린리더는 읽지 않는다.
  const control =
    describedBy && React.isValidElement(children)
      ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
          'aria-describedby':
            [(children.props as Record<string, unknown>)['aria-describedby'], describedBy]
              .filter(Boolean)
              .join(' '),
          ...(error ? { 'aria-invalid': true } : null),
        })
      : children;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-small font-medium text-foreground">
          {label}
          {required ? (
            <span className="ml-0.5 text-danger" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
        {aside ? <span className="text-micro tabular-nums text-muted-foreground">{aside}</span> : null}
      </div>

      {control}

      {error ? (
        <p id={describedBy} role="alert" className="text-tiny text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={describedBy} className="text-tiny leading-relaxed text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const CONTROL =
  'w-full rounded-control border border-input bg-background text-body text-foreground ' +
  'placeholder:text-muted-foreground/70 transition-colors duration-fast ' +
  'hover:border-border-strong disabled:cursor-not-allowed disabled:opacity-55';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, ...props }, ref) => (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        CONTROL,
        'h-11 appearance-none px-3 py-2',
        // 화살표는 배경 이미지로. 중간 회색 하나로 라이트/다크 양쪽에서 읽힌다
        `bg-[url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2012%2012'%3E%3Cpath%20d='M2.5%204.5%206%208l3.5-3.5'%20fill='none'%20stroke='%23888'%20stroke-width='1.4'%20stroke-linecap='round'/%3E%3C/svg%3E")] bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat pr-9`,
        invalid && 'border-danger',
        className
      )}
      {...props}
    />
  )
);
Select.displayName = 'Select';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        CONTROL,
        'min-h-[5rem] resize-y px-3 py-2.5 leading-relaxed',
        invalid && 'border-danger',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/*
 * 주 동작은 잉크 블랙이다. 브랜드 청록이 아니다.
 *
 * 청록을 버튼에 쓰면 화면에서 가장 눈에 띄는 색이 "누르는 곳"이 되고,
 * 정작 색으로 말해야 할 능력치·랭크·적합도가 뒤로 밀린다.
 * 이 제품에서 색은 데이터의 것이므로 동작은 명도로만 구분한다.
 */
const buttonVariants = cva(
  'inline-flex select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-control font-semibold ' +
    'transition-[background-color,border-color,color,transform] duration-fast ease-std ' +
    'active:scale-[0.985] disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        primary: 'bg-action text-action-foreground hover:opacity-90',
        outline: 'border border-border-strong bg-transparent text-foreground hover:bg-sunk',
        ghost: 'bg-transparent text-foreground hover:bg-sunk',
        subtle: 'bg-secondary text-secondary-foreground hover:bg-border',
        danger: 'bg-destructive text-destructive-foreground hover:brightness-110',
        link: 'bg-transparent px-0 text-primary underline-offset-4 hover:underline',
      },
      size: {
        // 한 손으로 쓰는 화면이 있어 최소 타깃을 44px 아래로 내리지 않는다
        sm: 'h-9 px-3.5 text-small',
        md: 'h-11 px-4 text-small',
        lg: 'h-[3.25rem] px-6 text-body',
        icon: 'h-11 w-11 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** 진행 중. 스피너를 붙이고 버튼을 잠근다 — 같은 요청이 두 번 나가지 않게 */
  loading?: boolean;
  /** 가로 전체. 폼 제출처럼 다음 동작이 하나뿐일 때 */
  block?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, block, disabled, children, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), block && 'w-full', className)}
        ref={ref}
        disabled={asChild ? undefined : disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading ? (
              <span
                className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
                aria-hidden="true"
              />
            ) : null}
            {children}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

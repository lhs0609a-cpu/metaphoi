import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Tone = 'ok' | 'danger' | 'warn';

interface Action {
  label: string;
  href: string;
  variant?: 'primary' | 'outline' | 'ghost';
}

interface OutcomeProps {
  tone: Tone;
  title: string;
  description?: string;
  /** 오류 코드처럼 문의할 때 필요한 값 */
  detail?: string | null;
  actions?: Action[];
  className?: string;
}

const ICON: Record<Tone, string> = {
  ok: 'M4.5 8.5 7 11l4.5-5',
  danger: 'M5 5l6 6M11 5l-6 6',
  warn: 'M8 4.5v4M8 11h.01',
};

const TONE: Record<Tone, { bg: string; fg: string }> = {
  ok: { bg: 'bg-ok-soft', fg: 'text-ok' },
  danger: { bg: 'bg-danger-soft', fg: 'text-danger' },
  warn: { bg: 'bg-warn-soft', fg: 'text-warn' },
};

/**
 * 결과 알림 — 결제 완료·실패처럼 흐름이 끝나는 화면.
 *
 * 색은 tailwind 기본 팔레트(green-100, red-600)가 아니라 의미 토큰을 쓴다.
 * 기본 팔레트를 쓰면 다크 모드에서 대비가 무너지고, 제품의 나머지 색과도
 * 미묘하게 어긋난다.
 *
 * 다음에 할 일을 반드시 준다. 끝났다고만 말하고 길을 주지 않으면
 * 사용자는 뒤로 가기를 누른다.
 */
export function Outcome({ tone, title, description, detail, actions, className }: OutcomeProps) {
  const t = TONE[tone];

  return (
    <div className={cn('flex flex-col items-start gap-4', className)}>
      <span
        className={cn('flex h-12 w-12 items-center justify-center rounded-full', t.bg)}
        aria-hidden="true"
      >
        <svg
          className={cn('h-5 w-5', t.fg)}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={ICON[tone]} />
        </svg>
      </span>

      <div className="flex flex-col gap-2">
        <h1 className="text-h2">{title}</h1>
        {description ? (
          <p className="max-w-[46ch] text-body leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
        {detail ? (
          <p className="text-tiny text-muted-foreground">
            <span className="stat-num">{detail}</span>
          </p>
        ) : null}
      </div>

      {actions && actions.length > 0 ? (
        <div className="mt-2 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {actions.map((a) => (
            <Button key={a.href} asChild size="lg" variant={a.variant ?? 'primary'}>
              <Link href={a.href}>{a.label}</Link>
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

import Link from 'next/link';

interface LogoProps {
  variant?: 'default' | 'enterprise' | 'jobs';
  href?: string;
}

export function Logo({ variant = 'default', href = '/' }: LogoProps) {
  const labels: Record<string, string> = {
    default: 'Metaphoi',
    enterprise: 'Metaphoi Enterprise',
    jobs: 'Metaphoi 채용',
  };

  return (
    <Link href={href} className="text-xl font-bold text-primary whitespace-nowrap">
      {labels[variant]}
    </Link>
  );
}

interface LogoMarkProps {
  className?: string;
}

/**
 * 심볼만. 계측기 눈금 위에 찍힌 한 점 — 재는 행위와 그 결과를 한 글자로.
 * 색은 currentColor를 따르므로 어느 표면에 놓아도 맞는다.
 */
export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Metaphoi"
    >
      {/* 눈금 호 */}
      <path d="M3.5 17a9 9 0 0 1 17 0" opacity="0.45" />
      {/* 바늘 */}
      <path d="M12 17 16.2 9.8" />
      {/* 축 */}
      <circle cx="12" cy="17" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

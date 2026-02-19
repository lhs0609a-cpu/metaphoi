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

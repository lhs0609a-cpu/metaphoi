import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogoMark } from './logo';

export function EnterpriseGnb() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="shell flex h-16 items-center justify-between gap-4">
        <Link
          href="/enterprise"
          className="flex items-center gap-2 text-body font-bold tracking-tight"
        >
          <LogoMark className="h-5 w-5 text-primary" />
          Metaphoi
          <span className="text-muted-foreground">기업</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/">개인 검사</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/company/login">로그인</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/company/register">가입</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

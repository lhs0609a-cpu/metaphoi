import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from './logo';

export function EnterpriseGnb() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Logo variant="enterprise" href="/enterprise" />
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            개인 검사
          </Link>
          <Link href="/company/login">
            <Button variant="outline" size="sm">기업 로그인</Button>
          </Link>
          <Link href="/company/register">
            <Button size="sm">기업 가입</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

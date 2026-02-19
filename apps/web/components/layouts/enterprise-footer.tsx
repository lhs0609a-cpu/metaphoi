import Link from 'next/link';

export function EnterpriseFooter() {
  return (
    <footer className="container mx-auto px-4 py-8 border-t">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Metaphoi. All rights reserved.
        </p>
        <div className="flex gap-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            개인 검사
          </Link>
          <Link href="/jobs" className="text-sm text-muted-foreground hover:text-primary">
            채용 플랫폼
          </Link>
          <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
            로그인
          </Link>
        </div>
      </div>
    </footer>
  );
}

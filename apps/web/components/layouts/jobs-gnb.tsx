'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogoMark } from './logo';
import { SearchBar } from './search-bar';
import { cn } from '@/lib/utils';

const SUB_NAV = [
  { href: '/jobs', label: '채용정보' },
  { href: '/jobs/companies', label: '기업정보' },
  { href: '/seeker/matches', label: '내 매칭' },
  { href: '/seeker/applications', label: '지원현황' },
  { href: '/seeker/messages', label: '메시지' },
];

export function JobsGnb() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="shell flex h-14 items-center justify-between gap-4">
        <Link href="/jobs" className="flex shrink-0 items-center gap-2 text-body font-bold tracking-tight">
          <LogoMark className="h-5 w-5 text-primary" />
          <span className="hidden sm:inline">Metaphoi</span>
          <span className="text-muted-foreground">채용</span>
        </Link>

        <div className="mx-2 hidden max-w-md flex-1 md:block">
          <SearchBar />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">로그인</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/company/register">기업 회원</Link>
          </Button>
        </div>
      </div>

      {/* 서브 내비 — 현재 위치를 색이 아니라 밑줄과 무게로 표시한다.
          브랜드색을 여기 쓰면 화면에서 가장 눈에 띄는 것이 메뉴가 된다 */}
      <nav className="hidden border-t border-border sm:block">
        <div className="shell scroll-x flex gap-1">
          {SUB_NAV.map((item) => {
            const active =
              pathname === item.href || (item.href !== '/jobs' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'whitespace-nowrap border-b-2 px-3.5 py-3 text-small transition-colors duration-fast',
                  active
                    ? 'border-foreground font-semibold text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-border px-4 py-2 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}

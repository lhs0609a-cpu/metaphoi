'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Logo } from './logo';
import { SearchBar } from './search-bar';

const subNavItems = [
  { href: '/jobs', label: '채용정보' },
  { href: '/jobs/companies', label: '기업정보' },
  { href: '/seeker/matches', label: '내 매칭' },
  { href: '/seeker/applications', label: '지원현황' },
  { href: '/seeker/messages', label: '메시지' },
];

export function JobsGnb() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      {/* 상단 바 */}
      <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Logo variant="jobs" href="/jobs" />
        <div className="hidden md:block flex-1 max-w-md mx-4">
          <SearchBar />
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            로그인
          </Link>
          <Link href="/company/register">
            <Button variant="outline" size="sm">기업회원</Button>
          </Link>
        </div>
      </div>
      {/* 하단 서브 네비게이션 */}
      <div className="border-t hidden sm:block">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {subNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/jobs' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? 'border-primary text-primary font-medium'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      {/* 모바일 검색바 */}
      <div className="md:hidden border-t px-4 py-2">
        <SearchBar />
      </div>
    </header>
  );
}

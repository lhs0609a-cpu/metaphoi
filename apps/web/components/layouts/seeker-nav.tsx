'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/auth';
import { Logo } from './logo';

const navItems = [
  { href: '/seeker/profile', label: '프로필' },
  { href: '/jobs', label: '기업 탐색' },
  { href: '/seeker/matches', label: '매칭' },
  { href: '/seeker/applications', label: '지원현황' },
  { href: '/seeker/messages', label: '메시지' },
];

export function SeekerNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => { logout(); router.push('/'); }}>
            로그아웃
          </Button>
        </div>
      </div>
      <div className="border-t">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/seeker/profile' && pathname.startsWith(item.href));
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
    </header>
  );
}

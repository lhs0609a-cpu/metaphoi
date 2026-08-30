'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCompanyAuthStore } from '@/lib/company-auth';
import { LogoMark } from './logo';
import { COMPANY_NAV, NavIcon } from './company-sidebar';
import { cn } from '@/lib/utils';

/**
 * 모바일 전용 머리. 데스크톱에서는 사이드바가 그 역할을 한다.
 *
 * 이 화면에도 내비게이션을 둔다 — 예전에는 로고와 로그아웃만 있어서
 * 휴대폰으로 들어오면 대시보드에서 다른 곳으로 갈 방법이 없었다.
 */
export function CompanyHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { member, logout } = useCompanyAuthStore();
  const [open, setOpen] = useState(false);

  const current = COMPANY_NAV.find(
    (n) => pathname === n.href || (n.href !== '/company/dashboard' && pathname.startsWith(n.href))
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md lg:hidden">
      <div className="flex h-14 items-center justify-between gap-3 px-4">
        <Link href="/company/dashboard" className="flex min-w-0 items-center gap-2">
          <LogoMark className="h-5 w-5 shrink-0 text-primary" />
          <span className="truncate text-small font-bold">
            {current?.label ?? member?.company_name ?? 'Metaphoi'}
          </span>
        </Link>

        <button
          type="button"
          className="-mr-2 flex h-11 w-11 items-center justify-center rounded-control"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            {open ? (
              <>
                <path d="M5 5l10 10" />
                <path d="M15 5L5 15" />
              </>
            ) : (
              <>
                <path d="M3 6h14" />
                <path d="M3 10h14" />
                <path d="M3 14h14" />
              </>
            )}
          </svg>
        </button>
      </div>

      <div
        className={cn(
          'overflow-hidden border-t border-border transition-[max-height] duration-std ease-std',
          open ? 'max-h-[28rem]' : 'max-h-0 border-t-0'
        )}
      >
        <nav className="flex flex-col gap-0.5 p-2.5">
          {member && (
            <p className="px-3 pb-2 text-tiny text-muted-foreground">{member.company_name}</p>
          )}
          {COMPANY_NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== '/company/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2.5 rounded-control px-3 py-3 text-body',
                  active ? 'bg-sunk font-semibold' : 'text-muted-foreground'
                )}
              >
                <NavIcon d={item.d} />
                {item.label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              logout();
              router.push('/');
            }}
            className="mt-1 flex items-center gap-2.5 rounded-control border-t border-border px-3 py-3 text-body text-muted-foreground"
          >
            <NavIcon d="M15 16.5 19.5 12 15 7.5M19.5 12H8M12 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6" />
            로그아웃
          </button>
        </nav>
      </div>
    </header>
  );
}

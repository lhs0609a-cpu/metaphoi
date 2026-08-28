'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogoMark } from './logo';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/start', label: '검사하기' },
  { href: '/jobs', label: '채용' },
  { href: '/enterprise', label: '기업 서비스' },
];

export function IntroGnb() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="shell flex h-16 items-center justify-between gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lead font-bold tracking-tight"
          onClick={() => setOpen(false)}
        >
          <LogoMark className="h-5 w-5 text-primary" />
          Metaphoi
        </Link>

        {/* 데스크톱 */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-control px-3 py-2 text-small font-medium text-muted-foreground transition-colors duration-fast hover:bg-sunk hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">로그인</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/start">무료로 시작</Link>
          </Button>
        </div>

        {/* 모바일 */}
        <button
          type="button"
          className="-mr-2 flex h-11 w-11 items-center justify-center rounded-control text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
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

      {/* 모바일 시트 */}
      <div
        className={cn(
          'overflow-hidden border-t border-border bg-background transition-[max-height] duration-std ease-std md:hidden',
          open ? 'max-h-96' : 'max-h-0 border-t-0'
        )}
      >
        <div className="shell flex flex-col gap-1 py-3">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="rounded-control px-3 py-3 text-body font-medium hover:bg-sunk"
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="rounded-control px-3 py-3 text-body font-medium text-muted-foreground hover:bg-sunk"
          >
            로그인
          </Link>
          <Button asChild block size="lg" className="mt-2">
            <Link href="/start" onClick={() => setOpen(false)}>
              무료로 시작
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

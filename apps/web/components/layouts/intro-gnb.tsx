'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Logo } from './logo';

export function IntroGnb() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Logo />
        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-4">
          <Link href="/start" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            무료 검사
          </Link>
          <Link href="/jobs" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            채용 플랫폼
          </Link>
          <Link href="/enterprise" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            기업 솔루션
          </Link>
          <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            로그인
          </Link>
        </div>
        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="메뉴"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-3 space-y-2">
            <Link href="/start" className="block py-2 text-sm hover:text-primary" onClick={() => setMenuOpen(false)}>
              무료 검사
            </Link>
            <Link href="/jobs" className="block py-2 text-sm hover:text-primary" onClick={() => setMenuOpen(false)}>
              채용 플랫폼
            </Link>
            <Link href="/enterprise" className="block py-2 text-sm hover:text-primary" onClick={() => setMenuOpen(false)}>
              기업 솔루션
            </Link>
            <Link href="/login" className="block py-2 text-sm hover:text-primary" onClick={() => setMenuOpen(false)}>
              로그인
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

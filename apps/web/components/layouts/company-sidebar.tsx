'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCompanyAuthStore } from '@/lib/company-auth';
import { LogoMark } from './logo';
import { cn } from '@/lib/utils';

/*
 * 아이콘은 모두 24 뷰박스, 선 굵기 1.6으로 맞춘다.
 * 굵기가 제각각이면 목록이 들쭉날쭉해 보이는데, 정작 원인을 찾기 어렵다.
 */
export const COMPANY_NAV = [
  {
    href: '/company/dashboard',
    label: '대시보드',
    d: 'M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8.5Z',
  },
  {
    href: '/company/jobs',
    label: '채용 공고',
    d: 'M3 8h18v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8Zm5 0V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18',
  },
  {
    href: '/company/candidates',
    label: '후보자 탐색',
    d: 'M10.5 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6.5 8a6.5 6.5 0 0 1 13 0M17 9.5a2.5 2.5 0 1 0 0-5M18 20a5.5 5.5 0 0 0-2-4.2',
  },
  {
    href: '/company/pipeline',
    label: '전형 파이프라인',
    d: 'M4 5h4v14H4zM10 5h4v9h-4zM16 5h4v5h-4z',
  },
  {
    href: '/company/team',
    label: '팀 프로필',
    d: 'M9 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 8a6 6 0 0 1 12 0M16 9.5a2.5 2.5 0 1 0 0-5M17 20a5.5 5.5 0 0 0-2-4.2',
  },
  {
    href: '/company/messages',
    label: '메시지',
    d: 'M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4.5 3.5V16H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z',
  },
];

export function NavIcon({ d }: { d: string }) {
  return (
    <svg
      className="h-[1.125rem] w-[1.125rem] shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

export function CompanySidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { member, logout } = useCompanyAuthStore();

  return (
    <aside className="fixed inset-y-0 hidden w-60 flex-col border-r border-border bg-background lg:flex">
      <div className="flex flex-col gap-0.5 border-b border-border px-4 py-4">
        <Link href="/company/dashboard" className="flex items-center gap-2 text-body font-bold tracking-tight">
          <LogoMark className="h-5 w-5 text-primary" />
          Metaphoi
        </Link>
        {member && (
          <p className="truncate pl-7 text-tiny text-muted-foreground">{member.company_name}</p>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2.5">
        {COMPANY_NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== '/company/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-2.5 rounded-control px-3 py-2.5 text-small',
                'transition-colors duration-fast ease-std',
                // 현재 위치는 색이 아니라 무게로 표시한다.
                // 브랜드색을 여기 쓰면 사이드바가 화면에서 가장 밝은 곳이 된다.
                active
                  ? 'bg-sunk font-semibold text-foreground'
                  : 'text-muted-foreground hover:bg-sunk hover:text-foreground'
              )}
            >
              <NavIcon d={item.d} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-2.5">
        <button
          type="button"
          onClick={() => {
            logout();
            router.push('/');
          }}
          className="flex w-full items-center gap-2.5 rounded-control px-3 py-2.5 text-small text-muted-foreground transition-colors duration-fast hover:bg-sunk hover:text-foreground"
        >
          <NavIcon d="M15 16.5 19.5 12 15 7.5M19.5 12H8M12 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6" />
          로그아웃
        </button>
      </div>
    </aside>
  );
}

import Link from 'next/link';
import { LogoMark } from '@/components/layouts/logo';

/**
 * 로그인·가입 공용 레이아웃.
 *
 * 표면을 지정하지 않는다 — 인증은 B2C(검사)와 B2B(채용) 양쪽에서 들어오는
 * 통로라서, 어느 한쪽 세계의 색을 입히면 나머지 절반에게 낯선 화면이 된다.
 * 기본 토큰(ops)을 그대로 쓰고 사용자 테마를 따른다.
 */
export default function SharedAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* 배경 격자 — 계측기 눈금의 은유. 내용 뒤로 완전히 물러나 있는다 */}
      <div className="grid-field pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />

      <header className="px-6 py-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-small font-semibold text-foreground"
        >
          <LogoMark className="h-5 w-5 text-primary" />
          Metaphoi
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="anim-rise flex w-full max-w-md flex-col gap-5">{children}</div>
      </main>

      <footer className="flex flex-col items-center gap-2 px-6 py-6 text-center">
        <p className="max-w-[42ch] text-micro leading-relaxed text-muted-foreground">
          검사 결과는 성격 경향을 재는 참고 지표입니다. 규준 표본이 쌓이기 전까지 점수는
          모집단 대비 백분위가 아니라 내부 상대 점수로 표시됩니다.
        </p>
        <nav className="flex items-center gap-3 text-micro text-muted-foreground">
          <Link href="/enterprise" className="hover:text-foreground">
            기업 서비스
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/company/login" className="hover:text-foreground">
            기업 담당자 로그인
          </Link>
        </nav>
      </footer>
    </div>
  );
}

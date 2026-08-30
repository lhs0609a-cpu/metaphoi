import Link from 'next/link';
import { Surface } from '@/components/layouts/surface';
import { LogoMark } from '@/components/layouts/logo';

/**
 * 기업 로그인·가입.
 *
 * 앱 셸(사이드바 + 헤더) 밖에 둔다. 아직 로그인하지 않은 사람에게
 * 대시보드·후보자 탐색 메뉴를 보여줄 이유가 없고, 누를 수도 없는
 * 메뉴가 옆에 붙어 있으면 화면이 고장난 것처럼 보인다.
 */
export default function CompanyAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Surface mode="ops" className="flex flex-col">
      <header className="border-b border-border">
        <div className="shell flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-body font-bold tracking-tight">
            <LogoMark className="h-5 w-5 text-primary" />
            Metaphoi
          </Link>
          <Link
            href="/enterprise"
            className="text-small text-muted-foreground transition-colors duration-fast hover:text-foreground"
          >
            기업 서비스 소개
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-12 sm:py-16">
        {children}
      </main>

      <footer className="shell py-8">
        <p className="max-w-[52ch] text-tiny leading-relaxed text-muted-foreground">
          매칭 점수는 정렬을 돕는 참고 지표입니다. 가중치는 아직 준거 타당도가 검증되지 않은
          설정값이며, 자동 산출된 점수만으로 불합격을 결정해서는 안 됩니다.
        </p>
      </footer>
    </Surface>
  );
}

import Link from 'next/link';
import { LogoMark } from './logo';

interface MinimalHeaderProps {
  /** 오른쪽에 놓을 보조 요소. 검사 중 진행률, 나가기 버튼 등 */
  aside?: React.ReactNode;
}

/**
 * 검사·결과처럼 한 가지 일에 집중하는 화면의 머리.
 * 메뉴를 두지 않는다 — 나가는 길이 여러 개면 중간에 나간다.
 */
export function MinimalHeader({ aside }: MinimalHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="shell flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 text-body font-bold tracking-tight">
          <LogoMark className="h-5 w-5 text-primary" />
          Metaphoi
        </Link>
        {aside}
      </div>
    </header>
  );
}

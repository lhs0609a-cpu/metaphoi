import type { Metadata } from 'next';
import { Surface } from '@/components/layouts/surface';

/**
 * 내부용 스펙 페이지. 검색 결과에 나올 이유가 없다.
 *
 * ops 표면으로 둔다 — 훑으면서 참조하는 문서라 밀도가 촘촘한 편이 맞고,
 * 견본이 실제 B2B 화면과 같은 밀도로 보여야 그대로 옮겨 쓸 수 있다.
 */
export const metadata: Metadata = {
  title: '디자인 시스템',
  robots: { index: false, follow: false },
};

export default function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  return <Surface mode="ops">{children}</Surface>;
}

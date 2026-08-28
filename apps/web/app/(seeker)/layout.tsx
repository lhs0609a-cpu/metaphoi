import { Surface } from '@/components/layouts/surface';
import { SeekerNav } from '@/components/layouts/seeker-nav';

/**
 * 구직자 영역 — 지원 현황·매칭·메시지를 훑는 작업 화면이므로 ops 표면.
 */
export default function SeekerLayout({ children }: { children: React.ReactNode }) {
  return (
    <Surface mode="ops">
      <SeekerNav />
      <main className="flex-1">{children}</main>
    </Surface>
  );
}

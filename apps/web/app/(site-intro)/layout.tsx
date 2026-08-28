import { Surface } from '@/components/layouts/surface';
import { IntroGnb } from '@/components/layouts/intro-gnb';
import { IntroFooter } from '@/components/layouts/intro-footer';

export default function SiteIntroLayout({ children }: { children: React.ReactNode }) {
  return (
    // play — 소비자 화면. 여백이 넉넉하고 타깃이 크다
    <Surface mode="play" className="flex flex-col">
      <IntroGnb />
      <main className="flex-1">{children}</main>
      <IntroFooter />
    </Surface>
  );
}

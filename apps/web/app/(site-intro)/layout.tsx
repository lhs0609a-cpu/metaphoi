import { IntroGnb } from '@/components/layouts/intro-gnb';
import { IntroFooter } from '@/components/layouts/intro-footer';

export default function SiteIntroLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <IntroGnb />
      <div className="flex-1">{children}</div>
      <IntroFooter />
    </div>
  );
}

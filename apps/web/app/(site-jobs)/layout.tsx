import { Surface } from '@/components/layouts/surface';
import { JobsGnb } from '@/components/layouts/jobs-gnb';
import { JobsFooter } from '@/components/layouts/jobs-footer';
import { JobsMobileTabs } from '@/components/layouts/jobs-mobile-tabs';

export default function SiteJobsLayout({ children }: { children: React.ReactNode }) {
  return (
    // ops — 공고를 훑고 비교하는 화면이라 밀도를 촘촘하게 둔다
    <Surface mode="ops" className="flex flex-col">
      <JobsGnb />
      <main className="flex-1 pb-16 sm:pb-0">{children}</main>
      <JobsFooter />
      <JobsMobileTabs />
    </Surface>
  );
}

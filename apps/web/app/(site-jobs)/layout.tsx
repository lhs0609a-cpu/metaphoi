import { JobsGnb } from '@/components/layouts/jobs-gnb';
import { JobsFooter } from '@/components/layouts/jobs-footer';
import { JobsMobileTabs } from '@/components/layouts/jobs-mobile-tabs';

export default function SiteJobsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <JobsGnb />
      <div className="flex-1 pb-16 sm:pb-0">{children}</div>
      <JobsFooter />
      <JobsMobileTabs />
    </div>
  );
}

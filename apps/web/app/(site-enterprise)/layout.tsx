import { EnterpriseGnb } from '@/components/layouts/enterprise-gnb';
import { EnterpriseFooter } from '@/components/layouts/enterprise-footer';

export default function SiteEnterpriseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <EnterpriseGnb />
      <div className="flex-1">{children}</div>
      <EnterpriseFooter />
    </div>
  );
}

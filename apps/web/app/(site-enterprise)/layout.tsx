import { Surface } from '@/components/layouts/surface';
import { EnterpriseGnb } from '@/components/layouts/enterprise-gnb';
import { EnterpriseFooter } from '@/components/layouts/enterprise-footer';

export default function SiteEnterpriseLayout({ children }: { children: React.ReactNode }) {
  return (
    <Surface mode="ops" className="flex flex-col">
      <EnterpriseGnb />
      <main className="flex-1">{children}</main>
      <EnterpriseFooter />
    </Surface>
  );
}

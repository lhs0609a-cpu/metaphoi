import { Surface } from '@/components/layouts/surface';
import { CompanySidebar } from '@/components/layouts/company-sidebar';
import { CompanyHeader } from '@/components/layouts/company-header';

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return (
    <Surface mode="ops">
      <CompanySidebar />
      <div className="flex min-h-screen flex-col lg:pl-60">
        <CompanyHeader />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </Surface>
  );
}

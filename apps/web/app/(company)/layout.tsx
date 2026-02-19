import { CompanySidebar } from '@/components/layouts/company-sidebar';
import { CompanyHeader } from '@/components/layouts/company-header';

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <CompanySidebar />
      <div className="lg:pl-64">
        <CompanyHeader />
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

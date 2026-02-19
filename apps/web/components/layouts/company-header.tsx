'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCompanyAuthStore } from '@/lib/company-auth';
import { Button } from '@/components/ui/button';

export function CompanyHeader() {
  const router = useRouter();
  const { member, logout } = useCompanyAuthStore();

  return (
    <header className="lg:hidden border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/company/dashboard" className="text-lg font-bold text-primary">
          Metaphoi
        </Link>
        <div className="flex items-center gap-3">
          {member && (
            <span className="text-sm text-muted-foreground truncate max-w-[120px]">
              {member.company_name}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => { logout(); router.push('/'); }}
          >
            로그아웃
          </Button>
        </div>
      </div>
    </header>
  );
}

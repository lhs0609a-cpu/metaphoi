'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { EmptyState, Skeleton } from '@/components/ui/states';
import { marketplaceApi } from '@/lib/marketplace-api';

export default function CompaniesDirectoryPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    marketplaceApi.companies.list().then((res) => {
      setCompanies((res.data as any)?.companies || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="shell max-w-[56rem] py-10 lg:py-14">
      <header className="flex flex-col items-start gap-2">
        <p className="eyebrow">기업</p>
        <h1 className="text-h1">채용 중인 기업</h1>
      </header>

      {loading ? (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="등록된 기업이 없습니다"
            description="기업이 가입하고 공고를 올리면 여기에 나타납니다."
            action={{ label: '공고 둘러보기', href: '/jobs' }}
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Link
              key={company.id}
              href={`/jobs/companies/${company.id}`}
              className="flex flex-col gap-1.5 rounded-card border border-border p-5 transition-colors duration-fast hover:border-border-strong hover:bg-sunk"
            >
              <span className="text-body font-semibold">{company.name}</span>
              <span className="text-tiny text-muted-foreground">
                {[company.industry, company.size_range ? `${company.size_range}명` : null, company.location]
                  .filter(Boolean)
                  .join(' · ') || '정보 없음'}
              </span>
              {company.culture_tags?.length ? (
                <span className="mt-1 line-clamp-1 text-tiny text-muted-foreground">
                  {company.culture_tags.slice(0, 3).join(' · ')}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

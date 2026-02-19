'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">기업 디렉토리</h1>
      <p className="text-muted-foreground mb-8">채용 중인 기업들을 둘러보세요</p>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        </div>
      ) : companies.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            현재 등록된 기업이 없습니다
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <Link key={company.id} href={`/jobs/companies/${company.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardContent className="pt-5 pb-4">
                  <h3 className="font-bold mb-1">{company.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {company.industry || ''} {company.size_range ? `· ${company.size_range}명` : ''}
                  </p>
                  {company.location && (
                    <p className="text-xs text-muted-foreground mt-1">{company.location}</p>
                  )}
                  {company.culture_tags && company.culture_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {company.culture_tags.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{tag}</span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

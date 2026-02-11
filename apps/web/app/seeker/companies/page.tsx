'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { marketplaceApi } from '@/lib/marketplace-api';

export default function SeekerCompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      marketplaceApi.companies.list(),
      marketplaceApi.jobs.list(),
    ]).then(([compRes, jobsRes]) => {
      setCompanies((compRes.data as any)?.companies || []);
      setJobs((jobsRes.data as any)?.jobs || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">Metaphoi</Link>
          <div className="flex gap-2">
            <Link href="/seeker/profile"><Button variant="outline" size="sm">내 프로필</Button></Link>
            <Link href="/seeker/matches"><Button variant="outline" size="sm">매칭</Button></Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-2">기업 & 채용 공고</h1>
        <p className="text-muted-foreground mb-8">관심 있는 기업에 관심 표시를 보내보세요</p>

        {/* 채용 공고 */}
        <h2 className="text-lg font-bold mb-4">채용 공고 ({jobs.length})</h2>
        {jobs.length === 0 ? (
          <Card className="mb-8">
            <CardContent className="py-8 text-center text-muted-foreground">
              현재 활성 채용 공고가 없습니다
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 mb-8">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{job.title}</h3>
                      <p className="text-sm text-primary">
                        {job.companies?.name || '기업명'}
                        {job.companies?.location && ` · ${job.companies.location}`}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {job.description || ''}
                      </p>
                      {job.conditions && (
                        <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                          {job.conditions.salary_range && <span>{job.conditions.salary_range}</span>}
                          {job.conditions.remote && (
                            <span>{job.conditions.remote === 'remote' ? '재택' : job.conditions.remote === 'hybrid' ? '하이브리드' : '출근'}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <Link href={`/seeker/companies/${job.company_id}`}>
                      <Button size="sm" variant="outline">상세</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 기업 목록 */}
        <h2 className="text-lg font-bold mb-4">기업 목록 ({companies.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {companies.map((company) => (
            <Link key={company.id} href={`/seeker/companies/${company.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardContent className="py-4">
                  <h3 className="font-bold">{company.name}</h3>
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
      </div>
    </main>
  );
}

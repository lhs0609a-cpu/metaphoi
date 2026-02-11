'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/auth';
import { marketplaceApi } from '@/lib/marketplace-api';

export default function CompanyDetailPage() {
  const params = useParams();
  const companyId = params.id as string;
  const { token } = useAuthStore();

  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [interestSent, setInterestSent] = useState(false);

  useEffect(() => {
    Promise.all([
      marketplaceApi.companies.get(companyId),
      marketplaceApi.jobs.list({ company_id: companyId }),
    ]).then(([compRes, jobsRes]) => {
      setCompany(compRes.data);
      setJobs((jobsRes.data as any)?.jobs || []);
      setLoading(false);
    });
  }, [companyId]);

  const handleInterest = async (jobPostingId?: string) => {
    if (!token) {
      alert('로그인이 필요합니다');
      return;
    }

    const result = await marketplaceApi.matching.sendSeekerInterest(
      { to_type: 'company', to_id: companyId, job_posting_id: jobPostingId },
      token,
    );

    if (result.error) {
      alert(result.error);
    } else {
      setInterestSent(true);
      if ((result.data as any)?.match) {
        alert('매칭이 성사되었습니다!');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!company) return null;

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">Metaphoi</Link>
          <Link href="/seeker/companies">
            <Button variant="outline" size="sm">기업 목록</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold mb-1">{company.name}</h1>
            <div className="flex gap-2 text-sm text-muted-foreground mb-4">
              {company.industry && <span>{company.industry}</span>}
              {company.size_range && <span>· {company.size_range}명</span>}
              {company.location && <span>· {company.location}</span>}
            </div>
            {company.description && (
              <p className="text-muted-foreground mb-4">{company.description}</p>
            )}
            {company.culture_tags && company.culture_tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {company.culture_tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">{tag}</span>
                ))}
              </div>
            )}
            {company.team_atmosphere && (
              <p className="text-sm text-muted-foreground">{company.team_atmosphere}</p>
            )}

            <Button
              className="mt-4"
              disabled={interestSent}
              onClick={() => handleInterest()}
            >
              {interestSent ? '관심 표시 완료' : '관심 표시하기'}
            </Button>
          </CardContent>
        </Card>

        {/* 채용 공고 */}
        {jobs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">채용 중 ({jobs.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="p-4 border rounded-lg">
                  <h3 className="font-bold">{job.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{job.description}</p>
                  {job.conditions && (
                    <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                      {job.conditions.salary_range && <span>{job.conditions.salary_range}</span>}
                      {job.conditions.remote && (
                        <span>{job.conditions.remote === 'remote' ? '재택' : job.conditions.remote === 'hybrid' ? '하이브리드' : '출근'}</span>
                      )}
                    </div>
                  )}
                  <Button
                    size="sm"
                    className="mt-3"
                    disabled={interestSent}
                    onClick={() => handleInterest(job.id)}
                  >
                    이 공고에 관심 표시
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

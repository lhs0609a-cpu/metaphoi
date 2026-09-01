'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EmptyState, PageLoading } from '@/components/ui/states';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/lib/auth';
import { marketplaceApi } from '@/lib/marketplace-api';

export default function CompanyPublicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
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
      router.push(`/login?redirect=${encodeURIComponent(`/jobs/companies/${companyId}`)}`);
      return;
    }

    const result = await marketplaceApi.matching.sendSeekerInterest(
      { to_type: 'company', to_id: companyId, job_posting_id: jobPostingId },
      token,
    );

    if (result.error) {
      toast({ title: '보내지 못했습니다', description: result.error, variant: 'destructive' });
      return;
    }

    setInterestSent(true);
    toast(
      (result.data as any)?.match
        ? { title: '매칭이 성사되었습니다', description: '메시지에서 대화를 시작할 수 있습니다' }
        : { title: '관심을 표시했습니다', description: '기업이 확인하면 알려드립니다' },
    );
  };

  if (loading) return <PageLoading label="기업 정보를 불러오는 중" />;

  if (!company) {
    return (
      <div className="shell max-w-[44rem] py-16">
        <EmptyState
          title="기업을 찾을 수 없습니다"
          description="삭제되었거나 비공개로 전환된 기업입니다."
          action={{ label: '기업 목록으로', href: '/jobs/companies' }}
        />
      </div>
    );
  }

  return (
    <div className="shell max-w-[44rem] py-10 lg:py-14">
      <header className="flex flex-col items-start gap-3">
        <h1 className="text-h1">{company.name}</h1>
        <p className="text-small text-muted-foreground">
          {[company.industry, company.size_range ? `${company.size_range}명` : null, company.location]
            .filter(Boolean)
            .join(' · ') || '정보 없음'}
        </p>

        {company.culture_tags?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {company.culture_tags.map((tag: string) => (
              <span key={tag} className="rounded-pill bg-sunk px-3 py-1 text-tiny">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      {company.description || company.team_atmosphere ? (
        <section className="mt-8 flex flex-col gap-3">
          {company.description ? (
            <p className="max-w-prose text-body leading-relaxed text-muted-foreground">
              {company.description}
            </p>
          ) : null}
          {company.team_atmosphere ? (
            <p className="max-w-prose text-small leading-relaxed text-muted-foreground">
              {company.team_atmosphere}
            </p>
          ) : null}
        </section>
      ) : null}

      <div className="mt-8">
        <Button disabled={interestSent} onClick={() => handleInterest()}>
          {interestSent ? '관심 표시 완료' : '관심 표시하기'}
        </Button>
        <p className="mt-2 text-tiny text-muted-foreground">
          관심을 표시하면 기업에 알림이 갑니다. 양쪽이 모두 관심을 표시하면 대화가 열립니다.
        </p>
      </div>

      <section className="mt-12">
        <div className="flex items-baseline gap-2.5">
          <h2 className="text-h3">채용 중</h2>
          <span className="stat-num text-small text-muted-foreground" data-numeric>
            {jobs.length}
          </span>
        </div>

        {jobs.length === 0 ? (
          <p className="mt-4 text-small text-muted-foreground">
            지금은 올라온 공고가 없습니다. 관심을 표시해 두면 새 공고가 열릴 때 연락받을 수 있습니다.
          </p>
        ) : (
          <ul className="mt-5 flex flex-col">
            {jobs.map((job) => (
              <li key={job.id} className="flex flex-col gap-2 border-t border-border py-5 last:border-b">
                <Link
                  href={`/jobs/${job.id}`}
                  className="text-lead font-semibold underline-offset-4 hover:underline"
                >
                  {job.title}
                </Link>

                {job.description ? (
                  <p className="line-clamp-2 max-w-prose text-small text-muted-foreground">
                    {job.description}
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-tiny text-muted-foreground">
                  {job.conditions?.salary_range ? <span>{job.conditions.salary_range}</span> : null}
                  {job.conditions?.remote ? (
                    <span>
                      {job.conditions.remote === 'remote'
                        ? '재택'
                        : job.conditions.remote === 'hybrid'
                          ? '하이브리드'
                          : '출근'}
                    </span>
                  ) : null}
                </div>

                <div className="mt-1">
                  <Button size="sm" variant="outline" disabled={interestSent} onClick={() => handleInterest(job.id)}>
                    이 공고에 지원
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

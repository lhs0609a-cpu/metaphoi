'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { EmptyState, PageLoading } from '@/components/ui/states';
import { ABILITY_NAME } from '@/lib/abilities-scoring';
import { RESOLVED_ROLES } from '@/lib/role-matching';
import { useAuthStore } from '@/lib/auth';
import { marketplaceApi } from '@/lib/marketplace-api';

export default function JobDetailPublicPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const { token, isAuthenticated } = useAuthStore();

  const [job, setJob] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    marketplaceApi.jobs.get(jobId).then((res) => {
      const jobData = res.data as any;
      setJob(jobData);
      if (jobData?.company_id) {
        marketplaceApi.companies.get(jobData.company_id).then((compRes) => {
          setCompany(compRes.data);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, [jobId]);

  const handleApply = async () => {
    if (!isAuthenticated || !token) {
      router.push(`/login?redirect=${encodeURIComponent(`/jobs/${jobId}`)}`);
      return;
    }

    const result = await marketplaceApi.matching.sendSeekerInterest(
      { to_type: 'company', to_id: job.company_id, job_posting_id: jobId },
      token,
    );

    if (result.error) {
      toast({ title: '지원하지 못했습니다', description: result.error, variant: 'destructive' });
      return;
    }

    setApplied(true);
    toast(
      (result.data as any)?.match
        ? { title: '매칭이 성사되었습니다', description: '메시지에서 대화를 시작할 수 있습니다' }
        : { title: '지원했습니다', description: '기업이 확인하면 알려드립니다' },
    );
  };

  if (loading) return <PageLoading label="공고를 불러오는 중" />;

  if (!job) {
    return (
      <div className="shell max-w-[44rem] py-16">
        <EmptyState
          title="공고를 찾을 수 없습니다"
          description="마감되었거나 삭제된 공고입니다."
          action={{ label: '공고 목록으로', href: '/jobs' }}
        />
      </div>
    );
  }

  const isActive = job.status === 'active';
  const role = job.role_id ? RESOLVED_ROLES.find((r) => r.id === job.role_id) : null;
  const requirements = Object.entries(job.required_abilities ?? {}) as [string, { min: number }][];

  const facts: [string, string][] = [
    ['연봉', job.conditions?.salary_range || '—'],
    ['근무지', job.conditions?.location || '—'],
    [
      '근무 형태',
      job.conditions?.remote === 'remote'
        ? '재택'
        : job.conditions?.remote === 'hybrid'
          ? '하이브리드'
          : job.conditions?.remote === 'onsite'
            ? '출근'
            : '—',
    ],
    [
      '경력',
      job.conditions?.experience_min != null || job.conditions?.experience_max != null
        ? `${job.conditions?.experience_min ?? 0}~${job.conditions?.experience_max ?? ''}년`
        : '—',
    ],
  ];

  return (
    <div className="shell max-w-[44rem] pb-28 pt-10 lg:pt-14">
      <header className="flex flex-col items-start gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={isActive ? 'ok' : 'neutral'} size="sm" dot>
            {isActive ? '모집중' : '마감'}
          </Badge>
          {role ? (
            <span className="text-tiny text-muted-foreground">
              {role.industryName} · {role.familyName}
            </span>
          ) : null}
        </div>

        <h1 className="text-h1">{job.title}</h1>

        {company ? (
          <Link
            href={`/jobs/companies/${company.id}`}
            className="text-body font-semibold text-primary underline-offset-4 hover:underline"
          >
            {company.name}
          </Link>
        ) : null}
      </header>

      {/* 조건 — 가장 먼저 확인하는 정보라 위로 올린다 */}
      <section className="mt-8 rounded-card border border-border p-6">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          {facts.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-0.5">
              <dt className="text-micro text-muted-foreground">{k}</dt>
              <dd className="text-small font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {job.description ? (
        <section className="mt-10">
          <h2 className="text-h3">직무 설명</h2>
          <p className="mt-4 max-w-prose whitespace-pre-wrap text-body leading-relaxed text-muted-foreground">
            {job.description}
          </p>
        </section>
      ) : null}

      {requirements.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-h3">원하는 역량</h2>
          <p className="mt-1 text-small text-muted-foreground">
            기준에 못 미치는 만큼만 감점됩니다. 넘친다고 가점되지는 않습니다.
          </p>
          <ul className="mt-5 flex flex-col">
            {requirements.map(([key, val]) => (
              <li
                key={key}
                className="flex items-center justify-between gap-4 border-t border-border py-3 last:border-b"
              >
                {/* 예전에는 problemSolving 같은 내부 키가 그대로 노출됐다 */}
                <span className="text-small">{ABILITY_NAME[key] ?? key}</span>
                <span className="stat-num text-small text-muted-foreground" data-numeric>
                  {val.min} 이상
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {company ? (
        <section className="mt-10">
          <h2 className="text-h3">회사</h2>
          <div className="mt-4 flex flex-col gap-2">
            <p className="text-body font-semibold">{company.name}</p>
            <p className="text-small text-muted-foreground">
              {[company.industry, company.size_range ? `${company.size_range}명` : null, company.location]
                .filter(Boolean)
                .join(' · ') || '정보 없음'}
            </p>
            {company.description ? (
              <p className="max-w-prose text-small leading-relaxed text-muted-foreground">
                {company.description}
              </p>
            ) : null}
            {company.culture_tags?.length ? (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {company.culture_tags.map((tag: string) => (
                  <span key={tag} className="rounded-pill bg-sunk px-2.5 py-1 text-tiny">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* 지원 — 화면 아래 고정. 길게 읽다가 되돌아가지 않아도 되게 */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md">
        <div className="shell flex max-w-[44rem] items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-small font-semibold">{job.title}</p>
            <p className="truncate text-tiny text-muted-foreground">{company?.name ?? ''}</p>
          </div>
          <Button onClick={handleApply} disabled={applied || !isActive} className="shrink-0">
            {applied ? '지원 완료' : isActive ? '지원하기' : '마감됨'}
          </Button>
        </div>
      </div>
    </div>
  );
}

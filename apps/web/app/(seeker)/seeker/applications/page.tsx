'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState, Skeleton } from '@/components/ui/states';
import { PageHeader, StatTile } from '@/components/layouts/page-header';
import { useAuthStore } from '@/lib/auth';
import { marketplaceApi } from '@/lib/marketplace-api';
import { cn } from '@/lib/utils';

/** 진행 순서 — 진행 바를 그리려면 순서가 있어야 한다 */
const FLOW = ['applied', 'screening', 'interview_scheduled', 'interviewing', 'evaluation', 'offer', 'hired'];

const STAGE_LABELS: Record<string, string> = {
  applied: '지원완료', screening: '서류심사', interview_scheduled: '면접예정',
  interviewing: '면접진행', evaluation: '평가중', offer: '오퍼',
  hired: '채용확정', rejected: '불합격',
};

const STAGE_TONE: Record<string, 'info' | 'signal' | 'warn' | 'ok' | 'danger'> = {
  applied: 'info', screening: 'info', interview_scheduled: 'signal',
  interviewing: 'signal', evaluation: 'warn', offer: 'ok',
  hired: 'ok', rejected: 'danger',
};

interface Application {
  id: string;
  stage?: string;
  created_at?: string;
  job_postings?: { id?: string; title?: string; companies?: { name?: string } };
  companies?: { name?: string };
}

export default function SeekerApplicationsPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }
    marketplaceApi.applications.listSeeker(token).then((res) => {
      setApplications(Array.isArray(res.data) ? (res.data as Application[]) : []);
      setLoading(false);
    });
  }, [isAuthenticated, token, router]);

  const inProgress = applications.filter(
    (a) => a.stage && a.stage !== 'rejected' && a.stage !== 'hired',
  ).length;
  const offers = applications.filter((a) => a.stage === 'offer' || a.stage === 'hired').length;

  return (
    <div id="main" className="container max-w-2xl py-8">
      <PageHeader
        title="지원 현황"
        description="기업이 단계를 변경하면 여기에 바로 반영됩니다."
      />

      {!loading && applications.length > 0 ? (
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <StatTile label="전체 지원" value={applications.length} unit="건" />
          <StatTile label="진행 중" value={inProgress} unit="건" tone={inProgress > 0 ? 'ok' : 'neutral'} />
          <StatTile label="오퍼 · 확정" value={offers} unit="건" tone={offers > 0 ? 'ok' : 'neutral'} />
        </div>
      ) : null}

      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          title="아직 지원 내역이 없습니다"
          description="관심 있는 공고에 지원하면 진행 상황을 여기서 추적할 수 있습니다."
          action={{ label: '공고 둘러보기', href: '/jobs' }}
          secondaryAction={{ label: '매칭 확인', href: '/seeker/matches' }}
          icon={
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M6 3h9l4 4v14H6V3Z" strokeLinejoin="round" />
              <path d="M9 12h6M9 16h4" strokeLinecap="round" />
            </svg>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((app) => {
            const stage = app.stage ?? 'applied';
            const rejected = stage === 'rejected';
            const idx = FLOW.indexOf(stage);
            const companyName = app.job_postings?.companies?.name ?? app.companies?.name;

            return (
              <article
                key={app.id}
                className="flex flex-col gap-3 rounded-card border border-border bg-card px-pad-i py-pad-b"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <h3 className="truncate text-body font-semibold">
                      {app.job_postings?.id ? (
                        <Link
                          href={`/jobs/${app.job_postings.id}`}
                          className="underline-offset-4 hover:underline"
                        >
                          {app.job_postings?.title || '공고'}
                        </Link>
                      ) : (
                        app.job_postings?.title || '공고'
                      )}
                    </h3>
                    <p className="truncate text-small text-muted-foreground">
                      {companyName || '기업명 미공개'}
                      {app.created_at
                        ? ` · ${new Date(app.created_at).toLocaleDateString('ko-KR')} 지원`
                        : ''}
                    </p>
                  </div>

                  <Badge tone={STAGE_TONE[stage] ?? 'neutral'} size="md" dot>
                    {STAGE_LABELS[stage] ?? stage}
                  </Badge>
                </div>

                {/* 진행 바 — 불합격이면 그리지 않는다 */}
                {!rejected ? (
                  <div className="flex items-center gap-1">
                    {FLOW.map((s, i) => (
                      <span
                        key={s}
                        title={STAGE_LABELS[s]}
                        className={cn(
                          'h-1.5 flex-1 rounded-pill transition-colors duration-slow',
                          i <= idx ? 'bg-primary' : 'bg-secondary',
                        )}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="rounded-control bg-sunk px-3.5 py-2.5 text-tiny text-muted-foreground">
                    이번에는 함께하지 못했습니다. 자동 산출된 점수만으로 판단됐다고 생각되면
                    기업에 설명과 사람의 재검토를 요구할 수 있습니다.
                  </p>
                )}

                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href="/seeker/messages">메시지</Link>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

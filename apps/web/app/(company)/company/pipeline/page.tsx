'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/field';
import { EmptyState, Skeleton } from '@/components/ui/states';
import { PageHeader } from '@/components/layouts/page-header';
import { useToast } from '@/components/ui/use-toast';
import { useCompanyAuthStore } from '@/lib/company-auth';
import { marketplaceApi } from '@/lib/marketplace-api';
import { cn } from '@/lib/utils';

/**
 * 전형 파이프라인 (칸반).
 *
 * 단계 색은 의미를 담는다 — 진행(청록) / 판단 대기(앰버) / 종료(중립·적색).
 * 무지개처럼 칠하면 어느 열을 먼저 봐야 하는지 알 수 없다.
 */
const STAGES = [
  { key: 'applied', label: '지원', tone: 'info' as const },
  { key: 'screening', label: '서류심사', tone: 'info' as const },
  { key: 'interview_scheduled', label: '면접예정', tone: 'signal' as const },
  { key: 'interviewing', label: '면접진행', tone: 'signal' as const },
  { key: 'evaluation', label: '평가', tone: 'warn' as const },
  { key: 'offer', label: '오퍼', tone: 'ok' as const },
  { key: 'hired', label: '채용완료', tone: 'ok' as const },
  { key: 'rejected', label: '불합격', tone: 'neutral' as const },
];

interface Application {
  id: string;
  stage?: string;
  seeker_profiles?: { display_name?: string };
  job_postings?: { title?: string };
  matches?: { fit_score?: { total?: number } };
}

export default function CompanyPipelinePage() {
  const router = useRouter();
  const { token, isAuthenticated } = useCompanyAuthStore();
  const { toast } = useToast();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [moving, setMoving] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/company/login');
      return;
    }
    marketplaceApi.applications.listCompany(token).then((res) => {
      setApplications(Array.isArray(res.data) ? (res.data as Application[]) : []);
      setLoading(false);
    });
  }, [isAuthenticated, token, router]);

  const handleStageChange = async (appId: string, newStage: string) => {
    if (!token) return;
    setMoving(appId);

    const prev = applications;
    // 낙관적 반영 — 칸반에서 카드가 멈춰 있으면 조작감이 사라진다
    setApplications((apps) =>
      apps.map((a) => (a.id === appId ? { ...a, stage: newStage } : a)),
    );

    const res = await marketplaceApi.applications.updateStage(appId, newStage, token);
    setMoving(null);

    if (res.error) {
      setApplications(prev);
      toast({
        title: '단계를 변경하지 못했습니다',
        description: res.error,
        variant: 'destructive',
      });
      return;
    }

    const label = STAGES.find((s) => s.key === newStage)?.label ?? newStage;
    toast({ title: `‘${label}’(으)로 이동했습니다` });
  };

  const byStage = STAGES.map((stage) => ({
    ...stage,
    apps: applications.filter((a) => a.stage === stage.key),
  }));

  const total = applications.length;

  return (
    <div>
      <PageHeader
        title="전형 파이프라인"
        description="지원자를 단계별로 관리합니다. 적합도는 참고 지표이며 단독 판단 근거로 쓰지 마세요."
        badge={total > 0 ? <Badge tone="outline" size="sm">{total}명</Badge> : undefined}
      />

      {loading ? (
        <div className="scroll-x flex gap-3 pb-4">
          {STAGES.slice(0, 5).map((s) => (
            <div key={s.key} className="w-64 shrink-0 flex-col gap-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="mt-2 h-20 w-full" />
              <Skeleton className="mt-2 h-20 w-full" />
            </div>
          ))}
        </div>
      ) : total === 0 ? (
        <EmptyState
          title="아직 지원자가 없습니다"
          description="공고를 등록하고 후보자에게 관심 표시를 보내면 지원이 들어옵니다."
          action={{ label: '공고 등록하기', href: '/company/jobs/new' }}
          secondaryAction={{ label: '후보자 탐색', href: '/company/candidates' }}
          icon={
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M5 4h14M5 4v16M19 4v16M5 20h14M9 9h6M9 13h6" strokeLinecap="round" />
            </svg>
          }
        />
      ) : (
        <div className="scroll-x pb-4">
          <div className="flex min-w-max gap-3">
            {byStage.map((stage) => (
              <section key={stage.key} className="flex w-64 shrink-0 flex-col gap-2.5">
                <header className="flex items-center justify-between gap-2 px-0.5">
                  <Badge tone={stage.tone} size="sm" dot>
                    {stage.label}
                  </Badge>
                  <span className="stat-num text-tiny text-muted-foreground">
                    {stage.apps.length}
                  </span>
                </header>

                <div
                  className={cn(
                    'flex min-h-[6rem] flex-col gap-2 rounded-card border border-dashed border-border p-2',
                    stage.apps.length === 0 && 'items-center justify-center',
                  )}
                >
                  {stage.apps.length === 0 ? (
                    <p className="text-micro text-muted-foreground">비어 있음</p>
                  ) : (
                    stage.apps.map((app) => {
                      const fit = app.matches?.fit_score?.total;
                      return (
                        <article
                          key={app.id}
                          className={cn(
                            'flex flex-col gap-2 rounded-control border border-border bg-card p-3',
                            'transition-[border-color,opacity] duration-fast hover:border-primary/45',
                            moving === app.id && 'opacity-60',
                          )}
                        >
                          <Link href={`/company/pipeline/${app.id}`} className="flex flex-col gap-1">
                            <span className="text-small font-semibold underline-offset-4 hover:underline">
                              {app.seeker_profiles?.display_name || '후보자'}
                            </span>
                            <span className="line-clamp-1 text-tiny text-muted-foreground">
                              {app.job_postings?.title || '공고 미지정'}
                            </span>
                          </Link>

                          {typeof fit === 'number' ? (
                            <div className="flex items-center gap-2">
                              <span className="h-1 flex-1 overflow-hidden rounded-pill bg-secondary">
                                <span
                                  className="block h-full rounded-pill bg-primary"
                                  style={{ width: `${Math.max(0, Math.min(100, fit))}%` }}
                                />
                              </span>
                              <span className="stat-num text-micro text-muted-foreground">
                                핏 {Math.round(fit)}
                              </span>
                            </div>
                          ) : null}

                          {stage.key !== 'hired' && stage.key !== 'rejected' ? (
                            <Select
                              aria-label={`${app.seeker_profiles?.display_name ?? '후보자'} 단계 이동`}
                              value=""
                              className="h-8 text-tiny"
                              onChange={(e) => {
                                if (e.target.value) handleStageChange(app.id, e.target.value);
                              }}
                            >
                              <option value="">단계 이동…</option>
                              {STAGES.filter((s) => s.key !== stage.key).map((s) => (
                                <option key={s.key} value={s.key}>
                                  {s.label}
                                </option>
                              ))}
                            </Select>
                          ) : null}
                        </article>
                      );
                    })
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

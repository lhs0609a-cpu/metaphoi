'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState, PageLoading } from '@/components/ui/states';
import { PageHeader } from '@/components/layouts/page-header';
import { FitScore } from '@/components/measure/fit-score';
import { useToast } from '@/components/ui/use-toast';
import { useCompanyAuthStore } from '@/lib/company-auth';
import { marketplaceApi } from '@/lib/marketplace-api';

const ABILITY_LABELS: Record<string, string> = {
  decisiveness: '결단력', composure: '침착성', focus: '집중력', creativity: '창의성',
  analytical: '분석력', adaptability: '적응력', communication: '소통능력', teamwork: '협동심',
  leadership: '리더십', empathy: '공감능력', influence: '영향력', networking: '네트워킹',
  execution: '실행력', planning: '기획력', problem_solving: '문제해결', time_management: '시간관리',
};

interface Candidate {
  seeker: {
    id: string;
    display_name?: string;
    headline?: string;
    desired_roles?: string[];
  };
  fit_score: { total: number; ability?: number; culture?: number; condition?: number };
}

interface Job {
  id: string;
  title: string;
  description?: string;
  status?: string;
  required_abilities?: Record<string, { min: number }>;
  preferred_culture?: string[];
  conditions?: Record<string, unknown>;
}

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  const { token, isAuthenticated } = useCompanyAuthStore();
  const { toast } = useToast();

  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/company/login');
      return;
    }

    Promise.all([
      marketplaceApi.jobs.get(jobId),
      marketplaceApi.jobs.getCandidates(jobId, token),
    ]).then(([jobRes, candRes]) => {
      setJob((jobRes.data as Job) ?? null);
      setCandidates(((candRes.data as { candidates?: Candidate[] })?.candidates ?? []) as Candidate[]);
      setLoading(false);
    });
  }, [jobId, isAuthenticated, token, router]);

  const handleClose = async () => {
    if (!token) return;
    setClosing(true);
    const res = await marketplaceApi.jobs.close(jobId, token);
    setClosing(false);
    setConfirmClose(false);

    if (res.error) {
      toast({ title: '마감하지 못했습니다', description: res.error, variant: 'destructive' });
      return;
    }
    toast({ title: '공고를 마감했습니다' });
    router.push('/company/jobs');
  };

  if (loading) return <PageLoading label="공고를 불러오는 중" />;
  if (!job) {
    return (
      <EmptyState
        title="공고를 찾을 수 없습니다"
        description="삭제되었거나 접근 권한이 없는 공고입니다."
        action={{ label: '공고 목록으로', href: '/company/jobs' }}
      />
    );
  }

  const isActive = job.status === 'active';
  const required = Object.entries(job.required_abilities ?? {});
  const sorted = [...candidates].sort((a, b) => (b.fit_score?.total ?? 0) - (a.fit_score?.total ?? 0));

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={job.title}
        badge={
          <Badge tone={isActive ? 'ok' : 'neutral'} size="sm" dot>
            {isActive ? '모집중' : '마감'}
          </Badge>
        }
        actions={
          isActive ? (
            confirmClose ? (
              <div className="flex items-center gap-2">
                <span className="text-tiny text-muted-foreground">마감할까요?</span>
                <Button size="sm" variant="danger" loading={closing} onClick={handleClose}>
                  마감
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmClose(false)}>
                  취소
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setConfirmClose(true)}>
                공고 마감
              </Button>
            )
          ) : undefined
        }
      />

      {job.description ? (
        <section className="rounded-card border border-border bg-card px-pad-i py-pad-b">
          <h2 className="mb-2 text-h4">상세 설명</h2>
          <p className="whitespace-pre-wrap text-small leading-relaxed text-muted-foreground">
            {job.description}
          </p>
        </section>
      ) : null}

      {/* 요구 조건 */}
      {(required.length > 0 || (job.preferred_culture ?? []).length > 0) ? (
        <section className="mt-4 flex flex-col gap-4 rounded-card border border-border bg-card px-pad-i py-pad-b">
          {required.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              <h2 className="text-h4">요구 능력치</h2>
              <div className="flex flex-col gap-1.5">
                {required.map(([key, val]) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="w-20 shrink-0 text-small">{ABILITY_LABELS[key] ?? key}</span>
                    <span className="relative h-1.5 flex-1 overflow-hidden rounded-pill bg-secondary">
                      <span
                        className="absolute inset-y-0 left-0 rounded-pill bg-primary/30"
                        style={{ width: `${val.min}%` }}
                      />
                      <span
                        className="absolute inset-y-[-3px] w-0.5 bg-primary"
                        style={{ left: `${val.min}%` }}
                      />
                    </span>
                    <span className="stat-num w-12 shrink-0 text-right text-small">{val.min}+</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {(job.preferred_culture ?? []).length > 0 ? (
            <div className="flex flex-col gap-2">
              <h2 className="text-h4">선호하는 일하는 방식</h2>
              <div className="flex flex-wrap gap-1.5">
                {(job.preferred_culture ?? []).map((t) => (
                  <Badge key={t} tone="signal" size="sm">{t}</Badge>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* 추천 후보자 */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-h4">추천 후보자</h2>
          <Badge tone="outline" size="sm">{sorted.length}명</Badge>
        </div>

        {sorted.length === 0 ? (
          <EmptyState
            title="아직 추천할 후보자가 없습니다"
            description="요구 능력치를 완화하거나, 후보자 탐색에서 직접 관심 표시를 보내보세요."
            action={{ label: '후보자 탐색', href: '/company/candidates' }}
            secondaryAction={{ label: '공고 수정', href: '/company/jobs' }}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {sorted.map((cand) => (
              <article
                key={cand.seeker.id}
                className="flex flex-col gap-4 rounded-card border border-border bg-card px-pad-i py-pad-b sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex min-w-0 flex-col gap-2">
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-body font-semibold">
                      {cand.seeker.display_name || '익명 후보자'}
                    </h3>
                    {cand.seeker.headline ? (
                      <p className="line-clamp-2 max-w-prose text-small text-muted-foreground">
                        {cand.seeker.headline}
                      </p>
                    ) : null}
                  </div>

                  {(cand.seeker.desired_roles ?? []).length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {(cand.seeker.desired_roles ?? []).slice(0, 3).map((r) => (
                        <Badge key={r} tone="outline" size="sm">{r}</Badge>
                      ))}
                    </div>
                  ) : null}

                  <Button asChild variant="outline" size="sm" className="mt-1 self-start">
                    <Link href={`/company/candidates/${cand.seeker.id}`}>상세 보기</Link>
                  </Button>
                </div>

                <div className="w-full shrink-0 sm:w-56">
                  <FitScore fit={cand.fit_score} size="sm" showNote={false} />
                </div>
              </article>
            ))}

            <p className="text-tiny leading-relaxed text-muted-foreground">
              적합도 가중치(능력 60% · 컬처 25% · 조건 15%)는 아직 준거 데이터로 검증되지 않은
              설정값입니다. 정렬 참고용으로만 사용하고, 자동 산출 점수만으로 불합격을 결정하지 마세요.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

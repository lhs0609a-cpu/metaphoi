'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState, SkeletonRows } from '@/components/ui/states';
import { PageHeader, StatTile } from '@/components/layouts/page-header';
import { TableFrame, Table, THead, TBody, Tr, Th, Td } from '@/components/ui/table';
import { useCompanyAuthStore } from '@/lib/company-auth';
import { marketplaceApi } from '@/lib/marketplace-api';

interface JobRow {
  id: string;
  title: string;
  status?: string;
  created_at?: string;
  application_count?: number;
}

const STATUS: Record<string, { label: string; tone: 'ok' | 'info' | 'neutral' }> = {
  active: { label: '모집중', tone: 'ok' },
  filled: { label: '채용완료', tone: 'info' },
  closed: { label: '마감', tone: 'neutral' },
};

/**
 * 기업 대시보드 (ops 표면).
 *
 * 숫자 타일만 늘어놓지 않는다. "지금 내가 뭘 해야 하는가"가 먼저 보여야 한다.
 * 그래서 지표 아래에 바로 처리 대기 목록을 둔다.
 */
export default function CompanyDashboardPage() {
  const router = useRouter();
  const { member, token, isAuthenticated } = useCompanyAuthStore();
  const [stats, setStats] = useState({ jobs: 0, matches: 0, applications: 0 });
  const [recentJobs, setRecentJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !token || !member) {
      router.push('/company/login');
      return;
    }

    Promise.all([
      marketplaceApi.jobs.list({ company_id: member.company_id }),
      marketplaceApi.matching.getCompanyMatches(token),
      marketplaceApi.applications.listCompany(token),
    ])
      .then(([jobsRes, matchesRes, appsRes]) => {
        const jobs = ((jobsRes.data as { jobs?: JobRow[] })?.jobs ?? []) as JobRow[];
        setRecentJobs(jobs.slice(0, 6));
        setStats({
          jobs: jobs.length,
          matches: Array.isArray(matchesRes.data) ? matchesRes.data.length : 0,
          applications: Array.isArray(appsRes.data) ? appsRes.data.length : 0,
        });
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, token, member, router]);

  if (!member) return null;

  return (
    <div>
      <PageHeader
        eyebrow={member.company_name}
        title="대시보드"
        description={`${member.name}님, 오늘 처리할 항목을 정리했습니다.`}
        actions={
          <Button asChild>
            <Link href="/company/jobs/new">새 공고 등록</Link>
          </Button>
        }
      />

      {/* 지표 */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label="활성 공고" value={stats.jobs} unit="건" hint="모집 중인 공고" />
        <StatTile
          label="AI 매칭 후보"
          value={stats.matches}
          unit="명"
          hint="적합도 기준 상위 후보"
          tone={stats.matches > 0 ? 'ok' : 'neutral'}
        />
        <StatTile
          label="지원자"
          value={stats.applications}
          unit="명"
          hint="전형 진행 중"
          tone={stats.applications > 0 ? 'warn' : 'neutral'}
        />
      </div>

      {/* 적합도 산출 고지 — 채용에 쓰는 이상 필수 */}
      <div className="mt-4 rounded-card border border-border bg-sunk px-4 py-3">
        <p className="text-tiny leading-relaxed text-muted-foreground">
          <strong className="text-foreground">적합도 산출 안내</strong> · 매칭 점수는
          능력 적합 60% + 컬처핏 25% + 조건 15%로 계산된 참고 지표입니다.
          아직 준거 타당도가 검증되지 않았으므로 <strong className="text-foreground">단독 근거로
          합격·불합격을 결정하지 마세요.</strong> 지원자는 자동화된 평가에 대해
          설명을 요구하고 사람의 재검토를 요청할 수 있습니다.
        </p>
      </div>

      {/* 최근 공고 */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-h4">최근 채용 공고</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/company/jobs">전체 보기</Link>
          </Button>
        </div>

        {loading ? (
          <TableFrame>
            <SkeletonRows rows={4} />
          </TableFrame>
        ) : recentJobs.length === 0 ? (
          <EmptyState
            title="등록된 공고가 없습니다"
            description="공고를 올리면 요구 능력치를 기준으로 적합한 후보를 자동으로 찾아 드립니다."
            action={{ label: '첫 공고 등록하기', href: '/company/jobs/new' }}
            icon={
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M3 8h18v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8Z" />
                <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            }
          />
        ) : (
          <TableFrame>
            <Table>
              <THead>
                <Tr>
                  <Th>공고명</Th>
                  <Th>상태</Th>
                  <Th numeric>지원자</Th>
                  <Th>등록일</Th>
                </Tr>
              </THead>
              <TBody>
                {recentJobs.map((job) => {
                  const s = STATUS[job.status ?? 'closed'] ?? STATUS.closed;
                  return (
                    <Tr
                      key={job.id}
                      clickable
                      onClick={() => router.push(`/company/jobs/${job.id}`)}
                    >
                      <Td>
                        <Link
                          href={`/company/jobs/${job.id}`}
                          className="font-medium underline-offset-4 hover:underline"
                        >
                          {job.title}
                        </Link>
                      </Td>
                      <Td>
                        <Badge tone={s.tone} size="sm" dot>
                          {s.label}
                        </Badge>
                      </Td>
                      <Td numeric>{job.application_count ?? 0}</Td>
                      <Td>
                        {job.created_at
                          ? new Date(job.created_at).toLocaleDateString('ko-KR')
                          : '—'}
                      </Td>
                    </Tr>
                  );
                })}
              </TBody>
            </Table>
          </TableFrame>
        )}
      </section>

      {/* 바로가기 */}
      <section className="mt-8">
        <h2 className="mb-3 text-h4">바로가기</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { href: '/company/candidates', title: '후보자 탐색', desc: '능력치 기준으로 인재 찾기' },
            { href: '/company/pipeline', title: '전형 파이프라인', desc: '지원자 단계 관리' },
            { href: '/company/team', title: '팀 프로필', desc: '기존 팀 성향 등록 · 컬처핏 기준' },
          ].map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group flex flex-col gap-1 rounded-card border border-border bg-card px-4 py-3.5 transition-[border-color,box-shadow] duration-fast hover:border-border-strong hover:shadow-e2"
            >
              <span className="flex items-center justify-between text-body font-semibold">
                {s.title}
                <svg
                  className="h-4 w-4 text-muted-foreground transition-transform duration-fast group-hover:translate-x-0.5"
                  viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                >
                  <path d="M6 3l5 5-5 5" />
                </svg>
              </span>
              <span className="text-tiny text-muted-foreground">{s.desc}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

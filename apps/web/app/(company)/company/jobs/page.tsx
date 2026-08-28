'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState, SkeletonRows } from '@/components/ui/states';
import { PageHeader } from '@/components/layouts/page-header';
import { TableFrame, Table, THead, TBody, Tr, Th, Td } from '@/components/ui/table';
import { useCompanyAuthStore } from '@/lib/company-auth';
import { marketplaceApi } from '@/lib/marketplace-api';
import { cn } from '@/lib/utils';

interface Job {
  id: string;
  title: string;
  description?: string;
  status?: string;
  created_at?: string;
  application_count?: number;
}

const STATUS: Record<string, { label: string; tone: 'ok' | 'info' | 'neutral' | 'warn' }> = {
  active: { label: '모집중', tone: 'ok' },
  filled: { label: '채용완료', tone: 'info' },
  draft: { label: '임시저장', tone: 'warn' },
  closed: { label: '마감', tone: 'neutral' },
};

const FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'active', label: '모집중' },
  { key: 'draft', label: '임시저장' },
  { key: 'closed', label: '마감' },
];

export default function CompanyJobsPage() {
  const router = useRouter();
  const { member, isAuthenticated } = useCompanyAuthStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!isAuthenticated || !member) {
      router.push('/company/login');
      return;
    }
    marketplaceApi.jobs.list({ company_id: member.company_id }).then((res) => {
      setJobs(((res.data as { jobs?: Job[] })?.jobs ?? []) as Job[]);
      setLoading(false);
    });
  }, [isAuthenticated, member, router]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: jobs.length };
    for (const j of jobs) {
      const s = j.status ?? 'closed';
      c[s] = (c[s] ?? 0) + 1;
    }
    return c;
  }, [jobs]);

  const visible = filter === 'all' ? jobs : jobs.filter((j) => (j.status ?? 'closed') === filter);

  return (
    <div>
      <PageHeader
        title="채용 공고"
        description="공고에 요구 능력치를 설정하면 적합한 후보가 자동으로 매칭됩니다."
        actions={
          <Button asChild>
            <Link href="/company/jobs/new">새 공고</Link>
          </Button>
        }
      >
        {/* 필터 탭 */}
        <div className="scroll-x flex gap-1 border-b border-border" role="tablist">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'relative whitespace-nowrap px-3.5 py-2.5 text-small transition-colors duration-fast',
                filter === f.key
                  ? 'font-semibold text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {f.label}
              <span className="ml-1.5 text-micro text-muted-foreground tnum">
                {counts[f.key] ?? 0}
              </span>
              <span
                className={cn(
                  'absolute inset-x-2 -bottom-px h-0.5 rounded-pill bg-primary transition-opacity duration-fast',
                  filter === f.key ? 'opacity-100' : 'opacity-0',
                )}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      </PageHeader>

      {loading ? (
        <TableFrame>
          <SkeletonRows rows={5} />
        </TableFrame>
      ) : visible.length === 0 ? (
        <EmptyState
          title={filter === 'all' ? '등록된 공고가 없습니다' : '해당 상태의 공고가 없습니다'}
          description={
            filter === 'all'
              ? '첫 공고를 등록하면 요구 능력치 기준으로 후보를 찾아 드립니다.'
              : '다른 상태를 선택하거나 새 공고를 등록해 보세요.'
          }
          action={{ label: '새 공고 등록', href: '/company/jobs/new' }}
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
                <Th />
              </Tr>
            </THead>
            <TBody>
              {visible.map((job) => {
                const s = STATUS[job.status ?? 'closed'] ?? STATUS.closed;
                return (
                  <Tr key={job.id} clickable onClick={() => router.push(`/company/jobs/${job.id}`)}>
                    <Td>
                      <div className="flex flex-col gap-0.5">
                        <Link
                          href={`/company/jobs/${job.id}`}
                          className="font-medium underline-offset-4 hover:underline"
                        >
                          {job.title}
                        </Link>
                        {job.description ? (
                          <span className="line-clamp-1 max-w-[42ch] text-tiny text-muted-foreground">
                            {job.description}
                          </span>
                        ) : null}
                      </div>
                    </Td>
                    <Td>
                      <Badge tone={s.tone} size="sm" dot>
                        {s.label}
                      </Badge>
                    </Td>
                    <Td numeric>{job.application_count ?? 0}</Td>
                    <Td>
                      {job.created_at ? new Date(job.created_at).toLocaleDateString('ko-KR') : '—'}
                    </Td>
                    <Td>
                      <svg
                        className="h-4 w-4 text-muted-foreground"
                        viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                      >
                        <path d="M6 3l5 5-5 5" />
                      </svg>
                    </Td>
                  </Tr>
                );
              })}
            </TBody>
          </Table>
        </TableFrame>
      )}
    </div>
  );
}

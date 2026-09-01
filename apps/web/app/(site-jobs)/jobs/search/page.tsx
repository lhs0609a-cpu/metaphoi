'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState, PageLoading, Skeleton } from '@/components/ui/states';
import { marketplaceApi } from '@/lib/marketplace-api';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    marketplaceApi.jobs.list().then((res) => {
      let allJobs = (res.data as any)?.jobs || [];
      if (query) {
        const q = query.toLowerCase();
        allJobs = allJobs.filter(
          (job: any) =>
            job.title?.toLowerCase().includes(q) ||
            job.description?.toLowerCase().includes(q) ||
            job.companies?.name?.toLowerCase().includes(q)
        );
      }
      setJobs(allJobs);
      setLoading(false);
    });
  }, [query]);

  return (
    <div className="shell max-w-[48rem] py-10 lg:py-14">
      <header className="flex flex-col items-start gap-2">
        <p className="eyebrow">검색</p>
        <h1 className="text-h1">{query ? `"${query}"` : '채용 공고'}</h1>
        {query ? (
          <p className="text-small text-muted-foreground">
            <span className="stat-num" data-numeric>
              {jobs.length}
            </span>
            건
          </p>
        ) : null}
      </header>

      <div className="mt-8">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            title={query ? '검색 결과가 없습니다' : '등록된 공고가 없습니다'}
            description={
              query
                ? '다른 키워드로 찾아보시거나 전체 목록을 확인하세요.'
                : '기업이 공고를 올리면 여기에 나타납니다.'
            }
            action={{ label: '전체 공고 보기', href: '/jobs' }}
          />
        ) : (
          <ul className="flex flex-col">
            {jobs.map((job) => (
              <li key={job.id} className="border-t border-border last:border-b">
                <Link
                  href={`/jobs/${job.id}`}
                  className="flex flex-col gap-2 py-5 transition-colors duration-fast hover:bg-sunk"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lead font-semibold">{job.title}</span>
                    <Badge tone={job.status === 'active' ? 'ok' : 'neutral'} size="sm" dot>
                      {job.status === 'active' ? '모집중' : '마감'}
                    </Badge>
                  </div>

                  <p className="text-small text-muted-foreground">
                    {job.companies?.name ?? '기업명 미상'}
                    {job.companies?.location ? ` · ${job.companies.location}` : ''}
                  </p>

                  {job.description ? (
                    <p className="line-clamp-2 max-w-prose text-small text-muted-foreground">
                      {job.description}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-tiny text-muted-foreground">
                    {job.conditions?.salary_range ? <span>{job.conditions.salary_range}</span> : null}
                    {job.conditions?.location ? <span>{job.conditions.location}</span> : null}
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
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function JobsSearchPage() {
  return (
    <Suspense fallback={<PageLoading label="불러오는 중" />}>
      <SearchContent />
    </Suspense>
  );
}

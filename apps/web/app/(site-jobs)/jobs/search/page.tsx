'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">채용공고 검색</h1>
        {query && (
          <p className="text-muted-foreground">
            &quot;{query}&quot; 검색 결과 ({jobs.length}건)
          </p>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        </div>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              {query ? `"${query}"에 대한 검색 결과가 없습니다` : '현재 채용 공고가 없습니다'}
            </p>
            <Link href="/jobs">
              <Button variant="outline">전체 공고 보기</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer mb-4">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold">{job.title}</h3>
                      <p className="text-sm text-primary">
                        {job.companies?.name || '기업명'}
                        {job.companies?.location && ` · ${job.companies.location}`}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {job.description || ''}
                      </p>
                      <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                        {job.conditions?.salary_range && <span>{job.conditions.salary_range}</span>}
                        {job.conditions?.remote && (
                          <span>
                            {job.conditions.remote === 'remote' ? '재택' : job.conditions.remote === 'hybrid' ? '하이브리드' : '출근'}
                          </span>
                        )}
                        {job.conditions?.location && <span>{job.conditions.location}</span>}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full shrink-0 ${
                      job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {job.status === 'active' ? '모집중' : '마감'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function JobsSearchPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

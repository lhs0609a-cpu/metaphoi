'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCompanyAuthStore } from '@/lib/company-auth';
import { marketplaceApi } from '@/lib/marketplace-api';

export default function CompanyJobsPage() {
  const router = useRouter();
  const { member, token, isAuthenticated } = useCompanyAuthStore();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !member) {
      router.push('/company/login');
      return;
    }

    marketplaceApi.jobs.list({ company_id: member.company_id }).then((res) => {
      setJobs((res.data as any)?.jobs || []);
      setLoading(false);
    });
  }, [isAuthenticated, member, router]);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/company/dashboard" className="text-xl font-bold text-primary">Metaphoi</Link>
          <Link href="/company/jobs/new">
            <Button size="sm">새 공고</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">채용 공고 관리</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          </div>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">등록된 공고가 없습니다</p>
              <Link href="/company/jobs/new">
                <Button>첫 공고 등록하기</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Link key={job.id} href={`/company/jobs/${job.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold">{job.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {job.description || '설명 없음'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(job.created_at).toLocaleDateString('ko-KR')} 등록
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-xs rounded-full shrink-0 ${
                        job.status === 'active' ? 'bg-green-100 text-green-700' :
                        job.status === 'filled' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {job.status === 'active' ? '모집중' : job.status === 'filled' ? '채용완료' : job.status === 'draft' ? '임시저장' : '마감'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

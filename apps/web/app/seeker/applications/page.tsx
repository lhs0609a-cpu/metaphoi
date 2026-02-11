'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/lib/auth';
import { marketplaceApi } from '@/lib/marketplace-api';

const STAGE_LABELS: Record<string, string> = {
  applied: '지원완료', screening: '서류심사', interview_scheduled: '면접예정',
  interviewing: '면접진행', evaluation: '평가중', offer: '오퍼',
  hired: '채용확정', rejected: '불합격',
};

const STAGE_COLORS: Record<string, string> = {
  applied: 'bg-blue-100 text-blue-700',
  screening: 'bg-yellow-100 text-yellow-700',
  interview_scheduled: 'bg-purple-100 text-purple-700',
  interviewing: 'bg-purple-100 text-purple-700',
  evaluation: 'bg-orange-100 text-orange-700',
  offer: 'bg-green-100 text-green-700',
  hired: 'bg-green-200 text-green-800',
  rejected: 'bg-red-100 text-red-700',
};

export default function SeekerApplicationsPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuthStore();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    marketplaceApi.applications.listSeeker(token).then((res) => {
      setApplications(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    });
  }, [isAuthenticated, token, router]);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">Metaphoi</Link>
          <div className="flex gap-2">
            <Link href="/seeker/profile"><Button variant="outline" size="sm">프로필</Button></Link>
            <Link href="/seeker/matches"><Button variant="outline" size="sm">매칭</Button></Link>
            <Link href="/seeker/messages"><Button variant="outline" size="sm">메시지</Button></Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">지원 현황</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          </div>
        ) : applications.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p className="mb-4">지원 내역이 없습니다</p>
              <Link href="/seeker/matches">
                <Button variant="outline">매칭 확인하기</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{app.job_postings?.title || '채용 공고'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {app.job_postings?.companies?.name || '기업'}
                      </p>
                      {app.matches?.fit_score && (
                        <p className="text-xs text-primary mt-1">핏 {app.matches.fit_score.total}%</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(app.applied_at).toLocaleDateString('ko-KR')} 지원
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full ${STAGE_COLORS[app.stage] || 'bg-gray-100'}`}>
                      {STAGE_LABELS[app.stage] || app.stage}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

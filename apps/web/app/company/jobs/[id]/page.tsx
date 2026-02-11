'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCompanyAuthStore } from '@/lib/company-auth';
import { marketplaceApi } from '@/lib/marketplace-api';

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  const { token, isAuthenticated } = useCompanyAuthStore();

  const [job, setJob] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/company/login');
      return;
    }

    Promise.all([
      marketplaceApi.jobs.get(jobId),
      marketplaceApi.jobs.getCandidates(jobId, token),
    ]).then(([jobRes, candRes]) => {
      setJob(jobRes.data);
      setCandidates((candRes.data as any)?.candidates || []);
      setLoading(false);
    });
  }, [jobId, isAuthenticated, token, router]);

  const handleClose = async () => {
    if (!token || !confirm('공고를 마감하시겠습니까?')) return;
    await marketplaceApi.jobs.close(jobId, token);
    router.push('/company/jobs');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!job) return null;

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/company/dashboard" className="text-xl font-bold text-primary">Metaphoi</Link>
          <div className="flex gap-2">
            <Link href="/company/jobs">
              <Button variant="outline" size="sm">공고 목록</Button>
            </Link>
            {job.status === 'active' && (
              <Button variant="destructive" size="sm" onClick={handleClose}>공고 마감</Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <span className={`px-2 py-1 text-xs rounded-full ${
              job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {job.status === 'active' ? '모집중' : '마감'}
            </span>
          </div>
          {job.description && (
            <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
          )}
        </div>

        {/* 요구 능력치 */}
        {job.required_abilities && Object.keys(job.required_abilities).length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">요구 능력치</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(job.required_abilities).map(([key, val]: any) => (
                  <span key={key} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                    {key}: {val.min}+
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 추천 후보자 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">추천 후보자 ({candidates.length}명)</CardTitle>
          </CardHeader>
          <CardContent>
            {candidates.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">추천할 후보자가 없습니다</p>
            ) : (
              <div className="space-y-4">
                {candidates.map((cand: any) => (
                  <div key={cand.seeker.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{cand.seeker.display_name || '익명'}</p>
                      <p className="text-sm text-muted-foreground">{cand.seeker.headline || ''}</p>
                      <div className="flex gap-2 mt-2">
                        {(cand.seeker.desired_roles || []).slice(0, 3).map((r: string) => (
                          <span key={r} className="px-2 py-0.5 bg-muted text-xs rounded-full">{r}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{cand.fit_score.total}%</p>
                      <p className="text-xs text-muted-foreground">핏 점수</p>
                      <div className="flex gap-1 mt-1 text-xs text-muted-foreground">
                        <span>능력 {cand.fit_score.ability}</span>
                        <span>문화 {cand.fit_score.culture}</span>
                        <span>조건 {cand.fit_score.condition}</span>
                      </div>
                      <Link href={`/company/candidates/${cand.seeker.id}`}>
                        <Button size="sm" variant="outline" className="mt-2">상세 보기</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

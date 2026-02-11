'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCompanyAuthStore } from '@/lib/company-auth';
import { marketplaceApi } from '@/lib/marketplace-api';

const STAGES = [
  { key: 'applied', label: '지원', color: 'bg-blue-100 text-blue-700' },
  { key: 'screening', label: '서류심사', color: 'bg-yellow-100 text-yellow-700' },
  { key: 'interview_scheduled', label: '면접예정', color: 'bg-purple-100 text-purple-700' },
  { key: 'interviewing', label: '면접진행', color: 'bg-purple-100 text-purple-700' },
  { key: 'evaluation', label: '평가', color: 'bg-orange-100 text-orange-700' },
  { key: 'offer', label: '오퍼', color: 'bg-green-100 text-green-700' },
  { key: 'hired', label: '채용완료', color: 'bg-green-200 text-green-800' },
  { key: 'rejected', label: '불합격', color: 'bg-red-100 text-red-700' },
];

export default function CompanyPipelinePage() {
  const router = useRouter();
  const { token, isAuthenticated } = useCompanyAuthStore();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/company/login');
      return;
    }

    marketplaceApi.applications.listCompany(token).then((res) => {
      setApplications(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    });
  }, [isAuthenticated, token, router]);

  const handleStageChange = async (appId: string, newStage: string) => {
    if (!token) return;
    await marketplaceApi.applications.updateStage(appId, newStage, token);
    // 새로고침
    const res = await marketplaceApi.applications.listCompany(token);
    setApplications(Array.isArray(res.data) ? res.data : []);
  };

  const appsByStage = STAGES.map((stage) => ({
    ...stage,
    apps: applications.filter((a) => a.stage === stage.key),
  }));

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/company/dashboard" className="text-xl font-bold text-primary">Metaphoi</Link>
          <div className="flex gap-2">
            <Link href="/company/candidates"><Button variant="outline" size="sm">후보자</Button></Link>
            <Link href="/company/messages"><Button variant="outline" size="sm">메시지</Button></Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">ATS 파이프라인</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {appsByStage.map((stage) => (
                <div key={stage.key} className="w-64 shrink-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${stage.color}`}>
                      {stage.label}
                    </span>
                    <span className="text-sm text-muted-foreground">{stage.apps.length}</span>
                  </div>

                  <div className="space-y-3">
                    {stage.apps.map((app) => (
                      <Card key={app.id} className="cursor-pointer hover:border-primary/50 transition-colors">
                        <CardContent className="py-3 px-4">
                          <Link href={`/company/pipeline/${app.id}`}>
                            <p className="font-medium text-sm">
                              {app.seeker_profiles?.display_name || '후보자'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {app.job_postings?.title || ''}
                            </p>
                            {app.matches?.fit_score && (
                              <p className="text-xs text-primary mt-1">
                                핏 {app.matches.fit_score.total}%
                              </p>
                            )}
                          </Link>

                          {/* 단계 이동 버튼 */}
                          <div className="flex gap-1 mt-2">
                            {stage.key !== 'hired' && stage.key !== 'rejected' && (
                              <select
                                className="text-xs border rounded px-1 py-0.5 w-full"
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) handleStageChange(app.id, e.target.value);
                                }}
                              >
                                <option value="">이동...</option>
                                {STAGES.filter((s) => s.key !== stage.key).map((s) => (
                                  <option key={s.key} value={s.key}>{s.label}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCompanyAuthStore } from '@/lib/company-auth';
import { marketplaceApi } from '@/lib/marketplace-api';

export default function CompanyDashboardPage() {
  const router = useRouter();
  const { member, token, isAuthenticated, logout } = useCompanyAuthStore();
  const [stats, setStats] = useState({ jobs: 0, matches: 0, applications: 0 });
  const [recentJobs, setRecentJobs] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !token || !member) {
      router.push('/company/login');
      return;
    }

    // 통계 로드
    Promise.all([
      marketplaceApi.jobs.list({ company_id: member.company_id }),
      marketplaceApi.matching.getCompanyMatches(token),
      marketplaceApi.applications.listCompany(token),
    ]).then(([jobsRes, matchesRes, appsRes]) => {
      const jobs = (jobsRes.data as any)?.jobs || [];
      setRecentJobs(jobs.slice(0, 5));
      setStats({
        jobs: jobs.length,
        matches: Array.isArray(matchesRes.data) ? matchesRes.data.length : 0,
        applications: Array.isArray(appsRes.data) ? appsRes.data.length : 0,
      });
    });
  }, [isAuthenticated, token, member, router]);

  if (!member) return null;

  const navItems = [
    { href: '/company/jobs', label: '채용 공고' },
    { href: '/company/candidates', label: '후보자 탐색' },
    { href: '/company/pipeline', label: 'ATS 파이프라인' },
    { href: '/company/team', label: '팀 프로필' },
    { href: '/company/messages', label: '메시지' },
  ];

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">Metaphoi</Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{member.company_name}</span>
            <Button variant="outline" size="sm" onClick={() => { logout(); router.push('/'); }}>
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">{member.company_name} 대시보드</h1>
            <p className="text-muted-foreground">{member.name}님, 안녕하세요</p>
          </div>
          <Link href="/company/jobs/new">
            <Button>새 공고 등록</Button>
          </Link>
        </div>

        {/* 네비게이션 */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button variant="outline" size="sm">{item.label}</Button>
            </Link>
          ))}
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-primary">{stats.jobs}</p>
              <p className="text-sm text-muted-foreground mt-1">활성 공고</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-primary">{stats.matches}</p>
              <p className="text-sm text-muted-foreground mt-1">매칭</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-primary">{stats.applications}</p>
              <p className="text-sm text-muted-foreground mt-1">지원자</p>
            </CardContent>
          </Card>
        </div>

        {/* 최근 공고 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>최근 채용 공고</CardTitle>
              <Link href="/company/jobs">
                <Button variant="ghost" size="sm">전체 보기</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentJobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">등록된 공고가 없습니다</p>
                <Link href="/company/jobs/new">
                  <Button>첫 공고 등록하기</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentJobs.map((job: any) => (
                  <Link key={job.id} href={`/company/jobs/${job.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                      <div>
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(job.created_at).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        job.status === 'active' ? 'bg-green-100 text-green-700' :
                        job.status === 'filled' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {job.status === 'active' ? '모집중' : job.status === 'filled' ? '채용완료' : '마감'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

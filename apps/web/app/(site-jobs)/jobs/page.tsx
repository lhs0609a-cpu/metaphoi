'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { marketplaceApi } from '@/lib/marketplace-api';

export default function JobsHomePage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      marketplaceApi.jobs.list(),
      marketplaceApi.companies.list(),
    ]).then(([jobsRes, compRes]) => {
      setJobs((jobsRes.data as any)?.jobs || []);
      setCompanies((compRes.data as any)?.companies || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="bg-gradient-to-b from-background to-muted/30">
      {/* Hero */}
      <section className="container mx-auto px-4 pt-12 pb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          능력치 기반 <span className="text-primary">채용 매칭</span> 플랫폼
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto mb-6">
          7가지 심리검사로 측정된 30가지 능력치를 기반으로
          나에게 가장 잘 맞는 기업을 찾아드립니다
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/seeker/register">
            <Button size="lg">프로필 등록하기</Button>
          </Link>
          <Link href="/company/register">
            <Button variant="outline" size="lg">기업 가입하기</Button>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { step: '1', title: '무료 검사 완료', desc: '30가지 능력치 프로필이 자동 생성됩니다' },
            { step: '2', title: '프로필 등록', desc: '나와 핏이 맞는 기업이 자동으로 매칭됩니다' },
            { step: '3', title: '매칭 & 채용', desc: '양방향 관심 확인 후 면접, 그리고 채용까지' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                {item.step}
              </div>
              <h3 className="font-bold mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 추천 채용공고 */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">채용 공고</h2>
          <Link href="/jobs/search" className="text-sm text-primary hover:underline">
            전체 보기
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          </div>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              현재 채용 공고가 없습니다. 곧 등록될 예정입니다.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.slice(0, 6).map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardContent className="pt-5 pb-4">
                    <h3 className="font-bold mb-1 line-clamp-1">{job.title}</h3>
                    <p className="text-sm text-primary mb-2">
                      {job.companies?.name || '기업명'}
                      {job.companies?.location && ` · ${job.companies.location}`}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {job.description || ''}
                    </p>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      {job.conditions?.salary_range && <span>{job.conditions.salary_range}</span>}
                      {job.conditions?.remote && (
                        <span>
                          {job.conditions.remote === 'remote' ? '재택' : job.conditions.remote === 'hybrid' ? '하이브리드' : '출근'}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 기업 리스트 */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">기업 정보</h2>
          <Link href="/jobs/companies" className="text-sm text-primary hover:underline">
            전체 보기
          </Link>
        </div>

        {loading ? null : companies.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              등록된 기업이 없습니다
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {companies.slice(0, 8).map((company) => (
              <Link key={company.id} href={`/jobs/companies/${company.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardContent className="pt-5 pb-4">
                    <h3 className="font-bold mb-1">{company.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {company.industry || ''} {company.size_range ? `· ${company.size_range}명` : ''}
                    </p>
                    {company.culture_tags && company.culture_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {company.culture_tags.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{tag}</span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-12 text-center">
        <Card className="max-w-xl mx-auto">
          <CardContent className="pt-8 pb-6">
            <h2 className="text-xl font-bold mb-2">아직 검사를 안 하셨나요?</h2>
            <p className="text-sm text-muted-foreground mb-4">
              무료 검사를 완료하면 능력치 기반 채용 매칭을 받을 수 있습니다
            </p>
            <Link href="/start">
              <Button>무료 검사 시작하기</Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

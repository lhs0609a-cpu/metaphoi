'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/auth';
import { marketplaceApi } from '@/lib/marketplace-api';

export default function JobDetailPublicPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const { token, isAuthenticated } = useAuthStore();

  const [job, setJob] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    marketplaceApi.jobs.get(jobId).then((res) => {
      const jobData = res.data as any;
      setJob(jobData);
      if (jobData?.company_id) {
        marketplaceApi.companies.get(jobData.company_id).then((compRes) => {
          setCompany(compRes.data);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, [jobId]);

  const handleApply = async () => {
    if (!isAuthenticated || !token) {
      router.push(`/login?redirect=${encodeURIComponent(`/jobs/${jobId}`)}`);
      return;
    }

    const result = await marketplaceApi.matching.sendSeekerInterest(
      { to_type: 'company', to_id: job.company_id, job_posting_id: jobId },
      token,
    );

    if (result.error) {
      alert(result.error);
    } else {
      setApplied(true);
      if ((result.data as any)?.match) {
        alert('매칭이 성사되었습니다!');
      } else {
        alert('지원이 완료되었습니다');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground mb-4">공고를 찾을 수 없습니다</p>
        <Link href="/jobs">
          <Button variant="outline">공고 목록으로</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* 공고 정보 */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">{job.title}</h1>
          <span className={`px-2 py-1 text-xs rounded-full ${
            job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {job.status === 'active' ? '모집중' : '마감'}
          </span>
        </div>
        {company && (
          <Link href={`/jobs/companies/${company.id}`} className="text-primary hover:underline">
            {company.name}
          </Link>
        )}
      </div>

      {/* 상세 설명 */}
      {job.description && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">직무 설명</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
          </CardContent>
        </Card>
      )}

      {/* 조건 */}
      {job.conditions && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">근무 조건</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {job.conditions.salary_range && (
                <div>
                  <span className="text-muted-foreground">연봉</span>
                  <p className="font-medium">{job.conditions.salary_range}</p>
                </div>
              )}
              {job.conditions.location && (
                <div>
                  <span className="text-muted-foreground">근무지</span>
                  <p className="font-medium">{job.conditions.location}</p>
                </div>
              )}
              {job.conditions.remote && (
                <div>
                  <span className="text-muted-foreground">근무 형태</span>
                  <p className="font-medium">
                    {job.conditions.remote === 'remote' ? '재택' : job.conditions.remote === 'hybrid' ? '하이브리드' : '출근'}
                  </p>
                </div>
              )}
              {(job.conditions.experience_min != null || job.conditions.experience_max != null) && (
                <div>
                  <span className="text-muted-foreground">경력</span>
                  <p className="font-medium">
                    {job.conditions.experience_min || 0}~{job.conditions.experience_max || ''}년
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 요구 능력치 */}
      {job.required_abilities && Object.keys(job.required_abilities).length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">원하는 역량</CardTitle>
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

      {/* 회사 정보 */}
      {company && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">회사 소개</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="font-bold mb-1">{company.name}</h3>
            <div className="flex gap-2 text-sm text-muted-foreground mb-2">
              {company.industry && <span>{company.industry}</span>}
              {company.size_range && <span>· {company.size_range}명</span>}
              {company.location && <span>· {company.location}</span>}
            </div>
            {company.description && (
              <p className="text-sm text-muted-foreground mb-3">{company.description}</p>
            )}
            {company.culture_tags && company.culture_tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {company.culture_tags.map((tag: string) => (
                  <span key={tag} className="px-2 py-0.5 bg-muted text-xs rounded-full">{tag}</span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 지원 CTA */}
      <div className="sticky bottom-4 sm:static">
        <Card className="border-primary/30">
          <CardContent className="pt-5 pb-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">{job.title}</p>
              <p className="text-sm text-muted-foreground">{company?.name || ''}</p>
            </div>
            <Button
              onClick={handleApply}
              disabled={applied || job.status !== 'active'}
              className="shrink-0"
            >
              {applied ? '지원 완료' : job.status === 'active' ? '지원하기' : '마감됨'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

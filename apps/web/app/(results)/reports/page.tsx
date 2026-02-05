'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/auth';
import { RadarChart } from '@/components/charts/radar-chart';

interface ReportPreview {
  total_tests_completed: number;
  completed_tests: string[];
  reliability_score: number;
  total_ability_score: number;
  max_ability_score: number;
  top_strengths_preview: Array<{
    name: string;
    score_range: string;
    blurred: boolean;
  }>;
  available_reports: Array<{
    type: string;
    name: string;
    price: number;
    features: string[];
  }>;
  min_tests_required: number;
  can_generate: boolean;
}

interface PurchasedReport {
  report_id: string;
  report_type: string;
  generated_at: string;
  expires_at: string;
  is_expired: boolean;
}

export default function ReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, isAuthenticated } = useAuth();

  const [preview, setPreview] = useState<ReportPreview | null>(null);
  const [reports, setReports] = useState<PurchasedReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);

  const reportId = searchParams.get('id');
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // If specific report ID, fetch that report
        if (reportId) {
          setLoadingReport(true);
          const response = await fetch(`${API_URL}/api/reports/${reportId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            setSelectedReport(data);
          }
          setLoadingReport(false);
        }

        // Fetch preview data
        const previewResponse = await fetch(`${API_URL}/api/reports/preview`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (previewResponse.ok) {
          setPreview(await previewResponse.json());
        }

        // Fetch purchased reports
        const reportsResponse = await fetch(`${API_URL}/api/reports`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (reportsResponse.ok) {
          const data = await reportsResponse.json();
          setReports(data.reports || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, isAuthenticated, router, reportId, API_URL]);

  const handlePurchaseReport = (reportType: string) => {
    router.push(`/checkout?type=${reportType}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show specific report
  if (selectedReport && !loadingReport) {
    return <ReportView report={selectedReport} onBack={() => setSelectedReport(null)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-primary">
            Metaphoi
          </Link>
          <div className="flex gap-2">
            <Link href="/results">
              <Button variant="outline" size="sm">
                검사 결과
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                대시보드
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">종합 리포트</h1>
        <p className="text-muted-foreground mb-8">
          AI 기반 종합 인재 분석 리포트를 확인하세요
        </p>

        {/* Purchased Reports */}
        {reports.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4">내 리포트</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map((report) => (
                <Card
                  key={report.report_id}
                  className={`cursor-pointer transition-shadow hover:shadow-md ${
                    report.is_expired ? 'opacity-60' : ''
                  }`}
                  onClick={() =>
                    !report.is_expired && router.push(`/reports?id=${report.report_id}`)
                  }
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg capitalize">
                        {report.report_type} 리포트
                      </CardTitle>
                      {report.is_expired ? (
                        <Badge variant="destructive">만료됨</Badge>
                      ) : (
                        <Badge variant="success">열람 가능</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      생성일: {formatDate(report.generated_at)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      만료일: {formatDate(report.expires_at)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Report Preview */}
        {preview && (
          <>
            {/* Progress Summary */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>리포트 생성 현황</CardTitle>
                <CardDescription>
                  최소 {preview.min_tests_required}개 검사 완료 시 리포트 생성 가능
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">
                      {preview.total_tests_completed}
                    </p>
                    <p className="text-sm text-muted-foreground">완료 검사</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">
                      {(preview.reliability_score * 100).toFixed(0)}%
                    </p>
                    <p className="text-sm text-muted-foreground">신뢰도</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">
                      {preview.total_ability_score.toFixed(0)}
                    </p>
                    <p className="text-sm text-muted-foreground">능력치 총점</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">30</p>
                    <p className="text-sm text-muted-foreground">분석 항목</p>
                  </div>
                </div>

                <Progress
                  value={(preview.total_tests_completed / preview.min_tests_required) * 100}
                  className="h-3"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {preview.can_generate
                    ? '✓ 리포트 생성 가능'
                    : `${preview.min_tests_required - preview.total_tests_completed}개 더 완료 필요`}
                </p>
              </CardContent>
            </Card>

            {/* Preview Strengths (Blurred) */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>강점 미리보기</CardTitle>
                <CardDescription>
                  리포트 구매 시 상세 분석 결과를 확인할 수 있습니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {preview.top_strengths_preview.map((strength, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium">{strength.name}</span>
                      <span
                        className={`${
                          strength.blurred ? 'blur-sm select-none' : ''
                        }`}
                      >
                        {strength.score_range}점
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Report Plans */}
            <h2 className="text-xl font-semibold mb-4">리포트 플랜</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {preview.available_reports.map((plan, index) => (
                <Card
                  key={plan.type}
                  className={`${
                    index === 1 ? 'border-primary shadow-lg scale-105' : ''
                  }`}
                >
                  {index === 1 && (
                    <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                      인기
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>
                      <span className="text-2xl font-bold text-foreground">
                        ₩{formatPrice(plan.price)}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm">
                          <svg
                            className="w-4 h-4 mr-2 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={index === 1 ? 'default' : 'outline'}
                      disabled={!preview.can_generate}
                      onClick={() => handlePurchaseReport(plan.type)}
                    >
                      {preview.can_generate ? '구매하기' : '검사 먼저 완료'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {!preview?.can_generate && (
          <Card className="border-dashed">
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                더 많은 검사를 완료하면 더 정확한 리포트를 받을 수 있습니다.
              </p>
              <Link href="/dashboard">
                <Button>검사하러 가기</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

// Report View Component
function ReportView({ report, onBack }: { report: any; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b print:hidden">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-primary">
            Metaphoi
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              PDF 저장
            </Button>
            <Button variant="outline" size="sm" onClick={onBack}>
              뒤로 가기
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">종합 인재 분석 리포트</h1>
          <p className="text-muted-foreground">
            Metaphoi {report.report_type?.toUpperCase() || 'Pro'} Report
          </p>
        </div>

        {report.data ? (
          <>
            {/* Summary */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>종합 요약</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold text-primary">
                      {report.data.summary?.total_score?.toFixed(0) || '-'}
                    </p>
                    <p className="text-sm text-muted-foreground">총점</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold">
                      {((report.data.summary?.reliability || 0) * 100).toFixed(0)}%
                    </p>
                    <p className="text-sm text-muted-foreground">신뢰도</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold">
                      {report.data.summary?.completed_tests?.length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">완료 검사</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold">30</p>
                    <p className="text-sm text-muted-foreground">분석 능력치</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Analysis */}
            {report.data.ai_analysis && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>AI 분석 결과</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    {typeof report.data.ai_analysis === 'string' ? (
                      <p>{report.data.ai_analysis}</p>
                    ) : (
                      <pre className="whitespace-pre-wrap text-sm">
                        {JSON.stringify(report.data.ai_analysis, null, 2)}
                      </pre>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Career Recommendations */}
            {report.data.career_recommendations?.top_careers && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>추천 직업</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {report.data.career_recommendations.top_careers.map(
                      (career: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-2xl font-bold text-muted-foreground">
                              {index + 1}
                            </span>
                            <div>
                              <span className="font-medium block">{career.career}</span>
                              {career.reason && (
                                <span className="text-sm text-muted-foreground">
                                  {career.reason}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="font-bold text-primary">
                            {career.fit_score}%
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Growth Roadmap */}
            {report.data.growth_roadmap && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>성장 로드맵</CardTitle>
                </CardHeader>
                <CardContent>
                  {['short_term', 'mid_term', 'long_term'].map((term) => {
                    const labels: Record<string, string> = {
                      short_term: '단기 (1-3개월)',
                      mid_term: '중기 (3-6개월)',
                      long_term: '장기 (6개월+)',
                    };
                    const items = report.data.growth_roadmap[term] || [];
                    if (items.length === 0) return null;

                    return (
                      <div key={term} className="mb-6 last:mb-0">
                        <h4 className="font-semibold mb-2">{labels[term]}</h4>
                        <ul className="space-y-2">
                          {items.map((item: any, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs flex-shrink-0">
                                {idx + 1}
                              </span>
                              <span className="text-sm">
                                {typeof item === 'string' ? item : item.goal || item.action}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">리포트 데이터를 불러올 수 없습니다.</p>
            </CardContent>
          </Card>
        )}

        <div className="text-center text-sm text-muted-foreground mt-12 pt-8 border-t print:mt-4">
          <p>Generated by Metaphoi</p>
          <p className="mt-1">
            이 리포트는 검사 결과를 바탕으로 생성되었으며, 참고 자료로만 활용하시기 바랍니다.
          </p>
        </div>
      </main>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { RadarChart } from '@/components/charts/radar-chart';

export default function ReportsPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchReport = async () => {
      try {
        // Generate a new report (or fetch existing)
        const response = await fetch(`${API_URL}/api/reports/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ type: 'pro' }),
        });

        if (response.ok) {
          const result = await response.json();
          setReport(result.report_data);
        }
      } catch (error) {
        console.error('Failed to fetch report:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [token, isAuthenticated, router, API_URL]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">리포트를 생성하는 중...</p>
        </div>
      </div>
    );
  }

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
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                대시보드
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Report Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">종합 인재 분석 리포트</h1>
          <p className="text-muted-foreground">
            Metaphoi Pro Report
          </p>
        </div>

        {report ? (
          <>
            {/* Summary Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>종합 요약</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold text-primary">
                      {report.abilities?.total_score?.toFixed(0) || '-'}
                    </p>
                    <p className="text-sm text-muted-foreground">총점</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold">
                      {((report.abilities?.reliability || 0) * 100).toFixed(0)}%
                    </p>
                    <p className="text-sm text-muted-foreground">신뢰도</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold">
                      {report.abilities?.completed_tests?.length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">완료 검사</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold">30</p>
                    <p className="text-sm text-muted-foreground">분석 능력치</p>
                  </div>
                </div>

                <div className="h-[400px]">
                  <RadarChart data={report.abilities} />
                </div>
              </CardContent>
            </Card>

            {/* Strengths & Weaknesses */}
            {report.detailed_analysis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">강점</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {report.detailed_analysis.strengths?.map((s: string) => (
                        <li key={s} className="flex items-center">
                          <svg
                            className="w-5 h-5 mr-2 text-green-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-orange-600">개선 영역</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {report.detailed_analysis.weaknesses?.map((w: string) => (
                        <li key={w} className="flex items-center">
                          <svg
                            className="w-5 h-5 mr-2 text-orange-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {w}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Career Recommendations */}
            {report.career_recommendations && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>추천 직업</CardTitle>
                  <CardDescription>
                    능력치 분석을 바탕으로 추천하는 직업군
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {report.career_recommendations.map((career: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold text-muted-foreground">
                            {index + 1}
                          </span>
                          <span className="font-medium">{career.career}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">적합도</span>
                          <span className="font-bold text-primary">
                            {career.fit_score}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Growth Roadmap (Premium) */}
            {report.growth_roadmap && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>성장 로드맵</CardTitle>
                  <CardDescription>
                    능력치 향상을 위한 단계별 가이드
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {['short_term', 'mid_term', 'long_term'].map((term, termIndex) => {
                      const termLabels: Record<string, string> = {
                        short_term: '단기 (1-3개월)',
                        mid_term: '중기 (3-6개월)',
                        long_term: '장기 (6개월+)',
                      };
                      const items = report.growth_roadmap[term] || [];
                      return (
                        <div key={term}>
                          <h4 className="font-semibold mb-2">{termLabels[term]}</h4>
                          <ul className="space-y-2">
                            {items.map((item: string, itemIndex: number) => (
                              <li key={itemIndex} className="flex items-start gap-2">
                                <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs flex-shrink-0">
                                  {itemIndex + 1}
                                </span>
                                <span className="text-sm">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                리포트를 생성할 수 없습니다.
              </p>
              <Link href="/dashboard">
                <Button>대시보드로 돌아가기</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground mt-12 pt-8 border-t print:mt-4">
          <p>Generated by Metaphoi</p>
          <p className="mt-1">
            이 리포트는 검사 결과를 바탕으로 생성되었으며, 참고 자료로만 활용하시기
            바랍니다.
          </p>
        </div>
      </main>
    </div>
  );
}

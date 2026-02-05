'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/auth';
import { RadarChart, DetailedRadarChart } from '@/components/charts/radar-chart';

const CATEGORY_NAMES: Record<string, string> = {
  mental: '정신력',
  social: '사회성',
  work: '업무역량',
  physical: '신체/감각',
  potential: '잠재력',
};

export default function AbilitiesPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchAbilities = async () => {
      try {
        const response = await fetch(`${API_URL}/api/abilities/radar`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch abilities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAbilities();
  }, [token, isAuthenticated, router, API_URL]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-primary">
            Metaphoi
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              대시보드
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">나의 능력치</h1>

        {data ? (
          <>
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">
                    총점
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {data.total_score.toFixed(0)}{' '}
                    <span className="text-lg text-muted-foreground">
                      / {data.max_total_score}
                    </span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">
                    검사 완료율
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {(data.reliability * 100).toFixed(0)}%
                  </p>
                  <Progress value={data.reliability * 100} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">
                    완료한 검사
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {data.completed_tests.length}{' '}
                    <span className="text-lg text-muted-foreground">
                      / {data.completed_tests.length + data.pending_tests.length}
                    </span>
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Radar Chart */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>능력치 레이더</CardTitle>
                <CardDescription>
                  5가지 카테고리별 평균 점수
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <RadarChart data={data} />
                </div>
              </CardContent>
            </Card>

            {/* Detailed Charts */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>상세 능력치</CardTitle>
                <CardDescription>
                  30가지 능력치 상세 분석
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DetailedRadarChart data={data} />
              </CardContent>
            </Card>

            {/* Ability List */}
            <div className="space-y-6">
              {data.categories.map((category: any) => (
                <Card key={category.category}>
                  <CardHeader>
                    <CardTitle>
                      {CATEGORY_NAMES[category.category] || category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {category.abilities.map((ability: any) => (
                        <div key={ability.code}>
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{ability.name}</span>
                            <span className="text-muted-foreground">
                              {ability.score.toFixed(1)} / {ability.max_score}
                            </span>
                          </div>
                          <Progress
                            value={(ability.score / ability.max_score) * 100}
                          />
                          {ability.source_tests.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              기반 검사: {ability.source_tests.join(', ')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                아직 완료한 검사가 없습니다.
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

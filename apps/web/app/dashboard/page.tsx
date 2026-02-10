'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/auth';
import { RadarChart } from '@/components/charts/radar-chart';
import { getAllCompleted, hasCompletedTest } from '@/lib/test-session';

const testCategories = [
  {
    category: '성격 검사',
    tests: [
      { code: 'mbti', name: 'MBTI', description: '16가지 성격 유형 분석', questions: 48, available: true },
      { code: 'disc', name: 'DISC', description: '행동 유형 분석', questions: 28, available: true },
      { code: 'enneagram', name: '에니어그램', description: '9가지 성격 유형', questions: 36, available: true },
      { code: 'tci', name: 'TCI', description: '기질 및 성격 검사', questions: 140, available: false },
    ],
  },
  {
    category: '적성/역량 검사',
    tests: [
      { code: 'gallup', name: 'Gallup 강점', description: '34개 강점 테마', questions: 34, available: false },
      { code: 'holland', name: 'Holland', description: '직업 흥미 유형', questions: 42, available: true },
      { code: 'iq', name: 'IQ 테스트', description: '논리/패턴 분석', questions: 30, available: false },
      { code: 'mmpi', name: 'MMPI 간이', description: '다면적 인성 검사', questions: 50, available: false },
    ],
  },
  {
    category: '전통/특수 검사',
    tests: [
      { code: 'tarot', name: '타로', description: '이미지 선택 기반', questions: 10, available: false },
      { code: 'htp', name: 'HTP', description: '그림 심리 검사', questions: 3, available: false },
      { code: 'saju', name: '사주', description: '생년월일시 사주팔자', questions: 5, available: true },
      { code: 'sasang', name: '사상체질', description: '체질 유형 분석', questions: 20, available: true },
      { code: 'face', name: '관상', description: '얼굴 분석', questions: 1, available: false },
      { code: 'blood', name: '혈액형', description: '혈액형 성격 분석', questions: 5, available: true },
    ],
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, fetchUser, logout } = useAuth();
  const [completedTests, setCompletedTests] = useState<string[]>([]);
  const [abilitiesData, setAbilitiesData] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated, fetchUser]);

  // localStorage에서 완료된 검사 로드
  useEffect(() => {
    const completed = getAllCompleted();
    setCompletedTests(completed.map((s) => s.testCode));
  }, []);

  const totalTests = 14;
  const completionRate = (completedTests.length / totalTests) * 100;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">
            Metaphoi
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.name || user?.email || '사용자'}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Progress Section */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>검사 진행률</CardTitle>
              <CardDescription>
                {completedTests.length}개 / {totalTests}개 검사 완료
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={completionRate} className="h-3" />
              <p className="mt-2 text-sm text-muted-foreground">
                모든 검사를 완료하면 더 정확한 능력치 분석을 받을 수 있습니다.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Abilities Overview */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>나의 능력치</CardTitle>
              <CardDescription>
                검사 결과를 바탕으로 산출된 30가지 능력치
              </CardDescription>
            </CardHeader>
            <CardContent>
              {completedTests.length > 0 ? (
                <div className="h-[400px]">
                  <RadarChart data={abilitiesData} />
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    아직 완료한 검사가 없습니다.
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    검사를 완료하면 능력치 레이더 차트가 표시됩니다.
                  </p>
                  <Link href="/mbti">
                    <Button>MBTI 검사 시작하기</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Tests Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">검사 목록</h2>
          <div className="space-y-8">
            {testCategories.map((category) => (
              <div key={category.category}>
                <h3 className="text-lg font-semibold mb-4 text-primary">
                  {category.category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {category.tests.map((test) => {
                    const isCompleted = hasCompletedTest(test.code);
                    return (
                      <Card
                        key={test.code}
                        className={`${isCompleted ? 'border-green-500' : ''} ${!test.available ? 'opacity-60' : ''}`}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{test.name}</CardTitle>
                            {isCompleted && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                무료 미리보기
                              </span>
                            )}
                          </div>
                          <CardDescription>{test.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            {test.questions}문항 {!test.available && '· 준비 중'}
                          </p>
                          <div className="flex flex-col gap-2">
                            {isCompleted ? (
                              <>
                                <Link href={`/results/${test.code}/preview`}>
                                  <Button variant="outline" size="sm" className="w-full">
                                    결과 보기
                                  </Button>
                                </Link>
                                <Link href={`/checkout?testCode=${test.code}`}>
                                  <Button size="sm" className="w-full">
                                    잠금 해제
                                  </Button>
                                </Link>
                              </>
                            ) : (
                              <Link href={test.available ? `/${test.code}` : '#'}>
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="w-full"
                                  disabled={!test.available}
                                >
                                  {test.available ? '검사하기' : '준비 중'}
                                </Button>
                              </Link>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Report Section */}
        <section className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>종합 리포트</CardTitle>
              <CardDescription>
                AI 분석 기반 상세 리포트를 받아보세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { tier: 'Basic', price: '9,900원', features: ['30개 능력치', '레이더 차트', '결과 요약'] },
                  { tier: 'Pro', price: '29,900원', features: ['상세 분석', '직업 추천', 'PDF 내보내기'], recommended: true },
                  { tier: 'Premium', price: '59,900원', features: ['성장 로드맵', 'AI 1:1 상담'] },
                ].map((plan) => (
                  <Card key={plan.tier} className={plan.recommended ? 'border-primary' : ''}>
                    <CardHeader>
                      {plan.recommended && (
                        <span className="text-xs font-semibold text-primary">추천</span>
                      )}
                      <CardTitle>{plan.tier}</CardTitle>
                      <CardDescription className="text-xl font-bold text-foreground">
                        {plan.price}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-4">
                        {plan.features.map((feature) => (
                          <li key={feature} className="text-sm flex items-center">
                            <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Link href="/checkout">
                        <Button
                          variant={plan.recommended ? 'default' : 'outline'}
                          className="w-full"
                          disabled={completedTests.length === 0}
                        >
                          구매하기
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {completedTests.length === 0 && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  리포트를 구매하려면 최소 1개 이상의 검사를 완료해야 합니다.
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

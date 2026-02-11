'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { RadarChart } from '@/components/charts/radar-chart';
import {
  hasCompletedComprehensive,
  getComprehensiveSession,
  saveComprehensiveProgress,
} from '@/lib/test-session';
import { api } from '@/lib/api';
import { type ComprehensiveProfile } from '@/data/tests/comprehensive';

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, fetchUser, logout } = useAuth();
  const [profile, setProfile] = useState<ComprehensiveProfile | null>(null);
  const [hasComprehensive, setHasComprehensive] = useState(false);
  const [abilitiesData, setAbilitiesData] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated, fetchUser]);

  useEffect(() => {
    // 1. localStorage에서 먼저 확인
    const completed = hasCompletedComprehensive();
    if (completed) {
      const session = getComprehensiveSession();
      if (session?.profile) {
        setProfile(session.profile);
        setHasComprehensive(true);
        return;
      }
    }

    // 2. localStorage에 없으면 서버에서 불러오기
    if (token) {
      api.results.getComprehensive(token).then((res) => {
        if (res.data) {
          const serverResult = res.data as any;
          if (serverResult.result?.comprehensive_profile) {
            const serverProfile = serverResult.result.comprehensive_profile;
            setProfile(serverProfile);
            setHasComprehensive(true);
            // 서버 데이터를 localStorage에도 캐시
            saveComprehensiveProgress({
              profile: serverProfile,
              currentStep: 'done',
              completedAt: serverResult.result.updated_at || new Date().toISOString(),
            });
          }
        }
      });
    }
  }, [token]);

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
        {/* 종합 검사 결과 */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>종합 심리검사 결과</CardTitle>
              <CardDescription>
                {hasComprehensive
                  ? '7가지 검사 종합 분석이 완료되었습니다'
                  : '종합 심리검사를 진행해보세요'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasComprehensive && profile ? (
                <div className="space-y-6">
                  {/* 유형 요약 */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">
                      {profile.personalInfo.name}님의 종합 유형
                    </p>
                    <p className="text-2xl font-bold text-primary mb-2">
                      {profile.summary.headline}
                    </p>
                    <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                      {profile.summary.personality.slice(0, 120)}...
                    </p>
                  </div>

                  {/* 유형 뱃지 */}
                  <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                    {[
                      { label: 'MBTI', value: profile.mbti.type },
                      { label: 'DISC', value: profile.disc.type },
                      { label: '에니어그램', value: profile.enneagram.wing },
                      { label: 'Holland', value: profile.holland.topCode },
                      { label: '사상', value: profile.sasang.type },
                      { label: '오행', value: profile.saju.dominant },
                      { label: '혈액형', value: `${profile.blood.type}형` },
                    ].map((item) => (
                      <div key={item.label} className="text-center p-2 rounded-lg bg-muted/50">
                        <p className="text-[10px] text-muted-foreground">{item.label}</p>
                        <p className="text-sm font-bold text-primary">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/results/preview">
                      <Button variant="outline">무료 결과 보기</Button>
                    </Link>
                    <Link href="/checkout?testCode=comprehensive">
                      <Button>전체 분석 잠금 해제</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    아직 종합 검사를 완료하지 않았습니다.
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    7가지 검사를 한 번에 진행하고 종합 분석 결과를 확인하세요.
                  </p>
                  <Link href="/test">
                    <Button size="lg">종합 검사 시작하기</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* 능력치 */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>나의 능력치</CardTitle>
              <CardDescription>
                검사 결과를 바탕으로 산출된 30가지 능력치
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasComprehensive ? (
                <div className="h-[400px]">
                  <RadarChart data={abilitiesData} />
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">
                    종합 검사를 완료하면 능력치 레이더 차트가 표시됩니다.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* 리포트 구매 */}
        <section>
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
                  { tier: 'Basic', price: '9,900원', features: ['30개 능력치', '레이더 차트', '유형별 상세 해석'] },
                  { tier: 'Pro', price: '29,900원', features: ['교차 심층 분석', '직업 추천 TOP 10', 'PDF 내보내기'], recommended: true },
                  { tier: 'Premium', price: '59,900원', features: ['성장 로드맵', 'AI 1:1 상담', '기업용 리포트'] },
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
                      <Link href="/checkout?testCode=comprehensive">
                        <Button
                          variant={plan.recommended ? 'default' : 'outline'}
                          className="w-full"
                          disabled={!hasComprehensive}
                        >
                          구매하기
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {!hasComprehensive && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  리포트를 구매하려면 종합 검사를 먼저 완료해야 합니다.
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

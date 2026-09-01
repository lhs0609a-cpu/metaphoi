'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layouts/page-header';
import { EmptyState } from '@/components/ui/states';
import { NormStatusBadge } from '@/components/measure/honesty';
import { RoleFit } from '@/components/results/role-fit';
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
    <div className="shell max-w-[52rem] py-10 lg:py-14">
      <PageHeader
        eyebrow={user?.name || user?.email || '내 계정'}
        title="대시보드"
        actions={
          <Button variant="outline" size="sm" onClick={handleLogout}>
            로그아웃
          </Button>
        }
      />

      {/* 검사 결과 */}
      {hasComprehensive && profile ? (
        <section className="flex flex-col gap-5">
          <div className="flex flex-col items-start gap-3">
            <p className="eyebrow">{profile.personalInfo.name}님의 결과</p>
            <h2 className="text-h2">{profile.summary.headline}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-pill bg-sunk px-3 py-1 text-small">
                {profile.mbti.type} · {profile.disc.type} · {profile.enneagram.wing}
              </span>
              <NormStatusBadge status="none" />
            </div>
            <p className="max-w-[62ch] text-body leading-relaxed text-muted-foreground">
              {profile.summary.personality.split('. ').slice(0, 2).join('. ')}.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-7">
            {[
              { label: 'MBTI', value: profile.mbti.type },
              { label: 'DISC', value: profile.disc.type },
              { label: '에니어그램', value: profile.enneagram.wing },
              { label: 'Holland', value: profile.holland.topCode },
              { label: '사상', value: profile.sasang.type },
              { label: '오행', value: profile.saju.dominant },
              { label: '혈액형', value: `${profile.blood.type}형` },
            ].map((t) => (
              <div key={t.label} className="flex flex-col gap-0.5 rounded-card bg-sunk px-3 py-2.5">
                <span className="text-micro text-muted-foreground">{t.label}</span>
                <span className="stat-num text-body leading-none">{t.value}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href="/results/preview">결과 자세히 보기</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/seeker/register">채용 프로필 만들기</Link>
            </Button>
          </div>
        </section>
      ) : (
        <EmptyState
          title="아직 검사를 완료하지 않았습니다"
          description="7가지 검사를 한 번에 보고 능력치 30개를 받아보세요. 53문항, 약 12분."
          action={{ label: '검사 시작하기', href: '/start' }}
        />
      )}

      {/* 잘 맞는 직군 — 검사한 사람에게만 */}
      {hasComprehensive && profile?.rawScores?.holland ? (
        <RoleFit holland={profile.rawScores.holland} />
      ) : null}

      {/* 능력치 차트 */}
      {hasComprehensive ? (
        <section className="mt-10">
          <h2 className="text-h3">능력치 한눈에</h2>
          <p className="mt-1 text-small text-muted-foreground">
            다섯 영역 30개 능력치의 분포입니다
          </p>
          <div className="mt-5 rounded-card border border-border p-4">
            <div className="h-[360px]">
              <RadarChart data={abilitiesData} />
            </div>
          </div>
        </section>
      ) : null}

      {/* 리포트 — 검사를 마친 사람에게만 보여준다.
          할 수 없는 일을 목록으로 늘어놓으면 화면만 무거워진다 */}
      {hasComprehensive ? (
        <section className="mt-12">
          <h2 className="text-h3">전체 리포트</h2>
          <p className="mt-1 max-w-[52ch] text-small text-muted-foreground">
            무료 결과에서 잠긴 부분을 엽니다. 한 번 결제하면 계속 볼 수 있습니다.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              { tier: 'Basic', price: '9,900원', features: ['능력치 30개 전체', '유형별 상세 해석'] },
              {
                tier: 'Pro',
                price: '29,900원',
                features: ['교차 심층 분석', '직업 추천 10개', 'PDF 내보내기'],
                recommended: true,
              },
              { tier: 'Premium', price: '59,900원', features: ['성장 로드맵', '기업용 리포트'] },
            ].map((plan) => (
              <div
                key={plan.tier}
                className={
                  plan.recommended
                    ? 'flex flex-col gap-3 rounded-card bg-action px-6 py-6 text-action-foreground'
                    : 'flex flex-col gap-3 rounded-card border border-border px-6 py-6'
                }
              >
                <div className="flex items-center gap-2">
                  <span className="text-h4">{plan.tier}</span>
                  {plan.recommended ? (
                    <span className="rounded-pill bg-action-foreground/15 px-2 py-0.5 text-micro font-semibold">
                      추천
                    </span>
                  ) : null}
                </div>
                <span className="stat-num text-h3">{plan.price}</span>
                <ul className="flex flex-1 flex-col gap-1.5">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className={
                        plan.recommended
                          ? 'flex items-start gap-2 text-small text-action-foreground/85'
                          : 'flex items-start gap-2 text-small text-muted-foreground'
                      }
                    >
                      <span
                        className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-current opacity-60"
                        aria-hidden="true"
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  block
                  variant={plan.recommended ? undefined : 'outline'}
                  className={
                    plan.recommended
                      ? 'bg-action-foreground text-action hover:opacity-90'
                      : undefined
                  }
                >
                  <Link href="/checkout?testCode=comprehensive">선택하기</Link>
                </Button>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

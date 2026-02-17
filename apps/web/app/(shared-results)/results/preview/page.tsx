'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PaywallOverlay } from '@/components/results/paywall-overlay';
import { LockedContent } from '@/components/results/locked-content';
import { ShareButtons } from '@/components/results/share-buttons';
import {
  getComprehensiveSession,
  clearComprehensive,
  type ComprehensiveSession,
} from '@/lib/test-session';
import { useAuthStore } from '@/lib/auth';
import { api } from '@/lib/api';
import { useSocialProof } from '@/hooks/use-social-proof';
import { type ComprehensiveProfile, type AbilityScore } from '@/data/tests/comprehensive';
import { getTopAbilities, getAbilitiesByCategory } from '@/lib/abilities-scoring';

function OhaengBar({ label, score, color, max }: { label: string; score: number; color: string; max: number }) {
  const pct = max > 0 ? (score / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium w-16">{label}</span>
      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-sm text-muted-foreground w-6 text-right">{score}</span>
    </div>
  );
}

function AbilityBar({ ability, rank }: { ability: AbilityScore; rank?: number }) {
  const barColor = ability.score >= 70 ? 'bg-primary' : ability.score >= 40 ? 'bg-primary/60' : 'bg-primary/30';
  return (
    <div className="flex items-center gap-3">
      {rank && (
        <span className="text-xs font-bold text-primary w-5">{rank}</span>
      )}
      <span className="text-sm font-medium w-24 shrink-0">{ability.name}</span>
      <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${ability.score}%` }} />
      </div>
      <span className="text-sm font-bold w-8 text-right">{ability.score}</span>
    </div>
  );
}

function TypeBadge({ label, value, sub, isPaid }: { label: string; value: string; sub?: string; isPaid?: boolean }) {
  return (
    <div className="text-center p-4 rounded-xl bg-muted/50">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold text-primary">{value}</p>
      {sub && (
        <p className={`text-xs text-muted-foreground mt-1 ${!isPaid ? 'blur-[3px] select-none' : ''}`}>
          {sub}
        </p>
      )}
    </div>
  );
}

function TeaserHook({ message }: { message: string }) {
  return (
    <div className="mb-4 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
      <p className="text-sm italic text-amber-800 dark:text-amber-200 flex items-center gap-2">
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {message}
      </p>
    </div>
  );
}

export default function ComprehensiveResultPreview() {
  const router = useRouter();
  const { token } = useAuthStore();
  const socialCount = useSocialProof();
  const [profile, setProfile] = useState<ComprehensiveProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [paidTier, setPaidTier] = useState<string | null>(null);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const freeEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const session = getComprehensiveSession();
    if (!session?.profile) {
      router.push('/test');
      return;
    }
    setProfile(session.profile);
    setLoading(false);
  }, [router]);

  // 결제 상태 확인
  const checkPaymentStatus = useCallback(() => {
    if (!token) return;
    api.payments.myStatus(token).then((res) => {
      if (res.data) {
        const data = res.data as any;
        if (data.has_paid) {
          setIsPaid(true);
          setPaidTier(data.report_type);
        }
      }
    });
  }, [token]);

  useEffect(() => {
    checkPaymentStatus();
  }, [checkPaymentStatus]);

  // 탭 재포커스 시 결제 상태 재확인 (결제 후 돌아올 때)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkPaymentStatus();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [checkPaymentStatus]);

  // 스티키 CTA 바 - IntersectionObserver
  useEffect(() => {
    if (isPaid || !freeEndRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyCta(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(freeEndRef.current);
    return () => observer.disconnect();
  }, [isPaid, loading]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">분석 결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const ohaengMax = Math.max(...profile.saju.ohaeng.map((o: any) => o.score), 1);
  const topAbilities = getTopAbilities(profile.abilities, 5);
  const freeTopCount = isPaid ? 5 : 3;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* 인사 & 제목 */}
        <div className="text-center mb-10">
          <p className="text-sm text-muted-foreground mb-2">
            {profile.personalInfo.name}님의 종합 분석 결과
          </p>
          <h1 className="text-3xl font-bold mb-3">당신은 이런 사람입니다</h1>
          <p className="text-lg text-primary font-semibold">
            {profile.summary.headline}
          </p>
        </div>

        {/* === 무료 공개 영역 === */}

        {/* 유형 요약 뱃지 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <TypeBadge label="성격 유형" value={profile.mbti.type} sub={profile.mbti.typeName} isPaid={isPaid} />
              <TypeBadge label="행동 유형" value={profile.disc.type} sub={profile.disc.typeName} isPaid={isPaid} />
              <TypeBadge label="에니어그램" value={profile.enneagram.wing} sub={profile.enneagram.typeName} isPaid={isPaid} />
              <TypeBadge label="직업 흥미" value={profile.holland.topCode} sub={profile.holland.typeName} isPaid={isPaid} />
            </div>
          </CardContent>
        </Card>

        {/* 부가 유형 (사주, 사상, 혈액형) */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-3">
              <TypeBadge label="오행 기질" value={profile.saju.dominant} sub={profile.saju.typeName} isPaid={isPaid} />
              <TypeBadge label="사상체질" value={profile.sasang.type} sub={profile.sasang.typeName} isPaid={isPaid} />
              <TypeBadge label="혈액형" value={`${profile.blood.type}형`} sub={profile.blood.typeName} isPaid={isPaid} />
            </div>
          </CardContent>
        </Card>

        {/* 신뢰도 안내 */}
        {profile.reliability && (() => {
          const r = profile.reliability;
          const combinedReliability = Math.min(r.overallReliability, r.consistencyScore);
          if (combinedReliability > 0.7 && r.flags.length === 0) return null;

          return (
            <Card className={`mb-6 ${
              combinedReliability < 0.4
                ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/20'
                : 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20'
            }`}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium">
                      {combinedReliability < 0.4
                        ? '응답 신뢰도가 낮아 재검사를 권장합니다'
                        : '응답 일관성이 다소 낮습니다'}
                    </p>
                    {r.flags.filter((f) => !f.includes('실제:')).length > 0 && (
                      <ul className="mt-1.5 space-y-0.5">
                        {r.flags.filter((f) => !f.includes('실제:')).map((flag, i) => (
                          <li key={i} className="text-xs text-muted-foreground">{flag}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* 공유 버튼 */}
        <div className="mb-6">
          <ShareButtons
            title={`나는 ${profile.mbti.type}, ${profile.disc.type}형 - ${profile.summary.headline}`}
            description={`MBTI: ${profile.mbti.type} | DISC: ${profile.disc.type} | 에니어그램: ${profile.enneagram.wing} | Holland: ${profile.holland.topCode} | 사상: ${profile.sasang.type} - 나도 검사해보기!`}
            url={typeof window !== 'undefined' ? `${window.location.origin}/results/share` : undefined}
          />
        </div>

        {/* 인라인 CTA (유형 뱃지 직후) */}
        {!isPaid && (
          <Card className="mb-6 border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-sm">상세 분석 & 30개 능력치 전체 보기</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {socialCount ?? '12,847'}명이 전체 분석을 확인했습니다
                  </p>
                </div>
                <Link href="/checkout?testCode=comprehensive" className="shrink-0">
                  <Button size="sm">9,900원~</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 종합 성격 설명 (무료: 첫 2문장만) */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>종합 성격 분석</CardTitle>
          </CardHeader>
          <CardContent>
            {isPaid ? (
              <p className="text-muted-foreground leading-relaxed">
                {profile.summary.personality}
              </p>
            ) : (
              <div>
                <p className="text-muted-foreground leading-relaxed">
                  {profile.summary.personality.split('. ').slice(0, 2).join('. ')}.
                </p>
                {profile.summary.personality.split('. ').length > 2 && (
                  <p className="text-muted-foreground leading-relaxed mt-2 blur-[3px] select-none">
                    {profile.summary.personality.split('. ').slice(2).join('. ')}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 무료 영역 끝 마커 (IntersectionObserver 대상) — 성격 분석 직후 */}
        <div ref={freeEndRef} />

        {/* 오행 차트 (무료 공개) */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>사주 오행 분석</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.saju.ohaeng.map((o: any) => (
              <OhaengBar key={o.key} label={o.label} score={o.score} color={o.color} max={ohaengMax} />
            ))}
          </CardContent>
        </Card>

        {/* 티저: MBTI */}
        {!isPaid && (
          <TeaserHook message="당신의 T/F 비율은 예상과 다를 수 있습니다..." />
        )}

        {/* 핵심 강점 (무료: 2개, 유료: 전체) */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>핵심 강점</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.summary.strengths.slice(0, isPaid ? undefined : 2).map((s) => (
                <span key={s} className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full">
                  {s}
                </span>
              ))}
              {!isPaid && profile.summary.strengths.length > 2 && (
                <>
                  {profile.summary.strengths.slice(2, 4).map((s) => (
                    <span key={s} className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full blur-[3px] select-none">
                      {s}
                    </span>
                  ))}
                  <span className="px-3 py-1.5 bg-muted text-muted-foreground text-sm rounded-full">
                    +{profile.summary.strengths.length - 2}개 더
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 티저: 능력치 */}
        {!isPaid && (
          <TeaserHook message="당신의 숨겨진 1위 능력치가 공개를 기다리고 있습니다" />
        )}

        {/* TOP 능력치 (무료: TOP 3, 유료: TOP 5) */}
        {profile.abilities && profile.abilities.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>TOP {freeTopCount} 능력치</CardTitle>
              <p className="text-sm text-muted-foreground">
                {profile.personalInfo.name}님이 가장 높은 능력치 상위 {freeTopCount}개
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {topAbilities.slice(0, freeTopCount).map((ability, i) => (
                <AbilityBar key={ability.key} ability={ability} rank={i + 1} />
              ))}
              {!isPaid && topAbilities.length > 3 && (
                <div className="relative">
                  <div className="blur-[3px] select-none pointer-events-none space-y-3">
                    {topAbilities.slice(3, 5).map((ability, i) => (
                      <AbilityBar key={ability.key} ability={ability} rank={i + 4} />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground bg-background/80 px-3 py-1 rounded-full">
                      전체 분석에서 확인
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 전체 능력치 미리보기 (카테고리당 1개 무료, 나머지 blur) */}
        {profile.abilities && profile.abilities.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>30가지 전체 능력치</CardTitle>
              <p className="text-sm text-muted-foreground">
                5개 영역 x 6개 능력치 = 30개 스탯
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {getAbilitiesByCategory(profile.abilities).map((group) => (
                  <div key={group.category}>
                    <h4 className="text-sm font-bold text-primary mb-3">{group.category}</h4>
                    <div className="space-y-2">
                      {isPaid ? (
                        group.abilities.map((ability) => (
                          <AbilityBar key={ability.key} ability={ability} />
                        ))
                      ) : (
                        <>
                          {group.abilities.slice(0, 1).map((ability) => (
                            <AbilityBar key={ability.key} ability={ability} />
                          ))}
                          {group.abilities.length > 1 && (
                            <div className="relative">
                              <div className="blur-sm select-none pointer-events-none space-y-2">
                                {group.abilities.slice(1).map((ability) => (
                                  <AbilityBar key={ability.key} ability={ability} />
                                ))}
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs text-muted-foreground bg-background/80 px-3 py-1 rounded-full">
                                  +{group.abilities.length - 1}개 잠금
                                </span>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* === 잠긴 영역 (페이월) === */}

        {/* 티저: 직업 추천 */}
        {!isPaid && (
          <TeaserHook message="당신에게 가장 잘 맞는 직업 1위는..." />
        )}

        {isPaid ? (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">상세 분석</h2>
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>MBTI 상세 분석</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">유형: {profile.mbti.type} ({profile.mbti.typeName})</p>
                  <div className="grid grid-cols-2 gap-4">
                    {profile.mbti.dimensions?.map((d: any) => (
                      <div key={d.label}>
                        <p className="text-xs text-muted-foreground">{d.label}</p>
                        <div className="h-2 bg-muted rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${d.score}%` }} />
                        </div>
                        <p className="text-xs mt-1">{d.left} {d.score}% / {d.right} {100 - d.score}%</p>
                      </div>
                    )) || <p className="text-sm text-muted-foreground col-span-2">상세 차원 데이터가 없습니다</p>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>행동 유형 & 에니어그램</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm"><span className="font-medium">DISC:</span> {profile.disc.type} - {profile.disc.typeName}</p>
                  <p className="text-sm"><span className="font-medium">에니어그램:</span> {profile.enneagram.wing} - {profile.enneagram.typeName}</p>
                  {profile.disc.description && <p className="text-sm text-muted-foreground">{profile.disc.description}</p>}
                  {profile.enneagram.description && <p className="text-sm text-muted-foreground">{profile.enneagram.description}</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>맞춤 직업 추천</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {profile.summary.careers.map((career, i) => (
                      <div key={career} className="flex items-center gap-3">
                        <span className="text-sm font-bold text-primary w-6">{i + 1}</span>
                        <span className="text-sm">{career}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>사주 & 사상체질 종합</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm"><span className="font-medium">오행 기질:</span> {profile.saju.dominant} ({profile.saju.typeName})</p>
                  <p className="text-sm"><span className="font-medium">사상체질:</span> {profile.sasang.type} ({profile.sasang.typeName})</p>
                  {profile.sasang.description && <p className="text-sm text-muted-foreground">{profile.sasang.description}</p>}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">상세 분석</h2>
            <PaywallOverlay testCode="comprehensive" socialCount={socialCount}>
              <div className="space-y-4">
                <LockedContent
                  title="MBTI 상세 분석"
                  items={[
                    '4가지 차원별 세부 해석 및 비율',
                    '유형별 대인관계 패턴과 소통 스타일',
                    '스트레스 상황에서의 반응과 대처법',
                  ]}
                />
                <LockedContent
                  title="행동 유형 & 에니어그램 심층 분석"
                  items={[
                    'DISC 행동 유형의 강점과 약점',
                    '에니어그램 날개 분석과 성장/퇴행 방향',
                    '두 유형의 교차 분석으로 보는 리더십 스타일',
                  ]}
                />
                <LockedContent
                  title="30가지 능력치 스탯"
                  items={[
                    '정신력, 사회성, 업무역량, 감각, 잠재력 5대 영역',
                    '각 능력치별 점수와 백분위',
                    '종합 레이더 차트와 성장 가이드',
                  ]}
                />
                <LockedContent
                  title="맞춤 직업 추천 & 커리어 로드맵"
                  items={[
                    'Holland 직업 흥미 유형과 사주 기질을 종합한 추천',
                    '적합 직업군 TOP 10',
                    '커리어 성장을 위한 구체적 액션 플랜',
                  ]}
                />
                <LockedContent
                  title="사주 & 사상체질 종합 해석"
                  items={[
                    '사주팔자 상세 풀이 (년주, 월주, 일주, 시주)',
                    '사상체질별 건강 관리법과 식이 추천',
                    '오행 밸런스와 보완 방법',
                  ]}
                />
              </div>
            </PaywallOverlay>
          </div>
        )}

        {/* 하단 CTA */}
        <div className="text-center space-y-4 pb-12">
          {isPaid ? (
            <>
              {/* 유료: 채용 프로필 작성 CTA */}
              <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 max-w-md mx-auto">
                <CardContent className="pt-6 pb-5 text-center">
                  <h3 className="text-lg font-bold mb-1">채용 프로필 작성하기</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    이 능력치 프로필을 기업에게 보여주세요
                  </p>
                  <Link href="/seeker/register">
                    <Button size="lg" className="w-full text-lg py-6">
                      채용 프로필 작성하기
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="w-full max-w-md">
                  대시보드로 이동
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/checkout?testCode=comprehensive">
                <Button size="lg" className="w-full max-w-md text-lg py-6">
                  전체 분석 잠금 해제 - 9,900원
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground">
                지금까지 {socialCount ?? '12,847'}명이 전체 분석을 확인했습니다
              </p>
            </>
          )}

          <div className="flex justify-center gap-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              홈으로 돌아가기
            </Link>
            {!token && (
              <Link href="/signup" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                계정 만들기 (결과 영구 저장)
              </Link>
            )}
            <Link href="/jobs" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              기업 탐색하기
            </Link>
          </div>
        </div>
      </main>

      {/* 스티키 하단 CTA 바 (무료 유저만) */}
      {!isPaid && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm transition-transform duration-300 ${
            showStickyCta ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4 max-w-2xl">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">전체 분석 잠금 해제</p>
              <p className="text-xs text-muted-foreground">{socialCount ?? '12,847'}명이 확인</p>
            </div>
            <Link href="/checkout?testCode=comprehensive" className="shrink-0">
              <Button size="sm" className="animate-pulse-scale">
                9,900원
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

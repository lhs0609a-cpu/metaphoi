'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/states';
import { PaywallOverlay } from '@/components/results/paywall-overlay';
import { LockedContent } from '@/components/results/locked-content';
import { ShareButtons } from '@/components/results/share-buttons';
import { RadarChart } from '@/components/results/radar-chart';
import { StatBar } from '@/components/results/stat-bar';
import { TypeBadgeCard } from '@/components/results/type-badge-card';
import { AbilityCategorySection } from '@/components/results/ability-category-section';
import { NormStatusBadge } from '@/components/measure/honesty';
import { RoleFit } from '@/components/results/role-fit';

import { getComprehensiveSession } from '@/lib/test-session';
import { useAuthStore } from '@/lib/auth';
import { api } from '@/lib/api';
import { useSocialProof } from '@/hooks/use-social-proof';
import { type ComprehensiveProfile } from '@/data/tests/comprehensive';
import { getTopAbilities, getAbilitiesByCategory } from '@/lib/abilities-scoring';
import { getCategoryColor } from '@/lib/design-tokens';

export default function ComprehensiveResultPreview() {
  const router = useRouter();
  const { token } = useAuthStore();
  const socialCount = useSocialProof();
  const [profile, setProfile] = useState<ComprehensiveProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
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

  const checkPaymentStatus = useCallback(() => {
    if (!token) return;
    api.payments.myStatus(token).then((res) => {
      if (res.data) {
        const data = res.data as any;
        if (data.has_paid) setIsPaid(true);
      }
    });
  }, [token]);

  useEffect(() => {
    checkPaymentStatus();
  }, [checkPaymentStatus]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') checkPaymentStatus();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [checkPaymentStatus]);

  // 무료 구간을 지나면 하단 CTA가 올라온다
  useEffect(() => {
    if (isPaid || !freeEndRef.current) return;
    const observer = new IntersectionObserver(([entry]) => setShowStickyCta(!entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(freeEndRef.current);
    return () => observer.disconnect();
  }, [isPaid, loading]);

  if (loading || !profile) {
    return <PageLoading label="분석 결과를 정리하는 중" />;
  }

  const ohaengMax = Math.max(...profile.saju.ohaeng.map((o: any) => o.score), 1);
  const topAbilities = getTopAbilities(profile.abilities, 5);
  const freeTopCount = isPaid ? 5 : 3;
  const categorizedAbilities = getAbilitiesByCategory(profile.abilities);

  const radarData = categorizedAbilities.map((group) => {
    const avg =
      group.abilities.length > 0
        ? Math.round(group.abilities.reduce((s, a) => s + a.score, 0) / group.abilities.length)
        : 0;
    return {
      name: group.category,
      score: avg,
      color: `hsl(${getCategoryColor(group.category).hsl})`,
    };
  });

  const types = [
    { label: '성격 유형', value: profile.mbti.type, sub: profile.mbti.typeName },
    { label: '행동 유형', value: profile.disc.type, sub: profile.disc.typeName },
    { label: '에니어그램', value: profile.enneagram.wing, sub: profile.enneagram.typeName },
    { label: '직업 흥미', value: profile.holland.topCode, sub: profile.holland.typeName },
    { label: '오행 기질', value: profile.saju.dominant, sub: profile.saju.typeName },
    { label: '사상체질', value: profile.sasang.type, sub: profile.sasang.typeName },
    { label: '혈액형', value: `${profile.blood.type}형`, sub: profile.blood.typeName },
  ];

  return (
    <div className={!isPaid ? 'pb-24' : undefined}>
      <div className="shell max-w-[44rem] py-12 lg:py-16">
        {/*
          머리 — 제목 자리에 "당신은 이런 사람입니다" 같은 고정 문구를 두지 않는다.
          사람마다 다른 한 줄이 결과 화면의 주인공이다.
        */}
        <header className="anim-rise flex flex-col items-start">
          <p className="eyebrow">{profile.personalInfo.name}님의 결과</p>
          <h1 className="mt-3 text-h1">{profile.summary.headline}</h1>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="rounded-pill bg-sunk px-3 py-1 text-small">
              {profile.mbti.type} · {profile.disc.type} · {profile.enneagram.wing}
            </span>
            {/* 규준 없음을 가장 크게 말해야 할 자리가 바로 여기다 */}
            <NormStatusBadge status="none" />
          </div>
        </header>

        <section className="mt-10">
          <h2 className="eyebrow">검사별 유형</h2>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {types.map((t) => (
              <TypeBadgeCard
                key={t.label}
                label={t.label}
                value={t.value}
                sub={t.sub}
                isPaid={isPaid}
              />
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-card border border-border p-6 sm:p-8">
          <h2 className="eyebrow">다섯 영역</h2>
          <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
            <RadarChart categories={radarData} animate size={220} />
            <ul className="flex w-full flex-1 flex-col gap-3">
              {radarData.map((d) => (
                <li key={d.name} className="flex items-center gap-3">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: d.color }}
                    aria-hidden="true"
                  />
                  <span className="flex-1 text-small">{d.name}</span>
                  <span className="stat-num text-body" data-numeric>
                    {d.score}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {profile.abilities && profile.abilities.length > 0 && (
          <section className="mt-10">
            <h2 className="text-h3">가장 높은 능력치</h2>
            <div className="mt-5 flex flex-col gap-3">
              {topAbilities.slice(0, freeTopCount).map((ability, i) => (
                <StatBar
                  key={ability.key}
                  label={ability.name}
                  score={ability.score}
                  category={ability.category}
                  rank={i + 1}
                  animated
                  delay={i * 100}
                />
              ))}

              {!isPaid && topAbilities.length > 3 && (
                <div className="relative">
                  <div className="pointer-events-none select-none space-y-3 blur-[3px]">
                    {topAbilities.slice(3, 5).map((ability, i) => (
                      <StatBar
                        key={ability.key}
                        label={ability.name}
                        score={ability.score}
                        category={ability.category}
                        rank={i + 4}
                        animated={false}
                      />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="rounded-pill bg-background/85 px-3 py-1 text-micro text-muted-foreground">
                      4위부터는 전체 분석에서
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 흥미 기반 직군 적합 — 능력치와 분리해서 보여준다 */}
        <RoleFit holland={profile.rawScores?.holland ?? {}} />

        <section className="mt-10">
          <ShareButtons
            title={`나는 ${profile.mbti.type}, ${profile.disc.type}형 — ${profile.summary.headline}`}
            description={`MBTI: ${profile.mbti.type} | DISC: ${profile.disc.type} | 에니어그램: ${profile.enneagram.wing} | Holland: ${profile.holland.topCode} | 사상: ${profile.sasang.type}`}
            url={typeof window !== 'undefined' ? `${window.location.origin}/results/share` : undefined}
          />
        </section>

        {profile.reliability &&
          (() => {
            const r = profile.reliability;
            const combined = Math.min(r.overallReliability, r.consistencyScore);
            if (combined > 0.7 && r.flags.length === 0) return null;
            const low = combined < 0.4;
            const flags = r.flags.filter((f) => !f.includes('실제:'));
            return (
              <section
                className={`mt-10 rounded-card px-5 py-4 ${low ? 'bg-danger-soft' : 'bg-warn-soft'}`}
                role="note"
              >
                <p className={`text-small font-semibold ${low ? 'text-danger' : 'text-warn'}`}>
                  {low
                    ? '응답 신뢰도가 낮습니다. 다시 검사하시길 권합니다'
                    : '응답 일관성이 다소 낮습니다'}
                </p>
                {flags.length > 0 && (
                  <ul className="mt-2 flex flex-col gap-1">
                    {flags.map((flag, i) => (
                      <li key={i} className="text-tiny text-muted-foreground">
                        {flag}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })()}

        <div ref={freeEndRef} />

        <section className="mt-10 rounded-card border border-border p-6 sm:p-8">
          <h2 className="text-h3">사주 오행</h2>
          <p className="mt-1 text-small text-muted-foreground">
            보조 지표입니다. 능력치 산출에는 낮은 비중으로만 반영됩니다.
          </p>
          <div className="mt-5 flex flex-col gap-2.5">
            {profile.saju.ohaeng.map((o: any) => (
              <StatBar
                key={o.key}
                label={o.label}
                score={o.score}
                maxScore={ohaengMax}
                color={o.color}
                animated
              />
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-h3">핵심 강점</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.summary.strengths.slice(0, isPaid ? undefined : 2).map((s) => (
              <span key={s} className="rounded-pill bg-sunk px-3 py-1.5 text-small font-medium">
                {s}
              </span>
            ))}
            {!isPaid && profile.summary.strengths.length > 2 && (
              <span className="rounded-pill border border-dashed border-border px-3 py-1.5 text-small text-muted-foreground">
                전체 분석에서 {profile.summary.strengths.length - 2}개 더
              </span>
            )}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-h3">종합 성격 분석</h2>
          {isPaid ? (
            <p className="mt-4 max-w-[62ch] text-body leading-relaxed text-muted-foreground">
              {profile.summary.personality}
            </p>
          ) : (
            <>
              <p className="mt-4 max-w-[62ch] text-body leading-relaxed text-muted-foreground">
                {profile.summary.personality.split('. ').slice(0, 2).join('. ')}.
              </p>
              {profile.summary.personality.split('. ').length > 2 && (
                <p className="mt-3 text-small text-muted-foreground">
                  이어지는 해석은 전체 분석에서 볼 수 있습니다.
                </p>
              )}
            </>
          )}
        </section>

        {profile.abilities && profile.abilities.length > 0 && (
          <section className="mt-10">
            <h2 className="text-h3">능력치 30개</h2>
            <p className="mt-1 text-small text-muted-foreground">5개 영역 × 6개</p>
            <div className="mt-6 flex flex-col gap-7">
              {categorizedAbilities.map((group) => (
                <AbilityCategorySection
                  key={group.category}
                  category={group.category}
                  abilities={group.abilities}
                  isPaid={isPaid}
                />
              ))}
            </div>
          </section>
        )}

        <section className="mt-12">
          <h2 className="text-h3">상세 분석</h2>
          {isPaid ? (
            <div className="mt-5 flex flex-col gap-8">
              <div>
                <h3 className="text-h4">MBTI</h3>
                <p className="mt-1 text-small text-muted-foreground">
                  {profile.mbti.type} · {profile.mbti.typeName}
                </p>
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  {profile.mbti.dimensions?.map((d: any) => (
                    <div key={d.label}>
                      <p className="text-tiny text-muted-foreground">{d.label}</p>
                      <div className="sunk mt-1.5 h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-pill bg-primary"
                          style={{ width: `${d.score}%` }}
                        />
                      </div>
                      <p className="mt-1.5 text-tiny text-muted-foreground">
                        {d.left} <span className="stat-num">{d.score}</span> / {d.right}{' '}
                        <span className="stat-num">{100 - d.score}</span>
                      </p>
                    </div>
                  )) || (
                    <p className="text-small text-muted-foreground">상세 차원 데이터가 없습니다</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-h4">행동 유형과 동기</h3>
                <dl className="mt-3 flex flex-col gap-3">
                  <div>
                    <dt className="text-small font-semibold">DISC · {profile.disc.type}</dt>
                    {profile.disc.description && (
                      <dd className="mt-1 text-small text-muted-foreground">
                        {profile.disc.description}
                      </dd>
                    )}
                  </div>
                  <div>
                    <dt className="text-small font-semibold">
                      에니어그램 · {profile.enneagram.wing}
                    </dt>
                    {profile.enneagram.description && (
                      <dd className="mt-1 text-small text-muted-foreground">
                        {profile.enneagram.description}
                      </dd>
                    )}
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-h4">직업 추천</h3>
                <ol className="mt-3 flex flex-col">
                  {profile.summary.careers.map((career, i) => (
                    <li
                      key={career}
                      className="flex items-baseline gap-4 border-t border-border py-3 last:border-b"
                    >
                      <span className="stat-num w-4 shrink-0 text-small text-muted-foreground">
                        {i + 1}
                      </span>
                      <span className="text-body">{career}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h3 className="text-h4">사주와 사상체질</h3>
                <p className="mt-2 text-small text-muted-foreground">
                  오행 기질 {profile.saju.dominant} ({profile.saju.typeName}) · 사상체질{' '}
                  {profile.sasang.type} ({profile.sasang.typeName})
                </p>
                {profile.sasang.description && (
                  <p className="mt-2 text-small text-muted-foreground">
                    {profile.sasang.description}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-5">
              <PaywallOverlay testCode="comprehensive" socialCount={socialCount}>
                <div className="flex flex-col gap-3">
                  <LockedContent
                    title="MBTI 상세 분석"
                    items={[
                      '4가지 차원별 비율과 해석',
                      '대인관계 패턴과 소통 스타일',
                      '스트레스 상황에서의 반응',
                    ]}
                  />
                  <LockedContent
                    title="행동 유형과 동기 심층 해석"
                    items={[
                      'DISC 강점과 약점',
                      '에니어그램 날개, 성장과 퇴행 방향',
                      '두 유형을 교차한 리더십 성향',
                    ]}
                  />
                  <LockedContent
                    title="능력치 30개 전체"
                    items={[
                      '다섯 영역 30개 능력치와 랭크',
                      '영역별 균형과 편차',
                      '낮은 능력치를 보완하는 방법',
                    ]}
                  />
                  <LockedContent
                    title="직업 추천과 커리어"
                    items={[
                      'Holland 흥미와 사주 기질을 종합한 추천',
                      '적합 직업군 10개',
                      '다음 3년을 위한 행동 계획',
                    ]}
                  />
                  <LockedContent
                    title="사주와 사상체질 해석"
                    items={['사주팔자 풀이', '체질별 생활 습관 제안', '오행 균형과 보완']}
                  />
                </div>
              </PaywallOverlay>
            </div>
          )}
        </section>

        <section className="mt-12 flex flex-col gap-4">
          {isPaid ? (
            <div className="flex flex-col gap-3 rounded-card border border-border p-6 sm:p-8">
              <h2 className="text-h3">이 결과로 제안을 받아보세요</h2>
              <p className="text-body text-muted-foreground">
                프로필을 공개하면 능력치를 보고 기업이 먼저 연락합니다. 공개 범위는 언제든 되돌릴 수
                있습니다.
              </p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/seeker/register">채용 프로필 만들기</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/dashboard">대시보드로</Link>
                </Button>
              </div>
            </div>
          ) : null}

          <nav className="flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-6">
            <Link href="/" className="text-small text-muted-foreground hover:text-foreground">
              홈으로
            </Link>
            {!token && (
              <Link href="/signup" className="text-small text-muted-foreground hover:text-foreground">
                결과 저장하기
              </Link>
            )}
            <Link href="/jobs" className="text-small text-muted-foreground hover:text-foreground">
              채용 공고 보기
            </Link>
          </nav>
        </section>
      </div>

      {/* 하단 고정 CTA — 무료 사용자에게만, 무료 구간을 지나면 올라온다 */}
      {!isPaid && (
        <div
          className={`fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-md transition-transform duration-std ease-std ${
            showStickyCta ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="shell flex max-w-[44rem] items-center justify-between gap-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-small font-semibold">전체 분석 열기</p>
              <p className="text-tiny text-muted-foreground">
                {socialCount ? `${socialCount}명이 열었습니다` : '능력치 30개와 상세 해석'}
              </p>
            </div>
            <Button asChild className="shrink-0">
              <Link href="/checkout?testCode=comprehensive">9,900원~</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

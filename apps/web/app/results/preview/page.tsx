'use client';

import { useEffect, useState } from 'react';
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

function TypeBadge({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="text-center p-4 rounded-xl bg-muted/50">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold text-primary">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

export default function ComprehensiveResultPreview() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [profile, setProfile] = useState<ComprehensiveProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [paidTier, setPaidTier] = useState<string | null>(null);

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
  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">
            Metaphoi
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              clearComprehensive();
              router.push('/test');
            }}
          >
            다시 검사하기
          </Button>
        </div>
      </header>

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
              <TypeBadge label="성격 유형" value={profile.mbti.type} sub={profile.mbti.typeName} />
              <TypeBadge label="행동 유형" value={profile.disc.type} sub={profile.disc.typeName} />
              <TypeBadge label="에니어그램" value={profile.enneagram.wing} sub={profile.enneagram.typeName} />
              <TypeBadge label="직업 흥미" value={profile.holland.topCode} sub={profile.holland.typeName} />
            </div>
          </CardContent>
        </Card>

        {/* 부가 유형 (사주, 사상, 혈액형) */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-3">
              <TypeBadge label="오행 기질" value={profile.saju.dominant} sub={profile.saju.typeName} />
              <TypeBadge label="사상체질" value={profile.sasang.type} sub={profile.sasang.typeName} />
              <TypeBadge label="혈액형" value={`${profile.blood.type}형`} sub={profile.blood.typeName} />
            </div>
          </CardContent>
        </Card>

        {/* 공유 버튼 */}
        <div className="mb-6">
          <ShareButtons
            title={`나는 ${profile.mbti.type}, ${profile.disc.type}형 - ${profile.summary.headline}`}
            description={`MBTI: ${profile.mbti.type} | DISC: ${profile.disc.type} | 에니어그램: ${profile.enneagram.wing} | Holland: ${profile.holland.topCode} | 사상: ${profile.sasang.type} - 나도 검사해보기!`}
            url={typeof window !== 'undefined' ? `${window.location.origin}/results/share` : undefined}
          />
        </div>

        {/* 종합 성격 설명 (무료 공개) */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>종합 성격 분석</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {profile.summary.personality}
            </p>
          </CardContent>
        </Card>

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

        {/* 핵심 강점 (무료 공개, 일부만) */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>핵심 강점</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.summary.strengths.slice(0, 4).map((s) => (
                <span key={s} className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full">
                  {s}
                </span>
              ))}
              {profile.summary.strengths.length > 4 && (
                <span className="px-3 py-1.5 bg-muted text-muted-foreground text-sm rounded-full">
                  +{profile.summary.strengths.length - 4}개 더
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* TOP 5 능력치 (무료 공개) */}
        {profile.abilities && profile.abilities.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>TOP 5 능력치</CardTitle>
              <p className="text-sm text-muted-foreground">
                {profile.personalInfo.name}님이 가장 높은 능력치 상위 5개
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {getTopAbilities(profile.abilities, 5).map((ability, i) => (
                <AbilityBar key={ability.key} ability={ability} rank={i + 1} />
              ))}
            </CardContent>
          </Card>
        )}

        {/* 전체 능력치 미리보기 (흐리게) */}
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
                        // 결제 완료: 전체 공개
                        group.abilities.map((ability) => (
                          <AbilityBar key={ability.key} ability={ability} />
                        ))
                      ) : (
                        <>
                          {group.abilities.slice(0, 2).map((ability) => (
                            <AbilityBar key={ability.key} ability={ability} />
                          ))}
                          {/* 나머지 4개는 블러 */}
                          <div className="relative">
                            <div className="blur-sm select-none pointer-events-none space-y-2">
                              {group.abilities.slice(2).map((ability) => (
                                <AbilityBar key={ability.key} ability={ability} />
                              ))}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs text-muted-foreground bg-background/80 px-3 py-1 rounded-full">
                                +{group.abilities.length - 2}개 잠금
                              </span>
                            </div>
                          </div>
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
            <PaywallOverlay testCode="comprehensive">
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

        {/* 채용 등록 CTA */}
        <Card className="mb-8 border-primary/30 bg-primary/5">
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-bold mb-2">이 결과로 취업하기</h3>
            <p className="text-sm text-muted-foreground mb-4">
              검사 결과와 능력치를 기업에 공개하고, 나에게 맞는 기업과 매칭되어 보세요.
              <br />
              실명은 양쪽 매칭이 성사된 후에만 공개됩니다.
            </p>
            <Link href="/seeker/register">
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                채용 프로필 등록하기
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* 하단 CTA */}
        <div className="text-center space-y-4 pb-12">
          {isPaid ? (
            <Link href="/dashboard">
              <Button size="lg" className="w-full max-w-md text-lg py-6">
                대시보드로 이동
              </Button>
            </Link>
          ) : (
            <Link href="/checkout?testCode=comprehensive">
              <Button size="lg" className="w-full max-w-md text-lg py-6">
                전체 분석 보기 - 9,900원부터
              </Button>
            </Link>
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
            <Link href="/seeker/companies" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              기업 탐색하기
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

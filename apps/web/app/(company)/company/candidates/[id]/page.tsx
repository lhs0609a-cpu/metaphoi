'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Badge, CategoryChip } from '@/components/ui/badge';
import { EmptyState, PageLoading } from '@/components/ui/states';
import { PageHeader } from '@/components/layouts/page-header';
import { StatBarCompact } from '@/components/measure/stat-bar';
import { RadarChart, type RadarAxis } from '@/components/measure/radar-chart';
import { NormStatusBadge } from '@/components/measure/honesty';
import { useToast } from '@/components/ui/use-toast';
import { useCompanyAuthStore } from '@/lib/company-auth';
import { marketplaceApi } from '@/lib/marketplace-api';
import { getCategoryColor } from '@/lib/design-tokens';

interface Ability {
  key: string;
  name: string;
  score: number;
  category?: string;
}

interface Seeker {
  id: string;
  display_name?: string;
  headline?: string;
  desired_roles?: string[];
  experience_years?: number | null;
  education?: string;
  salary_range?: string;
  remote_pref?: string;
  location_pref?: string;
  abilities_snapshot?: Ability[];
  comprehensive_profile?: {
    mbti?: { type?: string; typeName?: string };
    disc?: { type?: string; typeName?: string };
    holland?: { topCode?: string; typeName?: string };
    summary?: { headline?: string; strengths?: string[] };
  };
}

const REMOTE_LABEL: Record<string, string> = {
  remote: '전면 원격',
  hybrid: '하이브리드',
  onsite: '출근',
};

export default function CandidateDetailPage() {
  const params = useParams();
  const seekerId = params.id as string;
  const { token } = useCompanyAuthStore();
  const { toast } = useToast();

  const [seeker, setSeeker] = useState<Seeker | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    marketplaceApi.seekers.getProfile(seekerId).then((res) => {
      setSeeker((res.data as Seeker) ?? null);
      setLoading(false);
    });
  }, [seekerId]);

  const handleInterest = async () => {
    if (!token) return;
    setSending(true);
    const result = await marketplaceApi.matching.sendCompanyInterest(
      { to_type: 'seeker', to_id: seekerId },
      token,
    );
    setSending(false);

    if (result.error) {
      toast({ title: '관심 표시를 보내지 못했습니다', description: result.error, variant: 'destructive' });
      return;
    }
    setSent(true);
    const matched = (result.data as { match?: unknown })?.match;
    toast({
      title: matched ? '매칭이 성사됐습니다' : '관심 표시를 보냈습니다',
      description: matched ? '메시지에서 대화를 시작할 수 있습니다.' : '상대가 수락하면 알려드립니다.',
    });
  };

  if (loading) return <PageLoading label="후보자 정보를 불러오는 중" />;
  if (!seeker) {
    return (
      <EmptyState
        title="후보자를 찾을 수 없습니다"
        description="프로필이 비공개로 전환되었거나 삭제되었습니다."
        action={{ label: '후보자 목록으로', href: '/company/candidates' }}
      />
    );
  }

  const abilities = seeker.abilities_snapshot ?? [];
  const top = [...abilities].sort((a, b) => b.score - a.score).slice(0, 10);
  const profile = seeker.comprehensive_profile;

  // 카테고리 평균 → 레이더
  const byCategory = new Map<string, number[]>();
  for (const a of abilities) {
    if (!a.category) continue;
    if (!byCategory.has(a.category)) byCategory.set(a.category, []);
    byCategory.get(a.category)!.push(a.score);
  }
  const radar: RadarAxis[] = Array.from(byCategory.entries()).map(([label, scores]) => ({
    label,
    value: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
    color: `hsl(${getCategoryColor(label).hsl})`,
  }));

  const facts: [string, string][] = [
    ['경력', seeker.experience_years != null ? `${seeker.experience_years}년` : '—'],
    ['학력', seeker.education || '—'],
    ['희망 연봉', seeker.salary_range || '—'],
    ['근무 형태', seeker.remote_pref ? (REMOTE_LABEL[seeker.remote_pref] ?? '—') : '—'],
    ['선호 지역', seeker.location_pref || '—'],
  ];

  return (
    <div className="max-w-3xl">
      <PageHeader
        eyebrow="후보자"
        title={seeker.display_name || '익명 후보자'}
        description={seeker.headline}
        actions={
          <Button loading={sending} disabled={sent} onClick={handleInterest}>
            {sent ? '관심 표시 보냄' : '관심 표시'}
          </Button>
        }
      />

      {/* 기본 정보 */}
      <section className="rounded-card border border-border bg-card px-pad-i py-pad-b">
        {(seeker.desired_roles ?? []).length > 0 ? (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {(seeker.desired_roles ?? []).map((r) => (
              <Badge key={r} tone="signal" size="sm">{r}</Badge>
            ))}
          </div>
        ) : null}

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
          {facts.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-0.5">
              <dt className="text-micro text-muted-foreground">{k}</dt>
              <dd className="text-small font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 프로필 요약 */}
      {profile ? (
        <section className="mt-4 flex flex-col gap-4 rounded-card border border-border bg-card px-pad-i py-pad-b">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-h4">측정 프로필</h2>
            <NormStatusBadge status="none" />
          </div>

          {profile.summary?.headline ? (
            <p className="text-small text-muted-foreground">{profile.summary.headline}</p>
          ) : null}

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'MBTI', value: profile.mbti?.type },
              { label: 'DISC', value: profile.disc?.type },
              { label: 'Holland', value: profile.holland?.topCode },
            ].map((t) => (
              <div
                key={t.label}
                className="flex flex-col items-center gap-1 rounded-control bg-sunk px-2 py-2.5"
              >
                <span className="text-micro text-muted-foreground">{t.label}</span>
                <span className="stat-num text-small text-primary">{t.value ?? '—'}</span>
              </div>
            ))}
          </div>

          <p className="text-micro leading-relaxed text-muted-foreground">
            유형 이름은 기억하기 쉽게 옮긴 표현입니다. 경계에 걸친 유형은 재검사 시 바뀔 수 있으므로
            선발 기준으로 쓰지 마세요.
          </p>
        </section>
      ) : null}

      {/* 능력치 */}
      {abilities.length > 0 ? (
        <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          {radar.length >= 3 ? (
            <div className="flex flex-col items-center gap-3 rounded-card border border-border bg-card px-pad-i py-pad-b">
              <p className="eyebrow self-start">카테고리 평균</p>
              <RadarChart axes={radar} size={240} showCI={false} showValues animate />
              <div className="flex flex-wrap justify-center gap-1.5">
                {radar.map((r) => (
                  <CategoryChip key={r.label} category={r.label} />
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-1 rounded-card border border-border bg-card px-pad-i py-pad-b">
            <p className="eyebrow mb-1">상위 능력치</p>
            {top.map((a) => (
              <StatBarCompact
                key={a.key}
                name={a.name}
                percentile={a.score}
                category={a.category}
              />
            ))}
            <p className="mt-2 text-micro leading-relaxed text-muted-foreground">
              규준 표본이 확보되기 전이라 모집단 대비 백분위가 아니라 후보자 내부 상대 점수입니다.
              후보자 간 직접 비교에는 적합하지 않습니다.
            </p>
          </div>
        </section>
      ) : (
        <section className="mt-4">
          <EmptyState
            title="측정 결과가 없습니다"
            description="이 후보자는 아직 검사를 완료하지 않았거나 결과를 비공개로 두었습니다."
            className="py-8"
          />
        </section>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState, PageLoading } from '@/components/ui/states';
import { PageHeader } from '@/components/layouts/page-header';
import { StatBarCompact } from '@/components/measure/stat-bar';
import { NormStatusBadge } from '@/components/measure/honesty';
import { useAuthStore } from '@/lib/auth';
import { marketplaceApi } from '@/lib/marketplace-api';

interface Ability {
  key: string;
  name: string;
  score: number;
  category?: string;
}

interface SeekerProfile {
  display_name?: string;
  headline?: string;
  desired_roles?: string[];
  experience_years?: number | null;
  education?: string;
  salary_range?: string;
  remote_pref?: string;
  location_pref?: string;
  is_active?: boolean;
  visibility?: string;
  abilities_snapshot?: Ability[];
}

const VISIBILITY: Record<string, { label: string; tone: 'ok' | 'warn' | 'neutral'; desc: string }> = {
  public: {
    label: '전체 공개',
    tone: 'ok',
    desc: '기업이 후보자 탐색에서 내 프로필을 볼 수 있습니다.',
  },
  matched_only: {
    label: '매칭 기업만',
    tone: 'warn',
    desc: '서로 관심을 표시한 기업에게만 공개됩니다.',
  },
  private: {
    label: '비공개',
    tone: 'neutral',
    desc: '어떤 기업도 내 프로필을 볼 수 없습니다.',
  },
};

const REMOTE_LABEL: Record<string, string> = {
  remote: '전면 원격', hybrid: '하이브리드', onsite: '출근',
};

export default function SeekerProfilePage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuthStore();
  const [profile, setProfile] = useState<SeekerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }
    marketplaceApi.seekers.getMyProfile(token).then((res) => {
      if (res.error) {
        router.push('/seeker/register');
      } else {
        setProfile((res.data as SeekerProfile) ?? null);
      }
      setLoading(false);
    });
  }, [isAuthenticated, token, router]);

  if (loading) return <PageLoading label="프로필을 불러오는 중" />;
  if (!profile) return null;

  const abilities = profile.abilities_snapshot ?? [];
  const top = [...abilities].sort((a, b) => b.score - a.score).slice(0, 6);
  const vis = VISIBILITY[profile.visibility ?? 'private'] ?? VISIBILITY.private;

  const facts: [string, string][] = [
    ['경력', profile.experience_years != null ? `${profile.experience_years}년` : '—'],
    ['학력', profile.education || '—'],
    ['희망 연봉', profile.salary_range || '—'],
    ['근무 형태', profile.remote_pref ? (REMOTE_LABEL[profile.remote_pref] ?? '—') : '—'],
    ['선호 지역', profile.location_pref || '—'],
  ];

  return (
    <div id="main" className="container max-w-2xl py-8">
      <PageHeader
        title="내 구직 프로필"
        description="기업에 보이는 모습입니다."
        badge={
          <>
            <Badge tone={profile.is_active ? 'ok' : 'neutral'} size="sm" dot>
              {profile.is_active ? '구직 중' : '비활성'}
            </Badge>
            <Badge tone={vis.tone} size="sm">
              {vis.label}
            </Badge>
          </>
        }
        actions={
          <Button asChild variant="outline">
            <Link href="/seeker/register">프로필 수정</Link>
          </Button>
        }
      />

      {/* 공개 범위 안내 */}
      <div className="mb-4 rounded-card border border-border bg-sunk px-4 py-3">
        <p className="text-tiny text-muted-foreground">
          <strong className="text-foreground">{vis.label}</strong> · {vis.desc}
        </p>
      </div>

      {/* 기본 정보 */}
      <section className="flex flex-col gap-4 rounded-card border border-border bg-card px-pad-i py-pad-b">
        <div className="flex flex-col gap-1">
          <h2 className="text-h3">{profile.display_name || '이름 미설정'}</h2>
          <p className="text-small text-muted-foreground">
            {profile.headline || '한 줄 소개를 적으면 기업이 먼저 연락할 가능성이 올라갑니다.'}
          </p>
        </div>

        {(profile.desired_roles ?? []).length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {(profile.desired_roles ?? []).map((r) => (
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

      {/* 능력치 */}
      <section className="mt-4 flex flex-col gap-3 rounded-card border border-border bg-card px-pad-i py-pad-b">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-h4">기업에 공개되는 능력치</h2>
          <NormStatusBadge status="none" />
        </div>

        {top.length === 0 ? (
          <EmptyState
            title="측정 결과가 없습니다"
            description="검사를 완료하면 능력치가 프로필에 연결됩니다."
            action={{ label: '검사하러 가기', href: '/start' }}
            className="border-0 px-0 py-6"
          />
        ) : (
          <>
            <div>
              {top.map((a) => (
                <StatBarCompact
                  key={a.key}
                  name={a.name}
                  percentile={a.score}
                  category={a.category}
                />
              ))}
            </div>
            <p className="text-micro leading-relaxed text-muted-foreground">
              규준 표본이 확보되기 전이라 모집단 대비 백분위가 아니라 내부 상대 점수입니다.
              기업 화면에도 같은 안내가 함께 표시됩니다.
            </p>
          </>
        )}
      </section>

      {/* 권리 안내 */}
      <section className="mt-4 rounded-card border border-border bg-card px-pad-i py-pad-b">
        <h2 className="text-h4">내 데이터에 대한 권리</h2>
        <ul className="mt-2 flex flex-col gap-2 text-small text-muted-foreground">
          <li className="flex gap-2">
            <span className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-current opacity-50" />
            공개 범위는 언제든 바꾸거나 비공개로 되돌릴 수 있습니다.
          </li>
          <li className="flex gap-2">
            <span className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-current opacity-50" />
            자동 산출된 적합도만으로 불합격 처리된 경우, 기업에 설명과 사람의 재검토를 요구할 수 있습니다.
          </li>
          <li className="flex gap-2">
            <span className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-current opacity-50" />
            검사 응답과 프로필의 삭제를 요청할 수 있습니다.
          </li>
        </ul>
      </section>
    </div>
  );
}

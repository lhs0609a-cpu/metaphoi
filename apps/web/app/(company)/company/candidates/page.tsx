'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { EmptyState, Skeleton } from '@/components/ui/states';
import { PageHeader } from '@/components/layouts/page-header';
import { StatBarCompact } from '@/components/measure/stat-bar';
import { useToast } from '@/components/ui/use-toast';
import { useCompanyAuthStore } from '@/lib/company-auth';
import { marketplaceApi } from '@/lib/marketplace-api';

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
  abilities_snapshot?: Ability[];
}

/**
 * 후보자 탐색 (ops 표면).
 *
 * 카드 목록으로 두되 스캔이 가능해야 한다. 능력치는 숫자만 나열하지 않고
 * 막대를 함께 그려 훑어볼 수 있게 했다.
 *
 * alert() 를 토스트로 바꿨다. alert는 브라우저를 멈추고, 모바일에서는
 * 도메인 이름까지 노출되어 제품처럼 보이지 않는다.
 */
export default function CompanyCandidatesPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useCompanyAuthStore();
  const { toast } = useToast();

  const [seekers, setSeekers] = useState<Seeker[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [sending, setSending] = useState<string | null>(null);
  const [sent, setSent] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/company/login');
      return;
    }
    marketplaceApi.seekers.search().then((res) => {
      setSeekers(((res.data as { seekers?: Seeker[] })?.seekers ?? []) as Seeker[]);
      setLoading(false);
    });
  }, [isAuthenticated, router]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return seekers;
    return seekers.filter((s) =>
      [s.display_name, s.headline, ...(s.desired_roles ?? [])]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [seekers, query]);

  const handleInterest = async (seekerId: string) => {
    if (!token) return;
    setSending(seekerId);
    const result = await marketplaceApi.matching.sendCompanyInterest(
      { to_type: 'seeker', to_id: seekerId },
      token,
    );
    setSending(null);

    if (result.error) {
      toast({ title: '관심 표시를 보내지 못했습니다', description: result.error, variant: 'destructive' });
      return;
    }

    setSent((prev) => new Set(prev).add(seekerId));
    const matched = (result.data as { match?: unknown })?.match;
    toast({
      title: matched ? '매칭이 성사됐습니다' : '관심 표시를 보냈습니다',
      description: matched
        ? '메시지에서 바로 대화를 시작할 수 있습니다.'
        : '상대가 수락하면 메시지로 알려드립니다.',
    });
  };

  return (
    <div>
      <PageHeader
        title="후보자 탐색"
        description="공개 프로필을 가진 구직자입니다. 관심 표시를 보내면 상대에게 알림이 갑니다."
      >
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="이름, 직무, 소개로 검색"
          aria-label="후보자 검색"
          className="max-w-sm"
          leading={
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <circle cx="7" cy="7" r="4.5" />
              <path d="m10.5 10.5 3 3" strokeLinecap="round" />
            </svg>
          }
        />
      </PageHeader>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-3 rounded-card border border-border bg-card p-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-64" />
              <Skeleton className="h-1.5 w-full" />
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          title={query ? '검색 결과가 없습니다' : '공개된 후보자가 없습니다'}
          description={
            query
              ? '다른 키워드로 찾아보시거나 검색어를 지워 전체 목록을 확인하세요.'
              : '구직자가 프로필을 공개하면 이 목록에 나타납니다.'
          }
          action={query ? { label: '검색어 지우기', onClick: () => setQuery('') } : undefined}
          icon={
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <circle cx="11" cy="8" r="3.5" />
              <path d="M4.5 20a6.5 6.5 0 0 1 13 0" />
            </svg>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((seeker) => {
            const top = [...(seeker.abilities_snapshot ?? [])]
              .sort((a, b) => b.score - a.score)
              .slice(0, 3);
            const alreadySent = sent.has(seeker.id);

            return (
              <article
                key={seeker.id}
                className="flex flex-col gap-4 rounded-card border border-border bg-card px-pad-i py-pad-b sm:flex-row sm:items-start"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-body font-semibold">{seeker.display_name || '익명 후보자'}</h3>
                      {seeker.experience_years != null ? (
                        <Badge tone="outline" size="sm">
                          {seeker.experience_years}년차
                        </Badge>
                      ) : null}
                    </div>
                    {seeker.headline ? (
                      <p className="line-clamp-2 max-w-prose text-small text-muted-foreground">
                        {seeker.headline}
                      </p>
                    ) : null}
                  </div>

                  {(seeker.desired_roles ?? []).length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {(seeker.desired_roles ?? []).slice(0, 4).map((r) => (
                        <Badge key={r} tone="signal" size="sm">
                          {r}
                        </Badge>
                      ))}
                    </div>
                  ) : null}

                  {top.length > 0 ? (
                    <div className="max-w-sm">
                      {top.map((a) => (
                        <StatBarCompact
                          key={a.key}
                          name={a.name}
                          percentile={a.score}
                          category={a.category}
                        />
                      ))}
                      <p className="mt-1 text-micro text-muted-foreground">
                        규준 수집 전이라 후보자 내부 상대 점수입니다
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="flex shrink-0 gap-2 sm:flex-col">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/company/candidates/${seeker.id}`}>상세 보기</Link>
                  </Button>
                  <Button
                    size="sm"
                    variant={alreadySent ? 'ghost' : 'primary'}
                    disabled={alreadySent}
                    loading={sending === seeker.id}
                    onClick={() => handleInterest(seeker.id)}
                  >
                    {alreadySent ? '보냄' : '관심 표시'}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

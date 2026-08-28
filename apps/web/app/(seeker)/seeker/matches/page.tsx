'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState, Skeleton } from '@/components/ui/states';
import { PageHeader } from '@/components/layouts/page-header';
import { FitScoreInline } from '@/components/measure/fit-score';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/lib/auth';
import { marketplaceApi } from '@/lib/marketplace-api';
import { cn } from '@/lib/utils';

type Tab = 'matches' | 'received' | 'sent';

interface Match {
  id: string;
  companies?: { name?: string; id?: string };
  job_postings?: { title?: string; id?: string };
  fit_score?: { total?: number };
}

interface Interest {
  id: string;
  status?: string;
  message?: string;
  created_at?: string;
  companies?: { name?: string };
  job_postings?: { title?: string };
}

const STATUS: Record<string, { label: string; tone: 'ok' | 'danger' | 'warn' }> = {
  accepted: { label: '수락됨', tone: 'ok' },
  declined: { label: '거절됨', tone: 'danger' },
  pending: { label: '대기중', tone: 'warn' },
};

export default function SeekerMatchesPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuthStore();
  const { toast } = useToast();

  const [matches, setMatches] = useState<Match[]>([]);
  const [sent, setSent] = useState<Interest[]>([]);
  const [received, setReceived] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('matches');
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    const [matchRes, sentRes, recvRes] = await Promise.all([
      marketplaceApi.matching.getSeekerMatches(token),
      marketplaceApi.matching.getSeekerSentInterests(token),
      marketplaceApi.matching.getSeekerReceivedInterests(token),
    ]);
    setMatches(Array.isArray(matchRes.data) ? (matchRes.data as Match[]) : []);
    setSent(Array.isArray(sentRes.data) ? (sentRes.data as Interest[]) : []);
    setReceived(Array.isArray(recvRes.data) ? (recvRes.data as Interest[]) : []);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }
    load();
  }, [isAuthenticated, token, router, load]);

  /** 수락/거절 — window.location.reload() 대신 상태만 다시 읽는다 */
  const respond = async (interestId: string, status: 'accepted' | 'declined') => {
    if (!token) return;
    setBusy(interestId);
    const result = await marketplaceApi.matching.respondInterest(interestId, { status }, token);
    setBusy(null);

    if (result.error) {
      toast({ title: '처리하지 못했습니다', description: result.error, variant: 'destructive' });
      return;
    }

    const matched = (result.data as { match?: unknown })?.match;
    toast({
      title:
        status === 'accepted'
          ? matched
            ? '매칭이 성사됐습니다'
            : '수락했습니다'
          : '거절했습니다',
      description: matched ? '메시지에서 대화를 시작할 수 있습니다.' : undefined,
    });
    load();
  };

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: 'matches', label: '매칭', count: matches.length },
    { key: 'received', label: '받은 관심', count: received.length },
    { key: 'sent', label: '보낸 관심', count: sent.length },
  ];

  return (
    <div id="main" className="container max-w-2xl py-8">
      <PageHeader
        title="매칭 & 관심"
        description="서로 관심을 표시한 경우에만 연결됩니다. 프로필은 공개로 설정한 경우에만 노출됩니다."
      >
        <div className="scroll-x flex gap-1 border-b border-border" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'relative whitespace-nowrap px-3.5 py-2.5 text-small transition-colors duration-fast',
                tab === t.key
                  ? 'font-semibold text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t.label}
              <span className="ml-1.5 text-micro text-muted-foreground tnum">{t.count}</span>
              <span
                className={cn(
                  'absolute inset-x-2 -bottom-px h-0.5 rounded-pill bg-primary transition-opacity duration-fast',
                  tab === t.key ? 'opacity-100' : 'opacity-0',
                )}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      </PageHeader>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : tab === 'matches' ? (
        matches.length === 0 ? (
          <EmptyState
            title="아직 매칭이 없습니다"
            description="관심 있는 공고에 지원하거나 기업에 관심을 표시하면 매칭이 시작됩니다."
            action={{ label: '공고 둘러보기', href: '/jobs' }}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {matches.map((m) => (
              <article
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-card px-pad-i py-pad-b"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <h3 className="truncate text-body font-semibold">
                    {m.companies?.name || '기업'}
                  </h3>
                  <p className="truncate text-small text-muted-foreground">
                    {m.job_postings?.title || '공고 미지정'}
                  </p>
                  {typeof m.fit_score?.total === 'number' ? (
                    <FitScoreInline total={m.fit_score.total} className="mt-0.5" />
                  ) : null}
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href="/seeker/messages">메시지</Link>
                  </Button>
                  {m.job_postings?.id ? (
                    <Button asChild size="sm">
                      <Link href={`/jobs/${m.job_postings.id}`}>공고 보기</Link>
                    </Button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )
      ) : tab === 'received' ? (
        received.length === 0 ? (
          <EmptyState
            title="받은 관심이 없습니다"
            description="프로필을 공개로 두면 기업이 능력치 기준으로 찾아옵니다."
            action={{ label: '프로필 설정', href: '/seeker/profile' }}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {received.map((it) => {
              const s = STATUS[it.status ?? 'pending'] ?? STATUS.pending;
              return (
                <article
                  key={it.id}
                  className="flex flex-col gap-3 rounded-card border border-border bg-card px-pad-i py-pad-b"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col gap-1">
                      <h3 className="text-body font-semibold">
                        {it.companies?.name || '기업'}에서 관심을 보냈습니다
                      </h3>
                      {it.job_postings?.title ? (
                        <p className="text-small text-muted-foreground">{it.job_postings.title}</p>
                      ) : null}
                      {it.message ? (
                        <p className="mt-1 rounded-control bg-sunk px-3.5 py-2.5 text-small">
                          {it.message}
                        </p>
                      ) : null}
                    </div>
                    <Badge tone={s.tone} size="sm" dot>
                      {s.label}
                    </Badge>
                  </div>

                  {(it.status ?? 'pending') === 'pending' ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        loading={busy === it.id}
                        onClick={() => respond(it.id, 'accepted')}
                      >
                        수락
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busy === it.id}
                        onClick={() => respond(it.id, 'declined')}
                      >
                        거절
                      </Button>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )
      ) : sent.length === 0 ? (
        <EmptyState
          title="보낸 관심이 없습니다"
          description="마음에 드는 공고에 관심을 표시해 보세요."
          action={{ label: '공고 둘러보기', href: '/jobs' }}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {sent.map((it) => {
            const s = STATUS[it.status ?? 'pending'] ?? STATUS.pending;
            return (
              <article
                key={it.id}
                className="flex items-center justify-between gap-3 rounded-card border border-border bg-card px-pad-i py-pad-b"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <h3 className="truncate text-body font-medium">
                    {it.job_postings?.title || it.companies?.name || '기업'}
                  </h3>
                  {it.created_at ? (
                    <p className="text-tiny text-muted-foreground tnum">
                      {new Date(it.created_at).toLocaleDateString('ko-KR')} 보냄
                    </p>
                  ) : null}
                </div>
                <Badge tone={s.tone} size="sm" dot>
                  {s.label}
                </Badge>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

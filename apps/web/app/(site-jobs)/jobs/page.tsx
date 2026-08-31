'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState, Skeleton } from '@/components/ui/states';
import { marketplaceApi } from '@/lib/marketplace-api';
import { getComprehensiveSession } from '@/lib/test-session';
import {
  isDiscriminative,
  matchFamiliesForSeeker,
  RESOLVED_ROLES,
  BAND_LABEL,
} from '@/lib/role-matching';
import { INDUSTRIES } from '@/data/roles/families';
import type { RiasecProfile } from '@/data/roles/types';
import { cn } from '@/lib/utils';

interface Job {
  id: string;
  title: string;
  description?: string | null;
  role_id?: string | null;
  companies?: { name?: string; location?: string } | null;
  conditions?: { salary_range?: string; remote?: string } | null;
}

interface Company {
  id: string;
  name: string;
  industry?: string | null;
  size_range?: string | null;
  culture_tags?: string[] | null;
}

const REMOTE_LABEL: Record<string, string> = {
  remote: '재택',
  hybrid: '하이브리드',
  onsite: '출근',
};

const ROLE_BY_ID = new Map(RESOLVED_ROLES.map((r) => [r.id, r]));

export default function JobsHomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [industryId, setIndustryId] = useState<string | null>(null);
  /** 내 흥미와 맞는 직군만 보기 */
  const [onlyMatched, setOnlyMatched] = useState(false);
  const [riasec, setRiasec] = useState<RiasecProfile | null>(null);

  useEffect(() => {
    Promise.all([marketplaceApi.jobs.list(), marketplaceApi.companies.list()])
      .then(([jobsRes, compRes]) => {
        setJobs(((jobsRes.data as any)?.jobs as Job[]) || []);
        setCompanies(((compRes.data as any)?.companies as Company[]) || []);
      })
      .finally(() => setLoading(false));
  }, []);

  // 검사를 마친 사람이면 흥미 프로필을 읽어 온다.
  // 없으면 이 화면은 그냥 공고 목록으로 동작한다 — 검사를 강요하지 않는다.
  useEffect(() => {
    const session = getComprehensiveSession();
    const holland = session?.profile?.rawScores?.holland;
    if (!holland) return;
    const p = {
      R: holland.R ?? 0, I: holland.I ?? 0, A: holland.A ?? 0,
      S: holland.S ?? 0, E: holland.E ?? 0, C: holland.C ?? 0,
    } as RiasecProfile;
    if (isDiscriminative(p)) setRiasec(p);
  }, []);

  const matched = useMemo(
    () => (riasec ? matchFamiliesForSeeker(riasec, { limit: 5 }) : []),
    [riasec]
  );
  const matchedFamilyIds = useMemo(() => new Set(matched.map((m) => m.family.id)), [matched]);

  const visible = useMemo(() => {
    return jobs.filter((job) => {
      const role = job.role_id ? ROLE_BY_ID.get(job.role_id) : null;
      if (industryId && role?.industryId !== industryId) return false;
      // 직무가 지정되지 않은 공고는 걸러낼 근거가 없으므로 남긴다.
      // 필터에 안 걸린다고 감추면 공고가 조용히 사라진다.
      if (onlyMatched && role && !matchedFamilyIds.has(role.familyId)) return false;
      return true;
    });
  }, [jobs, industryId, onlyMatched, matchedFamilyIds]);

  return (
    <>
      <section className="shell py-12 lg:py-16">
        <div className="flex flex-col items-start gap-4">
          <p className="eyebrow">채용</p>
          <h1 className="text-h1">능력치로 찾는 자리</h1>
          <p className="max-w-[46ch] text-lead text-muted-foreground">
            검사를 마치면 흥미와 맞는 직군의 공고를 먼저 보여드립니다. 프로필을 공개하면
            기업이 먼저 연락합니다.
          </p>
        </div>

        {/* 검사를 마친 사람에게만 보이는 줄 */}
        {matched.length > 0 && (
          <div className="mt-8 rounded-card border border-border p-5 sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="eyebrow">내 흥미와 맞는 직군</p>
              <Link
                href="/results/preview"
                className="text-tiny text-muted-foreground hover:text-foreground"
              >
                결과 다시 보기
              </Link>
            </div>
            <ul className="mt-3 flex flex-wrap gap-2">
              {matched.map((m) => (
                <li
                  key={m.family.id}
                  className="rounded-pill bg-sunk px-3 py-1.5 text-small"
                >
                  {m.family.name}
                  <span className="ml-2 text-tiny text-muted-foreground">
                    {BAND_LABEL[m.band]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <div className="shell">
        <div className="rule" />
      </div>

      <section className="shell py-12 lg:py-16">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-h3">채용 공고</h2>
          <Link
            href="/jobs/search"
            className="text-small text-muted-foreground hover:text-foreground"
          >
            상세 검색
          </Link>
        </div>

        {/* 필터 */}
        <div className="mt-5 flex flex-col gap-3">
          {matched.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setOnlyMatched((v) => !v)}
                aria-pressed={onlyMatched}
                className={cn(
                  'rounded-pill border px-3.5 py-2 text-small font-medium transition-colors duration-fast',
                  onlyMatched
                    ? 'border-action bg-action text-action-foreground'
                    : 'border-border-strong text-foreground hover:bg-sunk'
                )}
              >
                내 흥미와 맞는 직군만
              </button>
            </div>
          )}

          <div className="scroll-x flex gap-1.5 pb-1">
            <button
              type="button"
              onClick={() => setIndustryId(null)}
              className={cn(
                'shrink-0 rounded-pill border px-3 py-1.5 text-tiny font-medium transition-colors duration-fast',
                industryId === null
                  ? 'border-action bg-action text-action-foreground'
                  : 'border-border text-muted-foreground hover:border-border-strong hover:text-foreground'
              )}
            >
              전체
            </button>
            {INDUSTRIES.map((ind) => (
              <button
                key={ind.id}
                type="button"
                onClick={() => setIndustryId(industryId === ind.id ? null : ind.id)}
                className={cn(
                  'shrink-0 rounded-pill border px-3 py-1.5 text-tiny font-medium transition-colors duration-fast',
                  industryId === ind.id
                    ? 'border-action bg-action text-action-foreground'
                    : 'border-border text-muted-foreground hover:border-border-strong hover:text-foreground'
                )}
              >
                {ind.name}
              </button>
            ))}
          </div>
        </div>

        {/* 목록 — 카드 격자가 아니라 줄로 놓는다.
            공고는 훑으면서 비교하는 것이라 세로로 늘어서는 편이 읽힌다 */}
        <div className="mt-6">
          {loading ? (
            <div className="flex flex-col gap-3">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <EmptyState
              title={
                jobs.length === 0 ? '등록된 공고가 없습니다' : '조건에 맞는 공고가 없습니다'
              }
              description={
                jobs.length === 0
                  ? '기업이 공고를 올리면 여기에 나타납니다.'
                  : '업종을 바꾸거나 필터를 해제해 보세요.'
              }
              action={
                jobs.length > 0
                  ? {
                      label: '필터 해제',
                      onClick: () => {
                        setIndustryId(null);
                        setOnlyMatched(false);
                      },
                    }
                  : { label: '무료 검사 시작하기', href: '/start' }
              }
            />
          ) : (
            <ul className="flex flex-col">
              {visible.map((job) => {
                const role = job.role_id ? ROLE_BY_ID.get(job.role_id) : null;
                const isMatch = role ? matchedFamilyIds.has(role.familyId) : false;
                return (
                  <li key={job.id} className="border-t border-border last:border-b">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="flex flex-col gap-2 py-5 transition-colors duration-fast hover:bg-sunk"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lead font-semibold">{job.title}</span>
                        {isMatch && (
                          <Badge tone="ok" size="sm">
                            흥미 일치
                          </Badge>
                        )}
                      </div>

                      <p className="text-small text-muted-foreground">
                        {job.companies?.name ?? '기업명 미상'}
                        {job.companies?.location ? ` · ${job.companies.location}` : ''}
                        {role ? ` · ${role.familyName}` : ''}
                      </p>

                      {job.description ? (
                        <p className="line-clamp-2 max-w-prose text-small text-muted-foreground">
                          {job.description}
                        </p>
                      ) : null}

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-tiny text-muted-foreground">
                        {job.conditions?.salary_range ? (
                          <span>{job.conditions.salary_range}</span>
                        ) : null}
                        {job.conditions?.remote ? (
                          <span>{REMOTE_LABEL[job.conditions.remote] ?? job.conditions.remote}</span>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* 기업 */}
      <section className="bg-sunk py-12 lg:py-16">
        <div className="shell">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-h3">기업</h2>
            <Link
              href="/jobs/companies"
              className="text-small text-muted-foreground hover:text-foreground"
            >
              전체 보기
            </Link>
          </div>

          {loading ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 w-full" />
              ))}
            </div>
          ) : companies.length === 0 ? (
            <p className="mt-6 text-small text-muted-foreground">등록된 기업이 없습니다.</p>
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {companies.slice(0, 8).map((company) => (
                <Link
                  key={company.id}
                  href={`/jobs/companies/${company.id}`}
                  className="flex flex-col gap-1.5 rounded-card border border-border bg-card p-5 transition-colors duration-fast hover:border-border-strong"
                >
                  <span className="text-body font-semibold">{company.name}</span>
                  <span className="text-tiny text-muted-foreground">
                    {[company.industry, company.size_range ? `${company.size_range}명` : null]
                      .filter(Boolean)
                      .join(' · ') || '정보 없음'}
                  </span>
                  {company.culture_tags && company.culture_tags.length > 0 ? (
                    <span className="mt-1 line-clamp-1 text-tiny text-muted-foreground">
                      {company.culture_tags.slice(0, 3).join(' · ')}
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 검사를 아직 안 한 사람에게만 */}
      {matched.length === 0 && (
        <section className="shell py-12 lg:py-16">
          <div className="flex flex-col items-start gap-4 rounded-card bg-action px-8 py-12 text-action-foreground sm:px-12">
            <h2 className="max-w-[20ch] text-h2">
              어떤 자리가 맞는지 먼저 확인해 보세요
            </h2>
            <p className="max-w-[42ch] text-body text-action-foreground/70">
              53문항, 약 12분. 검사를 마치면 흥미와 맞는 직군의 공고를 먼저 보여드립니다.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-2 bg-action-foreground text-action hover:opacity-90"
            >
              <Link href="/start">무료로 검사 시작하기</Link>
            </Button>
          </div>
        </section>
      )}
    </>
  );
}

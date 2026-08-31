'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Field, Textarea } from '@/components/ui/field';
import { EmptyState, Skeleton } from '@/components/ui/states';
import { PageHeader } from '@/components/layouts/page-header';
import { useToast } from '@/components/ui/use-toast';
import { useCompanyAuthStore } from '@/lib/company-auth';
import { marketplaceApi } from '@/lib/marketplace-api';
import { CultureSurvey, CultureProfileView } from '@/components/culture/culture-survey';
import type { CultureProfile } from '@/data/culture/cvf';

interface Team {
  id: string;
  team_name: string;
  team_size?: number | null;
  description?: string | null;
  culture_profile?: CultureProfile | null;
  culture_responses?: Record<string, Partial<CultureProfile>> | null;
}

/**
 * 팀 프로필.
 *
 * 컬처핏 계산에 쓰이는 기준 데이터다. 그래서 "왜 등록해야 하는지"를
 * 화면에서 설명한다. 목적을 모르면 아무도 채우지 않는다.
 *
 * confirm() 대신 인라인 확인 단계를 뒀다. confirm은 모바일에서 도메인이
 * 노출되고, 실수로 확인을 눌러도 되돌릴 수 없다.
 */
export default function CompanyTeamPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useCompanyAuthStore();
  const { toast } = useToast();

  const [teams, setTeams] = useState<Team[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ team_name: '', team_size: '', description: '' });
  // 문화 설문을 펼친 팀. 한 번에 하나만 연다 — 여러 개를 동시에 열면
  // 어느 팀에 답하고 있는지 헷갈린다
  const [cultureFor, setCultureFor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const loadTeams = async (t: string) => {
    const res = await marketplaceApi.companies.listTeams(t);
    setTeams(Array.isArray(res.data) ? (res.data as Team[]) : []);
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/company/login');
      return;
    }
    loadTeams(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token, router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSaving(true);
    const res = await marketplaceApi.companies.createTeam(
      {
        team_name: form.team_name,
        team_size: form.team_size ? parseInt(form.team_size, 10) : null,
        description: form.description || null,
      },
      token,
    );
    setSaving(false);

    if (res.error) {
      toast({ title: '팀을 만들지 못했습니다', description: res.error, variant: 'destructive' });
      return;
    }

    setForm({ team_name: '', team_size: '', description: '' });
    setShowForm(false);
    toast({ title: `‘${form.team_name}’ 팀을 추가했습니다` });
    loadTeams(token);
  };

  const handleDelete = async (teamId: string) => {
    if (!token) return;
    const res = await marketplaceApi.companies.deleteTeam(teamId, token);
    setConfirmDelete(null);

    if (res.error) {
      toast({ title: '삭제하지 못했습니다', description: res.error, variant: 'destructive' });
      return;
    }
    toast({ title: '팀을 삭제했습니다' });
    loadTeams(token);
  };

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="팀 프로필"
        description="등록한 팀의 구성과 성향은 후보자 컬처핏 계산의 기준이 됩니다. 팀이 없으면 컬처핏은 기본값 50으로 처리됩니다."
        actions={
          <Button onClick={() => setShowForm((v) => !v)} variant={showForm ? 'ghost' : 'primary'}>
            {showForm ? '취소' : '팀 추가'}
          </Button>
        }
      />

      {showForm ? (
        <form
          onSubmit={handleCreate}
          className="anim-rise mb-6 flex flex-col gap-4 rounded-card border border-border bg-card px-pad-i py-pad-b"
        >
          <Field label="팀 이름" htmlFor="team_name" required>
            <Input
              id="team_name"
              value={form.team_name}
              onChange={(e) => setForm((f) => ({ ...f, team_name: e.target.value }))}
              placeholder="예: 프로덕트 디자인팀"
              required
            />
          </Field>

          <Field label="팀 인원" htmlFor="team_size" hint="숫자만 입력해 주세요">
            <Input
              id="team_size"
              type="number"
              min={1}
              value={form.team_size}
              onChange={(e) => setForm((f) => ({ ...f, team_size: e.target.value }))}
              placeholder="6"
            />
          </Field>

          <Field
            label="팀 소개"
            htmlFor="description"
            hint="일하는 방식이나 분위기를 적으면 컬처핏 매칭 정확도가 올라갑니다"
            aside={`${form.description.length}/300`}
          >
            <Textarea
              id="description"
              rows={3}
              maxLength={300}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="예: 자율적으로 일하고 문서로 소통합니다. 회의는 주 1회."
            />
          </Field>

          <div className="flex gap-2">
            <Button type="submit" loading={saving}>
              팀 추가
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              취소
            </Button>
          </div>
        </form>
      ) : null}

      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <EmptyState
          title="등록된 팀이 없습니다"
          description="팀을 하나 이상 등록하면 후보자와 팀의 궁합을 계산할 수 있습니다."
          action={{ label: '첫 팀 추가하기', onClick: () => setShowForm(true) }}
          icon={
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <circle cx="9" cy="8" r="3" />
              <path d="M3 20a6 6 0 0 1 12 0M16 5.5a3 3 0 0 1 0 6M21 20a5.5 5.5 0 0 0-3.5-5.1" />
            </svg>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {teams.map((team) => (
            <article
              key={team.id}
              className="flex flex-col gap-3 rounded-card border border-border bg-card px-pad-i py-pad-b"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-body font-semibold">{team.team_name}</h3>
                    {team.team_size ? (
                      <Badge tone="outline" size="sm">
                        {team.team_size}명
                      </Badge>
                    ) : null}
                  </div>
                  {team.description ? (
                    <p className="max-w-prose text-small text-muted-foreground">
                      {team.description}
                    </p>
                  ) : (
                    <p className="text-small text-muted-foreground/70">
                      소개가 없습니다 — 적으면 컬처핏 정확도가 올라갑니다
                    </p>
                  )}
                </div>

                {confirmDelete === team.id ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-tiny text-muted-foreground">삭제할까요?</span>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(team.id)}>
                      삭제
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(null)}>
                      취소
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0"
                    onClick={() => setConfirmDelete(team.id)}
                  >
                    삭제
                  </Button>
                )}
              </div>

              {/* 조직문화 — 후보자와 같은 문항으로 재야 비교가 가능하다 */}
              <div className="border-t border-border pt-3">
                {cultureFor === team.id ? (
                  <CultureSurvey
                    audience="company"
                    initial={team.culture_responses ?? undefined}
                    onCancel={() => setCultureFor(null)}
                    onComplete={async ({ profile, responses }) => {
                      if (!token) return;
                      await marketplaceApi.companies.updateTeam(
                        team.id,
                        { culture_profile: profile, culture_responses: responses },
                        token,
                      );
                      setTeams((prev) =>
                        prev.map((t) =>
                          t.id === team.id
                            ? { ...t, culture_profile: profile, culture_responses: responses }
                            : t,
                        ),
                      );
                      setCultureFor(null);
                      toast({ title: `‘${team.team_name}’ 팀 문화를 저장했습니다` });
                    }}
                  />
                ) : team.culture_profile ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="eyebrow">팀 문화</p>
                      <Button size="sm" variant="ghost" onClick={() => setCultureFor(team.id)}>
                        다시 답하기
                      </Button>
                    </div>
                    <CultureProfileView profile={team.culture_profile} />
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="max-w-prose text-small text-muted-foreground">
                      6문항에 답하면 후보자와 같은 척도로 컬처핏을 계산합니다.
                      답하지 않으면 컬처핏은 계산에서 제외됩니다.
                    </p>
                    <Button size="sm" variant="outline" onClick={() => setCultureFor(team.id)}>
                      문화 문항 답하기
                    </Button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

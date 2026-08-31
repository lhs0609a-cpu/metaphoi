'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Field, Select, Textarea } from '@/components/ui/field';
import { ErrorState } from '@/components/ui/states';
import { PageHeader } from '@/components/layouts/page-header';
import { useToast } from '@/components/ui/use-toast';
import { useCompanyAuthStore } from '@/lib/company-auth';
import { marketplaceApi } from '@/lib/marketplace-api';
import { cn } from '@/lib/utils';
import { ABILITY_CATALOG } from '@/lib/abilities-scoring';
import { RolePicker } from '@/components/company/role-picker';
import type { ResolvedRole } from '@/lib/role-matching';

// 능력치 목록은 lib/abilities-scoring.ts 가 유일한 출처다.
// 예전에 이 화면이 자체 목록을 들고 있었고 키 5개가 실제와 달라서
// 능력 적합도(적합도의 60%)가 조용히 무력화돼 있었다.
const ABILITY_OPTIONS = ABILITY_CATALOG;

const CULTURE_TAGS = [
  '자율출퇴근', '수평문화', '성과중심', '데이터중심', '팀워크중심',
  '혁신적', '안정적', '성장지향', '워라밸', '빠른실행',
];

/** 요구 능력치는 3~5개가 적정. 너무 많으면 아무도 통과하지 못한다 */
const MAX_RECOMMENDED_ABILITIES = 5;

interface Team {
  id: string;
  team_name: string;
}

export default function NewJobPostingPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useCompanyAuthStore();
  const { toast } = useToast();

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // 직무를 골랐을 때 채워진 초안. 제출 시 담당자가 고쳤는지 비교한다 —
  // 근거의 질(초안 그대로 vs 사람이 검토함)을 기록해 두지 않으면
  // 나중에 매칭 품질을 따질 때 구분할 방법이 없다.
  const [abilityDraft, setAbilityDraft] = useState<string>('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    team_profile_id: '',
    role_id: '',
    required_abilities: {} as Record<string, { min: number }>,
    preferred_culture: [] as string[],
    conditions: {
      salary_range: '',
      location: '',
      remote: '',
      experience_min: '',
      experience_max: '',
    },
  });

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/company/login');
      return;
    }
    marketplaceApi.companies.listTeams(token).then((res) => {
      setTeams(Array.isArray(res.data) ? (res.data as Team[]) : []);
    });
  }, [isAuthenticated, token, router]);

  const toggleAbility = (key: string) => {
    setForm((f) => {
      const updated = { ...f.required_abilities };
      if (key in updated) delete updated[key];
      else updated[key] = { min: 60 };
      return { ...f, required_abilities: updated };
    });
  };

  const updateAbilityMin = (key: string, value: number) =>
    setForm((f) => ({
      ...f,
      required_abilities: { ...f.required_abilities, [key]: { min: value } },
    }));

  const toggleCulture = (tag: string) =>
    setForm((f) => ({
      ...f,
      preferred_culture: f.preferred_culture.includes(tag)
        ? f.preferred_culture.filter((t) => t !== tag)
        : [...f.preferred_culture, tag],
    }));

  const updateCondition = (key: string, value: string) =>
    setForm((f) => ({ ...f, conditions: { ...f.conditions, [key]: value } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError('');
    setLoading(true);

    const abilityCount = Object.keys(form.required_abilities).length;

    const result = await marketplaceApi.jobs.create(
      {
        title: form.title,
        description: form.description,
        team_profile_id: form.team_profile_id || null,
        role_id: form.role_id || null,
        required_abilities: abilityCount > 0 ? form.required_abilities : null,
        required_abilities_source:
          abilityDraft && JSON.stringify(form.required_abilities) === abilityDraft
            ? 'provisional'
            : 'manual',
        preferred_culture: form.preferred_culture.length > 0 ? form.preferred_culture : null,
        conditions: {
          salary_range: form.conditions.salary_range || null,
          location: form.conditions.location || null,
          remote: form.conditions.remote || null,
          experience_min: form.conditions.experience_min
            ? parseInt(form.conditions.experience_min, 10)
            : null,
          experience_max: form.conditions.experience_max
            ? parseInt(form.conditions.experience_max, 10)
            : null,
        },
      },
      token,
    );
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    toast({ title: '공고를 등록했습니다', description: '적합한 후보를 찾는 중입니다.' });
    router.push('/company/jobs');
  };

  const selectedAbilities = Object.keys(form.required_abilities);
  const tooMany = selectedAbilities.length > MAX_RECOMMENDED_ABILITIES;

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="새 채용 공고"
        description="요구 능력치를 설정하면 적합도 순으로 후보가 정렬됩니다."
        actions={
          <Button asChild variant="ghost">
            <Link href="/company/jobs">취소</Link>
          </Button>
        }
      />

      {error ? <ErrorState title="공고를 등록하지 못했습니다" detail={error} className="mb-5" /> : null}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* 기본 정보 */}
        <section className="flex flex-col gap-4 rounded-card border border-border bg-card px-pad-i py-pad-b">
          <h2 className="text-h4">기본 정보</h2>

          <Field label="공고 제목" htmlFor="title" required>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="프로덕트 디자이너 (3년 이상)"
              required
            />
          </Field>

          <Field
            label="상세 설명"
            htmlFor="description"
            hint="담당 업무와 함께 일하는 방식을 적으면 지원 전환율이 올라갑니다"
            aside={`${form.description.length}자`}
          >
            <Textarea
              id="description"
              rows={6}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="담당 업무, 자격 요건, 우대 사항…"
            />
          </Field>

          <Field
            label="소속 팀"
            htmlFor="team_profile_id"
            hint={
              teams.length === 0
                ? '등록된 팀이 없습니다. 팀을 등록하면 컬처핏 계산이 정확해집니다.'
                : '선택하면 해당 팀의 성향과 후보자 궁합을 계산합니다'
            }
          >
            <Select
              id="team_profile_id"
              value={form.team_profile_id}
              onChange={(e) => setForm((f) => ({ ...f, team_profile_id: e.target.value }))}
            >
              <option value="">선택 안 함</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.team_name}</option>
              ))}
            </Select>
          </Field>
        </section>

        {/* 직무 — 요구 능력치보다 먼저 묻는다.
            무엇을 뽑는지 정하지 않은 채로 능력치부터 고르면
            담당자가 그 자리에서 직무 정의를 새로 하게 된다 */}
        <section className="flex flex-col gap-4 rounded-card border border-border bg-card px-pad-i py-pad-b">
          <div className="flex flex-col gap-1">
            <h2 className="text-h4">어떤 직무인가요</h2>
            <p className="text-small text-muted-foreground">
              직무를 고르면 그 직무에서 중요한 능력치가 초안으로 채워집니다. 그대로 쓰지 마시고
              우리 팀 상황에 맞게 고쳐 주세요.
            </p>
          </div>

          <RolePicker
            value={form.role_id}
            onSelect={(role: ResolvedRole, draft) => {
              setAbilityDraft(JSON.stringify(draft));
              setForm((f) => ({
                ...f,
                role_id: role.id,
                // 이미 고른 것이 있으면 덮어쓰지 않는다 — 담당자가 한 일을 지우면 안 된다
                required_abilities:
                  Object.keys(f.required_abilities).length > 0 ? f.required_abilities : draft,
                title: f.title || role.name,
              }));
            }}
            onClear={() => setForm((f) => ({ ...f, role_id: '' }))}
          />
        </section>

        {/* 요구 능력치 */}
        <section className="flex flex-col gap-4 rounded-card border border-border bg-card px-pad-i py-pad-b">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-h4">요구 능력치</h2>
            <Badge tone={tooMany ? 'warn' : 'outline'} size="sm">
              {selectedAbilities.length}개 선택
            </Badge>
          </div>

          <p className="text-small text-muted-foreground">
            선택한 항목의 최소 기준을 정하면, 기준에 못 미치는 만큼만 감점됩니다.
            기준보다 높다고 가점되지는 않습니다.
          </p>

          {tooMany ? (
            <p className="rounded-control border border-warn/30 bg-warn-soft px-3.5 py-2.5 text-tiny text-warn">
              {MAX_RECOMMENDED_ABILITIES}개를 넘기면 조건을 모두 만족하는 후보가 거의 없어집니다.
              핵심 항목만 남기는 편이 매칭에 유리합니다.
            </p>
          ) : null}

          <div className="flex flex-wrap gap-1.5">
            {ABILITY_OPTIONS.map((a) => {
              const on = a.key in form.required_abilities;
              return (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => toggleAbility(a.key)}
                  aria-pressed={on}
                  className={cn(
                    'rounded-pill border px-3 py-1.5 text-tiny font-medium transition-colors duration-fast',
                    on
                      ? 'border-action bg-action text-action-foreground'
                      : 'border-border text-muted-foreground hover:border-border-strong hover:text-foreground',
                  )}
                >
                  {a.name}
                </button>
              );
            })}
          </div>

          {selectedAbilities.length > 0 ? (
            <div className="flex flex-col gap-3 border-t border-border pt-4">
              {selectedAbilities.map((key) => {
                const name = ABILITY_OPTIONS.find((a) => a.key === key)?.name ?? key;
                const min = form.required_abilities[key].min;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="w-20 shrink-0 text-small">{name}</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={min}
                      onChange={(e) => updateAbilityMin(key, Number(e.target.value))}
                      aria-label={`${name} 최소 기준`}
                      className="h-1.5 flex-1 cursor-pointer appearance-none rounded-pill bg-secondary accent-[hsl(var(--primary))]"
                    />
                    <span className="stat-num w-10 shrink-0 text-right text-small">{min}</span>
                    <button
                      type="button"
                      onClick={() => toggleAbility(key)}
                      aria-label={`${name} 제거`}
                      className="shrink-0 text-muted-foreground transition-colors duration-fast hover:text-danger"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
                        <path d="m4 4 8 8M12 4l-8 8" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : null}
        </section>

        {/* 컬처핏 */}
        <section className="flex flex-col gap-4 rounded-card border border-border bg-card px-pad-i py-pad-b">
          <h2 className="text-h4">선호하는 일하는 방식</h2>
          <p className="text-small text-muted-foreground">
            컬처핏 점수(전체의 25%)에 반영됩니다.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {CULTURE_TAGS.map((tag) => {
              const on = form.preferred_culture.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleCulture(tag)}
                  aria-pressed={on}
                  className={cn(
                    'rounded-pill border px-3 py-1.5 text-tiny font-medium transition-colors duration-fast',
                    on
                      ? 'border-action bg-action text-action-foreground'
                      : 'border-border text-muted-foreground hover:border-border-strong hover:text-foreground',
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </section>

        {/* 조건 */}
        <section className="flex flex-col gap-4 rounded-card border border-border bg-card px-pad-i py-pad-b">
          <h2 className="text-h4">근무 조건</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="연봉 범위" htmlFor="salary_range">
              <Input
                id="salary_range"
                value={form.conditions.salary_range}
                onChange={(e) => updateCondition('salary_range', e.target.value)}
                placeholder="5,000 ~ 7,000만원"
              />
            </Field>

            <Field label="근무지" htmlFor="location">
              <Input
                id="location"
                value={form.conditions.location}
                onChange={(e) => updateCondition('location', e.target.value)}
                placeholder="서울 강남구"
              />
            </Field>

            <Field label="원격 근무" htmlFor="remote">
              <Select
                id="remote"
                value={form.conditions.remote}
                onChange={(e) => updateCondition('remote', e.target.value)}
              >
                <option value="">선택 안 함</option>
                <option value="onsite">출근</option>
                <option value="hybrid">하이브리드</option>
                <option value="remote">전면 원격</option>
              </Select>
            </Field>

            <Field label="경력" htmlFor="experience_min" hint="연 단위">
              <div className="flex items-center gap-2">
                <Input
                  id="experience_min"
                  type="number"
                  min={0}
                  value={form.conditions.experience_min}
                  onChange={(e) => updateCondition('experience_min', e.target.value)}
                  placeholder="3"
                  aria-label="최소 경력"
                />
                <span className="text-small text-muted-foreground">~</span>
                <Input
                  type="number"
                  min={0}
                  value={form.conditions.experience_max}
                  onChange={(e) => updateCondition('experience_max', e.target.value)}
                  placeholder="7"
                  aria-label="최대 경력"
                />
              </div>
            </Field>
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" size="lg" loading={loading}>
            공고 등록
          </Button>
          <Button asChild type="button" variant="ghost" size="lg">
            <Link href="/company/jobs">취소</Link>
          </Button>
        </div>

        <p className="text-tiny leading-relaxed text-muted-foreground">
          공고에 설정한 요구 능력치는 후보 정렬에만 쓰이는 참고 지표입니다.
          자동 산출된 적합도만으로 불합격을 결정하면 지원자가 설명과 재검토를 요구할 수 있습니다.
        </p>
      </form>
    </div>
  );
}

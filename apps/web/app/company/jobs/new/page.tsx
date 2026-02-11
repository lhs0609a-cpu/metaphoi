'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCompanyAuthStore } from '@/lib/company-auth';
import { marketplaceApi } from '@/lib/marketplace-api';

const ABILITY_OPTIONS = [
  { key: 'decisiveness', name: '결단력' }, { key: 'composure', name: '침착성' },
  { key: 'focus', name: '집중력' }, { key: 'creativity', name: '창의성' },
  { key: 'analytical', name: '분석력' }, { key: 'adaptability', name: '적응력' },
  { key: 'communication', name: '소통능력' }, { key: 'teamwork', name: '협동심' },
  { key: 'leadership', name: '리더십' }, { key: 'empathy', name: '공감능력' },
  { key: 'influence', name: '영향력' }, { key: 'networking', name: '네트워킹' },
  { key: 'execution', name: '실행력' }, { key: 'planning', name: '기획력' },
  { key: 'problem_solving', name: '문제해결' }, { key: 'time_management', name: '시간관리' },
];

const CULTURE_TAGS = [
  '자율출퇴근', '수평문화', '성과중심', '데이터중심', '팀워크중심',
  '혁신적', '안정적', '성장지향', '워라밸', '빠른실행',
];

export default function NewJobPostingPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useCompanyAuthStore();
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    team_profile_id: '',
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
      setTeams(Array.isArray(res.data) ? res.data : []);
    });
  }, [isAuthenticated, token, router]);

  const toggleAbility = (key: string) => {
    setForm((f) => {
      const updated = { ...f.required_abilities };
      if (key in updated) {
        delete updated[key];
      } else {
        updated[key] = { min: 60 };
      }
      return { ...f, required_abilities: updated };
    });
  };

  const updateAbilityMin = (key: string, value: number) => {
    setForm((f) => ({
      ...f,
      required_abilities: { ...f.required_abilities, [key]: { min: value } },
    }));
  };

  const toggleCulture = (tag: string) => {
    setForm((f) => ({
      ...f,
      preferred_culture: f.preferred_culture.includes(tag)
        ? f.preferred_culture.filter((t) => t !== tag)
        : [...f.preferred_culture, tag],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    const data = {
      title: form.title,
      description: form.description,
      team_profile_id: form.team_profile_id || null,
      required_abilities: Object.keys(form.required_abilities).length > 0 ? form.required_abilities : null,
      preferred_culture: form.preferred_culture.length > 0 ? form.preferred_culture : null,
      conditions: {
        salary_range: form.conditions.salary_range || null,
        location: form.conditions.location || null,
        remote: form.conditions.remote || null,
        experience_min: form.conditions.experience_min ? parseInt(form.conditions.experience_min) : null,
        experience_max: form.conditions.experience_max ? parseInt(form.conditions.experience_max) : null,
      },
    };

    const result = await marketplaceApi.jobs.create(data, token);
    setLoading(false);

    if (result.error) {
      alert(result.error);
    } else {
      router.push('/company/jobs');
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/company/dashboard" className="text-xl font-bold text-primary">Metaphoi</Link>
          <Link href="/company/jobs">
            <Button variant="outline" size="sm">공고 목록</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">새 채용 공고 등록</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">공고 제목 *</label>
                <input
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  placeholder="예: 시니어 백엔드 개발자"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">상세 설명</label>
                <textarea
                  className="w-full border rounded-md px-3 py-2 text-sm min-h-[120px]"
                  placeholder="직무 설명, 자격 요건, 우대 사항 등"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              {teams.length > 0 && (
                <div>
                  <label className="text-sm font-medium block mb-1">배치 팀</label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={form.team_profile_id}
                    onChange={(e) => setForm((f) => ({ ...f, team_profile_id: e.target.value }))}
                  >
                    <option value="">선택 안함</option>
                    {teams.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.team_name}</option>
                    ))}
                  </select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">원하는 능력치</CardTitle>
              <p className="text-sm text-muted-foreground">후보자에게 원하는 최소 능력치를 설정하세요</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {ABILITY_OPTIONS.map((ab) => {
                  const selected = ab.key in form.required_abilities;
                  return (
                    <div key={ab.key} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleAbility(ab.key)}
                        className={`px-2 py-1 text-xs rounded-md border ${
                          selected ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
                        }`}
                      >
                        {ab.name}
                      </button>
                      {selected && (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="w-16 border rounded px-2 py-1 text-xs"
                          value={form.required_abilities[ab.key].min}
                          onChange={(e) => updateAbilityMin(ab.key, parseInt(e.target.value) || 0)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">문화 핏</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {CULTURE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleCulture(tag)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      form.preferred_culture.includes(tag)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-muted'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">조건</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">연봉대</label>
                  <input
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="4000-6000만원"
                    value={form.conditions.salary_range}
                    onChange={(e) => setForm((f) => ({ ...f, conditions: { ...f.conditions, salary_range: e.target.value } }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">근무지</label>
                  <input
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="서울 강남"
                    value={form.conditions.location}
                    onChange={(e) => setForm((f) => ({ ...f, conditions: { ...f.conditions, location: e.target.value } }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">근무 형태</label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={form.conditions.remote}
                    onChange={(e) => setForm((f) => ({ ...f, conditions: { ...f.conditions, remote: e.target.value } }))}
                  >
                    <option value="">선택</option>
                    <option value="remote">재택</option>
                    <option value="hybrid">하이브리드</option>
                    <option value="onsite">출근</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">최소 경력</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={form.conditions.experience_min}
                    onChange={(e) => setForm((f) => ({ ...f, conditions: { ...f.conditions, experience_min: e.target.value } }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">최대 경력</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={form.conditions.experience_max}
                    onChange={(e) => setForm((f) => ({ ...f, conditions: { ...f.conditions, experience_max: e.target.value } }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '등록 중...' : '공고 등록하기'}
          </Button>
        </form>
      </div>
    </main>
  );
}

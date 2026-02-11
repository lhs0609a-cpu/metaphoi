'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/auth';
import { getComprehensiveSession } from '@/lib/test-session';
import { marketplaceApi } from '@/lib/marketplace-api';

const ROLES = ['개발자', 'PM', '디자이너', '마케터', '기획자', '데이터분석가', '영업', 'HR', '재무/회계', '기타'];
const INDUSTRIES = ['IT/소프트웨어', '금융', '제조', '유통', '의료', '교육', '미디어', '컨설팅', '스타트업', '기타'];
const REMOTE_OPTIONS = [
  { value: 'remote', label: '재택근무' },
  { value: 'hybrid', label: '하이브리드' },
  { value: 'onsite', label: '출근' },
];

export default function SeekerRegisterPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuthStore();

  const [form, setForm] = useState({
    display_name: '',
    headline: '',
    desired_roles: [] as string[],
    desired_industries: [] as string[],
    experience_years: '',
    education: '',
    salary_range: '',
    location_pref: '',
    remote_pref: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    // 이미 프로필이 있는지 확인
    if (token) {
      marketplaceApi.seekers.getMyProfile(token).then((res) => {
        if (res.data) {
          setHasProfile(true);
          router.push('/seeker/profile');
        }
      });
    }
  }, [isAuthenticated, token, router]);

  const toggleRole = (role: string) => {
    setForm((f) => ({
      ...f,
      desired_roles: f.desired_roles.includes(role)
        ? f.desired_roles.filter((r) => r !== role)
        : [...f.desired_roles, role],
    }));
  };

  const toggleIndustry = (ind: string) => {
    setForm((f) => ({
      ...f,
      desired_industries: f.desired_industries.includes(ind)
        ? f.desired_industries.filter((i) => i !== ind)
        : [...f.desired_industries, ind],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError('');
    setLoading(true);

    // 종합 검사 결과 가져오기
    const session = getComprehensiveSession();
    const profileData = {
      ...form,
      experience_years: form.experience_years ? parseInt(form.experience_years) : null,
      comprehensive_profile: session?.profile || null,
      abilities_snapshot: session?.profile?.abilities || null,
    };

    const result = await marketplaceApi.seekers.createProfile(profileData, token);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      router.push('/seeker/profile');
    }
  };

  if (hasProfile) return null;

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">Metaphoi</Link>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">대시보드</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-lg">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">구직자 프로필 등록</CardTitle>
            <CardDescription>
              검사 결과와 함께 프로필을 등록하면 기업이 당신을 찾을 수 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium block mb-1">표시 이름 (닉네임)</label>
                <input
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  placeholder="매칭 전 기업에게 보여지는 이름"
                  value={form.display_name}
                  onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">한줄 자기소개</label>
                <input
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  placeholder="예: 3년차 풀스택 개발자, 성장하는 팀을 찾고 있습니다"
                  value={form.headline}
                  onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">희망 직무 (복수 선택)</label>
                <div className="flex flex-wrap gap-2">
                  {ROLES.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        form.desired_roles.includes(role)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background hover:bg-muted'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">관심 산업 (복수 선택)</label>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRIES.map((ind) => (
                    <button
                      key={ind}
                      type="button"
                      onClick={() => toggleIndustry(ind)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        form.desired_industries.includes(ind)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background hover:bg-muted'
                      }`}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">경력 (년)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={form.experience_years}
                    onChange={(e) => setForm((f) => ({ ...f, experience_years: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">학력</label>
                  <input
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="대학교 전공"
                    value={form.education}
                    onChange={(e) => setForm((f) => ({ ...f, education: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">희망 연봉대</label>
                  <input
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="3000-4000만원"
                    value={form.salary_range}
                    onChange={(e) => setForm((f) => ({ ...f, salary_range: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">선호 지역</label>
                  <input
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="서울"
                    value={form.location_pref}
                    onChange={(e) => setForm((f) => ({ ...f, location_pref: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">근무 형태</label>
                <div className="flex gap-3">
                  {REMOTE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, remote_pref: opt.value }))}
                      className={`flex-1 py-2 text-sm rounded-md border transition-colors ${
                        form.remote_pref === opt.value
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background hover:bg-muted'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '등록 중...' : '프로필 등록하기'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

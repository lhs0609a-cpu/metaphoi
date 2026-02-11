'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCompanyAuthStore } from '@/lib/company-auth';

const SIZE_RANGES = ['1-10', '11-50', '51-200', '201-1000', '1000+'];
const INDUSTRIES = [
  'IT/소프트웨어', '금융', '제조', '유통/물류', '의료/바이오',
  '교육', '미디어/콘텐츠', '컨설팅', '스타트업', '기타',
];

export default function CompanyRegisterPage() {
  const router = useRouter();
  const register = useCompanyAuthStore((s) => s.register);

  const [form, setForm] = useState({
    company_name: '',
    email: '',
    password: '',
    password_confirm: '',
    member_name: '',
    industry: '',
    size_range: '',
    website: '',
    location: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.password_confirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (form.password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    const { password_confirm, ...data } = form;
    const result = await register(data);
    setLoading(false);

    if (result.success) {
      router.push('/company/dashboard');
    } else {
      setError(result.error || '가입에 실패했습니다.');
    }
  };

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">Metaphoi</Link>
          <Link href="/company/login">
            <Button variant="outline" size="sm">기업 로그인</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-lg">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">기업 회원가입</CardTitle>
            <CardDescription>채용 마켓플레이스에 기업을 등록하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">회사명 *</label>
                <input
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={form.company_name}
                  onChange={(e) => update('company_name', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">담당자 이름 *</label>
                <input
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={form.member_name}
                  onChange={(e) => update('member_name', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">이메일 *</label>
                <input
                  type="email"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">비밀번호 *</label>
                  <input
                    type="password"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">비밀번호 확인 *</label>
                  <input
                    type="password"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={form.password_confirm}
                    onChange={(e) => update('password_confirm', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">산업</label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={form.industry}
                    onChange={(e) => update('industry', e.target.value)}
                  >
                    <option value="">선택</option>
                    {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">회사 규모</label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={form.size_range}
                    onChange={(e) => update('size_range', e.target.value)}
                  >
                    <option value="">선택</option>
                    {SIZE_RANGES.map((s) => <option key={s} value={s}>{s}명</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">웹사이트</label>
                <input
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  placeholder="https://"
                  value={form.website}
                  onChange={(e) => update('website', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">위치</label>
                <input
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  placeholder="서울 강남구"
                  value={form.location}
                  onChange={(e) => update('location', e.target.value)}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '가입 중...' : '기업 회원가입'}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              이미 계정이 있으신가요?{' '}
              <Link href="/company/login" className="text-primary hover:underline">로그인</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

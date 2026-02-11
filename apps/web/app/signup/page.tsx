'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/auth';

export default function SignupPage() {
  const router = useRouter();
  const signup = useAuthStore((s) => s.signup);

  const [form, setForm] = useState({
    email: '',
    password: '',
    password_confirm: '',
    name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

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
    const result = await signup({
      email: form.email,
      password: form.password,
      name: form.name || undefined,
    });
    setLoading(false);

    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || '회원가입에 실패했습니다.');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">Metaphoi</Link>
          <Link href="/login">
            <Button variant="outline" size="sm">로그인</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">회원가입</CardTitle>
            <CardDescription>검사 결과를 안전하게 저장하고 채용 서비스를 이용하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">이름 (선택)</label>
                <input
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="홍길동"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">이메일 *</label>
                <input
                  type="email"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="email@example.com"
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
                    placeholder="8자 이상"
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

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '가입 중...' : '회원가입'}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="text-primary hover:underline">로그인</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

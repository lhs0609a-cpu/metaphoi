'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      // 검사 결과가 localStorage에 있으면 동기화 후 대시보드로
      const hasResults = typeof window !== 'undefined' && localStorage.getItem('metaphoi_comprehensive');
      router.push(hasResults ? '/dashboard' : '/');
    } else {
      setError(result.error || '로그인에 실패했습니다.');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">Metaphoi</Link>
          <div className="flex gap-2">
            <Link href="/company/login">
              <Button variant="ghost" size="sm">기업 로그인</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">로그인</CardTitle>
            <CardDescription>검사 결과를 저장하고 관리하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">이메일</label>
                <input
                  type="email"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">비밀번호</label>
                <input
                  type="password"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '로그인 중...' : '로그인'}
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              <p className="text-center text-sm text-muted-foreground">
                계정이 없으신가요?{' '}
                <Link href="/signup" className="text-primary hover:underline">회원가입</Link>
              </p>
              <p className="text-center text-sm text-muted-foreground">
                기업이신가요?{' '}
                <Link href="/company/login" className="text-primary hover:underline">기업 로그인</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

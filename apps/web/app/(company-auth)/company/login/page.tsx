'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';
import { ErrorState } from '@/components/ui/states';
import { useCompanyAuthStore } from '@/lib/company-auth';

export default function CompanyLoginPage() {
  const router = useRouter();
  const login = useCompanyAuthStore((s) => s.login);

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
      router.push('/company/dashboard');
    } else {
      setError(result.error || '이메일 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-7">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-h2">기업 로그인</h1>
        <p className="text-small text-muted-foreground">채용 대시보드로 이동합니다</p>
      </header>

      {error ? <ErrorState title="로그인하지 못했습니다" detail={error} /> : null}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="이메일" htmlFor="company-email" required>
          <Input
            id="company-email"
            type="email"
            autoComplete="email"
            placeholder="hr@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>

        <Field label="비밀번호" htmlFor="company-password" required>
          <Input
            id="company-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>

        <Button type="submit" size="lg" block loading={loading} className="mt-2">
          로그인
        </Button>
      </form>

      <p className="text-center text-small text-muted-foreground">
        계정이 없으신가요?{' '}
        <Link
          href="/company/register"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          기업 가입
        </Link>
      </p>
    </div>
  );
}

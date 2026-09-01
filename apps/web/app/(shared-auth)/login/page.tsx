'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';
import { ErrorState, PageLoading } from '@/components/ui/states';
import { useAuth } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    const result = await login(data.email, data.password);

    if (result.success) {
      router.push(redirectTo);
    } else {
      setError(result.error || '로그인에 실패했습니다');
    }
  };

  return (
    <div className="flex w-full flex-col gap-7">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-h2">로그인</h1>
        <p className="text-small text-muted-foreground">
          검사 결과를 저장하고 채용 제안을 받아보세요
        </p>
      </header>

      {error ? <ErrorState title="로그인하지 못했습니다" detail={error} /> : null}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field label="이메일" htmlFor="email" error={errors.email?.message} required>
          <Input
            id="email"
            type="email"
            placeholder="email@example.com"
            autoComplete="email"
            invalid={!!errors.email}
            {...register('email')}
          />
        </Field>

        <Field label="비밀번호" htmlFor="password" error={errors.password?.message} required>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            invalid={!!errors.password}
            {...register('password')}
          />
        </Field>

        <Button type="submit" size="lg" block loading={isLoading} className="mt-2">
          로그인
        </Button>
      </form>

      <p className="text-center text-small text-muted-foreground">
        계정이 없으신가요?{' '}
        <Link
          href={
            redirectTo !== '/dashboard'
              ? `/signup?redirect=${encodeURIComponent(redirectTo)}`
              : '/signup'
          }
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          회원가입
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<PageLoading label="불러오는 중" />}>
      <LoginContent />
    </Suspense>
  );
}

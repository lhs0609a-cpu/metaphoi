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

const signupSchema = z
  .object({
    email: z.string().email('유효한 이메일을 입력해주세요'),
    name: z.string().min(2, '이름은 2자 이상이어야 합니다').optional(),
    password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

type SignupForm = z.infer<typeof signupSchema>;

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const { signup, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    setError(null);
    const result = await signup({
      email: data.email,
      password: data.password,
      name: data.name,
    });

    if (result.success) {
      router.push(redirectTo);
    } else {
      setError(result.error || '회원가입에 실패했습니다');
    }
  };

  return (
    <div className="flex w-full flex-col gap-7">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-h2">회원가입</h1>
        <p className="text-small text-muted-foreground">
          검사 결과를 저장하면 언제든 다시 볼 수 있습니다
        </p>
      </header>

      {error ? <ErrorState title="가입하지 못했습니다" detail={error} /> : null}

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

        <Field label="이름" htmlFor="name" hint="선택 — 결과 화면에 표시됩니다" error={errors.name?.message}>
          <Input
            id="name"
            type="text"
            placeholder="어떻게 부를까요"
            autoComplete="name"
            invalid={!!errors.name}
            {...register('name')}
          />
        </Field>

        <Field
          label="비밀번호"
          htmlFor="password"
          error={errors.password?.message}
          hint={errors.password ? undefined : '8자 이상'}
          required
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            invalid={!!errors.password}
            {...register('password')}
          />
        </Field>

        <Field
          label="비밀번호 확인"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
          required
        >
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            invalid={!!errors.confirmPassword}
            {...register('confirmPassword')}
          />
        </Field>

        <Button type="submit" size="lg" block loading={isLoading} className="mt-2">
          회원가입
        </Button>
      </form>

      <p className="text-center text-small text-muted-foreground">
        이미 계정이 있으신가요?{' '}
        <Link
          href={
            redirectTo !== '/dashboard'
              ? `/login?redirect=${encodeURIComponent(redirectTo)}`
              : '/login'
          }
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          로그인
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<PageLoading label="불러오는 중" />}>
      <SignupContent />
    </Suspense>
  );
}

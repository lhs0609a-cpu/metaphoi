'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, Select } from '@/components/ui/field';
import { ErrorState } from '@/components/ui/states';
import { useCompanyAuthStore } from '@/lib/company-auth';

const SIZE_RANGES = ['1-10', '11-50', '51-200', '201-1000', '1000+'];
const INDUSTRIES = [
  'IT/소프트웨어', '금융', '제조', '유통/물류', '의료/바이오',
  '교육', '미디어/콘텐츠', '컨설팅', '스타트업', '기타',
];

/**
 * 기업 가입.
 *
 * 폼을 두 덩어리로 나눴다 — 계정(필수)과 회사 정보(선택).
 * 필수와 선택이 섞여 있으면 길이에 압도되어 이탈한다.
 * 선택 항목에는 "왜 적으면 좋은지"를 붙여 이유를 준다.
 */
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
  const [fieldError, setFieldError] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setFieldError((e) => ({ ...e, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const next: Record<string, string> = {};

    if (form.password.length < 8) {
      next.password = '비밀번호는 8자 이상으로 만들어 주세요';
    }
    if (form.password !== form.password_confirm) {
      next.password_confirm = '위에 입력한 비밀번호와 다릅니다';
    }

    if (Object.keys(next).length > 0) {
      setFieldError(next);
      return;
    }

    setLoading(true);
    const { password_confirm, ...data } = form;
    const result = await register(data);
    setLoading(false);

    if (result.success) {
      router.push('/company/dashboard');
    } else {
      setError(result.error || '가입하지 못했습니다. 이미 등록된 이메일일 수 있습니다.');
    }
  };

  return (
    <div className="flex w-full max-w-lg flex-col gap-7">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-h2">기업 가입</h1>
        <p className="text-small text-muted-foreground">공고를 올리고 능력치 기준으로 후보를 찾을 수 있습니다.</p>
      </header>

      {error ? <ErrorState title="가입하지 못했습니다" detail={error} /> : null}

      <form onSubmit={handleSubmit} className="flex flex-col gap-7" noValidate>
        {/* 계정 */}
        <fieldset className="flex flex-col gap-4">
          <legend className="eyebrow mb-1">계정 정보</legend>

          <Field label="회사명" htmlFor="company_name" required>
            <Input
              id="company_name"
              value={form.company_name}
              onChange={(e) => update('company_name', e.target.value)}
              placeholder="주식회사 메타포이"
              required
            />
          </Field>

          <Field label="담당자 이름" htmlFor="member_name" required>
            <Input
              id="member_name"
              value={form.member_name}
              onChange={(e) => update('member_name', e.target.value)}
              placeholder="홍길동"
              autoComplete="name"
              required
            />
          </Field>

          <Field label="업무용 이메일" htmlFor="email" required>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="hr@company.com"
              autoComplete="email"
              required
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="비밀번호"
              htmlFor="password"
              required
              error={fieldError.password}
              hint={fieldError.password ? undefined : '8자 이상'}
            >
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                autoComplete="new-password"
                invalid={!!fieldError.password}
                required
              />
            </Field>

            <Field
              label="비밀번호 확인"
              htmlFor="password_confirm"
              required
              error={fieldError.password_confirm}
            >
              <Input
                id="password_confirm"
                type="password"
                value={form.password_confirm}
                onChange={(e) => update('password_confirm', e.target.value)}
                autoComplete="new-password"
                invalid={!!fieldError.password_confirm}
                required
              />
            </Field>
          </div>
        </fieldset>

        {/* 회사 정보 */}
        <fieldset className="flex flex-col gap-4">
          <legend className="eyebrow mb-1">회사 정보 — 선택</legend>
          <p className="-mt-2 text-tiny text-muted-foreground">
            적어두면 후보자에게 공고가 더 잘 노출되고, 컬처핏 계산에도 반영됩니다.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="산업" htmlFor="industry">
              <Select
                id="industry"
                value={form.industry}
                onChange={(e) => update('industry', e.target.value)}
              >
                <option value="">선택 안 함</option>
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </Select>
            </Field>

            <Field label="규모" htmlFor="size_range">
              <Select
                id="size_range"
                value={form.size_range}
                onChange={(e) => update('size_range', e.target.value)}
              >
                <option value="">선택 안 함</option>
                {SIZE_RANGES.map((s) => (
                  <option key={s} value={s}>{s}명</option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="웹사이트" htmlFor="website">
            <Input
              id="website"
              type="url"
              inputMode="url"
              value={form.website}
              onChange={(e) => update('website', e.target.value)}
              placeholder="https://company.com"
            />
          </Field>

          <Field label="위치" htmlFor="location">
            <Input
              id="location"
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
              placeholder="서울 강남구"
            />
          </Field>
        </fieldset>

        <Button type="submit" size="lg" block loading={loading}>
          가입하고 시작하기
        </Button>

        <p className="text-center text-micro leading-relaxed text-muted-foreground">
          가입하면 이용약관과 개인정보처리방침에 동의하는 것으로 봅니다.
          <br />
          채용에 AI 평가를 사용하는 경우 지원자에게 사전 고지할 의무가 있습니다.
        </p>
      </form>

      <p className="text-center text-small text-muted-foreground">
        이미 계정이 있으신가요?{' '}
        <Link href="/company/login" className="font-medium text-primary underline-offset-4 hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';
import { cn } from '@/lib/utils';
import { ROLES, INDUSTRIES } from '@/data/seeker/questionnaire';

interface Phase1Data {
  display_name: string;
  headline: string;
  desired_roles: string[];
  desired_industries: string[];
}

interface SeekerWizardPhase1Props {
  initialData?: Phase1Data;
  onSubmit: (data: Phase1Data) => void;
}

export function SeekerWizardPhase1({ initialData, onSubmit }: SeekerWizardPhase1Props) {
  const [form, setForm] = useState<Phase1Data>(
    initialData ?? {
      display_name: '',
      headline: '',
      desired_roles: [],
      desired_industries: [],
    }
  );

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

  const canSubmit = form.desired_roles.length > 0;

  const chip = (on: boolean) =>
    cn(
      'rounded-pill border px-3.5 py-2 text-small font-medium transition-colors duration-fast',
      on
        ? 'border-action bg-action text-action-foreground'
        : 'border-border text-muted-foreground hover:border-border-strong hover:text-foreground'
    );

  return (
    <div className="flex flex-col gap-6">
      <Field
        label="표시 이름"
        htmlFor="display_name"
        hint="매칭 전까지 기업에게 보이는 이름입니다. 실명이 아니어도 됩니다"
      >
        <Input
          id="display_name"
          placeholder="어떻게 표시할까요"
          value={form.display_name}
          onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
        />
      </Field>

      <Field
        label="한 줄 소개"
        htmlFor="headline"
        hint="기업이 목록에서 가장 먼저 읽는 문장입니다"
      >
        <Input
          id="headline"
          placeholder="예: 3년차 백엔드 개발자, 성장하는 팀을 찾고 있습니다"
          value={form.headline}
          onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
        />
      </Field>

      <Field
        label="희망 직무"
        hint="고른 직군에 맞는 질문이 이어집니다. 여러 개 고를 수 있습니다"
        required
      >
        <div className="flex flex-wrap gap-2">
          {ROLES.map((role) => (
            <button
              key={role}
              type="button"
              aria-pressed={form.desired_roles.includes(role)}
              onClick={() => toggleRole(role)}
              className={chip(form.desired_roles.includes(role))}
            >
              {role}
            </button>
          ))}
        </div>
      </Field>

      <Field label="관심 산업" hint="선택 — 비워 두면 전체 산업에서 매칭됩니다">
        <div className="flex flex-wrap gap-2">
          {INDUSTRIES.map((ind) => (
            <button
              key={ind}
              type="button"
              aria-pressed={form.desired_industries.includes(ind)}
              onClick={() => toggleIndustry(ind)}
              className={chip(form.desired_industries.includes(ind))}
            >
              {ind}
            </button>
          ))}
        </div>
      </Field>

      <Button size="lg" block disabled={!canSubmit} onClick={() => onSubmit(form)}>
        다음
      </Button>
    </div>
  );
}

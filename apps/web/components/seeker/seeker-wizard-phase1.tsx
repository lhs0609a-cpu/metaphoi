'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">채용 프로필 기본 정보</CardTitle>
        <CardDescription>
          기업이 당신을 찾을 수 있도록 기본 정보를 입력해주세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <label className="text-sm font-medium block mb-1">표시 이름 (닉네임)</label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            placeholder="매칭 전 기업에게 보여지는 이름"
            value={form.display_name}
            onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">한줄 자기소개</label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            placeholder="예: 3년차 풀스택 개발자, 성장하는 팀을 찾고 있습니다"
            value={form.headline}
            onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">
            희망 직무 (복수 선택) <span className="text-destructive">*</span>
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            선택한 직군에 맞는 맞춤 질문이 제공됩니다
          </p>
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

        <Button
          className="w-full"
          size="lg"
          disabled={!canSubmit}
          onClick={() => onSubmit(form)}
        >
          다음
        </Button>
      </CardContent>
    </Card>
  );
}

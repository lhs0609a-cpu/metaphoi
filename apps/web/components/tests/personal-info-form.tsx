'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, Select } from '@/components/ui/field';
import { Segmented } from '@/components/ui/segmented';
import { type PersonalInfo } from '@/data/tests/comprehensive';

interface PersonalInfoFormProps {
  initialData?: Partial<PersonalInfo>;
  onSubmit: (info: PersonalInfo) => void;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 60 }, (_, i) => currentYear - 59 + i);

const HOUR_OPTIONS = [
  '모름',
  '자시 (23:00~01:00)', '축시 (01:00~03:00)', '인시 (03:00~05:00)',
  '묘시 (05:00~07:00)', '진시 (07:00~09:00)', '사시 (09:00~11:00)',
  '오시 (11:00~13:00)', '미시 (13:00~15:00)', '신시 (15:00~17:00)',
  '유시 (17:00~19:00)', '술시 (19:00~21:00)', '해시 (21:00~23:00)',
];

const GENDERS = [
  { value: '남', label: '남성' },
  { value: '여', label: '여성' },
] as const;

const BLOOD_TYPES = [
  { value: 'A', label: 'A형' },
  { value: 'B', label: 'B형' },
  { value: 'O', label: 'O형' },
  { value: 'AB', label: 'AB형' },
] as const;

export function PersonalInfoForm({ initialData, onSubmit }: PersonalInfoFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [birthYear, setBirthYear] = useState(initialData?.birthYear || 2000);
  const [birthMonth, setBirthMonth] = useState(initialData?.birthMonth || 1);
  const [birthDay, setBirthDay] = useState(initialData?.birthDay || 1);
  const [birthHourIdx, setBirthHourIdx] = useState(initialData?.birthHourIdx || 0);
  const [gender, setGender] = useState<'남' | '여'>(initialData?.gender || '남');
  const [bloodType, setBloodType] = useState<'A' | 'B' | 'O' | 'AB'>(initialData?.bloodType || 'A');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), birthYear, birthMonth, birthDay, birthHourIdx, gender, bloodType });
  };

  const daysInMonth = new Date(birthYear, birthMonth, 0).getDate();

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="flex flex-col gap-6 rounded-card border border-border p-6 sm:p-7">
        <Field label="이름" htmlFor="name" hint="결과 화면에 표시됩니다. 실명이 아니어도 됩니다" required>
          <Input
            id="name"
            type="text"
            placeholder="어떻게 부를까요"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={20}
            autoComplete="name"
          />
        </Field>

        <Field label="생년월일" htmlFor="birth-year" required>
          <div className="grid grid-cols-3 gap-2">
            <Select
              id="birth-year"
              aria-label="태어난 해"
              value={birthYear}
              onChange={(e) => setBirthYear(Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}년</option>
              ))}
            </Select>
            <Select
              aria-label="태어난 달"
              value={birthMonth}
              onChange={(e) => setBirthMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{m}월</option>
              ))}
            </Select>
            <Select
              aria-label="태어난 날"
              value={birthDay}
              onChange={(e) => setBirthDay(Number(e.target.value))}
            >
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>{d}일</option>
              ))}
            </Select>
          </div>
        </Field>

        <Field
          label="태어난 시간"
          htmlFor="birth-hour"
          hint="사주 계산에만 씁니다. 모르면 '모름'으로 두세요 — 나머지 분석에는 영향이 없습니다"
        >
          <Select
            id="birth-hour"
            value={birthHourIdx}
            onChange={(e) => setBirthHourIdx(Number(e.target.value))}
          >
            {HOUR_OPTIONS.map((label, i) => (
              <option key={i} value={i}>{label}</option>
            ))}
          </Select>
        </Field>

        <Field label="성별" hint="사주와 사상체질 계산에 필요합니다">
          <Segmented options={GENDERS} value={gender} onChange={setGender} aria-label="성별" />
        </Field>

        <Field label="혈액형" hint="보조 지표로만 반영됩니다">
          <Segmented options={BLOOD_TYPES} value={bloodType} onChange={setBloodType} aria-label="혈액형" />
        </Field>
      </div>

      <div className="flex flex-col gap-3">
        <Button type="submit" size="lg" block disabled={!name.trim()}>
          검사 시작하기
        </Button>
        <p className="text-center text-tiny text-muted-foreground">
          입력한 정보는 결과 산출에만 쓰이고, 저장하지 않으면 브라우저를 닫을 때 사라집니다
        </p>
      </div>
    </form>
  );
}

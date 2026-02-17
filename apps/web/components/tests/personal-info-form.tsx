'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">기본 정보</CardTitle>
          <p className="text-sm text-muted-foreground">
            정확한 분석을 위해 기본 정보를 입력해주세요
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* 이름 */}
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              type="text"
              placeholder="이름을 입력하세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={20}
            />
          </div>

          {/* 생년월일 */}
          <div className="space-y-2">
            <Label>생년월일</Label>
            <div className="grid grid-cols-3 gap-3">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={birthYear}
                onChange={(e) => setBirthYear(Number(e.target.value))}
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}년</option>
                ))}
              </select>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={birthMonth}
                onChange={(e) => setBirthMonth(Number(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>{m}월</option>
                ))}
              </select>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={birthDay}
                onChange={(e) => setBirthDay(Number(e.target.value))}
              >
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{d}일</option>
                ))}
              </select>
            </div>
          </div>

          {/* 태어난 시간 */}
          <div className="space-y-2">
            <Label>태어난 시간</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={birthHourIdx}
              onChange={(e) => setBirthHourIdx(Number(e.target.value))}
            >
              {HOUR_OPTIONS.map((label, i) => (
                <option key={i} value={i}>{label}</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">사주 분석에 활용됩니다. 모르면 &apos;모름&apos;을 선택하세요.</p>
          </div>

          {/* 성별 */}
          <div className="space-y-2">
            <Label>성별</Label>
            <div className="flex gap-3">
              {(['남', '여'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  className={`flex-1 h-10 rounded-md border text-sm font-medium transition-colors ${
                    gender === g
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-input hover:border-primary/50'
                  }`}
                  onClick={() => setGender(g)}
                >
                  {g === '남' ? '남성' : '여성'}
                </button>
              ))}
            </div>
          </div>

          {/* 혈액형 */}
          <div className="space-y-2">
            <Label>혈액형</Label>
            <div className="flex gap-3">
              {(['A', 'B', 'O', 'AB'] as const).map((bt) => (
                <button
                  key={bt}
                  type="button"
                  className={`flex-1 h-10 rounded-md border text-sm font-medium transition-colors ${
                    bloodType === bt
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-input hover:border-primary/50'
                  }`}
                  onClick={() => setBloodType(bt)}
                >
                  {bt}형
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full text-lg py-6" disabled={!name.trim()}>
        검사 시작하기
      </Button>
    </form>
  );
}

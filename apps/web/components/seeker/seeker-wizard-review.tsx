'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type SeekerQuestion } from '@/data/seeker/questionnaire';

interface SeekerWizardReviewProps {
  phase1: {
    display_name: string;
    headline: string;
    desired_roles: string[];
    desired_industries: string[];
  };
  answers: Record<string, string | string[] | number>;
  allQuestions: SeekerQuestion[];
  onEdit: (phase: number) => void;
  onSubmit: () => void;
  submitting: boolean;
}

function formatAnswer(value: string | string[] | number | undefined): string {
  if (value === undefined) return '-';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

export function SeekerWizardReview({
  phase1,
  answers,
  allQuestions,
  onEdit,
  onSubmit,
  submitting,
}: SeekerWizardReviewProps) {
  const careerQs = allQuestions.filter((q) => q.phase === 'career');
  const roleQs = allQuestions.filter((q) => q.phase === 'role');
  const styleQs = allQuestions.filter((q) => q.phase === 'style');

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold">입력 내용 확인</h2>
        <p className="text-muted-foreground mt-1">내용을 확인하고 프로필을 등록해주세요</p>
      </div>

      {/* Phase 1: 기본 정보 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">기본 정보</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onEdit(1)}>
            수정하기
          </Button>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">표시 이름</span>
            <span>{phase1.display_name || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">한줄 소개</span>
            <span>{phase1.headline || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">희망 직무</span>
            <span>{phase1.desired_roles.join(', ') || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">관심 산업</span>
            <span>{phase1.desired_industries.join(', ') || '-'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Phase 2: 경력/팀워크 */}
      {careerQs.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">경력 & 팀워크</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onEdit(2)}>
              수정하기
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {careerQs.map((q) => (
              <div key={q.id} className="flex justify-between gap-4">
                <span className="text-muted-foreground shrink-0">{q.questionText.replace(/\?$/, '').slice(0, 20)}...</span>
                <span className="text-right">{formatAnswer(answers[q.id])}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Phase 3: 직군별 */}
      {roleQs.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">직군별 질문</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onEdit(3)}>
              수정하기
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {roleQs.map((q) => (
              <div key={q.id} className="flex justify-between gap-4">
                <span className="text-muted-foreground shrink-0">{q.questionText.replace(/\?$/, '').slice(0, 20)}...</span>
                <span className="text-right">{formatAnswer(answers[q.id])}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Phase 4: 근무스타일 */}
      {styleQs.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">근무 스타일 & 문화</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onEdit(4)}>
              수정하기
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {styleQs.map((q) => (
              <div key={q.id} className="flex justify-between gap-4">
                <span className="text-muted-foreground shrink-0">{q.questionText.replace(/\?$/, '').slice(0, 20)}...</span>
                <span className="text-right">{formatAnswer(answers[q.id])}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 제출 */}
      <div className="space-y-3 pt-2">
        <Button
          className="w-full"
          size="lg"
          onClick={onSubmit}
          disabled={submitting}
        >
          {submitting ? '등록 중...' : '프로필 등록하기'}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          등록 후에도 프로필을 수정할 수 있습니다
        </p>
      </div>
    </div>
  );
}

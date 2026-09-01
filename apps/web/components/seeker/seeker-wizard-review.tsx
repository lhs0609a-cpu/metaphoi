'use client';

import { Button } from '@/components/ui/button';
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
    <div className="flex flex-col gap-8">
      <header className="flex flex-col items-start gap-2">
        <p className="eyebrow">마지막 확인</p>
        <h2 className="text-h2">이대로 등록할까요</h2>
        <p className="text-small text-muted-foreground">
          등록 후에도 언제든 고칠 수 있습니다
        </p>
      </header>

      <ReviewSection title="기본 정보" onEdit={() => onEdit(1)}>
        <ReviewRow label="표시 이름" value={phase1.display_name} />
        <ReviewRow label="한 줄 소개" value={phase1.headline} />
        <ReviewRow label="희망 직무" value={phase1.desired_roles.join(', ')} />
        <ReviewRow label="관심 산업" value={phase1.desired_industries.join(', ')} />
      </ReviewSection>

      {careerQs.length > 0 && (
        <ReviewSection title="경력과 팀워크" onEdit={() => onEdit(2)}>
          {careerQs.map((q) => (
            <ReviewRow key={q.id} label={shorten(q.questionText)} value={formatAnswer(answers[q.id])} />
          ))}
        </ReviewSection>
      )}

      {roleQs.length > 0 && (
        <ReviewSection title="직군별 질문" onEdit={() => onEdit(3)}>
          {roleQs.map((q) => (
            <ReviewRow key={q.id} label={shorten(q.questionText)} value={formatAnswer(answers[q.id])} />
          ))}
        </ReviewSection>
      )}

      {styleQs.length > 0 && (
        <ReviewSection title="근무 스타일" onEdit={() => onEdit(4)}>
          {styleQs.map((q) => (
            <ReviewRow key={q.id} label={shorten(q.questionText)} value={formatAnswer(answers[q.id])} />
          ))}
        </ReviewSection>
      )}

      <div className="flex flex-col gap-3">
        <Button size="lg" block onClick={onSubmit} loading={submitting}>
          프로필 등록하기
        </Button>
        <p className="text-center text-tiny text-muted-foreground">
          공개 범위는 등록 후에 조정할 수 있습니다
        </p>
      </div>
    </div>
  );
}

/**
 * 문항을 목록에 넣을 만큼 줄인다.
 *
 * 예전에는 slice(0, 20) 뒤에 무조건 '...' 을 붙여서, 짧은 문항도
 * "혈액형은..." 처럼 잘린 것처럼 보였다. 실제로 자를 때만 붙인다.
 */
function shorten(text: string, max = 22): string {
  const clean = text.replace(/\?$/, '');
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

function ReviewSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-h4">{title}</h3>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          수정
        </Button>
      </div>
      <dl className="mt-2 flex flex-col">{children}</dl>
    </section>
  );
}

function ReviewRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-border py-2.5 last:border-b">
      <dt className="shrink-0 text-small text-muted-foreground">{label}</dt>
      <dd className="text-right text-small">{value || '—'}</dd>
    </div>
  );
}

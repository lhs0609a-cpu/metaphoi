'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { type SeekerQuestion } from '@/data/seeker/questionnaire';
import { cn } from '@/lib/utils';

interface SeekerQuestionCardProps {
  question: SeekerQuestion;
  value: string | string[] | number | undefined;
  onChange: (questionId: string, value: string | string[] | number) => void;
  onAutoAdvance?: () => void;
}

/*
 * 선택 상태는 잉크로 채운다.
 *
 * 예전에는 border-primary + bg-primary/10 이었다. 브랜드색이 "선택됨"과
 * "누를 수 있음" 두 뜻을 동시에 가지면 화면에서 무엇이 골라진 것인지
 * 한눈에 안 들어온다. 검사 문항·Segmented 와 같은 규칙으로 맞춘다.
 */
const OPTION_BASE =
  'w-full rounded-control border px-5 py-4 text-left text-body ' +
  'transition-[background-color,border-color,transform] duration-fast ease-std active:scale-[0.995]';

const OPTION_ON = 'border-action bg-action text-action-foreground font-semibold';
const OPTION_OFF = 'border-border hover:border-border-strong hover:bg-sunk';

export function SeekerQuestionCard({
  question,
  value,
  onChange,
  onAutoAdvance,
}: SeekerQuestionCardProps) {
  const [textValue, setTextValue] = useState(typeof value === 'string' ? value : '');

  const advance = () => {
    if (onAutoAdvance) setTimeout(onAutoAdvance, 300);
  };

  const handleSingleChoice = (option: string) => {
    onChange(question.id, option);
    advance();
  };

  const handleMultiChoice = (option: string) => {
    const current = Array.isArray(value) ? value : [];
    onChange(
      question.id,
      current.includes(option) ? current.filter((v) => v !== option) : [...current, option]
    );
  };

  const handleScale = (val: number) => {
    onChange(question.id, val);
    advance();
  };

  const scaleMin = question.scaleMin ?? 1;
  const scaleMax = question.scaleMax ?? 5;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-h3 font-semibold">{question.questionText}</h1>
        {question.subText ? (
          <p className="text-small text-muted-foreground">{question.subText}</p>
        ) : null}
      </div>

      {question.inputType === 'single-choice' && question.options ? (
        <div className="flex flex-col gap-2.5">
          {question.options.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={value === option}
              onClick={() => handleSingleChoice(option)}
              className={cn(OPTION_BASE, value === option ? OPTION_ON : OPTION_OFF)}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}

      {question.inputType === 'multi-choice' && question.options ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {question.options.map((option) => {
              const selected = Array.isArray(value) && value.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => handleMultiChoice(option)}
                  className={cn(
                    'rounded-pill border px-4 py-2.5 text-small font-medium transition-colors duration-fast',
                    selected
                      ? 'border-action bg-action text-action-foreground'
                      : 'border-border text-muted-foreground hover:border-border-strong hover:text-foreground'
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
          <p className="text-tiny text-muted-foreground">여러 개 고를 수 있습니다</p>
        </div>
      ) : null}

      {question.inputType === 'scale' ? (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            {Array.from({ length: scaleMax - scaleMin + 1 }, (_, i) => scaleMin + i).map((val) => (
              <button
                key={val}
                type="button"
                aria-pressed={value === val}
                onClick={() => handleScale(val)}
                className={cn(
                  'stat-num h-14 flex-1 rounded-control border text-body transition-colors duration-fast',
                  value === val
                    ? 'border-action bg-action text-action-foreground'
                    : 'border-border hover:border-border-strong hover:bg-sunk'
                )}
              >
                {val}
              </button>
            ))}
          </div>
          {question.scaleLabels ? (
            <div className="flex justify-between">
              <span className="text-tiny text-muted-foreground">{question.scaleLabels[0]}</span>
              <span className="text-tiny text-muted-foreground">{question.scaleLabels[1]}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {question.inputType === 'text-short' ? (
        <Input
          value={textValue}
          onChange={(e) => {
            setTextValue(e.target.value);
            onChange(question.id, e.target.value);
          }}
          placeholder="여기에 입력해 주세요"
          aria-label={question.questionText}
        />
      ) : null}
    </div>
  );
}

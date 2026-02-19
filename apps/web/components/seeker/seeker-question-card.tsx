'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type SeekerQuestion } from '@/data/seeker/questionnaire';

interface SeekerQuestionCardProps {
  question: SeekerQuestion;
  value: string | string[] | number | undefined;
  onChange: (questionId: string, value: string | string[] | number) => void;
  onAutoAdvance?: () => void;
}

export function SeekerQuestionCard({
  question,
  value,
  onChange,
  onAutoAdvance,
}: SeekerQuestionCardProps) {
  const [textValue, setTextValue] = useState(
    typeof value === 'string' ? value : ''
  );

  const handleSingleChoice = (option: string) => {
    onChange(question.id, option);
    if (onAutoAdvance) {
      setTimeout(onAutoAdvance, 300);
    }
  };

  const handleMultiChoice = (option: string) => {
    const current = Array.isArray(value) ? value : [];
    const next = current.includes(option)
      ? current.filter((v) => v !== option)
      : [...current, option];
    onChange(question.id, next);
  };

  const handleScale = (val: number) => {
    onChange(question.id, val);
    if (onAutoAdvance) {
      setTimeout(onAutoAdvance, 300);
    }
  };

  const handleText = (text: string) => {
    setTextValue(text);
    onChange(question.id, text);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-normal leading-relaxed">
          {question.questionText}
        </CardTitle>
        {question.subText && (
          <p className="text-sm text-muted-foreground">{question.subText}</p>
        )}
      </CardHeader>
      <CardContent>
        {question.inputType === 'single-choice' && question.options && (
          <div className="space-y-3">
            {question.options.map((option) => (
              <button
                key={option}
                className={`w-full p-4 text-left rounded-lg border transition-colors ${
                  value === option
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleSingleChoice(option)}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {question.inputType === 'multi-choice' && question.options && (
          <div className="flex flex-wrap gap-2">
            {question.options.map((option) => {
              const selected = Array.isArray(value) && value.includes(option);
              return (
                <button
                  key={option}
                  className={`px-4 py-2 text-sm rounded-full border transition-colors ${
                    selected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background hover:bg-muted border-border'
                  }`}
                  onClick={() => handleMultiChoice(option)}
                >
                  {option}
                </button>
              );
            })}
          </div>
        )}

        {question.inputType === 'scale' && (
          <div>
            <div className="flex gap-2 justify-center">
              {Array.from(
                { length: (question.scaleMax ?? 5) - (question.scaleMin ?? 1) + 1 },
                (_, i) => (question.scaleMin ?? 1) + i
              ).map((val) => (
                <button
                  key={val}
                  className={`w-12 h-12 rounded-lg border text-sm font-medium transition-colors ${
                    value === val
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background hover:bg-muted border-border'
                  }`}
                  onClick={() => handleScale(val)}
                >
                  {val}
                </button>
              ))}
            </div>
            {question.scaleLabels && (
              <div className="flex justify-between mt-2 px-1">
                <span className="text-xs text-muted-foreground">{question.scaleLabels[0]}</span>
                <span className="text-xs text-muted-foreground">{question.scaleLabels[1]}</span>
              </div>
            )}
          </div>
        )}

        {question.inputType === 'text-short' && (
          <input
            type="text"
            className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            placeholder="여기에 입력해주세요"
            value={textValue}
            onChange={(e) => handleText(e.target.value)}
          />
        )}
      </CardContent>
    </Card>
  );
}

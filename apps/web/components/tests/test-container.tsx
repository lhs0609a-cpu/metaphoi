'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getTestQuestions, getTestMeta } from '@/data/tests';
import { scoreTest } from '@/lib/test-engine';
import { saveProgress, completeTest, getSession } from '@/lib/test-session';

interface TestContainerProps {
  testCode: string;
  testName: string;
}

export function TestContainer({ testCode, testName }: TestContainerProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | string>>({});
  const [submitting, setSubmitting] = useState(false);

  const questions = getTestQuestions(testCode);
  const testMeta = getTestMeta(testCode);

  // 이전 진행 상태 복원
  useEffect(() => {
    const session = getSession(testCode);
    if (session && !session.completedAt) {
      setAnswers(session.answers);
      setCurrentIndex(session.currentIndex);
    }
  }, [testCode]);

  // 답변 변경 시 자동 저장
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      saveProgress(testCode, answers, currentIndex);
    }
  }, [answers, currentIndex, testCode]);

  const handleAnswer = useCallback((questionId: number, answer: number | string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  }, []);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    setSubmitting(true);

    const result = scoreTest(testCode, questions, answers);

    if (result) {
      completeTest(testCode, result);
      router.push(`/results/${testCode}/preview`);
    } else {
      console.error('Scoring failed for test:', testCode);
      setSubmitting(false);
    }
  };

  if (!testMeta?.available || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              이 검사는 아직 준비 중입니다.
            </p>
            <Button onClick={() => router.push('/')}>
              홈으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const currentAnswer = answers[currentQuestion.id];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-center mb-4">{testName}</h1>
          <div className="flex items-center gap-4">
            <Progress value={progress} className="flex-1" />
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-normal leading-relaxed">
              {currentQuestion.questionText}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentQuestion.questionType === 'likert' && currentQuestion.options?.scale && (
              <div className="space-y-3">
                {currentQuestion.options.scale.map((value, index) => (
                  <button
                    key={value}
                    className={`w-full p-4 text-left rounded-lg border transition-colors ${
                      currentAnswer === value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleAnswer(currentQuestion.id, value)}
                  >
                    <span className="font-medium">{value}.</span>{' '}
                    {currentQuestion.options?.labels?.[index] || ''}
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.questionType === 'choice' && currentQuestion.options?.choices && (
              <div className="space-y-3">
                {currentQuestion.options.choices.map((choice, index) => (
                  <button
                    key={index}
                    className={`w-full p-4 text-left rounded-lg border transition-colors ${
                      currentAnswer === index
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleAnswer(currentQuestion.id, index)}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            이전
          </Button>

          {currentIndex === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting || Object.keys(answers).length < questions.length}
            >
              {submitting ? '채점 중...' : '검사 완료'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={currentAnswer === undefined}
            >
              다음
            </Button>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="mt-6 flex justify-center gap-1 flex-wrap">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentIndex
                  ? 'bg-primary'
                  : answers[questions[index].id] !== undefined
                  ? 'bg-primary/50'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

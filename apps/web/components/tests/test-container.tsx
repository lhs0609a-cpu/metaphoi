'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/auth';

interface Question {
  id: number;
  question_number: number;
  question_type: string;
  question_text: string;
  options?: {
    scale?: number[];
    labels?: string[];
    choices?: string[];
  };
  scoring_weights?: Record<string, number>;
}

interface TestContainerProps {
  testCode: string;
  testName: string;
}

export function TestContainer({ testCode, testName }: TestContainerProps) {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, unknown>>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const startTest = async () => {
      try {
        const response = await fetch(`${API_URL}/api/tests/${testCode}/start`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSessionId(data.session.id);
          setQuestions(data.questions);
        }
      } catch (error) {
        console.error('Failed to start test:', error);
      } finally {
        setLoading(false);
      }
    };

    startTest();
  }, [testCode, token, isAuthenticated, router, API_URL]);

  const handleAnswer = useCallback((questionId: number, answer: unknown) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  }, []);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setStartTime(Date.now());
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!sessionId) return;

    setSubmitting(true);

    try {
      // Submit all answers
      const responseData = Object.entries(answers).map(([questionId, answer]) => ({
        question_id: parseInt(questionId),
        answer,
        response_time_ms: 5000, // Simplified for demo
      }));

      await fetch(`${API_URL}/api/tests/${testCode}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          session_id: sessionId,
          answers: responseData,
        }),
      });

      // Complete the test
      const completeResponse = await fetch(
        `${API_URL}/api/tests/${testCode}/complete?session_id=${sessionId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (completeResponse.ok) {
        router.push(`/results/${testCode}`);
      }
    } catch (error) {
      console.error('Failed to submit test:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">검사를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              아직 준비된 문항이 없습니다.
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              대시보드로 돌아가기
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
              {currentQuestion.question_text}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentQuestion.question_type === 'likert' && currentQuestion.options?.scale && (
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

            {currentQuestion.question_type === 'choice' && currentQuestion.options?.choices && (
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
              {submitting ? '제출 중...' : '검사 완료'}
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
        <div className="mt-6 flex justify-center gap-1">
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

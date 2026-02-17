'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PersonalInfoForm } from './personal-info-form';
import { MilestoneFeedback } from './milestone-feedback';
import { comprehensiveQuestions, type PersonalInfo } from '@/data/tests/comprehensive';
import { scoreComprehensive } from '@/lib/comprehensive-scoring';
import {
  getComprehensiveSession,
  saveComprehensiveProgress,
  completeComprehensive,
  getOrCreateAnonSessionId,
} from '@/lib/test-session';
import { api } from '@/lib/api';
import { getTestTypeInfo, getMilestoneFeedback } from '@/lib/question-utils';

function getProgressColor(pct: number): string {
  if (pct >= 75) return 'bg-violet-500';
  if (pct >= 50) return 'bg-emerald-500';
  if (pct >= 25) return 'bg-blue-500';
  return 'bg-primary';
}

export function ComprehensiveTestContainer() {
  const router = useRouter();
  const [step, setStep] = useState<'info' | 'questions' | 'done'>('info');
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneMessage, setMilestoneMessage] = useState<{ message: string; progress: number } | null>(null);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const [savedAnswerCount, setSavedAnswerCount] = useState(0);

  const questions = comprehensiveQuestions;

  // 이전 세션 복원 (문항 수 변경 시 세션 리셋 처리)
  useEffect(() => {
    const session = getComprehensiveSession();
    if (session) {
      if (session.currentStep === 'done' && session.profile) {
        router.push('/results/preview');
        return;
      }

      // 이전 세션의 답변이 현재 문항 ID에 포함되지 않으면 세션 리셋
      const currentQuestionIds = new Set(questions.map((q) => q.id));
      const savedAnswerIds = Object.keys(session.answers || {}).map(Number);
      const hasInvalidAnswers = savedAnswerIds.length > 0 &&
        savedAnswerIds.some((id) => !currentQuestionIds.has(id));

      if (hasInvalidAnswers) {
        // 문항 구성이 변경됨 → 개인정보만 유지하고 답변 초기화
        if (session.personalInfo) {
          setPersonalInfo(session.personalInfo);
        }
        return;
      }

      if (session.personalInfo) {
        setPersonalInfo(session.personalInfo);
      }
      if (session.answers) {
        setAnswers(session.answers);
      }
      if (session.currentStep === 'questions' && Object.keys(session.answers || {}).length > 0) {
        setHasSavedProgress(true);
        setSavedAnswerCount(Object.keys(session.answers || {}).length);
        // Don't auto-navigate; let user choose via banner
      }
    }
  }, [router, questions]);

  // beforeunload 경고
  useEffect(() => {
    if (step !== 'questions' || Object.keys(answers).length === 0) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [step, answers]);

  // 자동 저장
  useEffect(() => {
    if (step === 'questions' && Object.keys(answers).length > 0) {
      saveComprehensiveProgress({
        personalInfo: personalInfo || undefined,
        answers,
        currentStep: 'questions',
        currentIndex,
      });
    }
  }, [answers, currentIndex, step, personalInfo]);

  const handlePersonalInfoSubmit = useCallback((info: PersonalInfo) => {
    setPersonalInfo(info);
    setStep('questions');
    setHasSavedProgress(false);
    saveComprehensiveProgress({
      personalInfo: info,
      currentStep: 'questions',
      currentIndex: 0,
    });
  }, []);

  const handleResume = useCallback(() => {
    const session = getComprehensiveSession();
    if (session) {
      if (session.personalInfo) setPersonalInfo(session.personalInfo);
      if (session.answers) setAnswers(session.answers);
      setCurrentIndex(session.currentIndex || 0);
    }
    setStep('questions');
    setHasSavedProgress(false);
  }, []);

  const handleAnswer = useCallback((questionId: number, answer: number | string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
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

  const handleAutoAdvance = useCallback((answeredIndex: number) => {
    const milestone = getMilestoneFeedback(answeredIndex, questions.length);
    if (milestone) {
      setMilestoneMessage(milestone);
      setShowMilestone(true);
    } else if (answeredIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 300);
    }
  }, [questions.length]);

  const handleMilestoneContinue = useCallback(() => {
    setShowMilestone(false);
    setMilestoneMessage(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, questions.length]);

  const handleSubmit = () => {
    if (!personalInfo) return;
    setSubmitting(true);

    try {
      const profile = scoreComprehensive(personalInfo, answers);
      completeComprehensive(profile);

      // 서버에 익명 저장 (fire-and-forget)
      const sessionId = getOrCreateAnonSessionId();
      api.results.saveAnonymous({
        session_id: sessionId,
        comprehensive_profile: profile,
        abilities_snapshot: profile.abilities || [],
        personal_info: personalInfo,
        answers,
      }).catch(() => {});

      router.push('/results/preview');
    } catch (err) {
      console.error('Comprehensive scoring failed:', err);
      setSubmitting(false);
    }
  };

  // Step 1: 개인정보 입력
  if (step === 'info') {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">종합 심리검사</h1>
            <p className="text-muted-foreground">
              먼저 기본 정보를 입력해주세요
            </p>
          </div>

          {/* 이어하기 배너 */}
          {hasSavedProgress && (
            <div className="mb-6 animate-fade-in-up">
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-sm">이전 검사가 저장되어 있습니다</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {savedAnswerCount}/{questions.length}문항 완료
                      </p>
                    </div>
                    <Button size="sm" onClick={handleResume}>
                      이어서 하기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                1
              </div>
              <span className="font-medium">기본 정보 입력</span>
              <div className="flex-1 h-px bg-border" />
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="text-sm text-muted-foreground">검사</span>
              <div className="flex-1 h-px bg-border" />
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">
                3
              </div>
              <span className="text-sm text-muted-foreground">결과</span>
            </div>
          </div>

          <PersonalInfoForm
            initialData={personalInfo || undefined}
            onSubmit={handlePersonalInfoSubmit}
          />
        </div>
      </div>
    );
  }

  // Step 2: 질문 응답
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const currentAnswer = answers[currentQuestion.id];
  const answeredCount = Object.keys(answers).length;
  const remaining = questions.length - answeredCount;
  const typeInfo = getTestTypeInfo(currentQuestion.id);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Milestone Feedback Modal */}
        {showMilestone && milestoneMessage && (
          <MilestoneFeedback
            message={milestoneMessage.message}
            progress={milestoneMessage.progress}
            onContinue={handleMilestoneContinue}
          />
        )}

        {/* Step Indicator */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/30 text-primary flex items-center justify-center text-sm font-bold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm text-muted-foreground">기본 정보</span>
            <div className="flex-1 h-px bg-primary/30" />
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
              2
            </div>
            <span className="font-medium">검사 진행 중</span>
            <div className="flex-1 h-px bg-border" />
            <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">
              3
            </div>
            <span className="text-sm text-muted-foreground">결과</span>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold">
              {personalInfo?.name}님의 종합 검사
            </h1>
            <span className="text-sm text-muted-foreground">
              {answeredCount} / {questions.length}
            </span>
          </div>

          {/* Custom Progress Bar */}
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getProgressColor(progress)}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-muted-foreground">
              {remaining > 0 ? `${remaining}문항 남음` : '마지막 문항!'}
            </p>
            <p className="text-xs text-muted-foreground">
              {currentIndex + 1} / {questions.length}문항
            </p>
          </div>
        </div>

        {/* Test Type Badge */}
        <div className="mb-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${typeInfo.bgClass} ${typeInfo.textClass}`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: 'currentColor' }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: 'currentColor' }} />
            </span>
            {typeInfo.analyzing}
          </span>
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
                    onClick={() => {
                      handleAnswer(currentQuestion.id, value);
                      handleAutoAdvance(currentIndex);
                    }}
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
                    onClick={() => {
                      handleAnswer(currentQuestion.id, index);
                      handleAutoAdvance(currentIndex);
                    }}
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
              disabled={submitting || answeredCount < questions.length}
            >
              {submitting ? '분석 중...' : '결과 보기'}
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

        {/* Mini progress dots */}
        <div className="mt-6 flex justify-center gap-0.5 flex-wrap">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                index === currentIndex
                  ? 'bg-primary scale-150'
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

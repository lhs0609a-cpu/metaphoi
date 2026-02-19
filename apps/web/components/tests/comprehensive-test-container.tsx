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
import {
  getTestTypeInfo,
  getMilestoneFeedback,
  getProgressGradient,
  getDotColor,
  type MilestoneFeedback as MilestoneFeedbackType,
} from '@/lib/question-utils';

export function ComprehensiveTestContainer() {
  const router = useRouter();
  const [step, setStep] = useState<'info' | 'questions' | 'done'>('info');
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneData, setMilestoneData] = useState<MilestoneFeedbackType | null>(null);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const [savedAnswerCount, setSavedAnswerCount] = useState(0);
  const [answerBounce, setAnswerBounce] = useState(false);

  const questions = comprehensiveQuestions;

  // 이전 세션 복원
  useEffect(() => {
    const session = getComprehensiveSession();
    if (session) {
      if (session.currentStep === 'done' && session.profile) {
        router.push('/results/preview');
        return;
      }
      const currentQuestionIds = new Set(questions.map((q) => q.id));
      const savedAnswerIds = Object.keys(session.answers || {}).map(Number);
      const hasInvalidAnswers = savedAnswerIds.length > 0 &&
        savedAnswerIds.some((id) => !currentQuestionIds.has(id));

      if (hasInvalidAnswers) {
        if (session.personalInfo) setPersonalInfo(session.personalInfo);
        return;
      }
      if (session.personalInfo) setPersonalInfo(session.personalInfo);
      if (session.answers) setAnswers(session.answers);
      if (session.currentStep === 'questions' && Object.keys(session.answers || {}).length > 0) {
        setHasSavedProgress(true);
        setSavedAnswerCount(Object.keys(session.answers || {}).length);
      }
    }
  }, [router, questions]);

  // beforeunload 경고
  useEffect(() => {
    if (step !== 'questions' || Object.keys(answers).length === 0) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); };
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
    saveComprehensiveProgress({ personalInfo: info, currentStep: 'questions', currentIndex: 0 });
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
    // Bounce animation
    setAnswerBounce(true);
    setTimeout(() => setAnswerBounce(false), 200);
  }, []);

  const findFirstUnanswered = useCallback((): number => {
    for (let i = 0; i < questions.length; i++) {
      if (answers[questions[i].id] === undefined) return i;
    }
    return -1;
  }, [questions, answers]);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleGoToUnanswered = useCallback(() => {
    const idx = findFirstUnanswered();
    if (idx >= 0) setCurrentIndex(idx);
  }, [findFirstUnanswered]);

  const handleAutoAdvance = useCallback((answeredIndex: number) => {
    // Build set of all answered question IDs for section milestone detection
    const answeredIds = new Set(
      Object.keys(answers).map(Number).concat([questions[answeredIndex].id]),
    );
    const milestone = getMilestoneFeedback(answeredIndex, questions.length, answeredIds);
    if (milestone) {
      setMilestoneData(milestone);
      setShowMilestone(true);
    } else if (answeredIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1)), 300);
    }
  }, [questions, answers]);

  const handleMilestoneContinue = useCallback(() => {
    setShowMilestone(false);
    setMilestoneData(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
    }
  }, [currentIndex, questions.length]);

  const handleSubmit = () => {
    if (!personalInfo) return;
    setSubmitting(true);
    try {
      const profile = scoreComprehensive(personalInfo, answers);
      completeComprehensive(profile);
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
            <p className="text-muted-foreground">먼저 기본 정보를 입력해주세요</p>
          </div>

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
                    <Button size="sm" onClick={handleResume}>이어서 하기</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
              <span className="font-medium">기본 정보 입력</span>
              <div className="flex-1 h-px bg-border" />
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">2</div>
              <span className="text-sm text-muted-foreground">검사</span>
              <div className="flex-1 h-px bg-border" />
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">3</div>
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
  const safeIndex = Math.min(currentIndex, questions.length - 1);
  const currentQuestion = questions[safeIndex];
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">문항을 불러올 수 없습니다.</p>
          <Button onClick={() => { setStep('info'); setCurrentIndex(0); }}>처음부터 다시 시작</Button>
        </div>
      </div>
    );
  }

  const progress = ((safeIndex + 1) / questions.length) * 100;
  const currentAnswer = answers[currentQuestion.id];
  const answeredCount = Object.keys(answers).length;
  const remaining = questions.length - answeredCount;
  const typeInfo = getTestTypeInfo(currentQuestion.id);
  const gradientClass = getProgressGradient(currentQuestion.id);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Milestone Feedback Modal */}
        {showMilestone && milestoneData && (
          <MilestoneFeedback
            message={milestoneData.message}
            progress={milestoneData.progress}
            testCompleted={milestoneData.testCompleted}
            testsRemaining={milestoneData.testsRemaining}
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
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
            <span className="font-medium">검사 진행 중</span>
            <div className="flex-1 h-px bg-border" />
            <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">3</div>
            <span className="text-sm text-muted-foreground">결과</span>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold">{personalInfo?.name}님의 종합 검사</h1>
            <span className="font-mono-stat text-sm text-muted-foreground">
              {answeredCount} / {questions.length}
            </span>
          </div>

          {/* XP Progress Bar */}
          <div className="w-full h-4 bg-muted rounded-full overflow-hidden animate-xp-pulse">
            <div
              className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${gradientClass}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-muted-foreground">
              {remaining > 0 ? `${remaining}문항 남음` : '마지막 문항!'}
            </p>
            <p className="text-xs font-mono-stat text-muted-foreground">
              {safeIndex + 1} / {questions.length}
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
        <Card className={`mb-6 border-t-2 ${typeInfo.borderClass} transition-transform duration-200 ${answerBounce ? 'scale-[0.98]' : 'scale-100'}`}>
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
                    className={`w-full p-4 text-left rounded-lg border transition-all duration-150 ${
                      currentAnswer === value
                        ? `border-current ${typeInfo.bgClass} ${typeInfo.textClass}`
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => {
                      handleAnswer(currentQuestion.id, value);
                      handleAutoAdvance(safeIndex);
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
                    className={`w-full p-4 text-left rounded-lg border transition-all duration-150 ${
                      currentAnswer === index
                        ? `border-current ${typeInfo.bgClass} ${typeInfo.textClass}`
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => {
                      handleAnswer(currentQuestion.id, index);
                      handleAutoAdvance(safeIndex);
                    }}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 미응답 문항 경고 */}
        {remaining > 0 && answeredCount > 0 && safeIndex >= questions.length - 3 && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <svg className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <span className="font-semibold">{remaining}개 문항</span>이 미응답입니다
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 border-amber-300 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                onClick={handleGoToUnanswered}
              >
                미응답 문항으로
              </Button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={safeIndex === 0}>
            이전
          </Button>

          {answeredCount >= questions.length ? (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? '분석 중...' : '결과 보기'}
            </Button>
          ) : currentAnswer === undefined ? (
            <Button disabled>선택지를 골라주세요</Button>
          ) : safeIndex === questions.length - 1 ? (
            <Button variant="outline" onClick={handleGoToUnanswered}>
              미응답 {remaining}개 문항으로
            </Button>
          ) : (
            <Button onClick={handleNext}>다음</Button>
          )}
        </div>

        {/* Mini progress dots with test-type colors */}
        <div className="mt-6 flex justify-center gap-0.5 flex-wrap">
          {questions.map((q, index) => {
            const isAnswered = answers[q.id] !== undefined;
            const isCurrent = index === safeIndex;
            const dotColor = isAnswered ? getDotColor(q.id) : 'bg-muted';

            return (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  isCurrent ? `${dotColor} scale-[2]` : isAnswered ? `${dotColor} opacity-70` : dotColor
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

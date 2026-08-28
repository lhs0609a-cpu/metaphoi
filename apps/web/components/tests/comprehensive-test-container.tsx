'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
      <div className="shell max-w-[34rem] py-12 lg:py-16">
        <div className="flex flex-col items-start">
          <p className="eyebrow">1 / 3 · 기본 정보</p>
          <h1 className="mt-3 text-h1">먼저 몇 가지만</h1>
          <p className="mt-4 text-lead text-muted-foreground">
            사주와 사상체질 계산에 필요한 정보입니다. 나머지 검사에는 쓰이지 않습니다.
          </p>
        </div>

        {hasSavedProgress && (
          <div className="anim-rise mt-8 flex items-center justify-between gap-4 rounded-card border border-border bg-sunk px-5 py-4">
            <div className="min-w-0">
              <p className="text-small font-semibold">이어서 할 검사가 있습니다</p>
              <p className="mt-0.5 text-tiny text-muted-foreground">
                <span className="stat-num" data-numeric>{savedAnswerCount}</span> / {questions.length}문항 완료
              </p>
            </div>
            <Button size="sm" onClick={handleResume}>
              이어서 하기
            </Button>
          </div>
        )}

        <div className="mt-8">
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
      <div className="shell max-w-[30rem] py-24 text-center">
        <p className="text-body text-muted-foreground">문항을 불러올 수 없습니다.</p>
        <Button
          className="mt-5"
          onClick={() => {
            setStep('info');
            setCurrentIndex(0);
          }}
        >
          처음부터 다시 시작
        </Button>
      </div>
    );
  }

  const progress = ((safeIndex + 1) / questions.length) * 100;
  const currentAnswer = answers[currentQuestion.id];
  const answeredCount = Object.keys(answers).length;
  const remaining = questions.length - answeredCount;
  const typeInfo = getTestTypeInfo(currentQuestion.id);

  const options =
    currentQuestion.questionType === 'likert' && currentQuestion.options?.scale
      ? currentQuestion.options.scale.map((value, index) => ({
          key: String(value),
          answer: value as number | string,
          label: currentQuestion.options?.labels?.[index] || String(value),
        }))
      : currentQuestion.questionType === 'choice' && currentQuestion.options?.choices
        ? currentQuestion.options.choices.map((choice, index) => ({
            key: String(index),
            answer: index as number | string,
            label: choice,
          }))
        : [];

  return (
    <>
      {showMilestone && milestoneData && (
        <MilestoneFeedback
          message={milestoneData.message}
          progress={milestoneData.progress}
          testCompleted={milestoneData.testCompleted}
          testsRemaining={milestoneData.testsRemaining}
          onContinue={handleMilestoneContinue}
        />
      )}

      {/*
        진행률은 화면 맨 위에 얇게 붙인다.
        문항을 푸는 동안 눈이 가야 할 곳은 질문 하나뿐이고,
        남은 양은 곁눈으로 확인되면 충분하다.
      */}
      <div className="sticky top-16 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="h-0.5 w-full bg-sunk">
          <div
            className="h-full bg-action transition-[width] duration-std ease-std"
            style={{ width: `${Math.max(progress, 1.5)}%` }}
          />
        </div>
        <div className="shell max-w-[38rem] flex h-11 items-center justify-between gap-3">
          <span className="truncate text-tiny text-muted-foreground">{typeInfo.analyzing}</span>
          <span className="stat-num shrink-0 text-tiny text-muted-foreground" data-numeric>
            {safeIndex + 1} / {questions.length}
          </span>
        </div>
      </div>

      <div className="shell max-w-[38rem] py-10 lg:py-14">
        <h1 className="text-h3 font-semibold">{currentQuestion.questionText}</h1>

        <div className="mt-8 flex flex-col gap-2.5">
          {options.map((o) => {
            const selected = currentAnswer === o.answer;
            return (
              <button
                key={o.key}
                type="button"
                aria-pressed={selected}
                className={[
                  'w-full rounded-control border px-5 py-4 text-left text-body',
                  'transition-[background-color,border-color,transform] duration-fast ease-std',
                  'active:scale-[0.995]',
                  selected
                    ? 'border-action bg-action text-action-foreground font-semibold'
                    : 'border-border hover:border-border-strong hover:bg-sunk',
                ].join(' ')}
                onClick={() => {
                  handleAnswer(currentQuestion.id, o.answer);
                  handleAutoAdvance(safeIndex);
                }}
              >
                {o.label}
              </button>
            );
          })}
        </div>

        {/* 미응답 문항 안내 — 끝에 가까워졌을 때만 */}
        {remaining > 0 && answeredCount > 0 && safeIndex >= questions.length - 3 && (
          <div className="mt-6 flex items-center justify-between gap-3 rounded-card bg-warn-soft px-4 py-3">
            <p className="text-small text-warn">
              <span className="font-semibold">{remaining}개 문항</span>이 아직 비어 있습니다
            </p>
            <Button size="sm" variant="ghost" className="shrink-0" onClick={handleGoToUnanswered}>
              건너뛴 문항으로
            </Button>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={handlePrevious} disabled={safeIndex === 0}>
            이전
          </Button>

          {answeredCount >= questions.length ? (
            <Button size="lg" loading={submitting} onClick={handleSubmit}>
              {submitting ? '분석 중' : '결과 보기'}
            </Button>
          ) : currentAnswer === undefined ? (
            <p className="text-small text-muted-foreground">답을 고르면 다음으로 넘어갑니다</p>
          ) : safeIndex === questions.length - 1 ? (
            <Button variant="outline" onClick={handleGoToUnanswered}>
              건너뛴 {remaining}개 문항으로
            </Button>
          ) : (
            <Button variant="outline" onClick={handleNext}>
              다음
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

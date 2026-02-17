'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MilestoneFeedback } from '@/components/tests/milestone-feedback';
import { SeekerQuestionCard } from './seeker-question-card';
import { SeekerWizardPhase1 } from './seeker-wizard-phase1';
import { SeekerWizardReview } from './seeker-wizard-review';

import { useAuthStore } from '@/lib/auth';
import { api } from '@/lib/api';
import { marketplaceApi } from '@/lib/marketplace-api';
import { getComprehensiveSession } from '@/lib/test-session';
import {
  getSeekerWizardSession,
  saveSeekerWizardProgress,
  clearSeekerWizardSession,
  type SeekerWizardSession,
} from '@/lib/seeker-wizard-session';
import {
  getCareerQuestions,
  getStyleQuestions,
  getRoleQuestions,
  type SeekerQuestion,
} from '@/data/seeker/questionnaire';

type WizardPhase = 'loading' | 'gate' | 1 | 2 | 3 | 4 | 'review' | 'submitting' | 'done';

const MILESTONES = [
  { at: 0.25, message: '좋은 출발이에요!' },
  { at: 0.50, message: '절반 완료! 거의 다 왔어요' },
  { at: 0.75, message: '마지막 스퍼트!' },
];

export function SeekerWizard() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuthStore();

  const [phase, setPhase] = useState<WizardPhase>('loading');
  const [phase1Data, setPhase1Data] = useState<SeekerWizardSession['phase1']>({
    display_name: '',
    headline: '',
    desired_roles: [],
    desired_industries: [],
  });
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});
  const [roleQuestionIds, setRoleQuestionIds] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [error, setError] = useState('');
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneMsg, setMilestoneMsg] = useState<{ message: string; progress: number } | null>(null);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);

  // 질문 목록 계산
  const careerQuestions = useMemo(() => getCareerQuestions(), []);
  const styleQuestions = useMemo(() => getStyleQuestions(), []);
  const roleQuestions = useMemo(
    () => getRoleQuestions(phase1Data.desired_roles),
    [phase1Data.desired_roles]
  );

  // 현재 phase에 해당하는 질문 배열
  const currentPhaseQuestions = useMemo((): SeekerQuestion[] => {
    if (phase === 2) return careerQuestions;
    if (phase === 3) return roleQuestions;
    if (phase === 4) return styleQuestions;
    return [];
  }, [phase, careerQuestions, roleQuestions, styleQuestions]);

  // 전체 질문 (진행률 계산용)
  const allQuestions = useMemo(
    () => [...careerQuestions, ...roleQuestions, ...styleQuestions],
    [careerQuestions, roleQuestions, styleQuestions]
  );

  const totalQuestions = allQuestions.length;
  const answeredCount = allQuestions.filter((q) => answers[q.id] !== undefined).length;
  const overallProgress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  // 인증 + 결제 게이트 확인
  useEffect(() => {
    if (phase !== 'loading') return;

    if (!isAuthenticated) {
      router.push('/login?redirect=/seeker/register');
      return;
    }

    if (!token) return;

    // 이미 프로필 존재 확인
    marketplaceApi.seekers.getMyProfile(token).then((res) => {
      if (res.data) {
        router.push('/seeker/profile');
        return;
      }

      // 결제 상태 확인
      api.payments.myStatus(token).then((payRes) => {
        const data = payRes.data as any;
        if (!data?.has_paid) {
          setPhase('gate');
          return;
        }

        // 세션 복원
        const session = getSeekerWizardSession();
        if (session && session.phase !== 'done') {
          setPhase1Data(session.phase1);
          setAnswers(session.answers);
          setRoleQuestionIds(session.computedRoleQuestions);
          setCurrentQuestionIndex(0);

          if (
            Object.keys(session.answers).length > 0 ||
            session.phase1.desired_roles.length > 0
          ) {
            setHasSavedProgress(true);
          }

          setPhase(1);
        } else {
          setPhase(1);
        }
      });
    });
  }, [phase, isAuthenticated, token, router]);

  // beforeunload 경고
  useEffect(() => {
    if (typeof phase !== 'number' || answeredCount === 0) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [phase, answeredCount]);

  // 자동 저장
  useEffect(() => {
    if (typeof phase !== 'number' && phase !== 'review') return;

    saveSeekerWizardProgress({
      phase: typeof phase === 'number' ? phase as 1 | 2 | 3 | 4 : 'review',
      phase1: phase1Data,
      answers,
      computedRoleQuestions: roleQuestionIds,
      currentQuestionIndex,
    });
  }, [phase, phase1Data, answers, roleQuestionIds, currentQuestionIndex]);

  // Phase 1 제출
  const handlePhase1Submit = useCallback(
    (data: SeekerWizardSession['phase1']) => {
      setPhase1Data(data);
      const rqs = getRoleQuestions(data.desired_roles);
      setRoleQuestionIds(rqs.map((q) => q.id));
      setCurrentQuestionIndex(0);
      setHasSavedProgress(false);
      setPhase(2);
    },
    []
  );

  // 이어하기
  const handleResume = useCallback(() => {
    const session = getSeekerWizardSession();
    if (session) {
      setPhase1Data(session.phase1);
      setAnswers(session.answers);
      setRoleQuestionIds(session.computedRoleQuestions);
      setCurrentQuestionIndex(0);

      // 저장된 phase로 이동
      const savedPhase = session.phase;
      if (savedPhase === 'review') {
        setPhase('review');
      } else if (typeof savedPhase === 'number' && savedPhase >= 2) {
        setPhase(savedPhase as 2 | 3 | 4);
      } else {
        setPhase(1);
      }
    }
    setHasSavedProgress(false);
  }, []);

  // 답변 핸들러
  const handleAnswer = useCallback(
    (questionId: string, value: string | string[] | number) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
    },
    []
  );

  // 마일스톤 체크
  const checkMilestone = useCallback(
    (newAnsweredCount: number) => {
      if (totalQuestions === 0) return false;
      const pct = newAnsweredCount / totalQuestions;

      for (const ms of MILESTONES) {
        const prevPct = (newAnsweredCount - 1) / totalQuestions;
        if (prevPct < ms.at && pct >= ms.at) {
          setMilestoneMsg({ message: ms.message, progress: Math.round(pct * 100) });
          setShowMilestone(true);
          return true;
        }
      }
      return false;
    },
    [totalQuestions]
  );

  // 자동 진행 (single-choice, scale)
  const handleAutoAdvance = useCallback(() => {
    const newAnswered = allQuestions.filter((q) => answers[q.id] !== undefined).length + 1;
    if (checkMilestone(newAnswered)) return;

    if (currentQuestionIndex < currentPhaseQuestions.length - 1) {
      setTimeout(() => setCurrentQuestionIndex((i) => i + 1), 300);
    }
  }, [currentQuestionIndex, currentPhaseQuestions.length, checkMilestone, allQuestions, answers]);

  const handleMilestoneContinue = useCallback(() => {
    setShowMilestone(false);
    setMilestoneMsg(null);
    if (currentQuestionIndex < currentPhaseQuestions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    }
  }, [currentQuestionIndex, currentPhaseQuestions.length]);

  // 다음 phase로 이동
  const goNextPhase = useCallback(() => {
    setCurrentQuestionIndex(0);
    if (phase === 2) setPhase(3);
    else if (phase === 3) setPhase(4);
    else if (phase === 4) setPhase('review');
  }, [phase]);

  // 이전 질문 / 다음 질문
  const handleNext = () => {
    if (currentQuestionIndex < currentPhaseQuestions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    } else {
      goNextPhase();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
    }
  };

  // 리뷰에서 수정하기
  const handleEditFromReview = useCallback((targetPhase: number) => {
    setCurrentQuestionIndex(0);
    setPhase(targetPhase as 1 | 2 | 3 | 4);
  }, []);

  // 제출
  const handleSubmit = async () => {
    if (!token) return;

    setPhase('submitting');
    setError('');

    // matchingField 매핑
    const matchingData: Record<string, any> = {};
    for (const q of allQuestions) {
      if (q.matchingField && answers[q.id] !== undefined) {
        matchingData[q.matchingField] = answers[q.id];
      }
    }

    // experience_years 매핑 (텍스트 → 숫자)
    if (matchingData.experience_years) {
      const map: Record<string, number | null> = {
        '신입': 0,
        '1-2년': 1,
        '3-5년': 3,
        '5-10년': 5,
        '10년 이상': 10,
      };
      matchingData.experience_years = map[matchingData.experience_years as string] ?? null;
    }

    // remote_pref 매핑
    if (matchingData.remote_pref) {
      const map: Record<string, string> = {
        '재택근무': 'remote',
        '하이브리드': 'hybrid',
        '출근': 'onsite',
      };
      matchingData.remote_pref = map[matchingData.remote_pref as string] ?? matchingData.remote_pref;
    }

    // 종합 검사 결과
    const session = getComprehensiveSession();

    const profileData = {
      display_name: phase1Data.display_name,
      headline: phase1Data.headline,
      desired_roles: phase1Data.desired_roles,
      desired_industries: phase1Data.desired_industries,
      ...matchingData,
      comprehensive_profile: session?.profile || null,
      abilities_snapshot: session?.profile?.abilities || null,
      career_questionnaire: answers,
    };

    const result = await marketplaceApi.seekers.createProfile(profileData, token);

    if (result.error) {
      setError(result.error);
      setPhase('review');
    } else {
      saveSeekerWizardProgress({ phase: 'done', completedAt: new Date().toISOString() });
      clearSeekerWizardSession();
      setPhase('done');
      router.push('/seeker/profile');
    }
  };

  // ========== Render ==========

  // Loading
  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">프로필 정보를 확인하는 중...</p>
        </div>
      </div>
    );
  }

  // Gate (미결제)
  if (phase === 'gate') {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-lg">
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">결제 후 이용 가능합니다</h2>
              <p className="text-muted-foreground mb-2">
                채용 프로필을 작성하려면 종합 분석 리포트를 먼저 구매해주세요.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                능력치 프로필이 완성된 상태에서만 기업에게 의미있는 프로필을 보여줄 수 있습니다.
              </p>
              <div className="flex flex-col gap-3">
                <Button size="lg" className="w-full" onClick={() => router.push('/checkout?testCode=comprehensive')}>
                  전체 분석 잠금 해제
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push('/results/preview')}>
                  결과 미리보기로 돌아가기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Done / Submitting
  if (phase === 'submitting' || phase === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">프로필을 등록하는 중...</p>
        </div>
      </div>
    );
  }

  // Phase 1: 기본 정보
  if (phase === 1) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">채용 프로필 등록</h1>
            <p className="text-muted-foreground">
              4단계로 나만의 채용 프로필을 완성하세요
            </p>
          </div>

          {/* 이어하기 배너 */}
          {hasSavedProgress && (
            <div className="mb-6 animate-fade-in-up">
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-sm">이전 작성 내용이 저장되어 있습니다</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {answeredCount}개 질문 답변 완료
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

          {/* 스텝 인디케이터 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                1
              </div>
              <span className="font-medium text-sm">기본 정보</span>
              <div className="flex-1 h-px bg-border" />
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="text-xs text-muted-foreground">경력</span>
              <div className="flex-1 h-px bg-border" />
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">
                3
              </div>
              <span className="text-xs text-muted-foreground">직무</span>
              <div className="flex-1 h-px bg-border" />
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">
                4
              </div>
              <span className="text-xs text-muted-foreground">스타일</span>
            </div>
          </div>

          <SeekerWizardPhase1
            initialData={phase1Data}
            onSubmit={handlePhase1Submit}
          />
        </div>
      </div>
    );
  }

  // Review
  if (phase === 'review') {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-lg">
          {error && (
            <Card className="mb-4 border-destructive">
              <CardContent className="pt-4 pb-3">
                <p className="text-sm text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}
          <SeekerWizardReview
            phase1={phase1Data}
            answers={answers}
            allQuestions={allQuestions}
            onEdit={handleEditFromReview}
            onSubmit={handleSubmit}
            submitting={false}
          />
        </div>
      </div>
    );
  }

  // Phase 2, 3, 4: 질문
  const currentQuestion = currentPhaseQuestions[currentQuestionIndex];
  if (!currentQuestion) {
    goNextPhase();
    return null;
  }

  const phaseLabel =
    phase === 2 ? '경력 & 팀워크' : phase === 3 ? '직군별 질문' : '근무 스타일';
  const phaseProgress = currentPhaseQuestions.length > 0
    ? Math.round(((currentQuestionIndex + 1) / currentPhaseQuestions.length) * 100)
    : 0;
  const currentAnswer = answers[currentQuestion.id];
  const isLastInPhase = currentQuestionIndex === currentPhaseQuestions.length - 1;
  const canGoNext =
    currentAnswer !== undefined &&
    (currentQuestion.inputType !== 'multi-choice' || (Array.isArray(currentAnswer) && currentAnswer.length > 0)) &&
    (currentQuestion.inputType !== 'text-short' || (typeof currentAnswer === 'string' && currentAnswer.trim().length > 0));

  const stepNum = phase as number;
  const completedSteps = Array.from({ length: stepNum - 1 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Milestone */}
        {showMilestone && milestoneMsg && (
          <MilestoneFeedback
            message={milestoneMsg.message}
            progress={milestoneMsg.progress}
            onContinue={handleMilestoneContinue}
          />
        )}

        {/* 스텝 인디케이터 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    s === stepNum
                      ? 'bg-primary text-primary-foreground'
                      : completedSteps.includes(s)
                      ? 'bg-primary/30 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {completedSteps.includes(s) ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    s
                  )}
                </div>
                {s < 4 && <div className={`w-8 h-px ${s < stepNum ? 'bg-primary/30' : 'bg-border'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">{phaseLabel}</h2>
            <span className="text-sm text-muted-foreground">
              {currentQuestionIndex + 1} / {currentPhaseQuestions.length}
            </span>
          </div>

          {/* Phase 진행률 바 */}
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-1">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${phaseProgress}%` }}
            />
          </div>

          {/* 전체 진행률 */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              전체 {overallProgress}% 완료
            </p>
            <p className="text-xs text-muted-foreground">
              {answeredCount} / {totalQuestions} 문항
            </p>
          </div>
        </div>

        {/* 질문 카드 */}
        <div className="mb-6">
          <SeekerQuestionCard
            question={currentQuestion}
            value={currentAnswer}
            onChange={handleAnswer}
            onAutoAdvance={
              currentQuestion.inputType === 'single-choice' || currentQuestion.inputType === 'scale'
                ? handleAutoAdvance
                : undefined
            }
          />
        </div>

        {/* 네비게이션 */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            이전
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canGoNext}
          >
            {isLastInPhase && phase === 4
              ? '결과 확인'
              : isLastInPhase
              ? '다음 단계'
              : '다음'}
          </Button>
        </div>

        {/* Mini progress dots */}
        <div className="mt-6 flex justify-center gap-1 flex-wrap">
          {currentPhaseQuestions.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentQuestionIndex
                  ? 'bg-primary scale-125'
                  : answers[currentPhaseQuestions[index].id] !== undefined
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

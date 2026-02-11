import { type TestResult } from './test-engine';
import { type ComprehensiveProfile } from '@/data/tests/comprehensive';

const STORAGE_KEY = 'metaphoi_test_sessions';
const COMPREHENSIVE_KEY = 'metaphoi_comprehensive';

export interface LocalTestSession {
  testCode: string;
  answers: Record<number, number | string>;
  currentIndex: number;
  startedAt: string;
  completedAt?: string;
  result?: TestResult;
}

export interface ComprehensiveSession {
  personalInfo?: any;
  answers: Record<number, number | string>;
  currentStep: 'info' | 'questions' | 'done';
  currentIndex: number;
  startedAt: string;
  completedAt?: string;
  profile?: ComprehensiveProfile;
}

function getSessions(): Record<string, LocalTestSession> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setSessions(sessions: Record<string, LocalTestSession>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function getSession(testCode: string): LocalTestSession | null {
  const sessions = getSessions();
  return sessions[testCode] || null;
}

export function saveProgress(
  testCode: string,
  answers: Record<number, number | string>,
  currentIndex: number
) {
  const sessions = getSessions();
  const existing = sessions[testCode];

  sessions[testCode] = {
    testCode,
    answers,
    currentIndex,
    startedAt: existing?.startedAt || new Date().toISOString(),
    completedAt: existing?.completedAt,
    result: existing?.result,
  };

  setSessions(sessions);
}

export function completeTest(testCode: string, result: TestResult) {
  const sessions = getSessions();
  const existing = sessions[testCode];

  sessions[testCode] = {
    testCode,
    answers: existing?.answers || {},
    currentIndex: existing?.currentIndex || 0,
    startedAt: existing?.startedAt || new Date().toISOString(),
    completedAt: new Date().toISOString(),
    result,
  };

  setSessions(sessions);
}

export function getAllCompleted(): LocalTestSession[] {
  const sessions = getSessions();
  return Object.values(sessions).filter((s) => s.completedAt && s.result);
}

export function clearSession(testCode: string) {
  const sessions = getSessions();
  delete sessions[testCode];
  setSessions(sessions);
}

export function hasCompletedTest(testCode: string): boolean {
  const session = getSession(testCode);
  return !!(session?.completedAt && session?.result);
}

// === 종합 검사 세션 관리 ===

function getComprehensiveRaw(): ComprehensiveSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(COMPREHENSIVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setComprehensiveRaw(session: ComprehensiveSession) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COMPREHENSIVE_KEY, JSON.stringify(session));
}

export function getComprehensiveSession(): ComprehensiveSession | null {
  return getComprehensiveRaw();
}

export function saveComprehensiveProgress(
  data: Partial<ComprehensiveSession>,
) {
  const existing = getComprehensiveRaw();
  const session: ComprehensiveSession = {
    personalInfo: data.personalInfo ?? existing?.personalInfo,
    answers: data.answers ?? existing?.answers ?? {},
    currentStep: data.currentStep ?? existing?.currentStep ?? 'info',
    currentIndex: data.currentIndex ?? existing?.currentIndex ?? 0,
    startedAt: existing?.startedAt || new Date().toISOString(),
    completedAt: data.completedAt ?? existing?.completedAt,
    profile: data.profile ?? existing?.profile,
  };
  setComprehensiveRaw(session);
}

export function completeComprehensive(profile: ComprehensiveProfile) {
  const existing = getComprehensiveRaw();
  if (!existing) return;
  existing.completedAt = new Date().toISOString();
  existing.currentStep = 'done';
  existing.profile = profile;
  setComprehensiveRaw(existing);
}

export function hasCompletedComprehensive(): boolean {
  const session = getComprehensiveRaw();
  return !!(session?.completedAt && session?.profile);
}

export function clearComprehensive() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(COMPREHENSIVE_KEY);
}

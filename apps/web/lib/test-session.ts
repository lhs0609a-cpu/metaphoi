import { type TestResult } from './test-engine';

const STORAGE_KEY = 'metaphoi_test_sessions';

export interface LocalTestSession {
  testCode: string;
  answers: Record<number, number | string>;
  currentIndex: number;
  startedAt: string;
  completedAt?: string;
  result?: TestResult;
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

const STORAGE_KEY = 'metaphoi_seeker_registration';

export interface SeekerWizardSession {
  phase: 1 | 2 | 3 | 4 | 'review' | 'done';
  phase1: {
    display_name: string;
    headline: string;
    desired_roles: string[];
    desired_industries: string[];
  };
  answers: Record<string, string | string[] | number>;
  computedRoleQuestions: string[];
  currentQuestionIndex: number;
  startedAt: string;
  completedAt?: string;
}

function getRaw(): SeekerWizardSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setRaw(session: SeekerWizardSession) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function getSeekerWizardSession(): SeekerWizardSession | null {
  return getRaw();
}

export function saveSeekerWizardProgress(data: Partial<SeekerWizardSession>) {
  const existing = getRaw();
  const session: SeekerWizardSession = {
    phase: data.phase ?? existing?.phase ?? 1,
    phase1: data.phase1 ?? existing?.phase1 ?? {
      display_name: '',
      headline: '',
      desired_roles: [],
      desired_industries: [],
    },
    answers: data.answers ?? existing?.answers ?? {},
    computedRoleQuestions: data.computedRoleQuestions ?? existing?.computedRoleQuestions ?? [],
    currentQuestionIndex: data.currentQuestionIndex ?? existing?.currentQuestionIndex ?? 0,
    startedAt: existing?.startedAt || new Date().toISOString(),
    completedAt: data.completedAt ?? existing?.completedAt,
  };
  setRaw(session);
}

export function clearSeekerWizardSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

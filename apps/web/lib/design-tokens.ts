// RPG Design Tokens — category colors, rank system, test type colors

export type AbilityCategory = '정신력' | '사회성' | '업무역량' | '신체/감각' | '잠재력';

export interface CategoryColor {
  key: string;
  tw: string;        // Tailwind class prefix (e.g. "cat-mental")
  hsl: string;       // CSS variable name
  bgClass: string;   // bg- class with opacity
  textClass: string; // text- class
  borderClass: string;
}

export const CATEGORY_COLORS: Record<AbilityCategory, CategoryColor> = {
  '정신력': {
    key: 'mental',
    tw: 'cat-mental',
    hsl: 'var(--cat-mental)',
    bgClass: 'bg-cat-mental/10',
    textClass: 'text-cat-mental',
    borderClass: 'border-cat-mental',
  },
  '사회성': {
    key: 'social',
    tw: 'cat-social',
    hsl: 'var(--cat-social)',
    bgClass: 'bg-cat-social/10',
    textClass: 'text-cat-social',
    borderClass: 'border-cat-social',
  },
  '업무역량': {
    key: 'work',
    tw: 'cat-work',
    hsl: 'var(--cat-work)',
    bgClass: 'bg-cat-work/10',
    textClass: 'text-cat-work',
    borderClass: 'border-cat-work',
  },
  '신체/감각': {
    key: 'physical',
    tw: 'cat-physical',
    hsl: 'var(--cat-physical)',
    bgClass: 'bg-cat-physical/10',
    textClass: 'text-cat-physical',
    borderClass: 'border-cat-physical',
  },
  '잠재력': {
    key: 'potential',
    tw: 'cat-potential',
    hsl: 'var(--cat-potential)',
    bgClass: 'bg-cat-potential/10',
    textClass: 'text-cat-potential',
    borderClass: 'border-cat-potential',
  },
};

export type Rank = 'S' | 'A' | 'B' | 'C' | 'D';

export interface RankConfig {
  label: string;
  twColor: string;
  twBg: string;
  twBorder: string;
}

export const RANK_CONFIG: Record<Rank, RankConfig> = {
  S: { label: 'S', twColor: 'text-rank-s', twBg: 'bg-rank-s/15', twBorder: 'border-rank-s' },
  A: { label: 'A', twColor: 'text-rank-a', twBg: 'bg-rank-a/15', twBorder: 'border-rank-a' },
  B: { label: 'B', twColor: 'text-rank-b', twBg: 'bg-rank-b/15', twBorder: 'border-rank-b' },
  C: { label: 'C', twColor: 'text-rank-c', twBg: 'bg-rank-c/15', twBorder: 'border-rank-c' },
  D: { label: 'D', twColor: 'text-rank-d', twBg: 'bg-rank-d/15', twBorder: 'border-rank-d' },
};

export function getRank(score: number): Rank {
  if (score >= 90) return 'S';
  if (score >= 70) return 'A';
  if (score >= 50) return 'B';
  if (score >= 30) return 'C';
  return 'D';
}

export function getCategoryColor(category: string): CategoryColor {
  return CATEGORY_COLORS[category as AbilityCategory] ?? CATEGORY_COLORS['정신력'];
}

// Test type color mapping (aligns with question-utils.ts)
export type TestType = 'mbti' | 'disc' | 'enneagram' | 'holland' | 'sasang' | 'saju' | 'blood';

export interface TestTypeColor {
  tw: string;
  hsl: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export const TEST_TYPE_COLORS: Record<TestType, TestTypeColor> = {
  mbti: {
    tw: 'violet',
    hsl: '263 70% 58%',
    bgClass: 'bg-violet-100 dark:bg-violet-900/30',
    textClass: 'text-violet-700 dark:text-violet-300',
    borderClass: 'border-violet-400 dark:border-violet-600',
  },
  disc: {
    tw: 'blue',
    hsl: '217 91% 60%',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    textClass: 'text-blue-700 dark:text-blue-300',
    borderClass: 'border-blue-400 dark:border-blue-600',
  },
  enneagram: {
    tw: 'amber',
    hsl: '38 92% 50%',
    bgClass: 'bg-amber-100 dark:bg-amber-900/30',
    textClass: 'text-amber-700 dark:text-amber-300',
    borderClass: 'border-amber-400 dark:border-amber-600',
  },
  holland: {
    tw: 'green',
    hsl: '160 84% 39%',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-700 dark:text-green-300',
    borderClass: 'border-green-400 dark:border-green-600',
  },
  sasang: {
    tw: 'rose',
    hsl: '350 89% 60%',
    bgClass: 'bg-rose-100 dark:bg-rose-900/30',
    textClass: 'text-rose-700 dark:text-rose-300',
    borderClass: 'border-rose-400 dark:border-rose-600',
  },
  saju: {
    tw: 'indigo',
    hsl: '234 89% 63%',
    bgClass: 'bg-indigo-100 dark:bg-indigo-900/30',
    textClass: 'text-indigo-700 dark:text-indigo-300',
    borderClass: 'border-indigo-400 dark:border-indigo-600',
  },
  blood: {
    tw: 'pink',
    hsl: '330 81% 60%',
    bgClass: 'bg-pink-100 dark:bg-pink-900/30',
    textClass: 'text-pink-700 dark:text-pink-300',
    borderClass: 'border-pink-400 dark:border-pink-600',
  },
};

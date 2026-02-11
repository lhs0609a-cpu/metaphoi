import { mbtiQuestions, type TestQuestion } from './mbti';
import { discQuestions } from './disc';
import { enneagramQuestions } from './enneagram';
import { hollandQuestions } from './holland';
import { sasangQuestions } from './sasang';

// 종합 검사용 문항 선별
// 각 검사에서 핵심 문항을 선별하여 하나의 통합 검사로 구성

function selectEvenly(questions: TestQuestion[], count: number): TestQuestion[] {
  if (questions.length <= count) return questions;
  const step = questions.length / count;
  const selected: TestQuestion[] = [];
  for (let i = 0; i < count; i++) {
    selected.push(questions[Math.floor(i * step)]);
  }
  return selected;
}

// MBTI: 16문항 (4차원 x 4문항) - 충분한 정확도
const mbtiSubset = selectEvenly(mbtiQuestions, 16);

// DISC: 8문항 (4유형 x 2문항)
const discSubset = selectEvenly(discQuestions, 8);

// Enneagram: 9문항 (9유형 x 1문항)
const enneagramSubset = selectEvenly(enneagramQuestions, 9);

// Holland: 12문항 (6유형 x 2문항)
const hollandSubset = selectEvenly(hollandQuestions, 12);

// Sasang: 8문항 (4체질 x 2문항)
const sasangSubset = selectEvenly(sasangQuestions, 8);

// 문항 섞기 (라운드 로빈 방식으로 다양한 검사가 번갈아 나오도록)
function interleaveQuestions(groups: TestQuestion[][]): TestQuestion[] {
  const result: TestQuestion[] = [];
  const maxLen = Math.max(...groups.map((g) => g.length));

  for (let i = 0; i < maxLen; i++) {
    for (const group of groups) {
      if (i < group.length) {
        result.push(group[i]);
      }
    }
  }

  return result;
}

export const comprehensiveQuestions: TestQuestion[] = interleaveQuestions([
  mbtiSubset,
  discSubset,
  enneagramSubset,
  hollandSubset,
  sasangSubset,
]);

// 각 검사별 전체 문항 (채점용)
export const FULL_QUESTION_SETS = {
  mbti: mbtiQuestions,
  disc: discQuestions,
  enneagram: enneagramQuestions,
  holland: hollandQuestions,
  sasang: sasangQuestions,
} as const;

// 검사별로 사용된 문항 ID 집합
export const QUESTION_ID_RANGES = {
  mbti: new Set(mbtiSubset.map((q) => q.id)),
  disc: new Set(discSubset.map((q) => q.id)),
  enneagram: new Set(enneagramSubset.map((q) => q.id)),
  holland: new Set(hollandSubset.map((q) => q.id)),
  sasang: new Set(sasangSubset.map((q) => q.id)),
} as const;

export interface PersonalInfo {
  name: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHourIdx: number; // 0=모름, 1=자시, ... 12=해시
  gender: '남' | '여';
  bloodType: 'A' | 'B' | 'O' | 'AB';
}

// Raw 점수 (능력치 산출용)
export interface RawTestScores {
  mbti: { E: number; I: number; S: number; N: number; T: number; F: number; J: number; P: number };
  disc: { D: number; I: number; S: number; C: number };
  enneagram: { T1: number; T2: number; T3: number; T4: number; T5: number; T6: number; T7: number; T8: number; T9: number };
  holland: { R: number; I: number; A: number; S: number; E: number; C: number };
  sasang: { TY: number; TE: number; SY: number; SE: number };
  saju: Record<string, number>; // 목/화/토/금/수
}

// 능력치
export interface AbilityScore {
  key: string;
  name: string;
  category: string;
  score: number; // 0-100
  description: string;
}

// 종합 프로필 유형
export interface ComprehensiveProfile {
  personalInfo: PersonalInfo;
  mbti: { type: string; typeName: string; description: string; strengths: string[]; weaknesses: string[] };
  disc: { type: string; typeName: string; description: string };
  enneagram: { type: string; wing: string; typeName: string; description: string };
  holland: { topCode: string; typeName: string; description: string; careers: string[] };
  sasang: { type: string; typeName: string; description: string; bodyType: string };
  saju: { dominant: string; typeName: string; description: string; sajuPalza: any; ohaeng: any[] };
  blood: { type: string; typeName: string; description: string };
  rawScores: RawTestScores;
  abilities: AbilityScore[];
  // 종합 인물 요약
  summary: {
    headline: string;
    personality: string;
    strengths: string[];
    careers: string[];
  };
}

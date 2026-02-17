import { mbtiQuestions, type TestQuestion } from './mbti';
import { discQuestions } from './disc';
import { enneagramQuestions } from './enneagram';
import { hollandQuestions } from './holland';
import { bloodQuestions } from './blood';
import { sasangQuestions } from './sasang';
import { sajuQuestions } from './saju';

export type { TestQuestion };

export interface TestMeta {
  code: string;
  name: string;
  description: string;
  questionCount: number;
  category: 'personality' | 'aptitude' | 'traditional';
  categoryLabel: string;
  estimatedMinutes: number;
  available: boolean;
}

export const TEST_META: TestMeta[] = [
  // 성격 검사
  { code: 'mbti', name: 'MBTI', description: '16가지 성격 유형 분석', questionCount: 48, category: 'personality', categoryLabel: '성격 검사', estimatedMinutes: 10, available: true },
  { code: 'disc', name: 'DISC', description: '행동 유형 분석', questionCount: 28, category: 'personality', categoryLabel: '성격 검사', estimatedMinutes: 7, available: true },
  { code: 'enneagram', name: '에니어그램', description: '9가지 성격 유형', questionCount: 36, category: 'personality', categoryLabel: '성격 검사', estimatedMinutes: 8, available: true },
  { code: 'tci', name: 'TCI', description: '기질 및 성격 검사', questionCount: 140, category: 'personality', categoryLabel: '성격 검사', estimatedMinutes: 25, available: false },
  // 적성/역량 검사
  { code: 'gallup', name: 'Gallup 강점', description: '34개 강점 테마', questionCount: 34, category: 'aptitude', categoryLabel: '적성/역량 검사', estimatedMinutes: 8, available: false },
  { code: 'holland', name: 'Holland', description: '직업 흥미 유형', questionCount: 42, category: 'aptitude', categoryLabel: '적성/역량 검사', estimatedMinutes: 10, available: true },
  { code: 'iq', name: 'IQ 테스트', description: '논리/패턴 분석', questionCount: 30, category: 'aptitude', categoryLabel: '적성/역량 검사', estimatedMinutes: 20, available: false },
  { code: 'mmpi', name: 'MMPI 간이', description: '다면적 인성 검사', questionCount: 50, category: 'aptitude', categoryLabel: '적성/역량 검사', estimatedMinutes: 12, available: false },
  // 전통/특수 검사
  { code: 'tarot', name: '타로', description: '이미지 선택 기반', questionCount: 10, category: 'traditional', categoryLabel: '전통/특수 검사', estimatedMinutes: 3, available: false },
  { code: 'htp', name: 'HTP', description: '그림 심리 검사', questionCount: 3, category: 'traditional', categoryLabel: '전통/특수 검사', estimatedMinutes: 5, available: false },
  { code: 'saju', name: '사주', description: '생년월일시 기반 사주팔자', questionCount: 5, category: 'traditional', categoryLabel: '전통/특수 검사', estimatedMinutes: 2, available: true },
  { code: 'sasang', name: '사상체질', description: '체질 유형 분석', questionCount: 20, category: 'traditional', categoryLabel: '전통/특수 검사', estimatedMinutes: 5, available: true },
  { code: 'face', name: '관상', description: '얼굴 분석', questionCount: 1, category: 'traditional', categoryLabel: '전통/특수 검사', estimatedMinutes: 1, available: false },
  { code: 'blood', name: '혈액형', description: '혈액형 성격 분석', questionCount: 5, category: 'traditional', categoryLabel: '전통/특수 검사', estimatedMinutes: 2, available: true },
];

export function getTestMeta(testCode: string): TestMeta | undefined {
  return TEST_META.find((t) => t.code === testCode);
}

export function getTestQuestions(testCode: string): TestQuestion[] {
  switch (testCode) {
    case 'mbti':
      return mbtiQuestions;
    case 'disc':
      return discQuestions;
    case 'enneagram':
      return enneagramQuestions;
    case 'holland':
      return hollandQuestions;
    case 'blood':
      return bloodQuestions;
    case 'sasang':
      return sasangQuestions;
    case 'saju':
      return sajuQuestions;
    default:
      return [];
  }
}

export function getTestsByCategory() {
  const categories = new Map<string, TestMeta[]>();
  for (const test of TEST_META) {
    const list = categories.get(test.categoryLabel) || [];
    list.push(test);
    categories.set(test.categoryLabel, list);
  }
  return Array.from(categories.entries()).map(([category, tests]) => ({
    category,
    tests,
  }));
}

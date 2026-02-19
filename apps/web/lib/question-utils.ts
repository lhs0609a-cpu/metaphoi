export type TestType = 'mbti' | 'disc' | 'enneagram' | 'holland' | 'sasang';

// Question ID ranges per test type
const TEST_BOUNDARIES: { type: TestType; start: number; end: number }[] = [
  { type: 'mbti', start: 1, end: 48 },
  { type: 'disc', start: 101, end: 128 },
  { type: 'enneagram', start: 201, end: 236 },
  { type: 'holland', start: 301, end: 342 },
  { type: 'sasang', start: 501, end: 520 },
];

export function getTestType(questionId: number): TestType {
  if (questionId >= 1 && questionId <= 48) return 'mbti';
  if (questionId >= 101 && questionId <= 128) return 'disc';
  if (questionId >= 201 && questionId <= 236) return 'enneagram';
  if (questionId >= 301 && questionId <= 342) return 'holland';
  if (questionId >= 501 && questionId <= 520) return 'sasang';
  return 'mbti'; // fallback
}

interface TestTypeInfo {
  label: string;
  analyzing: string;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

const TEST_TYPE_MAP: Record<TestType, TestTypeInfo> = {
  mbti: {
    label: '성격',
    analyzing: '성격 유형 분석 중',
    color: 'violet',
    bgClass: 'bg-violet-100 dark:bg-violet-900/30',
    textClass: 'text-violet-700 dark:text-violet-300',
    borderClass: 'border-violet-400 dark:border-violet-600',
  },
  disc: {
    label: '행동',
    analyzing: '행동 패턴 분석 중',
    color: 'blue',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    textClass: 'text-blue-700 dark:text-blue-300',
    borderClass: 'border-blue-400 dark:border-blue-600',
  },
  enneagram: {
    label: '동기',
    analyzing: '내면 동기 분석 중',
    color: 'amber',
    bgClass: 'bg-amber-100 dark:bg-amber-900/30',
    textClass: 'text-amber-700 dark:text-amber-300',
    borderClass: 'border-amber-400 dark:border-amber-600',
  },
  holland: {
    label: '흥미',
    analyzing: '직업 흥미 분석 중',
    color: 'green',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-700 dark:text-green-300',
    borderClass: 'border-green-400 dark:border-green-600',
  },
  sasang: {
    label: '체질',
    analyzing: '체질 유형 분석 중',
    color: 'rose',
    bgClass: 'bg-rose-100 dark:bg-rose-900/30',
    textClass: 'text-rose-700 dark:text-rose-300',
    borderClass: 'border-rose-400 dark:border-rose-600',
  },
};

export function getTestTypeInfo(questionId: number): TestTypeInfo {
  return TEST_TYPE_MAP[getTestType(questionId)];
}

export function getTestTypeInfoByType(type: TestType): TestTypeInfo {
  return TEST_TYPE_MAP[type];
}

// Get gradient CSS for progress bar based on current test type
export function getProgressGradient(questionId: number): string {
  const type = getTestType(questionId);
  const gradients: Record<TestType, string> = {
    mbti: 'from-violet-500 to-violet-400',
    disc: 'from-blue-500 to-blue-400',
    enneagram: 'from-amber-500 to-amber-400',
    holland: 'from-green-500 to-green-400',
    sasang: 'from-rose-500 to-rose-400',
  };
  return gradients[type];
}

// Get dot color for mini progress dots per test type
export function getDotColor(questionId: number): string {
  const type = getTestType(questionId);
  const colors: Record<TestType, string> = {
    mbti: 'bg-violet-500',
    disc: 'bg-blue-500',
    enneagram: 'bg-amber-500',
    holland: 'bg-green-500',
    sasang: 'bg-rose-500',
  };
  return colors[type];
}

export interface MilestoneFeedback {
  message: string;
  progress: number;
  testCompleted?: TestType;
  testsRemaining?: number;
}

// Compute how many of the 5 test sections are complete given answered question IDs
function getCompletedTests(answeredIds: Set<number>): { completed: TestType[]; total: number } {
  const completed: TestType[] = [];
  for (const b of TEST_BOUNDARIES) {
    const sectionIds: number[] = [];
    for (let id = b.start; id <= b.end; id++) sectionIds.push(id);
    if (sectionIds.every((id) => answeredIds.has(id))) {
      completed.push(b.type);
    }
  }
  return { completed, total: TEST_BOUNDARIES.length };
}

export function getMilestoneFeedback(
  answeredIndex: number,
  total: number,
  allAnsweredIds?: Set<number>,
): MilestoneFeedback | null {
  const answeredCount = answeredIndex + 1;
  const progress = Math.round((answeredCount / total) * 100);

  // Test section boundary milestones
  if (allAnsweredIds) {
    const { completed, total: testTotal } = getCompletedTests(allAnsweredIds);
    const justCompleted = completed.length;

    // Trigger on section boundaries
    if (justCompleted > 0) {
      const lastCompleted = completed[completed.length - 1];
      const label = TEST_TYPE_MAP[lastCompleted]?.label ?? '';

      // Only fire when we just completed a new section (check if previous count was different)
      // Use simple heuristic: fire at specific answer counts that align with section ends
      const sectionEndCounts = [48, 76, 112, 154, 174]; // cumulative question counts
      if (sectionEndCounts.includes(answeredCount)) {
        return {
          message: `${label} 분석 완료! ${justCompleted}/${testTotal} 검사 통과`,
          progress,
          testCompleted: lastCompleted,
          testsRemaining: testTotal - justCompleted,
        };
      }
    }
  }

  // Fallback fixed milestones (reduced set — section boundaries handle most)
  const fixedMilestones: Record<number, string> = {
    5: '좋은 출발이에요! 감이 잡히시죠?',
    30: '3분의 1 돌파! 점점 윤곽이 드러나고 있어요',
    85: '거의 다 왔어요! 마지막 스퍼트',
  };

  const message = fixedMilestones[answeredCount];
  if (!message) return null;
  return { message, progress };
}

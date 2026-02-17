export type TestType = 'mbti' | 'disc' | 'enneagram' | 'holland' | 'sasang';

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
}

const TEST_TYPE_MAP: Record<TestType, TestTypeInfo> = {
  mbti: {
    label: '성격',
    analyzing: '성격 유형 분석 중',
    color: 'violet',
    bgClass: 'bg-violet-100 dark:bg-violet-900/30',
    textClass: 'text-violet-700 dark:text-violet-300',
  },
  disc: {
    label: '행동',
    analyzing: '행동 패턴 분석 중',
    color: 'blue',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    textClass: 'text-blue-700 dark:text-blue-300',
  },
  enneagram: {
    label: '동기',
    analyzing: '내면 동기 분석 중',
    color: 'amber',
    bgClass: 'bg-amber-100 dark:bg-amber-900/30',
    textClass: 'text-amber-700 dark:text-amber-300',
  },
  holland: {
    label: '흥미',
    analyzing: '직업 흥미 분석 중',
    color: 'green',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-700 dark:text-green-300',
  },
  sasang: {
    label: '체질',
    analyzing: '체질 유형 분석 중',
    color: 'rose',
    bgClass: 'bg-rose-100 dark:bg-rose-900/30',
    textClass: 'text-rose-700 dark:text-rose-300',
  },
};

export function getTestTypeInfo(questionId: number): TestTypeInfo {
  return TEST_TYPE_MAP[getTestType(questionId)];
}

const MILESTONE_MESSAGES: Record<number, string> = {
  5: '좋은 출발이에요! 감이 잡히시죠? 이대로 쭉 가볼까요 💪',
  15: '벌써 15문항! 당신의 성격 패턴이 보이기 시작합니다 🔍',
  30: '3분의 1 돌파! 점점 윤곽이 드러나고 있어요 📊',
  45: '절반 돌파! 정확도가 높아지고 있어요 🎯',
  60: '3분의 2 완료! 분석이 정교해지고 있습니다 📈',
  75: '거의 다 왔어요! 마지막 스퍼트 🏁',
  85: '마무리만 남았어요! 결과가 곧 나옵니다 ✨',
};

export function getMilestoneFeedback(
  answeredIndex: number,
  total: number,
): { message: string; progress: number } | null {
  // answeredIndex is 0-based index of the question just answered
  const answeredCount = answeredIndex + 1;
  const message = MILESTONE_MESSAGES[answeredCount];
  if (!message) return null;
  return {
    message,
    progress: Math.round((answeredCount / total) * 100),
  };
}

import { mbtiQuestions, type TestQuestion } from './mbti';
import { discQuestions } from './disc';
import { enneagramQuestions } from './enneagram';
import { hollandQuestions } from './holland';
import { sasangQuestions } from './sasang';

// 종합 검사용 문항 선별
// 각 검사에서 변별력 높은 문항을 선별하여 하나의 통합 검사로 구성

// 변별력 자동 계산: scoringWeight 구조를 분석
function getDiscriminationScore(q: TestQuestion): number {
  const weights = Object.values(q.scoringWeights);
  if (weights.length === 0) return 0;

  if (weights.length === 1) {
    // 단일 지표 문항: weight 절대값이 높을수록 변별력 높음
    return Math.abs(weights[0]);
  }

  // 다중 지표 문항(Sasang 등): primary와 secondary weight 차이가 클수록 변별력 높음
  const sorted = [...weights].sort((a, b) => Math.abs(b) - Math.abs(a));
  const primary = Math.abs(sorted[0]);
  const secondary = sorted.length > 1 ? Math.abs(sorted[1]) : 0;
  return primary - secondary; // 차이가 클수록 특정 유형을 잘 구분
}

// 변별력 기반 문항 선별
// balanceKeys가 제공되면 각 키별로 균등 배분 보장
function selectByDiscrimination(
  questions: TestQuestion[],
  count: number,
  balanceKeys?: string[],
): TestQuestion[] {
  if (questions.length <= count) return [...questions];

  if (balanceKeys && balanceKeys.length > 0) {
    // 키별 균등 배분: 각 키에서 count/keys개씩 선별
    const perKey = Math.floor(count / balanceKeys.length);
    const remainder = count - perKey * balanceKeys.length;
    const selected: TestQuestion[] = [];
    const usedIds = new Set<number>();

    for (let ki = 0; ki < balanceKeys.length; ki++) {
      const key = balanceKeys[ki];
      const keyQuestions = questions.filter((q) => q.polarity === key);

      // 변별력 순으로 정렬
      const sorted = [...keyQuestions].sort(
        (a, b) => getDiscriminationScore(b) - getDiscriminationScore(a),
      );

      // 양극성 균형을 위해 각 키에서 perKey개 선택 (+ 나머지 분배)
      const take = ki < remainder ? perKey + 1 : perKey;
      for (let i = 0; i < take && i < sorted.length; i++) {
        if (!usedIds.has(sorted[i].id)) {
          selected.push(sorted[i]);
          usedIds.add(sorted[i].id);
        }
      }
    }

    return selected;
  }

  // balanceKeys가 없으면 변별력 순 선택
  const sorted = [...questions].sort(
    (a, b) => getDiscriminationScore(b) - getDiscriminationScore(a),
  );
  return sorted.slice(0, count);
}

// MBTI: 28문항 (4차원 x 7문항, 양극성 균형)
const mbtiSubset = selectByDiscrimination(
  mbtiQuestions, 28,
  ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'], // 8극 × 3.5문항 ≈ 차원당 7문항
);

// DISC: 16문항 (4유형 x 4문항)
const discSubset = selectByDiscrimination(
  discQuestions, 16,
  ['D', 'I', 'S', 'C'],
);

// Enneagram: 18문항 (9유형 x 2문항)
const enneagramSubset = selectByDiscrimination(
  enneagramQuestions, 18,
  ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9'],
);

// Holland: 18문항 (6유형 x 3문항)
const hollandSubset = selectByDiscrimination(
  hollandQuestions, 18,
  ['R', 'I', 'A', 'S', 'E', 'C'],
);

// Sasang: 10문항 (4체질 x 2~3문항)
const sasangSubset = selectByDiscrimination(
  sasangQuestions, 10,
  ['TY', 'TE', 'SY', 'SE'],
);

// 문항 섞기: 초반에 MBTI(익숙한 유형)를 더 배치하여 이탈 방지
// Phase 1 (1~5): MBTI 3 + DISC 1 + 에니어그램 1 → 익숙한 질문으로 진입장벽 낮춤
// Phase 2 (6~90): 나머지 85문항 라운드 로빈
function interleaveWithFrontload(groups: TestQuestion[][]): TestQuestion[] {
  const [mbti, disc, enneagram, holland, sasang] = groups.map((g) => [...g]);
  const result: TestQuestion[] = [];

  // Phase 1: MBTI 앞부분 3개 + DISC 1 + 에니어그램 1 → 초반 5문항
  for (let i = 0; i < 3 && mbti.length > 0; i++) result.push(mbti.shift()!);
  if (disc.length > 0) result.push(disc.shift()!);
  if (enneagram.length > 0) result.push(enneagram.shift()!);

  // Phase 2: 나머지를 라운드 로빈
  const remaining = [mbti, disc, enneagram, holland, sasang];
  const maxLen = Math.max(...remaining.map((g) => g.length));

  for (let i = 0; i < maxLen; i++) {
    for (const group of remaining) {
      if (i < group.length) {
        result.push(group[i]);
      }
    }
  }

  return result;
}

export const comprehensiveQuestions: TestQuestion[] = interleaveWithFrontload([
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

// 신뢰도 정보
export interface ReliabilityInfo {
  overallReliability: number;
  consistencyScore: number;
  flags: string[];
  testReliability: Record<string, number>;
}

// 종합 프로필 유형
export interface ComprehensiveProfile {
  personalInfo: PersonalInfo;
  mbti: { type: string; typeName: string; description: string; strengths: string[]; weaknesses: string[]; dimensions?: { label: string; score: number; left: string; right: string }[] };
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
  // 신뢰도 정보 (응답 일관성 + 교차 검증)
  reliability?: ReliabilityInfo;
}

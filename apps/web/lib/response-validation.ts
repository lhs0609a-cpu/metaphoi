import { type TestQuestion } from '@/data/tests/mbti';
import { getTestType } from './question-utils';

export interface ConsistencyResult {
  overallReliability: number;  // 0-1
  flags: string[];
  testReliability: Record<string, number>;
}

// 직선 응답 감지: 전체 답변 중 가장 많이 선택된 값의 비율
function detectStraightLining(answers: Record<number, number | string>): { ratio: number; flagged: boolean } {
  const values = Object.values(answers).filter((v): v is number => typeof v === 'number');
  if (values.length === 0) return { ratio: 0, flagged: false };

  const counts: Record<number, number> = {};
  for (const v of values) {
    counts[v] = (counts[v] || 0) + 1;
  }
  const maxCount = Math.max(...Object.values(counts));
  const ratio = maxCount / values.length;

  return { ratio, flagged: ratio >= 0.5 };
}

// 극단 응답 감지: 1 또는 5만 선택하는 비율
function detectExtremeResponding(answers: Record<number, number | string>): { ratio: number; flagged: boolean } {
  const values = Object.values(answers).filter((v): v is number => typeof v === 'number');
  if (values.length === 0) return { ratio: 0, flagged: false };

  const extremeCount = values.filter((v) => v === 1 || v === 5).length;
  const ratio = extremeCount / values.length;

  return { ratio, flagged: ratio >= 0.7 };
}

// 중간 응답 편향: 3만 선택하는 비율
function detectMidpointClustering(answers: Record<number, number | string>): { ratio: number; flagged: boolean } {
  const values = Object.values(answers).filter((v): v is number => typeof v === 'number');
  if (values.length === 0) return { ratio: 0, flagged: false };

  const midCount = values.filter((v) => v === 3).length;
  const ratio = midCount / values.length;

  return { ratio, flagged: ratio >= 0.6 };
}

// Split-half reliability: 같은 차원을 측정하는 홀수/짝수 문항 상관계수
function computeSplitHalfReliability(
  answers: Record<number, number | string>,
  questions: TestQuestion[],
): Record<string, number> {
  // 검사별로 문항을 그룹화
  const testGroups: Record<string, { dimension: string; index: number; value: number }[]> = {};

  for (const q of questions) {
    const qId = q.id;
    const answer = answers[qId];
    if (typeof answer !== 'number') continue;

    const testType = getTestType(qId);
    if (!testGroups[testType]) testGroups[testType] = [];

    const dimension = q.polarity || Object.keys(q.scoringWeights)[0] || 'unknown';
    testGroups[testType].push({ dimension, index: testGroups[testType].length, value: answer });
  }

  const reliabilities: Record<string, number> = {};

  for (const [testType, items] of Object.entries(testGroups)) {
    // MBTI: 차원 쌍별로 일관성 계산
    const dimensionGroups: Record<string, number[]> = {};
    for (const item of items) {
      // MBTI 차원을 쌍으로 그룹화
      let dimKey = item.dimension;
      if (testType === 'mbti') {
        if (dimKey === 'E' || dimKey === 'I') dimKey = 'EI';
        else if (dimKey === 'S' || dimKey === 'N') dimKey = 'SN';
        else if (dimKey === 'T' || dimKey === 'F') dimKey = 'TF';
        else if (dimKey === 'J' || dimKey === 'P') dimKey = 'JP';
      }
      if (!dimensionGroups[dimKey]) dimensionGroups[dimKey] = [];
      dimensionGroups[dimKey].push(item.value);
    }

    // 각 차원 그룹에서 홀수/짝수 분리 후 상관계수 계산
    const dimReliabilities: number[] = [];
    for (const values of Object.values(dimensionGroups)) {
      if (values.length < 4) {
        dimReliabilities.push(0.7); // 문항이 적으면 기본값
        continue;
      }
      const odd = values.filter((_, i) => i % 2 === 0);
      const even = values.filter((_, i) => i % 2 === 1);
      const r = pearsonCorrelation(odd, even);
      // Spearman-Brown correction: 2r / (1 + r)
      const corrected = isNaN(r) ? 0.5 : (2 * r) / (1 + Math.abs(r));
      dimReliabilities.push(Math.max(0, Math.min(1, corrected)));
    }

    reliabilities[testType] = dimReliabilities.length > 0
      ? dimReliabilities.reduce((a, b) => a + b, 0) / dimReliabilities.length
      : 0.5;
  }

  return reliabilities;
}

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;

  const meanX = x.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const meanY = y.slice(0, n).reduce((a, b) => a + b, 0) / n;

  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    sumXY += dx * dy;
    sumX2 += dx * dx;
    sumY2 += dy * dy;
  }

  const denom = Math.sqrt(sumX2 * sumY2);
  if (denom === 0) return 0;
  return sumXY / denom;
}

export function validateResponses(
  answers: Record<number, number | string>,
  questions: TestQuestion[],
): ConsistencyResult {
  const flags: string[] = [];

  const straightLine = detectStraightLining(answers);
  if (straightLine.flagged) {
    flags.push(`직선 응답이 감지되었습니다 (동일 답변 ${Math.round(straightLine.ratio * 100)}%)`);
  }

  const extreme = detectExtremeResponding(answers);
  if (extreme.flagged) {
    flags.push(`극단 응답이 감지되었습니다 (1 또는 5 선택 ${Math.round(extreme.ratio * 100)}%)`);
  }

  const midpoint = detectMidpointClustering(answers);
  if (midpoint.flagged) {
    flags.push(`중간 응답 편향이 감지되었습니다 (보통 선택 ${Math.round(midpoint.ratio * 100)}%)`);
  }

  const testReliability = computeSplitHalfReliability(answers, questions);

  // 전체 신뢰도 계산: 패턴 감지 페널티 + split-half 평균
  let patternPenalty = 1.0;
  if (straightLine.flagged) patternPenalty -= 0.3;
  if (extreme.flagged) patternPenalty -= 0.2;
  if (midpoint.flagged) patternPenalty -= 0.25;
  patternPenalty = Math.max(0, patternPenalty);

  const avgTestReliability = Object.values(testReliability).length > 0
    ? Object.values(testReliability).reduce((a, b) => a + b, 0) / Object.values(testReliability).length
    : 0.5;

  const overallReliability = Math.max(0, Math.min(1, patternPenalty * avgTestReliability));

  return {
    overallReliability,
    flags,
    testReliability,
  };
}

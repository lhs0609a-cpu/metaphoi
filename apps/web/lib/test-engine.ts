import { type TestQuestion } from '@/data/tests';
import { MBTI_TYPE_DESCRIPTIONS, MBTI_DIMENSIONS } from '@/data/tests/mbti';

export interface TestResult {
  testCode: string;
  resultType: string;
  rawScores: Record<string, unknown>;
  interpretation: Record<string, unknown>;
}

// 퍼센트 계산 유틸
function calcPercentage(a: number, b: number): { first: number; second: number } {
  const total = Math.abs(a) + Math.abs(b);
  if (total === 0) return { first: 50, second: 50 };
  return {
    first: Math.round((Math.abs(a) / total) * 1000) / 10,
    second: Math.round((Math.abs(b) / total) * 1000) / 10,
  };
}

// MBTI 채점
function scoreMBTI(
  questions: TestQuestion[],
  answers: Record<number, number | string>
): TestResult {
  const scores: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

  for (const question of questions) {
    const answer = answers[question.id];
    if (answer === undefined || answer === null) continue;

    const numAnswer = typeof answer === 'number' ? answer : parseInt(String(answer), 10);
    if (isNaN(numAnswer)) continue;

    for (const [indicator, weight] of Object.entries(question.scoringWeights)) {
      if (indicator in scores) {
        scores[indicator] += weight * numAnswer;
      }
    }
  }

  // 유형 결정
  let typeCode = '';
  typeCode += scores.E >= scores.I ? 'E' : 'I';
  typeCode += scores.S >= scores.N ? 'S' : 'N';
  typeCode += scores.T >= scores.F ? 'T' : 'F';
  typeCode += scores.J >= scores.P ? 'J' : 'P';

  const rawScores = {
    type: typeCode,
    E: scores.E,
    I: scores.I,
    S: scores.S,
    N: scores.N,
    T: scores.T,
    F: scores.F,
    J: scores.J,
    P: scores.P,
    E_I_pct: calcPercentage(scores.E, scores.I),
    S_N_pct: calcPercentage(scores.S, scores.N),
    T_F_pct: calcPercentage(scores.T, scores.F),
    J_P_pct: calcPercentage(scores.J, scores.P),
  };

  const typeInfo = MBTI_TYPE_DESCRIPTIONS[typeCode] || {
    name: 'Unknown',
    description: '',
    strengths: [],
    weaknesses: [],
  };

  const interpretation = {
    type: typeCode,
    typeName: typeInfo.name,
    description: typeInfo.description,
    strengths: typeInfo.strengths,
    weaknesses: typeInfo.weaknesses,
    dimensions: {
      'E-I': {
        result: typeCode[0],
        E_label: MBTI_DIMENSIONS['E-I'].E,
        I_label: MBTI_DIMENSIONS['E-I'].I,
        percentage: rawScores.E_I_pct,
      },
      'S-N': {
        result: typeCode[1],
        S_label: MBTI_DIMENSIONS['S-N'].S,
        N_label: MBTI_DIMENSIONS['S-N'].N,
        percentage: rawScores.S_N_pct,
      },
      'T-F': {
        result: typeCode[2],
        T_label: MBTI_DIMENSIONS['T-F'].T,
        F_label: MBTI_DIMENSIONS['T-F'].F,
        percentage: rawScores.T_F_pct,
      },
      'J-P': {
        result: typeCode[3],
        J_label: MBTI_DIMENSIONS['J-P'].J,
        P_label: MBTI_DIMENSIONS['J-P'].P,
        percentage: rawScores.J_P_pct,
      },
    },
  };

  return {
    testCode: 'mbti',
    resultType: typeCode,
    rawScores,
    interpretation,
  };
}

// 메인 채점 함수
export function scoreTest(
  testCode: string,
  questions: TestQuestion[],
  answers: Record<number, number | string>
): TestResult | null {
  switch (testCode) {
    case 'mbti':
      return scoreMBTI(questions, answers);
    default:
      return null;
  }
}

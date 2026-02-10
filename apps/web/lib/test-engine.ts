import { type TestQuestion } from '@/data/tests';
import { MBTI_TYPE_DESCRIPTIONS, MBTI_DIMENSIONS } from '@/data/tests/mbti';
import { DISC_TYPE_DESCRIPTIONS, DISC_DIMENSIONS } from '@/data/tests/disc';
import { ENNEAGRAM_TYPE_DESCRIPTIONS } from '@/data/tests/enneagram';
import { HOLLAND_TYPE_DESCRIPTIONS } from '@/data/tests/holland';
import { BLOOD_TYPE_DESCRIPTIONS } from '@/data/tests/blood';
import { SASANG_TYPE_DESCRIPTIONS } from '@/data/tests/sasang';
import {
  SAJU_TYPE_DESCRIPTIONS,
  getYearGanji,
  getMonthGanji,
  getDayGanji,
  getHourGanji,
  calculateOhaengScores,
  CHEONGAN,
  OHAENG,
} from '@/data/tests/saju';

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

// 점수 기반 범용 채점 (최고 점수 유형 반환)
function scoreByHighest(
  questions: TestQuestion[],
  answers: Record<number, number | string>,
  keys: string[]
): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const k of keys) scores[k] = 0;

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

  return scores;
}

// 점수를 백분율로 정규화
function normalizeScores(scores: Record<string, number>): Record<string, number> {
  const total = Object.values(scores).reduce((s, v) => s + v, 0);
  if (total === 0) return scores;
  const normalized: Record<string, number> = {};
  for (const [k, v] of Object.entries(scores)) {
    normalized[k] = Math.round((v / total) * 1000) / 10;
  }
  return normalized;
}

// ===== MBTI 채점 =====
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
      if (indicator in scores) scores[indicator] += weight * numAnswer;
    }
  }

  let typeCode = '';
  typeCode += scores.E >= scores.I ? 'E' : 'I';
  typeCode += scores.S >= scores.N ? 'S' : 'N';
  typeCode += scores.T >= scores.F ? 'T' : 'F';
  typeCode += scores.J >= scores.P ? 'J' : 'P';

  const rawScores = {
    type: typeCode, ...scores,
    E_I_pct: calcPercentage(scores.E, scores.I),
    S_N_pct: calcPercentage(scores.S, scores.N),
    T_F_pct: calcPercentage(scores.T, scores.F),
    J_P_pct: calcPercentage(scores.J, scores.P),
  };

  const typeInfo = MBTI_TYPE_DESCRIPTIONS[typeCode] || { name: 'Unknown', description: '', strengths: [], weaknesses: [] };

  return {
    testCode: 'mbti',
    resultType: typeCode,
    rawScores,
    interpretation: {
      type: typeCode, typeName: typeInfo.name, description: typeInfo.description,
      strengths: typeInfo.strengths, weaknesses: typeInfo.weaknesses,
      dimensions: {
        'E-I': { result: typeCode[0], E_label: MBTI_DIMENSIONS['E-I'].E, I_label: MBTI_DIMENSIONS['E-I'].I, percentage: rawScores.E_I_pct },
        'S-N': { result: typeCode[1], S_label: MBTI_DIMENSIONS['S-N'].S, N_label: MBTI_DIMENSIONS['S-N'].N, percentage: rawScores.S_N_pct },
        'T-F': { result: typeCode[2], T_label: MBTI_DIMENSIONS['T-F'].T, F_label: MBTI_DIMENSIONS['T-F'].F, percentage: rawScores.T_F_pct },
        'J-P': { result: typeCode[3], J_label: MBTI_DIMENSIONS['J-P'].J, P_label: MBTI_DIMENSIONS['J-P'].P, percentage: rawScores.J_P_pct },
      },
    },
  };
}

// ===== DISC 채점 =====
function scoreDISC(
  questions: TestQuestion[],
  answers: Record<number, number | string>
): TestResult {
  const scores = scoreByHighest(questions, answers, ['D', 'I', 'S', 'C']);
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const primaryType = sorted[0][0];
  const secondaryType = sorted[1][0];
  const resultType = primaryType;
  const pct = normalizeScores(scores);

  const typeInfo = DISC_TYPE_DESCRIPTIONS[primaryType] || { name: 'Unknown', description: '', strengths: [], weaknesses: [] };

  return {
    testCode: 'disc',
    resultType,
    rawScores: { scores, percentages: pct, primary: primaryType, secondary: secondaryType },
    interpretation: {
      type: resultType, typeName: typeInfo.name, description: typeInfo.description,
      strengths: typeInfo.strengths, weaknesses: typeInfo.weaknesses,
      primary: primaryType, secondary: secondaryType,
      dimensions: Object.entries(DISC_DIMENSIONS).map(([key, dim]) => ({
        key, label: dim.label, score: scores[key], percentage: pct[key],
      })),
    },
  };
}

// ===== Enneagram 채점 =====
function scoreEnneagram(
  questions: TestQuestion[],
  answers: Record<number, number | string>
): TestResult {
  const keys = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9'];
  const scores = scoreByHighest(questions, answers, keys);
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const primaryKey = sorted[0][0];
  const primaryNum = primaryKey.replace('T', '');
  const pct = normalizeScores(scores);

  const typeInfo = ENNEAGRAM_TYPE_DESCRIPTIONS[primaryNum] || { name: 'Unknown', description: '', strengths: [], weaknesses: [], wing1: '', wing2: '' };

  // 날개 결정: 인접 유형 중 높은 점수
  const num = parseInt(primaryNum);
  const wing1Num = num === 1 ? 9 : num - 1;
  const wing2Num = num === 9 ? 1 : num + 1;
  const wing1Score = scores[`T${wing1Num}`] || 0;
  const wing2Score = scores[`T${wing2Num}`] || 0;
  const wing = wing1Score >= wing2Score ? wing1Num : wing2Num;

  return {
    testCode: 'enneagram',
    resultType: `${primaryNum}w${wing}`,
    rawScores: { scores, percentages: pct },
    interpretation: {
      type: primaryNum, typeName: typeInfo.name, description: typeInfo.description,
      strengths: typeInfo.strengths, weaknesses: typeInfo.weaknesses,
      wing, wingLabel: `${primaryNum}w${wing}`,
      allScores: keys.map((k) => ({
        type: k.replace('T', ''),
        name: ENNEAGRAM_TYPE_DESCRIPTIONS[k.replace('T', '')]?.name || '',
        score: scores[k],
        percentage: pct[k],
      })),
    },
  };
}

// ===== Holland RIASEC 채점 =====
function scoreHolland(
  questions: TestQuestion[],
  answers: Record<number, number | string>
): TestResult {
  const keys = ['R', 'I', 'A', 'S', 'E', 'C'];
  const scores = scoreByHighest(questions, answers, keys);
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top3 = sorted.slice(0, 3).map(([k]) => k);
  const resultType = top3.join('');
  const primaryType = sorted[0][0];
  const pct = normalizeScores(scores);

  const typeInfo = HOLLAND_TYPE_DESCRIPTIONS[primaryType] || { name: 'Unknown', description: '', strengths: [], weaknesses: [], careers: [] };

  return {
    testCode: 'holland',
    resultType,
    rawScores: { scores, percentages: pct, top3 },
    interpretation: {
      type: resultType, typeName: typeInfo.name, description: typeInfo.description,
      strengths: typeInfo.strengths, weaknesses: typeInfo.weaknesses,
      careers: typeInfo.careers,
      allScores: keys.map((k) => ({
        key: k, name: HOLLAND_TYPE_DESCRIPTIONS[k]?.name || k,
        score: scores[k], percentage: pct[k],
      })),
    },
  };
}

// ===== 혈액형 채점 =====
function scoreBlood(
  questions: TestQuestion[],
  answers: Record<number, number | string>
): TestResult {
  // 첫 문항(choice)에서 혈액형 직접 선택
  const firstAnswer = answers[questions[0]?.id];
  const bloodTypes = ['A', 'B', 'O', 'AB'];
  let selectedType = 'A';

  if (typeof firstAnswer === 'number' && firstAnswer >= 0 && firstAnswer < bloodTypes.length) {
    selectedType = bloodTypes[firstAnswer];
  }

  // 나머지 문항 점수도 참고
  const scores = scoreByHighest(questions.slice(1), answers, ['A', 'B', 'O', 'AB']);
  const pct = normalizeScores(scores);

  const typeInfo = BLOOD_TYPE_DESCRIPTIONS[selectedType] || { name: 'Unknown', description: '', strengths: [], weaknesses: [] };

  return {
    testCode: 'blood',
    resultType: selectedType,
    rawScores: { selectedType, scores, percentages: pct },
    interpretation: {
      type: selectedType, typeName: typeInfo.name, description: typeInfo.description,
      strengths: typeInfo.strengths, weaknesses: typeInfo.weaknesses,
    },
  };
}

// ===== 사상체질 채점 =====
function scoreSasang(
  questions: TestQuestion[],
  answers: Record<number, number | string>
): TestResult {
  const scores = scoreByHighest(questions, answers, ['TY', 'TE', 'SY', 'SE']);
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const primaryType = sorted[0][0];
  const pct = normalizeScores(scores);

  const typeInfo = SASANG_TYPE_DESCRIPTIONS[primaryType] || { name: 'Unknown', description: '', strengths: [], weaknesses: [], bodyType: '', healthTips: [] };

  return {
    testCode: 'sasang',
    resultType: primaryType,
    rawScores: { scores, percentages: pct },
    interpretation: {
      type: primaryType, typeName: typeInfo.name, description: typeInfo.description,
      strengths: typeInfo.strengths, weaknesses: typeInfo.weaknesses,
      bodyType: typeInfo.bodyType, healthTips: typeInfo.healthTips,
      allScores: ['TY', 'TE', 'SY', 'SE'].map((k) => ({
        key: k, name: SASANG_TYPE_DESCRIPTIONS[k]?.name || k,
        score: scores[k], percentage: pct[k],
      })),
    },
  };
}

// ===== 사주 채점 =====
function scoreSaju(
  questions: TestQuestion[],
  answers: Record<number, number | string>
): TestResult {
  // 생년월일시 추출
  const yearAnswer = answers[601];
  const monthAnswer = answers[602];
  const dayAnswer = answers[603];
  const hourAnswer = answers[604];
  const genderAnswer = answers[605];

  const year = typeof yearAnswer === 'number' ? 1965 + yearAnswer : 2000;
  const month = typeof monthAnswer === 'number' ? monthAnswer + 1 : 1;
  const day = typeof dayAnswer === 'number' ? dayAnswer + 1 : 1;
  const hourIdx = typeof hourAnswer === 'number' ? hourAnswer : 0; // 0 = 모름
  const gender = typeof genderAnswer === 'number' ? (genderAnswer === 0 ? '남' : '여') : '남';

  // 사주팔자 계산
  const yearGanji = getYearGanji(year);
  const monthGanji = getMonthGanji(year, month);
  const dayGanji = getDayGanji(year, month, day);

  let hourGanji: { cheongan: string; jiji: string } | undefined;
  if (hourIdx > 0) {
    const dayCgIdx = CHEONGAN.indexOf(dayGanji.cheongan);
    hourGanji = getHourGanji(dayCgIdx, hourIdx - 1);
  }

  // 오행 점수 계산
  const ohaengScores = calculateOhaengScores(yearGanji, monthGanji, dayGanji, hourGanji);
  const sorted = Object.entries(ohaengScores).sort((a, b) => b[1] - a[1]);
  const dominant = sorted[0][0];
  const weakest = sorted[sorted.length - 1][0];

  const typeInfo = SAJU_TYPE_DESCRIPTIONS[dominant] || { name: 'Unknown', description: '', strengths: [], weaknesses: [], career: [], advice: '' };

  const sajuPalza = {
    year: yearGanji,
    month: monthGanji,
    day: dayGanji,
    hour: hourGanji || null,
  };

  return {
    testCode: 'saju',
    resultType: dominant,
    rawScores: {
      birthInfo: { year, month, day, hourIdx, gender },
      sajuPalza,
      ohaengScores,
      dominant,
      weakest,
    },
    interpretation: {
      type: dominant,
      typeName: typeInfo.name,
      description: typeInfo.description,
      strengths: typeInfo.strengths,
      weaknesses: typeInfo.weaknesses,
      career: typeInfo.career,
      advice: typeInfo.advice,
      sajuPalza,
      ohaeng: Object.entries(OHAENG).map(([key, info]) => ({
        key, label: info.label, color: info.color, description: info.description,
        score: ohaengScores[key], isDominant: key === dominant, isWeakest: key === weakest,
      })),
      gender,
      birthYear: year, birthMonth: month, birthDay: day,
    },
  };
}

// ===== 메인 채점 함수 =====
export function scoreTest(
  testCode: string,
  questions: TestQuestion[],
  answers: Record<number, number | string>
): TestResult | null {
  switch (testCode) {
    case 'mbti':
      return scoreMBTI(questions, answers);
    case 'disc':
      return scoreDISC(questions, answers);
    case 'enneagram':
      return scoreEnneagram(questions, answers);
    case 'holland':
      return scoreHolland(questions, answers);
    case 'blood':
      return scoreBlood(questions, answers);
    case 'sasang':
      return scoreSasang(questions, answers);
    case 'saju':
      return scoreSaju(questions, answers);
    default:
      return null;
  }
}

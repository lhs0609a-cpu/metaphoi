import { scoreTest, type TestResult } from './test-engine';
import {
  FULL_QUESTION_SETS,
  type PersonalInfo,
  type ComprehensiveProfile,
  type RawTestScores,
} from '@/data/tests/comprehensive';
import { computeAbilities } from './abilities-scoring';
import { BLOOD_TYPE_DESCRIPTIONS } from '@/data/tests/blood';
import {
  getYearGanji,
  getMonthGanji,
  getDayGanji,
  getHourGanji,
  calculateOhaengScores,
  SAJU_TYPE_DESCRIPTIONS,
  CHEONGAN,
  OHAENG,
} from '@/data/tests/saju';

// 사주 채점 (개인정보 기반)
function scoreSajuFromInfo(info: PersonalInfo) {
  const yearGanji = getYearGanji(info.birthYear);
  const monthGanji = getMonthGanji(info.birthYear, info.birthMonth);
  const dayGanji = getDayGanji(info.birthYear, info.birthMonth, info.birthDay);

  let hourGanji: { cheongan: string; jiji: string } | undefined;
  if (info.birthHourIdx > 0) {
    const dayCgIdx = CHEONGAN.indexOf(dayGanji.cheongan);
    hourGanji = getHourGanji(dayCgIdx, info.birthHourIdx - 1);
  }

  const ohaengScores = calculateOhaengScores(yearGanji, monthGanji, dayGanji, hourGanji);
  const sorted = Object.entries(ohaengScores).sort((a, b) => b[1] - a[1]);
  const dominant = sorted[0][0];
  const weakest = sorted[sorted.length - 1][0];

  const typeInfo = SAJU_TYPE_DESCRIPTIONS[dominant] || {
    name: 'Unknown', description: '', strengths: [], weaknesses: [], career: [], advice: '',
  };

  return {
    dominant,
    weakest,
    typeInfo,
    sajuPalza: { year: yearGanji, month: monthGanji, day: dayGanji, hour: hourGanji || null },
    ohaengScores,
    ohaeng: Object.entries(OHAENG).map(([key, info]) => ({
      key, label: info.label, color: info.color, description: info.description,
      score: ohaengScores[key], isDominant: key === dominant, isWeakest: key === weakest,
    })),
  };
}

// 종합 인물 요약 생성
function generateSummary(
  mbtiResult: TestResult,
  discResult: TestResult,
  enneagramResult: TestResult,
  hollandResult: TestResult,
  sajuDominant: string,
): { headline: string; personality: string; strengths: string[]; careers: string[] } {
  const mbti = mbtiResult.interpretation as any;
  const disc = discResult.interpretation as any;
  const enneagram = enneagramResult.interpretation as any;
  const holland = hollandResult.interpretation as any;

  // MBTI 기반 핵심 키워드
  const mbtiType = mbti.type || mbtiResult.resultType;
  const discType = disc.typeName || disc.type;
  const enneaType = enneagram.typeName || '';

  const headline = `${mbtiType} | ${discType} | 에니어그램 ${enneagram.type}유형`;

  // 성격 종합 설명
  const personality = `당신은 ${mbti.typeName || mbtiType} 유형으로, ${mbti.description || '독특한 개성을 가진 사람'}입니다. ` +
    `행동 면에서는 ${disc.description || '뚜렷한 행동 패턴'}을 보이며, ` +
    `내면적으로는 에니어그램 ${enneaType}의 특성이 강합니다. ` +
    `사주적으로는 ${SAJU_TYPE_DESCRIPTIONS[sajuDominant]?.name || sajuDominant} 기질이 두드러집니다.`;

  // 강점 합산 (중복 제거, 최대 8개)
  const allStrengths = [
    ...(mbti.strengths || []),
    ...(disc.strengths || []),
    ...(enneagram.strengths || []),
  ];
  const strengths = [...new Set(allStrengths)].slice(0, 8);

  // 직업 추천 (Holland + Saju)
  const hollandCareers = holland.careers || [];
  const sajuCareers = SAJU_TYPE_DESCRIPTIONS[sajuDominant]?.career || [];
  const careers = [...new Set([...hollandCareers, ...sajuCareers])].slice(0, 6);

  return { headline, personality, strengths, careers };
}

// 종합 채점 메인 함수
export function scoreComprehensive(
  personalInfo: PersonalInfo,
  answers: Record<number, number | string>,
): ComprehensiveProfile {
  // 1) 각 검사별 채점 (전체 문항 배열 전달, 답변은 부분집합)
  const mbtiResult = scoreTest('mbti', FULL_QUESTION_SETS.mbti, answers)!;
  const discResult = scoreTest('disc', FULL_QUESTION_SETS.disc, answers)!;
  const enneagramResult = scoreTest('enneagram', FULL_QUESTION_SETS.enneagram, answers)!;
  const hollandResult = scoreTest('holland', FULL_QUESTION_SETS.holland, answers)!;
  const sasangResult = scoreTest('sasang', FULL_QUESTION_SETS.sasang, answers)!;

  // 2) 사주 채점 (개인정보에서)
  const sajuData = scoreSajuFromInfo(personalInfo);

  // 3) 혈액형
  const bloodInfo = BLOOD_TYPE_DESCRIPTIONS[personalInfo.bloodType] || {
    name: 'Unknown', description: '', strengths: [], weaknesses: [],
  };

  // 4) 각 결과 해석 추출
  const mbtiInterp = mbtiResult.interpretation as any;
  const discInterp = discResult.interpretation as any;
  const enneagramInterp = enneagramResult.interpretation as any;
  const hollandInterp = hollandResult.interpretation as any;
  const sasangInterp = sasangResult.interpretation as any;

  // 5) Raw 점수 추출 (능력치 산출용)
  const mbtiRaw = mbtiResult.rawScores as any;
  const discRaw = discResult.rawScores as any;
  const enneagramRaw = enneagramResult.rawScores as any;
  const hollandRaw = hollandResult.rawScores as any;
  const sasangRaw = sasangResult.rawScores as any;

  const rawScores: RawTestScores = {
    mbti: {
      E: mbtiRaw.E || 0, I: mbtiRaw.I || 0,
      S: mbtiRaw.S || 0, N: mbtiRaw.N || 0,
      T: mbtiRaw.T || 0, F: mbtiRaw.F || 0,
      J: mbtiRaw.J || 0, P: mbtiRaw.P || 0,
    },
    disc: {
      D: discRaw.scores?.D || 0, I: discRaw.scores?.I || 0,
      S: discRaw.scores?.S || 0, C: discRaw.scores?.C || 0,
    },
    enneagram: {
      T1: enneagramRaw.scores?.T1 || 0, T2: enneagramRaw.scores?.T2 || 0,
      T3: enneagramRaw.scores?.T3 || 0, T4: enneagramRaw.scores?.T4 || 0,
      T5: enneagramRaw.scores?.T5 || 0, T6: enneagramRaw.scores?.T6 || 0,
      T7: enneagramRaw.scores?.T7 || 0, T8: enneagramRaw.scores?.T8 || 0,
      T9: enneagramRaw.scores?.T9 || 0,
    },
    holland: {
      R: hollandRaw.scores?.R || 0, I: hollandRaw.scores?.I || 0,
      A: hollandRaw.scores?.A || 0, S: hollandRaw.scores?.S || 0,
      E: hollandRaw.scores?.E || 0, C: hollandRaw.scores?.C || 0,
    },
    sasang: {
      TY: sasangRaw.scores?.TY || 0, TE: sasangRaw.scores?.TE || 0,
      SY: sasangRaw.scores?.SY || 0, SE: sasangRaw.scores?.SE || 0,
    },
    saju: sajuData.ohaengScores,
  };

  // 6) 30가지 능력치 산출
  const abilities = computeAbilities(rawScores);

  // 7) 종합 요약 생성
  const summary = generateSummary(
    mbtiResult, discResult, enneagramResult, hollandResult, sajuData.dominant,
  );

  return {
    personalInfo,
    rawScores,
    abilities,
    mbti: {
      type: mbtiInterp.type || mbtiResult.resultType,
      typeName: mbtiInterp.typeName || '',
      description: mbtiInterp.description || '',
      strengths: mbtiInterp.strengths || [],
      weaknesses: mbtiInterp.weaknesses || [],
    },
    disc: {
      type: discInterp.type || discResult.resultType,
      typeName: discInterp.typeName || '',
      description: discInterp.description || '',
    },
    enneagram: {
      type: enneagramInterp.type || '',
      wing: enneagramInterp.wingLabel || enneagramResult.resultType,
      typeName: enneagramInterp.typeName || '',
      description: enneagramInterp.description || '',
    },
    holland: {
      topCode: hollandResult.resultType,
      typeName: hollandInterp.typeName || '',
      description: hollandInterp.description || '',
      careers: hollandInterp.careers || [],
    },
    sasang: {
      type: sasangInterp.type || sasangResult.resultType,
      typeName: sasangInterp.typeName || '',
      description: sasangInterp.description || '',
      bodyType: sasangInterp.bodyType || '',
    },
    saju: {
      dominant: sajuData.dominant,
      typeName: sajuData.typeInfo.name,
      description: sajuData.typeInfo.description,
      sajuPalza: sajuData.sajuPalza,
      ohaeng: sajuData.ohaeng,
    },
    blood: {
      type: personalInfo.bloodType,
      typeName: bloodInfo.name,
      description: bloodInfo.description,
    },
    summary,
  };
}

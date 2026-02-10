import { type TestQuestion } from './mbti';

// 사주 (四柱) - 생년월일시 기반 분석
// 천간(10개)과 지지(12개)를 조합하여 사주팔자 산출

export const CHEONGAN = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'] as const;
export const JIJI = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'] as const;

export const OHAENG = {
  목: { element: '木', label: '목(木)', color: '#22c55e', description: '성장과 창의력, 인자함' },
  화: { element: '火', label: '화(火)', color: '#ef4444', description: '열정과 예의, 활력' },
  토: { element: '土', label: '토(土)', color: '#eab308', description: '안정과 신뢰, 중용' },
  금: { element: '金', label: '금(金)', color: '#a3a3a3', description: '결단력과 의리, 정의' },
  수: { element: '水', label: '수(水)', color: '#3b82f6', description: '지혜와 유연함, 소통' },
} as const;

// 천간 → 오행 매핑
export const CHEONGAN_OHAENG: Record<string, string> = {
  갑: '목', 을: '목', 병: '화', 정: '화', 무: '토',
  기: '토', 경: '금', 신: '금', 임: '수', 계: '수',
};

// 지지 → 오행 매핑
export const JIJI_OHAENG: Record<string, string> = {
  자: '수', 축: '토', 인: '목', 묘: '목', 진: '토', 사: '화',
  오: '화', 미: '토', 신: '금', 유: '금', 술: '토', 해: '수',
};

// 사주 유형 설명 (오행 기반)
export const SAJU_TYPE_DESCRIPTIONS: Record<string, {
  name: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  career: string[];
  advice: string;
}> = {
  목: {
    name: '목(木)형 인간',
    description: '나무처럼 꾸준히 성장하며, 창의적이고 인자한 성격입니다. 새로운 시작과 도전을 두려워하지 않으며, 주변을 돌보는 따뜻한 마음을 지니고 있습니다.',
    strengths: ['창의력', '성장 지향', '인자함', '계획성', '적응력'],
    weaknesses: ['우유부단', '과도한 걱정', '고집', '질투심'],
    career: ['교육자', '연구원', '디자이너', '상담사', '환경 분야'],
    advice: '때로는 결단력을 발휘하고, 자신의 감정을 솔직히 표현하세요.',
  },
  화: {
    name: '화(火)형 인간',
    description: '불처럼 열정적이고 활력이 넘치며, 예의 바르고 사교적인 성격입니다. 리더십이 강하며 주변 사람들에게 영감을 줍니다.',
    strengths: ['열정', '리더십', '사교성', '예의', '표현력'],
    weaknesses: ['급한 성격', '감정 기복', '참을성 부족', '과시욕'],
    career: ['기업가', '정치인', '방송인', '마케터', '영업직'],
    advice: '차분히 상황을 관찰하고, 감정에 휘둘리지 않는 연습을 하세요.',
  },
  토: {
    name: '토(土)형 인간',
    description: '대지처럼 안정적이고 신뢰감 있는 성격입니다. 중용을 지키며 주변 사람들의 중심 역할을 합니다. 성실하고 약속을 잘 지킵니다.',
    strengths: ['안정감', '신뢰성', '성실함', '포용력', '중재력'],
    weaknesses: ['변화 저항', '고집', '느린 결정', '보수적'],
    career: ['공무원', '금융업', '부동산', '요식업', '관리직'],
    advice: '새로운 변화를 두려워하지 말고, 때로는 모험을 시도해보세요.',
  },
  금: {
    name: '금(金)형 인간',
    description: '금속처럼 강한 의지와 결단력을 지닌 성격입니다. 의리를 중시하고 정의로우며, 목표를 향해 흔들림 없이 나아갑니다.',
    strengths: ['결단력', '의리', '정의감', '집중력', '실행력'],
    weaknesses: ['완고함', '냉정함', '융통성 부족', '독단적'],
    career: ['법조인', '군인/경찰', '외과의사', '엔지니어', 'CEO'],
    advice: '타인의 의견에 귀 기울이고, 유연한 사고를 연습하세요.',
  },
  수: {
    name: '수(水)형 인간',
    description: '물처럼 유연하고 지혜로운 성격입니다. 소통 능력이 뛰어나고 상황에 잘 적응하며, 깊은 통찰력을 지니고 있습니다.',
    strengths: ['지혜', '유연함', '소통 능력', '통찰력', '적응력'],
    weaknesses: ['우유부단', '변덕', '불안감', '과도한 걱정'],
    career: ['작가', '철학자', '컨설턴트', '외교관', 'IT 전문가'],
    advice: '결단의 순간에 용기를 내고, 자신의 직감을 신뢰하세요.',
  },
};

// 사주 입력용 문항 (생년월일시 입력)
export const sajuQuestions: TestQuestion[] = [
  {
    id: 601,
    questionNumber: 1,
    questionType: 'choice',
    questionText: '출생 연도를 선택해주세요.',
    options: {
      choices: Array.from({ length: 60 }, (_, i) => `${1965 + i}년`),
    },
    scoringWeights: { birthYear: 1 },
  },
  {
    id: 602,
    questionNumber: 2,
    questionType: 'choice',
    questionText: '출생 월을 선택해주세요.',
    options: {
      choices: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    },
    scoringWeights: { birthMonth: 1 },
  },
  {
    id: 603,
    questionNumber: 3,
    questionType: 'choice',
    questionText: '출생 일을 선택해주세요.',
    options: {
      choices: Array.from({ length: 31 }, (_, i) => `${i + 1}일`),
    },
    scoringWeights: { birthDay: 1 },
  },
  {
    id: 604,
    questionNumber: 4,
    questionType: 'choice',
    questionText: '출생 시간을 선택해주세요 (모르면 "모름" 선택).',
    options: {
      choices: [
        '모름',
        '자시 (23:00~01:00)', '축시 (01:00~03:00)', '인시 (03:00~05:00)',
        '묘시 (05:00~07:00)', '진시 (07:00~09:00)', '사시 (09:00~11:00)',
        '오시 (11:00~13:00)', '미시 (13:00~15:00)', '신시 (15:00~17:00)',
        '유시 (17:00~19:00)', '술시 (19:00~21:00)', '해시 (21:00~23:00)',
      ],
    },
    scoringWeights: { birthHour: 1 },
  },
  {
    id: 605,
    questionNumber: 5,
    questionType: 'choice',
    questionText: '성별을 선택해주세요.',
    options: {
      choices: ['남성', '여성'],
    },
    scoringWeights: { gender: 1 },
  },
];

// 연도에서 천간/지지 계산 (만세력 간이 계산)
export function getYearGanji(year: number): { cheongan: string; jiji: string } {
  const cgIdx = (year - 4) % 10;
  const jjIdx = (year - 4) % 12;
  return {
    cheongan: CHEONGAN[cgIdx >= 0 ? cgIdx : cgIdx + 10],
    jiji: JIJI[jjIdx >= 0 ? jjIdx : jjIdx + 12],
  };
}

// 월에서 천간/지지 계산 (간이)
export function getMonthGanji(year: number, month: number): { cheongan: string; jiji: string } {
  const yearCgIdx = (year - 4) % 10;
  const monthCgBase = (yearCgIdx % 5) * 2;
  const monthCgIdx = (monthCgBase + month - 1) % 10;
  const monthJjIdx = (month + 1) % 12;
  return {
    cheongan: CHEONGAN[monthCgIdx],
    jiji: JIJI[monthJjIdx],
  };
}

// 일에서 천간/지지 계산 (간이 - 실제로는 만세력 필요)
export function getDayGanji(year: number, month: number, day: number): { cheongan: string; jiji: string } {
  // 간이 계산: 기준일(1900-01-01 = 갑자일)로부터 일수 계산
  const baseDate = new Date(1900, 0, 1);
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const cgIdx = diffDays % 10;
  const jjIdx = diffDays % 12;
  return {
    cheongan: CHEONGAN[cgIdx >= 0 ? cgIdx : cgIdx + 10],
    jiji: JIJI[jjIdx >= 0 ? jjIdx : jjIdx + 12],
  };
}

// 시간에서 천간/지지 계산
export function getHourGanji(dayCgIdx: number, hourIdx: number): { cheongan: string; jiji: string } {
  const hourCgBase = (dayCgIdx % 5) * 2;
  const hourCgIdx = (hourCgBase + hourIdx) % 10;
  return {
    cheongan: CHEONGAN[hourCgIdx],
    jiji: JIJI[hourIdx],
  };
}

// 오행 점수 계산
export function calculateOhaengScores(
  yearGanji: { cheongan: string; jiji: string },
  monthGanji: { cheongan: string; jiji: string },
  dayGanji: { cheongan: string; jiji: string },
  hourGanji?: { cheongan: string; jiji: string }
): Record<string, number> {
  const scores: Record<string, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };

  const ganjis = [yearGanji, monthGanji, dayGanji];
  if (hourGanji) ganjis.push(hourGanji);

  for (const ganji of ganjis) {
    const cgOhaeng = CHEONGAN_OHAENG[ganji.cheongan];
    const jjOhaeng = JIJI_OHAENG[ganji.jiji];
    if (cgOhaeng) scores[cgOhaeng]++;
    if (jjOhaeng) scores[jjOhaeng]++;
  }

  return scores;
}

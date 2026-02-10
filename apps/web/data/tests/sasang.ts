import { type TestQuestion } from './mbti';

// 사상체질 유형 설명
export const SASANG_TYPE_DESCRIPTIONS: Record<
  string,
  {
    name: string;
    description: string;
    strengths: string[];
    weaknesses: string[];
    bodyType: string;
    healthTips: string[];
  }
> = {
  TY: {
    name: '태양인 (太陽人)',
    description: '기운이 위로 발산하는 체질로, 가슴이 넓고 허리 아래가 약한 편입니다. 진취적이고 카리스마가 있으며 창의적인 리더 기질을 가지고 있습니다.',
    strengths: ['리더십', '창의력', '추진력', '결단력'],
    weaknesses: ['독선적', '끈기 부족', '하체 허약', '분노 조절 어려움'],
    bodyType: '상체가 발달하고 가슴이 넓으며, 허리와 하체가 상대적으로 약한 체형. 목덜미 부위가 굵고 눈빛이 강렬한 편입니다.',
    healthTips: [
      '담백하고 시원한 음식을 섭취하세요 (메밀, 포도, 감, 새우)',
      '하체 운동을 꾸준히 하여 상하 균형을 맞추세요',
      '지나친 분노와 흥분을 자제하세요',
      '기름진 음식과 맵고 뜨거운 음식을 피하세요',
    ],
  },
  TE: {
    name: '태음인 (太陰人)',
    description: '체격이 크고 든든하며, 간 기능이 발달한 체질입니다. 인내심이 강하고 묵묵하게 일을 추진하는 실행력을 가지고 있습니다.',
    strengths: ['인내심', '실행력', '포용력', '끈기'],
    weaknesses: ['게으름', '고집', '변화에 둔감', '욕심'],
    bodyType: '체격이 크고 골격이 굵은 편. 허리 부위가 발달하고 살이 잘 찌는 체질로, 전체적으로 안정감 있는 체형입니다.',
    healthTips: [
      '담백하고 가벼운 식사를 하세요 (율무, 콩나물, 미역, 밤)',
      '꾸준한 유산소 운동으로 체중을 관리하세요',
      '땀을 잘 흘려야 건강이 유지됩니다',
      '과식과 기름진 음식을 조절하세요',
    ],
  },
  SY: {
    name: '소양인 (少陽人)',
    description: '활발하고 에너지가 넘치며, 비장 기능이 발달한 체질입니다. 행동이 빠르고 사교적이며, 정의감이 강한 성격을 가지고 있습니다.',
    strengths: ['활동성', '사교성', '정의감', '순발력'],
    weaknesses: ['성급함', '인내심 부족', '산만함', '감정 기복'],
    bodyType: '상체가 발달하고 하체가 가벼운 편. 가슴 부위가 충실하나 엉덩이가 빈약한 역삼각형 체형이 많습니다.',
    healthTips: [
      '시원하고 신선한 음식을 섭취하세요 (보리, 오이, 수박, 해산물)',
      '과격한 운동보다 수영이나 산책이 좋습니다',
      '뜨겁고 매운 음식을 줄이세요',
      '충분한 수면과 마음의 안정을 취하세요',
    ],
  },
  SE: {
    name: '소음인 (少陰人)',
    description: '조용하고 섬세하며, 신장 기능이 발달한 체질입니다. 내면이 깊고 분석적이며, 타인을 세심하게 배려하는 따뜻한 마음을 가지고 있습니다.',
    strengths: ['섬세함', '배려심', '분석력', '꼼꼼함'],
    weaknesses: ['소극적', '걱정이 많음', '추위에 약함', '소화력 약함'],
    bodyType: '체격이 작고 가늘며, 엉덩이 부위가 발달한 편. 전체적으로 아담하고 단정한 체형이 많습니다.',
    healthTips: [
      '따뜻하고 소화가 잘 되는 음식을 섭취하세요 (인삼, 대추, 생강, 닭고기)',
      '몸을 따뜻하게 유지하고 찬 음식을 피하세요',
      '적당한 운동으로 혈액순환을 촉진하세요',
      '스트레스 관리와 정서적 안정에 신경 쓰세요',
    ],
  },
};

// 사상체질 검사 문항 (20문항, 체질별 5문항)
export const sasangQuestions: TestQuestion[] = [
  // ===== 태양인 (TY) 관련 문항 (5문항) =====
  {
    id: 501,
    questionNumber: 1,
    questionType: 'likert',
    questionText: '가슴이 넓고 상체가 발달한 편이다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { TY: 1, TE: 0.3, SY: 0.3, SE: -0.5 },
  },
  {
    id: 502,
    questionNumber: 2,
    questionType: 'likert',
    questionText: '새로운 일을 시작할 때 과감하게 도전하는 편이다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { TY: 1, TE: 0, SY: 0.5, SE: -0.5 },
  },
  {
    id: 503,
    questionNumber: 3,
    questionType: 'likert',
    questionText: '허리나 다리 쪽이 상대적으로 약하다고 느낀다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { TY: 1, TE: -0.3, SY: 0.3, SE: 0 },
  },
  {
    id: 504,
    questionNumber: 4,
    questionType: 'likert',
    questionText: '기름진 음식보다 담백하고 시원한 음식이 잘 맞는 편이다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { TY: 1, TE: -0.3, SY: 0.3, SE: -0.5 },
  },
  {
    id: 505,
    questionNumber: 5,
    questionType: 'likert',
    questionText: '남들 앞에 나서서 의견을 주도하는 것이 자연스럽다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { TY: 1, TE: 0, SY: 0.5, SE: -0.5 },
  },

  // ===== 태음인 (TE) 관련 문항 (5문항) =====
  {
    id: 506,
    questionNumber: 6,
    questionType: 'likert',
    questionText: '체격이 크고 골격이 굵은 편이다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { TY: 0.3, TE: 1, SY: -0.3, SE: -0.5 },
  },
  {
    id: 507,
    questionNumber: 7,
    questionType: 'likert',
    questionText: '한번 시작한 일은 끝까지 묵묵하게 해내는 편이다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { TY: 0, TE: 1, SY: -0.5, SE: 0.3 },
  },
  {
    id: 508,
    questionNumber: 8,
    questionType: 'likert',
    questionText: '살이 잘 찌고 땀을 많이 흘리는 편이다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { TY: 0, TE: 1, SY: 0, SE: -0.5 },
  },
  {
    id: 509,
    questionNumber: 9,
    questionType: 'likert',
    questionText: '먹는 것을 좋아하고, 식사량이 많은 편이다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { TY: 0, TE: 1, SY: 0.3, SE: -0.5 },
  },
  {
    id: 510,
    questionNumber: 10,
    questionType: 'likert',
    questionText: '급하게 서두르기보다 느긋하고 여유 있게 행동한다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { TY: -0.3, TE: 1, SY: -0.5, SE: 0.3 },
  },

  // ===== 소양인 (SY) 관련 문항 (5문항) =====
  {
    id: 511,
    questionNumber: 11,
    questionType: 'likert',
    questionText: '행동이 빠르고 에너지가 넘치는 편이다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { TY: 0.3, TE: -0.3, SY: 1, SE: -0.5 },
  },
  {
    id: 512,
    questionNumber: 12,
    questionType: 'likert',
    questionText: '불의를 보면 참지 못하고 나서는 편이다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { TY: 0.5, TE: 0, SY: 1, SE: -0.3 },
  },
  {
    id: 513,
    questionNumber: 13,
    questionType: 'likert',
    questionText: '더운 것을 잘 타고, 시원한 것을 좋아한다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { TY: 0.3, TE: 0.3, SY: 1, SE: -0.5 },
  },
  {
    id: 514,
    questionNumber: 14,
    questionType: 'likert',
    questionText: '하체보다 상체가 발달했고, 엉덩이가 작은 편이다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { TY: 0.5, TE: -0.3, SY: 1, SE: -0.5 },
  },
  {
    id: 515,
    questionNumber: 15,
    questionType: 'likert',
    questionText: '여러 사람과 어울리는 것이 좋고 사교적이라는 말을 자주 듣는다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { TY: 0.3, TE: 0, SY: 1, SE: -0.5 },
  },

  // ===== 소음인 (SE) 관련 문항 (5문항) =====
  {
    id: 516,
    questionNumber: 16,
    questionType: 'likert',
    questionText: '체격이 작고 마른 편이며, 추위를 잘 탄다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { TY: -0.5, TE: -0.5, SY: -0.3, SE: 1 },
  },
  {
    id: 517,
    questionNumber: 17,
    questionType: 'likert',
    questionText: '소화가 잘 안 되거나 위장이 약한 편이다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { TY: 0, TE: -0.3, SY: 0, SE: 1 },
  },
  {
    id: 518,
    questionNumber: 18,
    questionType: 'likert',
    questionText: '조용하고 차분한 성격이며, 혼자만의 시간을 중요하게 여긴다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { TY: -0.5, TE: 0, SY: -0.5, SE: 1 },
  },
  {
    id: 519,
    questionNumber: 19,
    questionType: 'likert',
    questionText: '따뜻한 음식이나 차가 체질에 잘 맞는다고 느낀다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { TY: -0.3, TE: 0, SY: -0.3, SE: 1 },
  },
  {
    id: 520,
    questionNumber: 20,
    questionType: 'likert',
    questionText: '다른 사람의 감정을 잘 살피고 세심하게 배려하는 편이다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { TY: -0.3, TE: 0, SY: 0, SE: 1 },
  },
];

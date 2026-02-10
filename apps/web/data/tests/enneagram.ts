import { type TestQuestion } from './mbti';

// 에니어그램 9가지 유형 설명
export const ENNEAGRAM_TYPE_DESCRIPTIONS: Record<
  string,
  {
    name: string;
    description: string;
    strengths: string[];
    weaknesses: string[];
    wing1: string;
    wing2: string;
  }
> = {
  '1': {
    name: '개혁가',
    description:
      '원칙적이고 목적의식이 강하며 자기 절제력이 뛰어난 완벽주의자입니다. 세상을 더 나은 곳으로 만들고자 하는 강한 사명감을 지니고 있습니다.',
    strengths: ['정직함', '책임감', '도덕적 용기', '자기 절제력'],
    weaknesses: ['비판적 태도', '완벽주의', '경직성', '분노 억압'],
    wing1: '9',
    wing2: '2',
  },
  '2': {
    name: '조력자',
    description:
      '너그럽고 타인을 향한 관심이 많으며 사랑받고 싶어하는 유형입니다. 다른 사람의 필요를 직감적으로 알아차리고 도움을 주려 합니다.',
    strengths: ['공감 능력', '너그러움', '헌신적', '대인관계 능력'],
    weaknesses: ['자기 희생', '인정 욕구', '소유욕', '간접적 조종'],
    wing1: '1',
    wing2: '3',
  },
  '3': {
    name: '성취자',
    description:
      '적응력이 뛰어나고 성공 지향적이며 목표 달성에 강한 에너지를 쏟는 유형입니다. 효율적이고 이미지에 민감합니다.',
    strengths: ['목표 지향성', '적응력', '자신감', '효율성'],
    weaknesses: ['허영심', '자기기만', '감정 회피', '과잉 경쟁'],
    wing1: '2',
    wing2: '4',
  },
  '4': {
    name: '예술가',
    description:
      '자기 표현에 능하고 감수성이 풍부하며 내면의 깊이를 중시하는 유형입니다. 독특함과 진정성을 추구하며 아름다움에 민감합니다.',
    strengths: ['창의성', '감수성', '진정성', '깊은 공감 능력'],
    weaknesses: ['자기 몰두', '우울 성향', '질투심', '현실 회피'],
    wing1: '3',
    wing2: '5',
  },
  '5': {
    name: '탐구자',
    description:
      '통찰력이 뛰어나고 지적 호기심이 강하며 독립적인 유형입니다. 세상을 관찰하고 이해하려는 욕구가 강하며 자신만의 전문 영역을 구축합니다.',
    strengths: ['분석력', '객관성', '독립심', '전문성'],
    weaknesses: ['고립 성향', '인색함', '거만함', '감정 분리'],
    wing1: '4',
    wing2: '6',
  },
  '6': {
    name: '충성가',
    description:
      '책임감이 강하고 신뢰를 중시하며 안전을 추구하는 유형입니다. 최악의 상황을 대비하는 능력이 뛰어나고 조직에 대한 충성심이 높습니다.',
    strengths: ['충성심', '책임감', '협력', '위기 대처 능력'],
    weaknesses: ['불안감', '의심', '우유부단', '과잉 경계'],
    wing1: '5',
    wing2: '7',
  },
  '7': {
    name: '낙천가',
    description:
      '활기차고 다재다능하며 새로운 경험을 추구하는 유형입니다. 긍정적 에너지가 넘치고 다양한 가능성에 열려 있습니다.',
    strengths: ['낙관주의', '다재다능', '모험심', '빠른 사고력'],
    weaknesses: ['산만함', '고통 회피', '충동성', '깊이 부족'],
    wing1: '6',
    wing2: '8',
  },
  '8': {
    name: '도전자',
    description:
      '자신감이 넘치고 결단력이 있으며 강한 의지력을 가진 유형입니다. 정의감이 강하고 약자를 보호하려는 본능이 있습니다.',
    strengths: ['리더십', '결단력', '자신감', '보호 본능'],
    weaknesses: ['공격성', '통제욕', '약점 회피', '과도한 독립심'],
    wing1: '7',
    wing2: '9',
  },
  '9': {
    name: '중재자',
    description:
      '수용적이고 안정감을 주며 조화를 추구하는 유형입니다. 갈등을 중재하는 능력이 뛰어나고 여러 관점을 이해할 수 있습니다.',
    strengths: ['평화주의', '포용력', '인내심', '중재 능력'],
    weaknesses: ['수동성', '우유부단', '갈등 회피', '자기 무시'],
    wing1: '8',
    wing2: '1',
  },
};

// 36개 에니어그램 문항 (9유형 x 4문항)
export const enneagramQuestions: TestQuestion[] = [
  // ===== 유형 1: 개혁가 (4문항) =====
  {
    id: 201,
    questionNumber: 1,
    questionType: 'likert',
    questionText: '일을 할 때 정해진 원칙과 기준을 철저히 지키는 편이다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T1: 1 },
  },
  {
    id: 202,
    questionNumber: 2,
    questionType: 'likert',
    questionText: '잘못된 것을 보면 바로잡아야 한다는 강한 의무감을 느낀다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T1: 1 },
  },
  {
    id: 203,
    questionNumber: 3,
    questionType: 'likert',
    questionText: '스스로에게 엄격한 잣대를 적용하며, 실수를 쉽게 용납하지 못한다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T1: 1 },
  },
  {
    id: 204,
    questionNumber: 4,
    questionType: 'likert',
    questionText: '세상이 더 공정하고 올바른 곳이 되어야 한다는 신념이 있다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T1: 1 },
  },

  // ===== 유형 2: 조력자 (4문항) =====
  {
    id: 205,
    questionNumber: 5,
    questionType: 'likert',
    questionText: '다른 사람이 어려움에 처해 있으면 나서서 도와주고 싶다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T2: 1 },
  },
  {
    id: 206,
    questionNumber: 6,
    questionType: 'likert',
    questionText: '주변 사람들에게 필요한 존재로 인정받을 때 큰 보람을 느낀다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T2: 1 },
  },
  {
    id: 207,
    questionNumber: 7,
    questionType: 'likert',
    questionText: '상대방의 기분이나 필요를 말하지 않아도 직감적으로 알아차린다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T2: 1 },
  },
  {
    id: 208,
    questionNumber: 8,
    questionType: 'likert',
    questionText: '나보다 남의 부탁을 먼저 들어주다 보면 정작 내 일을 놓칠 때가 있다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T2: 1 },
  },

  // ===== 유형 3: 성취자 (4문항) =====
  {
    id: 209,
    questionNumber: 9,
    questionType: 'likert',
    questionText: '목표를 세우고 그것을 달성하는 과정에서 큰 만족감을 얻는다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T3: 1 },
  },
  {
    id: 210,
    questionNumber: 10,
    questionType: 'likert',
    questionText: '다른 사람들에게 유능하고 성공한 모습으로 보이는 것이 중요하다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T3: 1 },
  },
  {
    id: 211,
    questionNumber: 11,
    questionType: 'likert',
    questionText: '상황에 따라 나의 이미지를 유연하게 조절할 수 있다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T3: 1 },
  },
  {
    id: 212,
    questionNumber: 12,
    questionType: 'likert',
    questionText: '효율성을 중시하며, 시간을 낭비하는 것을 참기 어렵다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T3: 1 },
  },

  // ===== 유형 4: 예술가 (4문항) =====
  {
    id: 213,
    questionNumber: 13,
    questionType: 'likert',
    questionText: '나만의 독특한 정체성과 개성을 표현하는 것이 매우 중요하다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T4: 1 },
  },
  {
    id: 214,
    questionNumber: 14,
    questionType: 'likert',
    questionText: '깊은 감정을 느끼는 편이며, 슬프거나 우울한 감정도 의미 있다고 여긴다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T4: 1 },
  },
  {
    id: 215,
    questionNumber: 15,
    questionType: 'likert',
    questionText: '다른 사람들이 가진 것을 보며 나에게 부족한 것이 무엇인지 생각할 때가 있다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T4: 1 },
  },
  {
    id: 216,
    questionNumber: 16,
    questionType: 'likert',
    questionText: '예술, 음악, 문학 등 아름다운 것에 대한 감각이 남다르다고 느낀다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T4: 1 },
  },

  // ===== 유형 5: 탐구자 (4문항) =====
  {
    id: 217,
    questionNumber: 17,
    questionType: 'likert',
    questionText: '관심 있는 분야를 깊이 파고들어 전문적으로 이해하고 싶다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T5: 1 },
  },
  {
    id: 218,
    questionNumber: 18,
    questionType: 'likert',
    questionText: '혼자만의 시간과 공간이 충분해야 에너지를 회복할 수 있다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T5: 1 },
  },
  {
    id: 219,
    questionNumber: 19,
    questionType: 'likert',
    questionText: '감정보다 논리와 데이터를 근거로 판단하는 것을 선호한다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T5: 1 },
  },
  {
    id: 220,
    questionNumber: 20,
    questionType: 'likert',
    questionText: '나의 내면 세계나 생각을 타인에게 쉽게 드러내지 않는 편이다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T5: 1 },
  },

  // ===== 유형 6: 충성가 (4문항) =====
  {
    id: 221,
    questionNumber: 21,
    questionType: 'likert',
    questionText: '새로운 일을 시작하기 전에 발생할 수 있는 문제들을 미리 점검하는 편이다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T6: 1 },
  },
  {
    id: 222,
    questionNumber: 22,
    questionType: 'likert',
    questionText: '신뢰할 수 있는 사람이나 조직에 대한 충성심이 매우 강하다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T6: 1 },
  },
  {
    id: 223,
    questionNumber: 23,
    questionType: 'likert',
    questionText: '불확실한 상황에서 불안감을 느끼며 안전한 선택을 하려고 한다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T6: 1 },
  },
  {
    id: 224,
    questionNumber: 24,
    questionType: 'likert',
    questionText: '중요한 결정을 내릴 때 여러 사람의 의견을 구해 확인하고 싶다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T6: 1 },
  },

  // ===== 유형 7: 낙천가 (4문항) =====
  {
    id: 225,
    questionNumber: 25,
    questionType: 'likert',
    questionText: '새로운 경험과 모험을 즐기며 한 가지에 오래 머물기보다 다양한 것을 시도한다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T7: 1 },
  },
  {
    id: 226,
    questionNumber: 26,
    questionType: 'likert',
    questionText: '어려운 상황에서도 긍정적인 면을 찾으려고 노력하는 편이다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T7: 1 },
  },
  {
    id: 227,
    questionNumber: 27,
    questionType: 'likert',
    questionText: '재미있는 계획을 세우는 것만으로도 기분이 좋아진다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T7: 1 },
  },
  {
    id: 228,
    questionNumber: 28,
    questionType: 'likert',
    questionText: '지루하거나 고통스러운 상황을 피하고 즐거운 쪽으로 방향을 바꾸는 편이다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T7: 1 },
  },

  // ===== 유형 8: 도전자 (4문항) =====
  {
    id: 229,
    questionNumber: 29,
    questionType: 'likert',
    questionText: '내 의견을 솔직하고 강하게 말하는 것을 주저하지 않는다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T8: 1 },
  },
  {
    id: 230,
    questionNumber: 30,
    questionType: 'likert',
    questionText: '누군가가 나를 통제하거나 지배하려 하면 강하게 저항한다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T8: 1 },
  },
  {
    id: 231,
    questionNumber: 31,
    questionType: 'likert',
    questionText: '약한 사람이 부당하게 대우받는 것을 보면 나서서 보호하고 싶다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T8: 1 },
  },
  {
    id: 232,
    questionNumber: 32,
    questionType: 'likert',
    questionText: '결정을 빨리 내리는 편이며, 상황을 주도적으로 이끌어 나간다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T8: 1 },
  },

  // ===== 유형 9: 중재자 (4문항) =====
  {
    id: 233,
    questionNumber: 33,
    questionType: 'likert',
    questionText: '갈등이 생기면 가능한 한 평화롭게 해결하려고 한다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T9: 1 },
  },
  {
    id: 234,
    questionNumber: 34,
    questionType: 'likert',
    questionText: '여러 사람의 서로 다른 의견을 이해하고 조율하는 것을 잘한다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T9: 1 },
  },
  {
    id: 235,
    questionNumber: 35,
    questionType: 'likert',
    questionText: '내 의견을 강하게 내세우기보다 주변 사람들의 흐름에 맞추는 편이다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T9: 1 },
  },
  {
    id: 236,
    questionNumber: 36,
    questionType: 'likert',
    questionText: '편안하고 안정된 환경을 선호하며, 급격한 변화가 불편하다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { T9: 1 },
  },
];

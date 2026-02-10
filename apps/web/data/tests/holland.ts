import { type TestQuestion } from './mbti';

// Holland RIASEC 6가지 유형 설명
export const HOLLAND_TYPE_DESCRIPTIONS: Record<
  string,
  {
    name: string;
    description: string;
    strengths: string[];
    weaknesses: string[];
    careers: string[];
  }
> = {
  R: {
    name: '실재형 (Realistic)',
    description:
      '손으로 직접 만들고 조작하는 것을 좋아하며, 실용적이고 구체적인 결과물을 중시하는 유형입니다. 도구나 기계를 다루는 데 능숙하고, 신체적 활동과 야외 작업을 선호합니다.',
    strengths: ['실용적 문제해결', '기계 조작 능력', '체력과 인내심', '구체적 성과 지향'],
    weaknesses: ['대인관계 기술 부족', '감정 표현 어려움', '추상적 사고 회피', '변화에 대한 저항'],
    careers: ['기계공학자', '전기기사', '건축가', '농업인', '요리사', '소방관', '운동선수', '항공기 정비사'],
  },
  I: {
    name: '탐구형 (Investigative)',
    description:
      '지적 호기심이 강하고 분석적 사고를 즐기는 유형입니다. 복잡한 문제를 탐구하고 원리를 파악하는 것에 몰두하며, 독립적으로 연구하고 사색하는 것을 선호합니다.',
    strengths: ['분석력', '논리적 사고', '지적 호기심', '독립적 연구 능력'],
    weaknesses: ['리더십 부족', '실용성 경시', '사회적 기술 미흡', '지나친 완벽주의'],
    careers: ['과학자', '연구원', '의사', '데이터 분석가', '프로그래머', '수학자', '심리학자', '약사'],
  },
  A: {
    name: '예술형 (Artistic)',
    description:
      '창의적이고 독창적인 표현을 중시하는 유형입니다. 자유로운 환경에서 상상력을 발휘하며, 아름다움과 감성에 민감하고 틀에 얽매이지 않는 사고를 추구합니다.',
    strengths: ['창의력', '독창성', '감수성', '직관적 표현력'],
    weaknesses: ['체계성 부족', '현실 감각 부족', '규칙 준수 어려움', '경제적 불안정 감수'],
    careers: ['화가', '음악가', '작가', '디자이너', '배우', '영화감독', '사진작가', '인테리어 디자이너'],
  },
  S: {
    name: '사회형 (Social)',
    description:
      '타인을 돕고 가르치며 치유하는 것에 보람을 느끼는 유형입니다. 협력적이고 공감 능력이 뛰어나며, 사람들과의 상호작용을 통해 긍정적 변화를 이끌어내는 것을 추구합니다.',
    strengths: ['공감 능력', '의사소통 능력', '협동심', '봉사 정신'],
    weaknesses: ['자기주장 부족', '감정적 소진', '객관성 결여', '거절하지 못함'],
    careers: ['교사', '상담사', '사회복지사', '간호사', '성직자', '인사담당자', '치료사', '코치'],
  },
  E: {
    name: '진취형 (Enterprising)',
    description:
      '목표를 세우고 사람들을 이끌며 성취를 추구하는 유형입니다. 설득력이 있고 경쟁적이며, 리더십을 발휘하여 조직이나 프로젝트를 주도하는 것을 즐깁니다.',
    strengths: ['리더십', '설득력', '추진력', '의사결정 능력'],
    weaknesses: ['지배적 성향', '타인 의견 경시', '조급함', '권력 지향적'],
    careers: ['기업가', '경영자', '정치인', '영업관리자', '변호사', '부동산 중개사', '마케팅 관리자', 'PD'],
  },
  C: {
    name: '관습형 (Conventional)',
    description:
      '체계적이고 정확한 작업을 선호하는 유형입니다. 규칙과 절차를 잘 따르며, 데이터를 정리하고 관리하는 데 능숙합니다. 안정적이고 예측 가능한 환경에서 능력을 발휘합니다.',
    strengths: ['꼼꼼함', '조직력', '정확성', '책임감'],
    weaknesses: ['유연성 부족', '창의성 부족', '변화 저항', '자율성 부족'],
    careers: ['회계사', '세무사', '행정공무원', '은행원', '사서', '비서', '감사관', '데이터 입력 전문가'],
  },
};

// Holland RIASEC 6가지 차원
export const HOLLAND_DIMENSIONS = {
  R: '실재형(Realistic)',
  I: '탐구형(Investigative)',
  A: '예술형(Artistic)',
  S: '사회형(Social)',
  E: '진취형(Enterprising)',
  C: '관습형(Conventional)',
};

// 42개 Holland RIASEC 문항 (6유형 x 7문항)
export const hollandQuestions: TestQuestion[] = [
  // ===== R (실재형) 7문항 =====
  {
    id: 301,
    questionNumber: 1,
    questionType: 'likert',
    questionText: '손으로 직접 물건을 만들거나 수리하는 작업이 즐겁다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { R: 1 },
  },
  {
    id: 302,
    questionNumber: 2,
    questionType: 'likert',
    questionText: '기계나 도구를 다루는 일에 자신이 있다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { R: 1 },
  },
  {
    id: 303,
    questionNumber: 3,
    questionType: 'likert',
    questionText: '야외에서 몸을 움직이며 일하는 것을 선호한다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { R: 1 },
  },
  {
    id: 304,
    questionNumber: 4,
    questionType: 'likert',
    questionText: '전자제품이나 컴퓨터를 분해하고 조립하는 것에 흥미가 있다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { R: 1 },
  },
  {
    id: 305,
    questionNumber: 5,
    questionType: 'likert',
    questionText: '눈에 보이는 구체적인 결과물을 만들어내는 일이 보람차다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { R: 1 },
  },
  {
    id: 306,
    questionNumber: 6,
    questionType: 'likert',
    questionText: '설계도나 도면을 보고 실제로 구현하는 작업이 재미있다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { R: 1 },
  },
  {
    id: 307,
    questionNumber: 7,
    questionType: 'likert',
    questionText: '체력을 사용하는 활동적인 일이 책상에 앉아 하는 일보다 좋다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { R: 1 },
  },

  // ===== I (탐구형) 7문항 =====
  {
    id: 308,
    questionNumber: 8,
    questionType: 'likert',
    questionText: '복잡한 문제의 원인을 분석하고 해결책을 찾는 과정이 흥미롭다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { I: 1 },
  },
  {
    id: 309,
    questionNumber: 9,
    questionType: 'likert',
    questionText: '과학 실험이나 연구 활동에 참여하는 것이 즐겁다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { I: 1 },
  },
  {
    id: 310,
    questionNumber: 10,
    questionType: 'likert',
    questionText: '새로운 지식을 배우고 탐구하는 것에 시간을 투자하는 것이 아깝지 않다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { I: 1 },
  },
  {
    id: 311,
    questionNumber: 11,
    questionType: 'likert',
    questionText: '현상의 이면에 있는 원리나 법칙을 이해하고 싶은 욕구가 크다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { I: 1 },
  },
  {
    id: 312,
    questionNumber: 12,
    questionType: 'likert',
    questionText: '데이터를 수집하고 논리적으로 분석하는 작업을 잘 수행한다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { I: 1 },
  },
  {
    id: 313,
    questionNumber: 13,
    questionType: 'likert',
    questionText: '혼자서 깊이 있게 사고하며 집중하는 시간이 필요하다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { I: 1 },
  },
  {
    id: 314,
    questionNumber: 14,
    questionType: 'likert',
    questionText: '어떤 현상이 왜 일어나는지 근본적인 이유를 끝까지 파고드는 편이다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { I: 1 },
  },

  // ===== A (예술형) 7문항 =====
  {
    id: 315,
    questionNumber: 15,
    questionType: 'likert',
    questionText: '그림, 음악, 글쓰기 등 창작 활동을 할 때 행복감을 느낀다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { A: 1 },
  },
  {
    id: 316,
    questionNumber: 16,
    questionType: 'likert',
    questionText: '자유롭고 틀에 얽매이지 않는 환경에서 일하고 싶다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { A: 1 },
  },
  {
    id: 317,
    questionNumber: 17,
    questionType: 'likert',
    questionText: '독창적인 아이디어를 떠올리고 이를 표현하는 것이 중요하다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { A: 1 },
  },
  {
    id: 318,
    questionNumber: 18,
    questionType: 'likert',
    questionText: '미적 감각이나 예술적 안목이 뛰어나다는 이야기를 듣는다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { A: 1 },
  },
  {
    id: 319,
    questionNumber: 19,
    questionType: 'likert',
    questionText: '공연, 전시, 영화 등 문화예술 활동을 감상하는 것을 좋아한다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { A: 1 },
  },
  {
    id: 320,
    questionNumber: 20,
    questionType: 'likert',
    questionText: '정해진 규칙보다 나만의 방식으로 문제를 해결하는 것을 선호한다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { A: 1 },
  },
  {
    id: 321,
    questionNumber: 21,
    questionType: 'likert',
    questionText: '감정이나 생각을 예술적 매체를 통해 표현하는 데 관심이 많다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { A: 1 },
  },

  // ===== S (사회형) 7문항 =====
  {
    id: 322,
    questionNumber: 22,
    questionType: 'likert',
    questionText: '다른 사람들을 돕고 봉사하는 일에 보람을 느낀다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { S: 1 },
  },
  {
    id: 323,
    questionNumber: 23,
    questionType: 'likert',
    questionText: '사람들의 고민을 들어주고 상담하는 역할이 잘 맞는다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { S: 1 },
  },
  {
    id: 324,
    questionNumber: 24,
    questionType: 'likert',
    questionText: '팀원들과 협력하여 함께 목표를 달성하는 것이 즐겁다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { S: 1 },
  },
  {
    id: 325,
    questionNumber: 25,
    questionType: 'likert',
    questionText: '누군가에게 새로운 것을 가르쳐주는 것이 기쁘다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { S: 1 },
  },
  {
    id: 326,
    questionNumber: 26,
    questionType: 'likert',
    questionText: '주변 사람들의 감정을 잘 파악하고 공감하는 편이다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { S: 1 },
  },
  {
    id: 327,
    questionNumber: 27,
    questionType: 'likert',
    questionText: '사회적으로 의미 있는 일을 하며 세상에 기여하고 싶다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { S: 1 },
  },
  {
    id: 328,
    questionNumber: 28,
    questionType: 'likert',
    questionText: '갈등 상황에서 중재자 역할을 자연스럽게 맡게 된다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { S: 1 },
  },

  // ===== E (진취형) 7문항 =====
  {
    id: 329,
    questionNumber: 29,
    questionType: 'likert',
    questionText: '프로젝트나 모임에서 리더 역할을 맡는 것이 자연스럽다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { E: 1 },
  },
  {
    id: 330,
    questionNumber: 30,
    questionType: 'likert',
    questionText: '다른 사람을 설득하여 내 의견에 동의하게 만드는 것에 자신이 있다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { E: 1 },
  },
  {
    id: 331,
    questionNumber: 31,
    questionType: 'likert',
    questionText: '새로운 사업이나 프로젝트를 기획하고 추진하는 것이 흥미롭다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { E: 1 },
  },
  {
    id: 332,
    questionNumber: 32,
    questionType: 'likert',
    questionText: '경쟁 상황에서 이기고 싶은 욕구가 강하다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { E: 1 },
  },
  {
    id: 333,
    questionNumber: 33,
    questionType: 'likert',
    questionText: '큰 목표를 세우고 이를 달성하기 위해 전략을 세우는 것이 좋다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { E: 1 },
  },
  {
    id: 334,
    questionNumber: 34,
    questionType: 'likert',
    questionText: '위험을 감수하더라도 높은 보상을 추구하는 편이다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { E: 1 },
  },
  {
    id: 335,
    questionNumber: 35,
    questionType: 'likert',
    questionText: '사람들 앞에서 발표하거나 의견을 주장하는 것이 두렵지 않다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { E: 1 },
  },

  // ===== C (관습형) 7문항 =====
  {
    id: 336,
    questionNumber: 36,
    questionType: 'likert',
    questionText: '정해진 절차와 규칙에 따라 체계적으로 일하는 것이 편하다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { C: 1 },
  },
  {
    id: 337,
    questionNumber: 37,
    questionType: 'likert',
    questionText: '숫자나 데이터를 꼼꼼하게 정리하고 관리하는 작업을 잘한다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { C: 1 },
  },
  {
    id: 338,
    questionNumber: 38,
    questionType: 'likert',
    questionText: '서류나 문서를 정확하게 작성하고 관리하는 능력이 뛰어나다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { C: 1 },
  },
  {
    id: 339,
    questionNumber: 39,
    questionType: 'likert',
    questionText: '반복적이고 안정적인 업무가 불확실한 업무보다 좋다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { C: 1 },
  },
  {
    id: 340,
    questionNumber: 40,
    questionType: 'likert',
    questionText: '세부 사항을 빠뜨리지 않고 꼼꼼하게 확인하는 편이다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { C: 1 },
  },
  {
    id: 341,
    questionNumber: 41,
    questionType: 'likert',
    questionText: '일정이나 계획표를 작성하고 이에 맞춰 생활하는 것을 좋아한다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { C: 1 },
  },
  {
    id: 342,
    questionNumber: 42,
    questionType: 'likert',
    questionText: '명확한 지시와 기준이 있는 환경에서 업무 효율이 높다.',
    options: { scale: [1, 2, 3, 4, 5], labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'] },
    scoringWeights: { C: 1 },
  },
];

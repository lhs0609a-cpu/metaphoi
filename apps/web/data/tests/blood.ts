import { type TestQuestion } from './mbti';

// 혈액형 성격 유형 설명
export const BLOOD_TYPE_DESCRIPTIONS: Record<
  string,
  {
    name: string;
    description: string;
    strengths: string[];
    weaknesses: string[];
  }
> = {
  A: {
    name: 'A형 - 꼼꼼한 완벽주의자',
    description: '섬세하고 책임감이 강하며 타인을 배려하는 성격의 소유자. 계획적이고 신중하게 행동하며, 조화로운 관계를 중시합니다.',
    strengths: ['꼼꼼함', '책임감', '배려심', '성실함'],
    weaknesses: ['걱정이 많음', '소심함', '스트레스에 취약', '남의 시선을 의식'],
  },
  B: {
    name: 'B형 - 자유로운 마이웨이',
    description: '자유분방하고 창의적이며 호기심이 넘치는 성격. 자신만의 세계가 뚜렷하고 솔직하며 독창적인 사고를 가지고 있습니다.',
    strengths: ['창의성', '솔직함', '자유로움', '열정적'],
    weaknesses: ['변덕스러움', '자기중심적', '규칙 무시', '끈기 부족'],
  },
  O: {
    name: 'O형 - 리더십의 아이콘',
    description: '강한 의지와 리더십을 갖춘 행동파. 목표 지향적이고 사교적이며, 넓은 포용력으로 주변 사람들을 이끄는 존재입니다.',
    strengths: ['리더십', '자신감', '사교성', '포용력'],
    weaknesses: ['독단적', '질투심', '자존심이 강함', '대충하는 경향'],
  },
  AB: {
    name: 'AB형 - 다면적 천재',
    description: '이성적이면서도 감성적인 양면성을 가진 복합적 성격. 뛰어난 분석력과 독특한 감수성을 동시에 갖추고 있습니다.',
    strengths: ['분석력', '다재다능', '합리적', '독특한 감성'],
    weaknesses: ['이중적', '냉소적', '우유부단', '거리감'],
  },
};

// 혈액형 성격 검사 문항 (5문항)
export const bloodQuestions: TestQuestion[] = [
  // Q1: 혈액형 선택 (choice)
  {
    id: 401,
    questionNumber: 1,
    questionType: 'choice',
    questionText: '당신의 혈액형은 무엇인가요?',
    options: {
      choices: ['A형', 'B형', 'O형', 'AB형'],
    },
    scoringWeights: { A: 0, B: 0, O: 0, AB: 0 },
  },

  // Q2-5: 성격 확인 문항 (likert)
  {
    id: 402,
    questionNumber: 2,
    questionType: 'likert',
    questionText: '일을 시작하기 전에 꼼꼼하게 계획을 세우고, 계획대로 진행되지 않으면 불안하다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { A: 1, B: -0.5, O: 0, AB: 0.3 },
  },
  {
    id: 403,
    questionNumber: 3,
    questionType: 'likert',
    questionText: '규칙이나 관습에 얽매이기보다 나만의 방식으로 자유롭게 행동하는 것이 좋다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { A: -0.5, B: 1, O: 0.3, AB: 0.3 },
  },
  {
    id: 404,
    questionNumber: 4,
    questionType: 'likert',
    questionText: '모임이나 단체에서 자연스럽게 중심 역할을 맡게 되는 편이다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { A: -0.3, B: 0.3, O: 1, AB: 0 },
  },
  {
    id: 405,
    questionNumber: 5,
    questionType: 'likert',
    questionText: '같은 상황에서도 감정이 상반되게 느껴질 때가 있고, 스스로도 복잡하다고 느낀다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { A: 0, B: 0.3, O: -0.3, AB: 1 },
  },
];

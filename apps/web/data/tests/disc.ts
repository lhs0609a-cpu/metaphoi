import { type TestQuestion } from './mbti';

// DISC 4가지 차원 설명
export const DISC_DIMENSIONS = {
  D: { key: 'D', label: '주도형(Dominance)', description: '결과 지향적이고 결단력 있는 유형' },
  I: { key: 'I', label: '사교형(Influence)', description: '열정적이고 협력적인 유형' },
  S: { key: 'S', label: '안정형(Steadiness)', description: '인내심 있고 신뢰할 수 있는 유형' },
  C: { key: 'C', label: '신중형(Conscientiousness)', description: '분석적이고 체계적인 유형' },
};

// DISC 유형 설명 (4개 주요 유형 + 주요 조합 유형)
export const DISC_TYPE_DESCRIPTIONS: Record<
  string,
  {
    name: string;
    description: string;
    strengths: string[];
    weaknesses: string[];
  }
> = {
  // 주요 4유형
  D: {
    name: '주도형',
    description:
      '목표 달성에 강한 의지를 가지고 있으며, 도전적인 환경에서 빛을 발합니다. 빠르게 결정을 내리고 결과를 중시하며, 주도적으로 상황을 이끌어갑니다.',
    strengths: ['결단력', '추진력', '목표 지향성', '문제 해결 능력', '리더십'],
    weaknesses: ['성급한 판단', '타인 감정 간과', '인내심 부족', '독단적 경향'],
  },
  I: {
    name: '사교형',
    description:
      '사람들과의 관계에서 에너지를 얻으며, 긍정적인 분위기를 만드는 데 탁월합니다. 설득력이 뛰어나고 팀의 사기를 높이는 역할을 합니다.',
    strengths: ['소통 능력', '설득력', '낙관적 태도', '팀 분위기 조성', '창의성'],
    weaknesses: ['세부 사항 간과', '비체계적', '감정적 의사결정', '집중력 분산'],
  },
  S: {
    name: '안정형',
    description:
      '안정적이고 조화로운 환경을 추구하며, 팀원들을 세심하게 배려합니다. 꾸준하고 신뢰할 수 있으며, 일관성 있는 업무 수행에 강점을 보입니다.',
    strengths: ['인내심', '경청 능력', '팀워크', '일관성', '충성심'],
    weaknesses: ['변화 저항', '수동적 태도', '갈등 회피', '의사 표현 부족'],
  },
  C: {
    name: '신중형',
    description:
      '정확성과 품질을 최우선으로 여기며, 논리적이고 체계적인 접근을 선호합니다. 데이터에 기반한 분석과 세밀한 계획 수립에 뛰어납니다.',
    strengths: ['분석력', '정확성', '체계적 사고', '품질 관리', '계획 수립'],
    weaknesses: ['과도한 분석', '결정 지연', '비판적 성향', '유연성 부족'],
  },
  // 조합 유형
  DI: {
    name: '촉진자형',
    description:
      '강한 추진력과 사교성을 겸비한 유형입니다. 목표를 향해 사람들을 이끌면서도 활기찬 분위기를 만들어냅니다. 영향력 있는 리더로서 비전을 제시하고 팀을 동기부여합니다.',
    strengths: ['카리스마 리더십', '설득력 있는 추진', '비전 제시', '빠른 행동력'],
    weaknesses: ['세부 사항 경시', '과도한 경쟁심', '타인 의견 무시 경향'],
  },
  DC: {
    name: '개척자형',
    description:
      '목표 지향적이면서도 철저한 분석을 바탕으로 움직이는 유형입니다. 높은 기준을 설정하고 체계적으로 결과를 달성합니다. 전략적 사고와 실행력을 모두 갖추고 있습니다.',
    strengths: ['전략적 사고', '높은 기준', '체계적 실행', '독립적 업무 수행'],
    weaknesses: ['지나친 완벽주의', '대인 관계 소홀', '비타협적 태도'],
  },
  DS: {
    name: '실행가형',
    description:
      '결과를 추구하면서도 팀의 안정성을 중시하는 유형입니다. 꾸준한 추진력으로 목표를 달성하며, 팀원들과의 관계도 소중히 여깁니다.',
    strengths: ['꾸준한 추진력', '팀 관리 능력', '결단력과 배려의 균형', '실질적 리더십'],
    weaknesses: ['변화 수용과 추진 사이의 갈등', '우선순위 혼란', '스트레스 축적'],
  },
  ID: {
    name: '설득가형',
    description:
      '뛰어난 소통 능력과 추진력을 겸비한 유형입니다. 열정적으로 아이디어를 전파하고 사람들을 행동으로 이끕니다. 영업, 마케팅, 홍보 분야에서 두각을 나타냅니다.',
    strengths: ['강력한 설득력', '열정적 리더십', '네트워킹 능력', '빠른 적응력'],
    weaknesses: ['충동적 결정', '과잉 약속', '후속 관리 부족'],
  },
  IS: {
    name: '조력자형',
    description:
      '따뜻한 소통과 안정적인 지원을 동시에 제공하는 유형입니다. 팀 내 분위기를 밝게 만들면서도 묵묵히 구성원들을 돕습니다. 상담, 교육, 서비스 분야에 적합합니다.',
    strengths: ['공감 능력', '팀 조화 촉진', '신뢰 구축', '따뜻한 리더십'],
    weaknesses: ['거절 어려움', '갈등 회피', '자기주장 부족'],
  },
  IC: {
    name: '분석 소통가형',
    description:
      '사교적이면서도 분석적인 사고를 겸비한 유형입니다. 데이터를 기반으로 설득력 있는 소통을 하며, 창의적이면서도 논리적인 접근이 가능합니다.',
    strengths: ['논리적 설득', '창의적 분석', '균형 잡힌 소통', '다재다능함'],
    weaknesses: ['우선순위 설정 어려움', '완벽한 소통에 대한 집착', '결정 지연'],
  },
  SC: {
    name: '검토자형',
    description:
      '꼼꼼하고 안정적인 업무 수행이 특징인 유형입니다. 기존 시스템을 충실히 따르면서 정확하게 업무를 처리합니다. 품질 관리, 회계, 연구 분야에 강합니다.',
    strengths: ['꼼꼼한 업무 처리', '일관된 품질', '규칙 준수', '안정적 성과'],
    weaknesses: ['변화 극도 저항', '자기주장 부족', '과도한 신중함으로 인한 지연'],
  },
  SD: {
    name: '관리자형',
    description:
      '안정적인 환경에서 주도적으로 일을 처리하는 유형입니다. 팀의 안정을 유지하면서도 필요할 때 결단력을 발휘합니다. 운영 관리와 프로젝트 관리에 적합합니다.',
    strengths: ['안정적 리더십', '체계적 관리', '위기 대응 능력', '팀 결속력 강화'],
    weaknesses: ['혁신 부족', '과도한 통제', '새로운 시도 주저'],
  },
  SI: {
    name: '지원자형',
    description:
      '팀을 위해 묵묵히 헌신하면서도 따뜻한 관계를 유지하는 유형입니다. 팀원들의 필요를 세심하게 파악하고 안정적으로 지원합니다.',
    strengths: ['헌신', '팀 지원', '관계 유지', '일관된 업무 수행'],
    weaknesses: ['자기 표현 부족', '타인 의존', '변화 적응 어려움'],
  },
  CD: {
    name: '전략가형',
    description:
      '철저한 분석을 바탕으로 결단력 있게 실행하는 유형입니다. 높은 기준과 체계적 접근으로 탁월한 결과를 만들어냅니다. 전략 기획, 엔지니어링, 법률 분야에 적합합니다.',
    strengths: ['전략 수립', '분석 기반 의사결정', '높은 품질 기준', '체계적 실행'],
    weaknesses: ['지나친 완벽주의', '대인 관계 어려움', '비판적 태도'],
  },
  CI: {
    name: '평가자형',
    description:
      '분석력과 소통 능력을 겸비한 유형입니다. 정확한 데이터를 바탕으로 설득력 있게 의견을 전달하며, 팀의 방향성을 논리적으로 제시합니다.',
    strengths: ['데이터 기반 소통', '객관적 평가', '논리적 설득', '균형 잡힌 시각'],
    weaknesses: ['감정 표현 부족', '과도한 분석', '비판적 소통 경향'],
  },
  CS: {
    name: '전문가형',
    description:
      '전문 분야에서 꾸준하고 정확하게 업무를 수행하는 유형입니다. 높은 전문성과 안정적인 성과로 신뢰를 얻으며, 품질과 정확성에서 타협하지 않습니다.',
    strengths: ['전문성', '정확성', '꾸준한 성과', '높은 품질 기준'],
    weaknesses: ['융통성 부족', '지나친 완벽주의', '변화 수용 어려움'],
  },
};

// 28개 DISC 문항 (4차원 x 7문항)
export const discQuestions: TestQuestion[] = [
  // ===== D (주도형) 차원 (7문항) =====
  {
    id: 101,
    questionNumber: 1,
    questionType: 'likert',
    questionText: '업무에서 빠르게 결정을 내리고 즉시 실행하는 편이다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { D: 1 },
  },
  {
    id: 102,
    questionNumber: 2,
    questionType: 'likert',
    questionText: '어려운 문제에 직면했을 때 오히려 도전 의욕이 생긴다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { D: 1 },
  },
  {
    id: 103,
    questionNumber: 3,
    questionType: 'likert',
    questionText: '팀 프로젝트에서 자연스럽게 주도적인 역할을 맡게 된다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { D: 1 },
  },
  {
    id: 104,
    questionNumber: 4,
    questionType: 'likert',
    questionText: '결과가 나오지 않는 회의나 논의가 길어지면 답답함을 느낀다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { D: 1 },
  },
  {
    id: 105,
    questionNumber: 5,
    questionType: 'likert',
    questionText: '경쟁적인 상황에서 더 높은 성과를 내는 편이다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { D: 1 },
  },
  {
    id: 106,
    questionNumber: 6,
    questionType: 'likert',
    questionText: '의견 충돌이 있을 때 내 입장을 분명하게 밝히는 편이다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { D: 1 },
  },
  {
    id: 107,
    questionNumber: 7,
    questionType: 'likert',
    questionText: '일의 진행 속도가 느리면 직접 나서서 해결하려 한다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { D: 1 },
  },

  // ===== I (사교형) 차원 (7문항) =====
  {
    id: 108,
    questionNumber: 8,
    questionType: 'likert',
    questionText: '새로운 사람을 만나는 것이 즐겁고 에너지를 준다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { I: 1 },
  },
  {
    id: 109,
    questionNumber: 9,
    questionType: 'likert',
    questionText: '아이디어를 발표하거나 사람들 앞에서 이야기하는 것을 좋아한다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { I: 1 },
  },
  {
    id: 110,
    questionNumber: 10,
    questionType: 'likert',
    questionText: '어려운 상황에서도 긍정적인 면을 찾으려고 노력한다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { I: 1 },
  },
  {
    id: 111,
    questionNumber: 11,
    questionType: 'likert',
    questionText: '팀의 분위기를 활기차게 만드는 역할을 자주 한다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { I: 1 },
  },
  {
    id: 112,
    questionNumber: 12,
    questionType: 'likert',
    questionText: '다른 사람을 설득하거나 동기부여하는 데 자신이 있다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { I: 1 },
  },
  {
    id: 113,
    questionNumber: 13,
    questionType: 'likert',
    questionText: '회의나 모임에서 자유롭게 의견을 교환하는 것이 생산적이라 생각한다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { I: 1 },
  },
  {
    id: 114,
    questionNumber: 14,
    questionType: 'likert',
    questionText: '직장에서 동료들과 친밀한 관계를 유지하는 것이 중요하다고 느낀다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { I: 1 },
  },

  // ===== S (안정형) 차원 (7문항) =====
  {
    id: 115,
    questionNumber: 15,
    questionType: 'likert',
    questionText: '갑작스러운 변화보다는 예측 가능한 업무 환경을 선호한다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { S: 1 },
  },
  {
    id: 116,
    questionNumber: 16,
    questionType: 'likert',
    questionText: '팀원들 사이에 갈등이 생기면 중재자 역할을 하려고 한다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { S: 1 },
  },
  {
    id: 117,
    questionNumber: 17,
    questionType: 'likert',
    questionText: '맡은 일은 끝까지 책임감 있게 완수하는 편이다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { S: 1 },
  },
  {
    id: 118,
    questionNumber: 18,
    questionType: 'likert',
    questionText: '다른 사람의 의견을 먼저 경청한 후에 내 생각을 말하는 편이다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { S: 1 },
  },
  {
    id: 119,
    questionNumber: 19,
    questionType: 'likert',
    questionText: '한 가지 업무에 꾸준히 집중하여 완성도를 높이는 것이 좋다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { S: 1 },
  },
  {
    id: 120,
    questionNumber: 20,
    questionType: 'likert',
    questionText: '팀의 조화와 협력을 개인의 성과보다 중요하게 생각한다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { S: 1 },
  },
  {
    id: 121,
    questionNumber: 21,
    questionType: 'likert',
    questionText: '검증된 방법과 절차를 따르는 것이 안전하다고 생각한다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { S: 1 },
  },

  // ===== C (신중형) 차원 (7문항) =====
  {
    id: 122,
    questionNumber: 22,
    questionType: 'likert',
    questionText: '업무를 시작하기 전에 충분한 자료 조사와 분석을 하는 편이다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { C: 1 },
  },
  {
    id: 123,
    questionNumber: 23,
    questionType: 'likert',
    questionText: '보고서나 문서의 오류를 발견하면 반드시 수정해야 직성이 풀린다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { C: 1 },
  },
  {
    id: 124,
    questionNumber: 24,
    questionType: 'likert',
    questionText: '의사결정 시 감정보다 데이터와 논리를 우선시한다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { C: 1 },
  },
  {
    id: 125,
    questionNumber: 25,
    questionType: 'likert',
    questionText: '업무 프로세스를 체계적으로 정리하고 문서화하는 것이 중요하다고 생각한다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { C: 1 },
  },
  {
    id: 126,
    questionNumber: 26,
    questionType: 'likert',
    questionText: '정해진 규칙과 기준을 철저히 지키는 편이다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { C: 1 },
  },
  {
    id: 127,
    questionNumber: 27,
    questionType: 'likert',
    questionText: '결과물의 품질을 위해 시간이 더 걸리더라도 꼼꼼히 검토한다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { C: 1 },
  },
  {
    id: 128,
    questionNumber: 28,
    questionType: 'likert',
    questionText: '모호한 지시보다는 명확하고 구체적인 기준이 주어질 때 일을 잘 한다.',
    options: {
      scale: [1, 2, 3, 4, 5],
      labels: ['매우 아니다', '아니다', '보통', '그렇다', '매우 그렇다'],
    },
    scoringWeights: { C: 1 },
  },
];

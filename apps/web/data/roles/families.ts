import type { Industry, JobFamily } from './types';

/**
 * 업종 12개 · 직군 42개.
 *
 * hollandCode 와 onetCode 는 O*NET 이 공개한 값이다 — 이 두 개는 근거가 있다.
 * competencies 의 숫자는 아직 provisional 이다. O*NET 의 Abilities/Skills/
 * Work Styles 중요도(0-100 스케일)를 우리 능력치 30개로 사상해서 교체할 자리이고,
 * 그 전까지는 화면에서 잠정값으로 표시한다.
 */

export const INDUSTRIES: Industry[] = [
  { id: 'it', name: 'IT·소프트웨어' },
  { id: 'data', name: '데이터·AI' },
  { id: 'design', name: '디자인·크리에이티브' },
  { id: 'biz', name: '기획·경영지원' },
  { id: 'sales', name: '영업·마케팅' },
  { id: 'finance', name: '금융·회계' },
  { id: 'manufacturing', name: '제조·엔지니어링' },
  { id: 'construction', name: '건설·부동산' },
  { id: 'health', name: '의료·바이오' },
  { id: 'education', name: '교육·연구' },
  { id: 'media', name: '미디어·콘텐츠' },
  { id: 'service', name: '서비스·물류' },
];

export const JOB_FAMILIES: JobFamily[] = [
  // ── IT·소프트웨어 ────────────────────────────────────────────────
  {
    id: 'swe',
    industryId: 'it',
    name: '소프트웨어 개발',
    summary: '요구사항을 코드로 옮기고 동작하는 시스템으로 만든다',
    hollandCode: 'IRC',
    onetCode: '15-1252.00',
    competencies: {
      problemSolving: 92, analysis: 88, focus: 85, learningSpeed: 82,
      precision: 78, creativity: 68, cooperation: 62, endurance: 58,
    },
    competencySource: 'provisional',
  },
  {
    id: 'infra',
    industryId: 'it',
    name: '인프라·보안',
    summary: '서비스가 죽지 않게 하고, 사고가 나면 가장 먼저 대응한다',
    hollandCode: 'IRC',
    onetCode: '15-1244.00',
    competencies: {
      precision: 90, composure: 88, stressTolerance: 86, problemSolving: 84,
      analysis: 80, diligence: 76, focus: 72, execution: 68,
    },
    competencySource: 'provisional',
  },
  {
    id: 'qa',
    industryId: 'it',
    name: 'QA·품질',
    summary: '만들어진 것이 실제로 맞게 동작하는지 끝까지 확인한다',
    hollandCode: 'CIR',
    onetCode: '15-1253.00',
    competencies: {
      precision: 94, diligence: 88, focus: 84, analysis: 78,
      timeManagement: 70, communication: 66, composure: 62,
    },
    competencySource: 'provisional',
  },
  {
    id: 'pm-tech',
    industryId: 'it',
    name: '프로덕트 매니지먼트',
    summary: '무엇을 만들지 정하고, 만드는 사람들 사이의 결정을 좁힌다',
    hollandCode: 'EIC',
    onetCode: '13-1082.00',
    competencies: {
      planning: 90, communication: 88, determination: 82, analysis: 80,
      influence: 76, timeManagement: 74, empathy: 70, adaptability: 68,
    },
    competencySource: 'provisional',
  },

  // ── 데이터·AI ────────────────────────────────────────────────────
  {
    id: 'data-science',
    industryId: 'data',
    name: '데이터 사이언스',
    summary: '데이터에서 패턴을 찾아 의사결정에 쓸 수 있는 형태로 만든다',
    hollandCode: 'IRC',
    onetCode: '15-2051.00',
    competencies: {
      analysis: 95, problemSolving: 88, focus: 84, learningSpeed: 82,
      precision: 78, creativity: 70, communication: 66,
    },
    competencySource: 'provisional',
  },
  {
    id: 'data-eng',
    industryId: 'data',
    name: '데이터 엔지니어링',
    summary: '흩어진 데이터를 쓸 수 있는 상태로 모으고 흐르게 한다',
    hollandCode: 'IRC',
    onetCode: '15-2051.01',
    competencies: {
      analysis: 86, precision: 88, problemSolving: 84, focus: 82,
      diligence: 78, execution: 72, learningSpeed: 70,
    },
    competencySource: 'provisional',
  },
  {
    id: 'data-analyst',
    industryId: 'data',
    name: '데이터 분석',
    summary: '숫자로 무슨 일이 일어났는지 설명하고 다음 행동을 제안한다',
    hollandCode: 'ICE',
    onetCode: '13-1161.01',
    competencies: {
      analysis: 92, communication: 80, problemSolving: 78, precision: 76,
      verbalAbility: 72, planning: 68, intuition: 62,
    },
    competencySource: 'provisional',
  },

  // ── 디자인·크리에이티브 ──────────────────────────────────────────
  {
    id: 'product-design',
    industryId: 'design',
    name: '프로덕트 디자인',
    summary: '사람이 실제로 쓸 수 있는 화면과 흐름을 만든다',
    hollandCode: 'AIR',
    onetCode: '15-1255.00',
    competencies: {
      aesthetics: 92, creativity: 88, empathy: 82, problemSolving: 76,
      communication: 74, precision: 70, spatialAwareness: 68, innovation: 66,
    },
    competencySource: 'provisional',
  },
  {
    id: 'graphic-design',
    industryId: 'design',
    name: '그래픽·브랜드 디자인',
    summary: '브랜드가 보이는 방식을 만들고 일관되게 유지한다',
    hollandCode: 'ARE',
    onetCode: '27-1024.00',
    competencies: {
      aesthetics: 95, creativity: 90, spatialAwareness: 76, precision: 72,
      innovation: 70, communication: 62, timeManagement: 60,
    },
    competencySource: 'provisional',
  },
  {
    id: 'ux-research',
    industryId: 'design',
    name: 'UX 리서치',
    summary: '사용자가 실제로 무엇에 막히는지 직접 확인해서 근거를 만든다',
    hollandCode: 'ISA',
    onetCode: '19-3039.03',
    competencies: {
      empathy: 90, analysis: 86, communication: 82, verbalAbility: 78,
      intuition: 74, precision: 70, planning: 66,
    },
    competencySource: 'provisional',
  },

  // ── 기획·경영지원 ────────────────────────────────────────────────
  {
    id: 'strategy',
    industryId: 'biz',
    name: '전략·사업기획',
    summary: '회사가 어디로 갈지 근거를 만들어 제안하고 설득한다',
    hollandCode: 'EIC',
    onetCode: '13-1111.00',
    competencies: {
      analysis: 88, planning: 90, influence: 82, verbalAbility: 80,
      determination: 76, networking: 70, ambition: 68,
    },
    competencySource: 'provisional',
  },
  {
    id: 'hr',
    industryId: 'biz',
    name: '인사·조직',
    summary: '사람을 뽑고, 남게 하고, 조직이 굴러가게 만든다',
    hollandCode: 'ESC',
    onetCode: '13-1071.00',
    competencies: {
      empathy: 88, communication: 90, cooperation: 82, precision: 74,
      composure: 72, planning: 70, networking: 68,
    },
    competencySource: 'provisional',
  },
  {
    id: 'ops',
    industryId: 'biz',
    name: '경영지원·총무',
    summary: '회사가 돌아가는 데 필요한 잡다한 일을 빠뜨리지 않고 처리한다',
    hollandCode: 'CES',
    onetCode: '43-6014.00',
    competencies: {
      precision: 90, diligence: 86, multitasking: 82, timeManagement: 80,
      cooperation: 72, communication: 68,
    },
    competencySource: 'provisional',
  },
  {
    id: 'legal',
    industryId: 'biz',
    name: '법무·컴플라이언스',
    summary: '회사가 하는 일이 법의 테두리 안에 있는지 확인한다',
    hollandCode: 'EIC',
    onetCode: '23-1011.00',
    competencies: {
      precision: 94, analysis: 88, verbalAbility: 86, diligence: 82,
      focus: 78, composure: 72,
    },
    competencySource: 'provisional',
  },

  // ── 영업·마케팅 ──────────────────────────────────────────────────
  {
    id: 'sales-b2b',
    industryId: 'sales',
    name: 'B2B 영업',
    summary: '기업 고객을 만나 관계를 만들고 계약까지 끌고 간다',
    hollandCode: 'ECS',
    onetCode: '41-4012.00',
    competencies: {
      influence: 92, networking: 90, communication: 88, resilience: 84,
      determination: 78, ambition: 76, empathy: 70,
    },
    competencySource: 'provisional',
  },
  {
    id: 'sales-b2c',
    industryId: 'sales',
    name: '리테일·B2C 영업',
    summary: '매장이나 채널에서 개인 고객을 직접 상대한다',
    hollandCode: 'ESC',
    onetCode: '41-2031.00',
    competencies: {
      communication: 90, empathy: 84, endurance: 80, resilience: 78,
      influence: 74, adaptability: 70,
    },
    competencySource: 'provisional',
  },
  {
    id: 'marketing',
    industryId: 'sales',
    name: '마케팅',
    summary: '제품을 알리고, 얼마나 알려졌는지 숫자로 확인한다',
    hollandCode: 'EAI',
    onetCode: '11-2021.00',
    competencies: {
      creativity: 84, analysis: 82, communication: 84, planning: 80,
      innovation: 74, influence: 72, adaptability: 70,
    },
    competencySource: 'provisional',
  },
  {
    id: 'cs',
    industryId: 'sales',
    name: '고객지원',
    summary: '문제가 생긴 고객을 가장 먼저 만나 해결까지 안내한다',
    hollandCode: 'SEC',
    onetCode: '43-4051.00',
    competencies: {
      empathy: 90, communication: 88, composure: 86, stressTolerance: 84,
      multitasking: 76, precision: 70,
    },
    competencySource: 'provisional',
  },

  // ── 금융·회계 ────────────────────────────────────────────────────
  {
    id: 'accounting',
    industryId: 'finance',
    name: '회계·세무',
    summary: '돈의 흐름을 기록하고 틀린 곳이 없게 맞춘다',
    hollandCode: 'CEI',
    onetCode: '13-2011.00',
    competencies: {
      precision: 95, diligence: 90, analysis: 80, focus: 78,
      timeManagement: 72, composure: 68,
    },
    competencySource: 'provisional',
  },
  {
    id: 'finance-corp',
    industryId: 'finance',
    name: '재무·자금',
    summary: '회사의 돈을 어디에 얼마나 쓸지 계획하고 관리한다',
    hollandCode: 'CEI',
    onetCode: '13-2051.00',
    competencies: {
      analysis: 90, precision: 86, planning: 84, determination: 74,
      composure: 72, verbalAbility: 66,
    },
    competencySource: 'provisional',
  },
  {
    id: 'invest',
    industryId: 'finance',
    name: '투자·심사',
    summary: '어디에 돈을 넣을지 판단하고 그 판단에 책임을 진다',
    hollandCode: 'EIC',
    onetCode: '13-2052.00',
    competencies: {
      analysis: 92, determination: 86, intuition: 78, stressTolerance: 80,
      networking: 74, ambition: 76, composure: 72,
    },
    competencySource: 'provisional',
  },

  // ── 제조·엔지니어링 ──────────────────────────────────────────────
  {
    id: 'mech-eng',
    industryId: 'manufacturing',
    name: '기계·설계 엔지니어링',
    summary: '물리적으로 동작하는 것을 설계하고 도면으로 만든다',
    hollandCode: 'RIC',
    onetCode: '17-2141.00',
    competencies: {
      spatialAwareness: 90, analysis: 86, precision: 88, problemSolving: 82,
      focus: 78, creativity: 66,
    },
    competencySource: 'provisional',
  },
  {
    id: 'production',
    industryId: 'manufacturing',
    name: '생산·공정관리',
    summary: '라인이 멈추지 않고 계획한 양이 나오게 관리한다',
    hollandCode: 'RCE',
    onetCode: '17-2112.00',
    competencies: {
      execution: 88, timeManagement: 86, precision: 82, composure: 80,
      leadership: 74, endurance: 76, problemSolving: 72,
    },
    competencySource: 'provisional',
  },
  {
    id: 'quality-mfg',
    industryId: 'manufacturing',
    name: '품질관리',
    summary: '기준에 못 미치는 것이 밖으로 나가지 않게 막는다',
    hollandCode: 'RCI',
    onetCode: '17-2112.01',
    competencies: {
      precision: 95, diligence: 88, analysis: 80, focus: 82,
      determination: 70, composure: 68,
    },
    competencySource: 'provisional',
  },

  // ── 건설·부동산 ──────────────────────────────────────────────────
  {
    id: 'civil-eng',
    industryId: 'construction',
    name: '건축·토목 설계',
    summary: '건물과 구조물을 설계하고 안전 기준을 맞춘다',
    hollandCode: 'RIA',
    onetCode: '17-2051.00',
    competencies: {
      spatialAwareness: 92, precision: 88, analysis: 84, planning: 80,
      aesthetics: 70, diligence: 76,
    },
    competencySource: 'provisional',
  },
  {
    id: 'construction-mgmt',
    industryId: 'construction',
    name: '시공·현장관리',
    summary: '현장에서 일정과 사람과 안전을 동시에 관리한다',
    hollandCode: 'REC',
    onetCode: '11-9021.00',
    competencies: {
      leadership: 86, execution: 88, endurance: 84, composure: 82,
      timeManagement: 84, stressTolerance: 80, determination: 76,
    },
    competencySource: 'provisional',
  },
  {
    id: 'realestate',
    industryId: 'construction',
    name: '부동산·자산관리',
    summary: '부동산의 가치를 판단하고 거래와 운영을 맡는다',
    hollandCode: 'ECS',
    onetCode: '41-9021.00',
    competencies: {
      networking: 86, influence: 84, communication: 82, analysis: 76,
      determination: 74, resilience: 72,
    },
    competencySource: 'provisional',
  },

  // ── 의료·바이오 ──────────────────────────────────────────────────
  {
    id: 'clinical',
    industryId: 'health',
    name: '임상·진료',
    summary: '환자를 직접 만나 판단하고 처치한다',
    hollandCode: 'SIR',
    onetCode: '29-1141.00',
    competencies: {
      empathy: 90, composure: 92, precision: 88, stressTolerance: 90,
      endurance: 84, analysis: 80, communication: 78,
    },
    competencySource: 'provisional',
  },
  {
    id: 'bio-research',
    industryId: 'health',
    name: '바이오·제약 연구',
    summary: '실험을 설계하고 반복해서 근거를 만든다',
    hollandCode: 'IRC',
    onetCode: '19-1042.00',
    competencies: {
      analysis: 92, precision: 90, focus: 86, diligence: 88,
      problemSolving: 80, learningSpeed: 74,
    },
    competencySource: 'provisional',
  },
  {
    id: 'health-admin',
    industryId: 'health',
    name: '의료행정·상담',
    summary: '환자 흐름과 의료 기록, 보험 절차를 관리한다',
    hollandCode: 'CSE',
    onetCode: '29-2072.00',
    competencies: {
      precision: 88, empathy: 82, multitasking: 80, communication: 80,
      composure: 78, diligence: 76,
    },
    competencySource: 'provisional',
  },

  // ── 교육·연구 ────────────────────────────────────────────────────
  {
    id: 'teaching',
    industryId: 'education',
    name: '교육·강의',
    summary: '아는 것을 남이 알아들을 수 있게 전달한다',
    hollandCode: 'SAE',
    onetCode: '25-2021.00',
    competencies: {
      communication: 92, verbalAbility: 90, empathy: 86, endurance: 76,
      planning: 74, composure: 74, adaptability: 72,
    },
    competencySource: 'provisional',
  },
  {
    id: 'research',
    industryId: 'education',
    name: '학술·기초연구',
    summary: '아직 답이 없는 질문을 오래 붙잡고 판다',
    hollandCode: 'IAR',
    onetCode: '19-3011.00',
    competencies: {
      analysis: 94, focus: 92, diligence: 86, creativity: 78,
      verbalAbility: 76, resilience: 74, learningSpeed: 78,
    },
    competencySource: 'provisional',
  },
  {
    id: 'edu-planning',
    industryId: 'education',
    name: '교육기획·커리큘럼',
    summary: '무엇을 어떤 순서로 가르칠지 설계한다',
    hollandCode: 'SEI',
    onetCode: '25-9031.00',
    competencies: {
      planning: 88, communication: 82, empathy: 78, analysis: 76,
      creativity: 74, precision: 70,
    },
    competencySource: 'provisional',
  },

  // ── 미디어·콘텐츠 ────────────────────────────────────────────────
  {
    id: 'content',
    industryId: 'media',
    name: '콘텐츠 기획·제작',
    summary: '사람이 끝까지 보게 만드는 것을 기획하고 만든다',
    hollandCode: 'AEI',
    onetCode: '27-3043.00',
    competencies: {
      creativity: 92, verbalAbility: 84, aesthetics: 80, innovation: 78,
      intuition: 76, timeManagement: 70, adaptability: 72,
    },
    competencySource: 'provisional',
  },
  {
    id: 'writing',
    industryId: 'media',
    name: '기자·에디터',
    summary: '사실을 확인하고 읽히는 글로 정리한다',
    hollandCode: 'AIE',
    onetCode: '27-3041.00',
    competencies: {
      verbalAbility: 94, analysis: 82, precision: 84, communication: 80,
      timeManagement: 76, resilience: 72,
    },
    competencySource: 'provisional',
  },
  {
    id: 'av-production',
    industryId: 'media',
    name: '영상·음향 제작',
    summary: '촬영하고 편집해서 완성된 결과물로 만든다',
    hollandCode: 'ARE',
    onetCode: '27-4032.00',
    competencies: {
      aesthetics: 88, creativity: 86, spatialAwareness: 78, precision: 76,
      endurance: 76, cooperation: 72, timeManagement: 74,
    },
    competencySource: 'provisional',
  },

  // ── 서비스·물류 ──────────────────────────────────────────────────
  {
    id: 'logistics',
    industryId: 'service',
    name: '물류·SCM',
    summary: '물건이 제때 제자리에 도착하게 만든다',
    hollandCode: 'CER',
    onetCode: '13-1081.00',
    competencies: {
      planning: 88, timeManagement: 90, precision: 84, problemSolving: 78,
      multitasking: 80, composure: 74,
    },
    competencySource: 'provisional',
  },
  {
    id: 'hospitality',
    industryId: 'service',
    name: '호텔·외식 서비스',
    summary: '현장에서 손님을 직접 응대하고 경험을 만든다',
    hollandCode: 'SEC',
    onetCode: '35-1012.00',
    competencies: {
      empathy: 88, communication: 86, endurance: 86, composure: 82,
      multitasking: 84, cooperation: 78, stressTolerance: 80,
    },
    competencySource: 'provisional',
  },
  {
    id: 'facility',
    industryId: 'service',
    name: '설비·정비',
    summary: '고장 난 것을 직접 손으로 고친다',
    hollandCode: 'RCI',
    onetCode: '49-9071.00',
    competencies: {
      spatialAwareness: 84, problemSolving: 84, precision: 82, endurance: 82,
      focus: 76, diligence: 78, composure: 72,
    },
    competencySource: 'provisional',
  },
];

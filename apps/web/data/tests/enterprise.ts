// 기업용 추가 심층 검사 정의
// 일반 종합 검사(53문항) + 기업 전용 딥 테스트로 정밀 능력치 + 채용 적합도 산출

export interface EnterpriseTestMeta {
  code: string;
  name: string;
  description: string;
  questionCount: number;
  category: 'cognitive' | 'competency' | 'culture';
  categoryLabel: string;
  estimatedMinutes: number;
  available: boolean;
}

// 기업용 추가 검사 목록
export const ENTERPRISE_TESTS: EnterpriseTestMeta[] = [
  // 인지능력 검사
  {
    code: 'iq-logic',
    name: '논리 추론',
    description: '패턴 인식 및 논리적 사고력 측정',
    questionCount: 20,
    category: 'cognitive',
    categoryLabel: '인지능력',
    estimatedMinutes: 15,
    available: false,
  },
  {
    code: 'iq-numerical',
    name: '수리 추론',
    description: '수치 데이터 분석 및 계산 능력',
    questionCount: 15,
    category: 'cognitive',
    categoryLabel: '인지능력',
    estimatedMinutes: 12,
    available: false,
  },
  {
    code: 'iq-verbal',
    name: '언어 추론',
    description: '언어 이해 및 논리적 표현 능력',
    questionCount: 15,
    category: 'cognitive',
    categoryLabel: '인지능력',
    estimatedMinutes: 10,
    available: false,
  },

  // 역량 평가
  {
    code: 'comp-leadership',
    name: '리더십 역량',
    description: '상황별 리더십 스타일 및 의사결정',
    questionCount: 20,
    category: 'competency',
    categoryLabel: '역량 평가',
    estimatedMinutes: 10,
    available: false,
  },
  {
    code: 'comp-teamwork',
    name: '팀워크 역량',
    description: '협업, 갈등 해결, 커뮤니케이션',
    questionCount: 15,
    category: 'competency',
    categoryLabel: '역량 평가',
    estimatedMinutes: 8,
    available: false,
  },
  {
    code: 'comp-problem',
    name: '문제해결 역량',
    description: '비즈니스 케이스 기반 문제해결 능력',
    questionCount: 10,
    category: 'competency',
    categoryLabel: '역량 평가',
    estimatedMinutes: 15,
    available: false,
  },

  // 조직문화 적합도
  {
    code: 'culture-fit',
    name: '조직문화 적합도',
    description: '기업 가치관 및 업무 환경 선호도',
    questionCount: 20,
    category: 'culture',
    categoryLabel: '조직문화',
    estimatedMinutes: 8,
    available: false,
  },
  {
    code: 'culture-stress',
    name: '스트레스 대처',
    description: '업무 스트레스 상황 시뮬레이션',
    questionCount: 15,
    category: 'culture',
    categoryLabel: '조직문화',
    estimatedMinutes: 8,
    available: false,
  },
];

// 기업용 채용 리포트 구조
export interface HiringReport {
  candidateName: string;
  testDate: string;

  // 기본 종합 검사 결과 (53문항)
  comprehensiveProfile: any; // ComprehensiveProfile

  // 추가 심층 검사 결과
  cognitiveScores?: {
    logic: number;      // 0-100
    numerical: number;
    verbal: number;
    overall: number;
  };

  competencyScores?: {
    leadership: number;
    teamwork: number;
    problemSolving: number;
    overall: number;
  };

  cultureFit?: {
    fitScore: number;   // 0-100
    dimensions: { key: string; label: string; candidateScore: number; companyTarget: number }[];
    stressHandling: string;
  };

  // 종합 채용 추천
  recommendation: {
    overallScore: number;  // 0-100
    grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D';
    strengths: string[];
    risks: string[];
    fitRoles: string[];    // 적합 직무
    summary: string;
  };

  // 30가지 능력치 (기업 버전: 심층 검사 반영으로 더 정밀)
  enhancedAbilities: { key: string; name: string; basicScore: number; enhancedScore: number }[];
}

// 기업용 요금제
export const ENTERPRISE_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '월 99,000원',
    pricePerTest: '건당 5,000원',
    features: [
      '종합 검사 (53문항) 무제한',
      '기본 채용 리포트',
      '30가지 능력치',
      '월 20명 테스트',
    ],
    maxCandidatesPerMonth: 20,
  },
  {
    id: 'business',
    name: 'Business',
    price: '월 299,000원',
    pricePerTest: '건당 3,000원',
    features: [
      'Starter 전체 포함',
      '인지능력 검사 (IQ 3종)',
      '역량 평가 (3종)',
      '월 100명 테스트',
      '팀 분석 대시보드',
      'API 연동',
    ],
    maxCandidatesPerMonth: 100,
    recommended: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '문의',
    pricePerTest: '맞춤 견적',
    features: [
      'Business 전체 포함',
      '조직문화 적합도 분석',
      '맞춤형 역량 모델',
      '무제한 테스트',
      '전담 매니저',
      'SSO/SAML 인증',
      'ATS 연동',
    ],
    maxCandidatesPerMonth: Infinity,
  },
];

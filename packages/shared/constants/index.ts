// Test codes
export const TEST_CODES = {
  MBTI: 'mbti',
  DISC: 'disc',
  ENNEAGRAM: 'enneagram',
  TCI: 'tci',
  GALLUP: 'gallup',
  HOLLAND: 'holland',
  IQ: 'iq',
  MMPI: 'mmpi',
  TAROT: 'tarot',
  HTP: 'htp',
  SAJU: 'saju',
  SASANG: 'sasang',
  FACE: 'face',
  BLOOD: 'blood',
} as const;

export type TestCode = (typeof TEST_CODES)[keyof typeof TEST_CODES];

// Test categories
export const TEST_CATEGORIES = {
  PERSONALITY: 'personality',
  APTITUDE: 'aptitude',
  TRADITIONAL: 'traditional',
} as const;

// Ability categories
export const ABILITY_CATEGORIES = {
  MENTAL: 'mental',
  SOCIAL: 'social',
  WORK: 'work',
  PHYSICAL: 'physical',
  POTENTIAL: 'potential',
} as const;

// Ability category names (Korean)
export const ABILITY_CATEGORY_NAMES: Record<string, string> = {
  mental: '정신력',
  social: '사회성',
  work: '업무역량',
  physical: '신체/감각',
  potential: '잠재력',
};

// 30 Abilities
export const ABILITIES = [
  // Mental
  { code: 'determination', name: '결단력', category: 'mental' },
  { code: 'composure', name: '침착성', category: 'mental' },
  { code: 'concentration', name: '집중력', category: 'mental' },
  { code: 'creativity', name: '창의성', category: 'mental' },
  { code: 'analytical', name: '분석력', category: 'mental' },
  { code: 'adaptability', name: '적응력', category: 'mental' },
  // Social
  { code: 'communication', name: '소통능력', category: 'social' },
  { code: 'teamwork', name: '협동심', category: 'social' },
  { code: 'leadership', name: '리더십', category: 'social' },
  { code: 'empathy', name: '공감능력', category: 'social' },
  { code: 'influence', name: '영향력', category: 'social' },
  { code: 'networking', name: '네트워킹', category: 'social' },
  // Work
  { code: 'execution', name: '실행력', category: 'work' },
  { code: 'planning', name: '기획력', category: 'work' },
  { code: 'problem_solving', name: '문제해결', category: 'work' },
  { code: 'time_management', name: '시간관리', category: 'work' },
  { code: 'attention_detail', name: '꼼꼼함', category: 'work' },
  { code: 'multitasking', name: '멀티태스킹', category: 'work' },
  // Physical
  { code: 'stress_resistance', name: '스트레스내성', category: 'physical' },
  { code: 'endurance', name: '지구력', category: 'physical' },
  { code: 'intuition', name: '직관력', category: 'physical' },
  { code: 'aesthetic', name: '심미안', category: 'physical' },
  { code: 'spatial', name: '공간지각', category: 'physical' },
  { code: 'verbal', name: '언어능력', category: 'physical' },
  // Potential
  { code: 'growth_potential', name: '성장가능성', category: 'potential' },
  { code: 'learning_speed', name: '학습속도', category: 'potential' },
  { code: 'innovation', name: '혁신성', category: 'potential' },
  { code: 'resilience', name: '회복탄력성', category: 'potential' },
  { code: 'ambition', name: '야망', category: 'potential' },
  { code: 'integrity', name: '성실성', category: 'potential' },
] as const;

// Report prices
export const REPORT_PRICES = {
  basic: 9900,
  pro: 29900,
  premium: 59900,
} as const;

// Report features
export const REPORT_FEATURES = {
  basic: [
    '30개 능력치 점수',
    '레이더 차트',
    '검사별 결과 요약',
  ],
  pro: [
    'Basic 전체 포함',
    '상세 분석',
    '직업 추천',
    'PDF 내보내기',
  ],
  premium: [
    'Pro 전체 포함',
    '성장 로드맵',
    'AI 1:1 상담',
  ],
} as const;

// Test info (for display)
export const TEST_INFO = [
  {
    category: '성격 검사',
    tests: [
      { code: 'mbti', name: 'MBTI', description: '16가지 성격 유형 분석', questions: 48 },
      { code: 'disc', name: 'DISC', description: '행동 유형 분석', questions: 28 },
      { code: 'enneagram', name: '에니어그램', description: '9가지 성격 유형', questions: 36 },
      { code: 'tci', name: 'TCI', description: '기질 및 성격 검사', questions: 140 },
    ],
  },
  {
    category: '적성/역량 검사',
    tests: [
      { code: 'gallup', name: 'Gallup 강점', description: '34개 강점 테마', questions: 34 },
      { code: 'holland', name: 'Holland', description: '직업 흥미 유형', questions: 42 },
      { code: 'iq', name: 'IQ 테스트', description: '논리/패턴 분석', questions: 30 },
      { code: 'mmpi', name: 'MMPI 간이', description: '다면적 인성 검사', questions: 50 },
    ],
  },
  {
    category: '전통/특수 검사',
    tests: [
      { code: 'tarot', name: '타로', description: '이미지 선택 기반', questions: 10 },
      { code: 'htp', name: 'HTP', description: '그림 심리 검사', questions: 3 },
      { code: 'saju', name: '사주', description: '생년월일시 분석', questions: 1 },
      { code: 'sasang', name: '사상체질', description: '체질 유형 분석', questions: 20 },
      { code: 'face', name: '관상', description: '얼굴 분석', questions: 1 },
      { code: 'blood', name: '혈액형', description: '혈액형 성격 분석', questions: 5 },
    ],
  },
] as const;

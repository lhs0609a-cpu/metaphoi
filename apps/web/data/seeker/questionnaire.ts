export type QuestionInputType = 'single-choice' | 'multi-choice' | 'scale' | 'text-short';

export interface SeekerQuestion {
  id: string;
  phase: 'career' | 'role' | 'style';
  role?: string;
  questionText: string;
  subText?: string;
  inputType: QuestionInputType;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: [string, string];
  required: boolean;
  matchingField?: string;
}

// ============================================================
// Phase 2: 경력/팀워크 공통 질문 (8문항)
// ============================================================

const careerQuestions: SeekerQuestion[] = [
  {
    id: 'career_001',
    phase: 'career',
    questionText: '총 경력 기간은 어떻게 되시나요?',
    inputType: 'single-choice',
    options: ['신입', '1-2년', '3-5년', '5-10년', '10년 이상'],
    required: true,
    matchingField: 'experience_years',
  },
  {
    id: 'career_002',
    phase: 'career',
    questionText: '최종 학력은 어떻게 되시나요?',
    inputType: 'single-choice',
    options: ['고졸', '전문대졸', '대졸', '석사', '박사'],
    required: true,
    matchingField: 'education',
  },
  {
    id: 'career_003',
    phase: 'career',
    questionText: '희망 연봉대는 어떻게 되시나요?',
    inputType: 'single-choice',
    options: ['3,000만원 미만', '3,000-4,000만원', '4,000-5,000만원', '5,000-7,000만원', '7,000만원 이상', '협의 가능'],
    required: true,
    matchingField: 'salary_range',
  },
  {
    id: 'career_004',
    phase: 'career',
    questionText: '선호하는 근무 지역은 어디인가요?',
    inputType: 'single-choice',
    options: ['서울', '수도권', '지방', '해외', '무관'],
    required: true,
    matchingField: 'location_pref',
  },
  {
    id: 'career_005',
    phase: 'career',
    questionText: '선호하는 근무 형태는 무엇인가요?',
    inputType: 'single-choice',
    options: ['재택근무', '하이브리드', '출근'],
    required: true,
    matchingField: 'remote_pref',
  },
  {
    id: 'career_006',
    phase: 'career',
    questionText: '선호하는 팀 규모는 어떻게 되나요?',
    inputType: 'single-choice',
    options: ['1-5명', '6-15명', '16-50명', '50명 이상', '무관'],
    required: true,
  },
  {
    id: 'career_007',
    phase: 'career',
    questionText: '리더십 경험 수준은 어느 정도인가요?',
    subText: '1: 경험 없음 ~ 5: 팀 전체 리드',
    inputType: 'scale',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ['경험 없음', '팀 전체 리드'],
    required: true,
  },
  {
    id: 'career_008',
    phase: 'career',
    questionText: '선호하는 협업 스타일은 무엇인가요?',
    inputType: 'single-choice',
    options: ['독립적 작업 선호', '균형 잡힌 협업', '강한 협업 선호'],
    required: true,
  },
];

// ============================================================
// Phase 3: 직군별 질문
// ============================================================

const developerQuestions: SeekerQuestion[] = [
  {
    id: 'dev_001',
    phase: 'role',
    role: '개발자',
    questionText: '주 포지션은 무엇인가요?',
    inputType: 'single-choice',
    options: ['프론트엔드', '백엔드', '풀스택', '모바일', '데이터', '인프라/DevOps'],
    required: true,
  },
  {
    id: 'dev_002',
    phase: 'role',
    role: '개발자',
    questionText: '주로 사용하는 기술 스택을 선택해주세요.',
    subText: '최대 5개까지 선택 가능합니다',
    inputType: 'multi-choice',
    options: ['JavaScript/TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C/C++', 'Swift', 'Kotlin', 'React', 'Vue', 'Angular', 'Node.js', 'Spring', 'Django/FastAPI', 'AWS', 'GCP', 'Docker/K8s'],
    required: true,
  },
  {
    id: 'dev_003',
    phase: 'role',
    role: '개발자',
    questionText: '선호하는 개발 방법론은 무엇인가요?',
    inputType: 'single-choice',
    options: ['애자일/스크럼', '칸반', '워터폴', '상관없음'],
    required: true,
  },
  {
    id: 'dev_004',
    phase: 'role',
    role: '개발자',
    questionText: '코드 리뷰를 얼마나 중요하게 생각하시나요?',
    subText: '1: 별로 ~ 5: 매우 중요',
    inputType: 'scale',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ['별로 중요하지 않음', '매우 중요'],
    required: true,
  },
  {
    id: 'dev_005',
    phase: 'role',
    role: '개발자',
    questionText: '오픈소스 기여 경험이 있으신가요?',
    inputType: 'single-choice',
    options: ['없음', '사용만', '기여 경험 있음', '메인테이너 경험'],
    required: true,
  },
  {
    id: 'dev_006',
    phase: 'role',
    role: '개발자',
    questionText: '테스트 코드 작성 습관은 어떠한가요?',
    subText: '1: 거의 안 씀 ~ 5: TDD 수준',
    inputType: 'scale',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ['거의 안 씀', 'TDD 수준'],
    required: true,
  },
];

const pmQuestions: SeekerQuestion[] = [
  {
    id: 'pm_001',
    phase: 'role',
    role: 'PM',
    questionText: '주로 사용하는 프로젝트 관리 도구를 선택해주세요.',
    inputType: 'multi-choice',
    options: ['Jira', 'Asana', 'Notion', 'Linear', 'Trello', 'Monday.com', 'ClickUp'],
    required: true,
  },
  {
    id: 'pm_002',
    phase: 'role',
    role: 'PM',
    questionText: '관리해본 최대 팀 규모는 어떻게 되나요?',
    inputType: 'single-choice',
    options: ['5명 이하', '6-10명', '11-20명', '20명 이상'],
    required: true,
  },
  {
    id: 'pm_003',
    phase: 'role',
    role: 'PM',
    questionText: '다양한 이해관계자와의 커뮤니케이션 경험은?',
    subText: '1: 제한적 ~ 5: C-Level까지 소통',
    inputType: 'scale',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ['제한적', 'C-Level까지 소통'],
    required: true,
  },
  {
    id: 'pm_004',
    phase: 'role',
    role: 'PM',
    questionText: '데이터 기반 의사결정 경험 수준은?',
    subText: '1: 직관 위주 ~ 5: A/B테스트 등 데이터 드리븐',
    inputType: 'scale',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ['직관 위주', '데이터 드리븐'],
    required: true,
  },
  {
    id: 'pm_005',
    phase: 'role',
    role: 'PM',
    questionText: 'B2B / B2C 중 어떤 경험이 더 많으신가요?',
    inputType: 'single-choice',
    options: ['B2B 위주', 'B2C 위주', '둘 다 경험', '해당 없음'],
    required: true,
  },
  {
    id: 'pm_006',
    phase: 'role',
    role: 'PM',
    questionText: '선호하는 제품 단계는 무엇인가요?',
    inputType: 'single-choice',
    options: ['0→1 신규 제품', '성장기 제품', '성숙기 제품', '상관없음'],
    required: true,
  },
];

const designerQuestions: SeekerQuestion[] = [
  {
    id: 'design_001',
    phase: 'role',
    role: '디자이너',
    questionText: '디자인 전문 분야를 선택해주세요.',
    inputType: 'multi-choice',
    options: ['UI 디자인', 'UX 디자인', '그래픽 디자인', '브랜딩', 'BX', '모션', '일러스트'],
    required: true,
  },
  {
    id: 'design_002',
    phase: 'role',
    role: '디자이너',
    questionText: '주로 사용하는 도구를 선택해주세요.',
    inputType: 'multi-choice',
    options: ['Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'After Effects', 'Framer'],
    required: true,
  },
  {
    id: 'design_003',
    phase: 'role',
    role: '디자이너',
    questionText: '포트폴리오 유형은 무엇인가요?',
    inputType: 'single-choice',
    options: ['개인 웹사이트', '노션/PDF', 'Behance/Dribbble', '없음'],
    required: true,
  },
  {
    id: 'design_004',
    phase: 'role',
    role: '디자이너',
    questionText: '개발자와의 협업 경험은 어느 정도인가요?',
    subText: '1: 거의 없음 ~ 5: 긴밀한 협업',
    inputType: 'scale',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ['거의 없음', '긴밀한 협업'],
    required: true,
  },
  {
    id: 'design_005',
    phase: 'role',
    role: '디자이너',
    questionText: '사용자 리서치 경험 수준은?',
    subText: '1: 경험 없음 ~ 5: 직접 기획/실행',
    inputType: 'scale',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ['경험 없음', '직접 기획/실행'],
    required: true,
  },
  {
    id: 'design_006',
    phase: 'role',
    role: '디자이너',
    questionText: '디자인 시스템 구축/운영 경험이 있으신가요?',
    inputType: 'single-choice',
    options: ['없음', '사용만 해봄', '구축 참여', '직접 구축/운영'],
    required: true,
  },
];

const marketerQuestions: SeekerQuestion[] = [
  {
    id: 'mkt_001',
    phase: 'role',
    role: '마케터',
    questionText: '주로 경험한 마케팅 채널을 선택해주세요.',
    inputType: 'multi-choice',
    options: ['검색광고(SEM)', 'SNS 광고', '콘텐츠 마케팅', '이메일 마케팅', 'SEO', '인플루언서', 'PR', 'CRM'],
    required: true,
  },
  {
    id: 'mkt_002',
    phase: 'role',
    role: '마케터',
    questionText: '사용하는 분석 도구를 선택해주세요.',
    inputType: 'multi-choice',
    options: ['Google Analytics', 'Amplitude', 'Mixpanel', 'Meta Ads Manager', 'Google Ads', 'Braze', 'AppsFlyer'],
    required: true,
  },
  {
    id: 'mkt_003',
    phase: 'role',
    role: '마케터',
    questionText: 'B2B / B2C 중 어떤 경험이 더 많으신가요?',
    inputType: 'single-choice',
    options: ['B2B 위주', 'B2C 위주', '둘 다 경험'],
    required: true,
  },
  {
    id: 'mkt_004',
    phase: 'role',
    role: '마케터',
    questionText: '관리해본 최대 월 캠페인 예산 규모는?',
    inputType: 'single-choice',
    options: ['100만원 미만', '100-500만원', '500-2,000만원', '2,000만원-1억', '1억 이상'],
    required: true,
  },
  {
    id: 'mkt_005',
    phase: 'role',
    role: '마케터',
    questionText: '퍼포먼스 vs 브랜드 마케팅 성향은?',
    subText: '1: 퍼포먼스 위주 ~ 5: 브랜드 위주',
    inputType: 'scale',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ['퍼포먼스 위주', '브랜드 위주'],
    required: true,
  },
  {
    id: 'mkt_006',
    phase: 'role',
    role: '마케터',
    questionText: '콘텐츠 직접 제작 경험이 있나요?',
    inputType: 'single-choice',
    options: ['없음', '텍스트 콘텐츠', '영상 콘텐츠', '텍스트+영상 모두'],
    required: true,
  },
];

const plannerQuestions: SeekerQuestion[] = [
  {
    id: 'plan_001',
    phase: 'role',
    role: '기획자',
    questionText: '경험해본 기획 유형을 선택해주세요.',
    inputType: 'multi-choice',
    options: ['서비스 기획', '전략 기획', '사업 기획', '콘텐츠 기획', '운영 기획'],
    required: true,
  },
  {
    id: 'plan_002',
    phase: 'role',
    role: '기획자',
    questionText: '주로 사용하는 분석/협업 도구를 선택해주세요.',
    inputType: 'multi-choice',
    options: ['Notion', 'Confluence', 'Google Docs', 'Excel/Sheets', 'Miro', 'Figma'],
    required: true,
  },
  {
    id: 'plan_003',
    phase: 'role',
    role: '기획자',
    questionText: '주로 사용하는 문서화 도구를 선택해주세요.',
    inputType: 'multi-choice',
    options: ['Notion', 'Confluence', 'Google Docs', 'PowerPoint', 'Markdown'],
    required: true,
  },
  {
    id: 'plan_004',
    phase: 'role',
    role: '기획자',
    questionText: '상위 기획 (전략/비전) 참여 경험은?',
    subText: '1: 경험 없음 ~ 5: 주도적으로 참여',
    inputType: 'scale',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ['경험 없음', '주도적으로 참여'],
    required: true,
  },
  {
    id: 'plan_005',
    phase: 'role',
    role: '기획자',
    questionText: '선호하는 협업 방식은?',
    inputType: 'single-choice',
    options: ['독립 기획 후 공유', '워크숍/브레인스토밍', '페어 기획', '상관없음'],
    required: true,
  },
];

const dataAnalystQuestions: SeekerQuestion[] = [
  {
    id: 'data_001',
    phase: 'role',
    role: '데이터분석가',
    questionText: '주로 사용하는 프로그래밍 언어를 선택해주세요.',
    inputType: 'multi-choice',
    options: ['Python', 'R', 'SQL', 'Scala', 'Julia'],
    required: true,
  },
  {
    id: 'data_002',
    phase: 'role',
    role: '데이터분석가',
    questionText: '주로 사용하는 시각화 도구를 선택해주세요.',
    inputType: 'multi-choice',
    options: ['Tableau', 'Power BI', 'Looker', 'Redash', 'Metabase', 'Matplotlib/Seaborn'],
    required: true,
  },
  {
    id: 'data_003',
    phase: 'role',
    role: '데이터분석가',
    questionText: '통계/ML 경험 수준은?',
    subText: '1: 기초 통계 ~ 5: 프로덕션 ML 모델 운영',
    inputType: 'scale',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ['기초 통계', '프로덕션 ML 운영'],
    required: true,
  },
  {
    id: 'data_004',
    phase: 'role',
    role: '데이터분석가',
    questionText: '데이터 파이프라인 경험이 있으신가요?',
    inputType: 'single-choice',
    options: ['없음', 'ETL 작업 경험', '직접 파이프라인 설계', 'Airflow 등 오케스트레이션'],
    required: true,
  },
  {
    id: 'data_005',
    phase: 'role',
    role: '데이터분석가',
    questionText: '분석 경험이 있는 도메인을 선택해주세요.',
    inputType: 'multi-choice',
    options: ['이커머스', '핀테크', '게임', '헬스케어', '광고/마케팅', 'SaaS', '물류'],
    required: true,
  },
  {
    id: 'data_006',
    phase: 'role',
    role: '데이터분석가',
    questionText: 'A/B 테스트 설계/분석 경험은?',
    subText: '1: 경험 없음 ~ 5: 전문적으로 운영',
    inputType: 'scale',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ['경험 없음', '전문적으로 운영'],
    required: true,
  },
];

const salesQuestions: SeekerQuestion[] = [
  {
    id: 'sales_001',
    phase: 'role',
    role: '영업',
    questionText: '주요 영업 대상은 누구인가요?',
    inputType: 'single-choice',
    options: ['B2B 기업', 'B2C 개인', 'B2G 공공기관', '혼합'],
    required: true,
  },
  {
    id: 'sales_002',
    phase: 'role',
    role: '영업',
    questionText: '동시에 관리한 최대 고객 수는?',
    inputType: 'single-choice',
    options: ['10건 이하', '11-30건', '31-100건', '100건 이상'],
    required: true,
  },
  {
    id: 'sales_003',
    phase: 'role',
    role: '영업',
    questionText: '영업 목표 달성률은 어느 정도인가요?',
    subText: '1: 미달성 ~ 5: 꾸준히 초과 달성',
    inputType: 'scale',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ['미달성', '꾸준히 초과 달성'],
    required: true,
  },
  {
    id: 'sales_004',
    phase: 'role',
    role: '영업',
    questionText: '경험해본 평균 계약 규모는?',
    inputType: 'single-choice',
    options: ['100만원 이하', '100만-1,000만원', '1,000만-1억', '1억 이상'],
    required: true,
  },
  {
    id: 'sales_005',
    phase: 'role',
    role: '영업',
    questionText: '사용해본 CRM 도구를 선택해주세요.',
    inputType: 'multi-choice',
    options: ['Salesforce', 'HubSpot', 'Zoho', 'Pipedrive', '자체 CRM', '없음'],
    required: true,
  },
];

const hrQuestions: SeekerQuestion[] = [
  {
    id: 'hr_001',
    phase: 'role',
    role: 'HR',
    questionText: 'HR 전문 영역을 선택해주세요.',
    inputType: 'multi-choice',
    options: ['채용', '교육/개발', '보상/평가', '조직문화', 'HRBP', '노무관리'],
    required: true,
  },
  {
    id: 'hr_002',
    phase: 'role',
    role: 'HR',
    questionText: '채용 경험 수준은?',
    subText: '1: 보조 업무 ~ 5: 채용 전략 수립/실행',
    inputType: 'scale',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ['보조 업무', '채용 전략 수립/실행'],
    required: true,
  },
  {
    id: 'hr_003',
    phase: 'role',
    role: 'HR',
    questionText: 'HR 데이터 분석 경험은?',
    subText: '1: 경험 없음 ~ 5: 대시보드 운영',
    inputType: 'scale',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ['경험 없음', '대시보드 운영'],
    required: true,
  },
  {
    id: 'hr_004',
    phase: 'role',
    role: 'HR',
    questionText: '노무/법규 관련 지식 수준은?',
    subText: '1: 기초 ~ 5: 전문 수준',
    inputType: 'scale',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ['기초', '전문 수준'],
    required: true,
  },
  {
    id: 'hr_005',
    phase: 'role',
    role: 'HR',
    questionText: '경험해본 조직 규모는?',
    inputType: 'single-choice',
    options: ['50명 이하', '51-200명', '201-1,000명', '1,000명 이상'],
    required: true,
  },
];

const financeQuestions: SeekerQuestion[] = [
  {
    id: 'fin_001',
    phase: 'role',
    role: '재무/회계',
    questionText: '전문 영역을 선택해주세요.',
    inputType: 'multi-choice',
    options: ['재무제표', '세무', '원가회계', '관리회계', '자금관리', 'IR'],
    required: true,
  },
  {
    id: 'fin_002',
    phase: 'role',
    role: '재무/회계',
    questionText: '주로 사용하는 도구를 선택해주세요.',
    inputType: 'multi-choice',
    options: ['SAP', 'Oracle ERP', 'Excel 고급', 'QuickBooks', '더존', '위하고', '자체 시스템'],
    required: true,
  },
  {
    id: 'fin_003',
    phase: 'role',
    role: '재무/회계',
    questionText: '보유 자격증을 선택해주세요.',
    inputType: 'multi-choice',
    options: ['CPA', 'AICPA', '세무사', '전산회계', '재경관리사', 'CFA', '없음'],
    required: true,
  },
  {
    id: 'fin_004',
    phase: 'role',
    role: '재무/회계',
    questionText: '예산 관리 경험 수준은?',
    subText: '1: 경험 없음 ~ 5: 연간 예산 수립',
    inputType: 'scale',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ['경험 없음', '연간 예산 수립'],
    required: true,
  },
  {
    id: 'fin_005',
    phase: 'role',
    role: '재무/회계',
    questionText: '외부 감사 대응 경험이 있나요?',
    inputType: 'single-choice',
    options: ['없음', '보조 경험', '담당자로 참여', '주도적으로 대응'],
    required: true,
  },
];

const etcQuestions: SeekerQuestion[] = [
  {
    id: 'etc_001',
    phase: 'role',
    role: '기타',
    questionText: '본인의 직무를 키워드로 표현해주세요.',
    subText: '예: 물류 관리, 고객 상담, 법무 등',
    inputType: 'text-short',
    required: true,
  },
  {
    id: 'etc_002',
    phase: 'role',
    role: '기타',
    questionText: '현재 취업 상태는 어떠신가요?',
    inputType: 'single-choice',
    options: ['재직 중 (이직 희망)', '구직 중', '프리랜서', '학생/취준생'],
    required: true,
  },
  {
    id: 'etc_003',
    phase: 'role',
    role: '기타',
    questionText: '포트폴리오가 있으신가요?',
    inputType: 'single-choice',
    options: ['있음', '준비 중', '없음'],
    required: true,
  },
  {
    id: 'etc_004',
    phase: 'role',
    role: '기타',
    questionText: '추가로 알리고 싶은 사항이 있나요?',
    subText: '자유롭게 작성해주세요',
    inputType: 'text-short',
    required: false,
  },
];

// ============================================================
// Phase 4: 근무스타일/문화 공통 질문 (5문항)
// ============================================================

const styleQuestions: SeekerQuestion[] = [
  {
    id: 'style_001',
    phase: 'style',
    questionText: '선호하는 회사 규모는 무엇인가요?',
    inputType: 'single-choice',
    options: ['스타트업 (1-50명)', '중소기업 (51-300명)', '중견기업 (301-1,000명)', '대기업 (1,000명+)', '무관'],
    required: true,
  },
  {
    id: 'style_002',
    phase: 'style',
    questionText: '선호하는 조직 문화는 어떤가요?',
    subText: '1: 수직적 ~ 5: 수평적',
    inputType: 'scale',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ['수직적 조직', '수평적 조직'],
    required: true,
  },
  {
    id: 'style_003',
    phase: 'style',
    questionText: '단기 커리어 목표 (3년)는 무엇인가요?',
    inputType: 'single-choice',
    options: ['전문성 심화', '매니지먼트 전환', '창업/독립', '직무 전환', '아직 모르겠음'],
    required: true,
  },
  {
    id: 'style_004',
    phase: 'style',
    questionText: '장기 커리어 목표 (10년)는 무엇인가요?',
    inputType: 'single-choice',
    options: ['해당 분야 전문가', '경영진/임원', '창업', '다양한 분야 경험', '아직 모르겠음'],
    required: true,
  },
  {
    id: 'style_005',
    phase: 'style',
    questionText: '나를 한 단어로 표현하면?',
    subText: '예: 끈기, 도전, 소통, 분석 등',
    inputType: 'text-short',
    required: true,
  },
];

// ============================================================
// 직군별 질문 매핑
// ============================================================

const roleQuestionsMap: Record<string, SeekerQuestion[]> = {
  '개발자': developerQuestions,
  'PM': pmQuestions,
  '디자이너': designerQuestions,
  '마케터': marketerQuestions,
  '기획자': plannerQuestions,
  '데이터분석가': dataAnalystQuestions,
  '영업': salesQuestions,
  'HR': hrQuestions,
  '재무/회계': financeQuestions,
  '기타': etcQuestions,
};

// ============================================================
// 헬퍼 함수
// ============================================================

export function getCareerQuestions(): SeekerQuestion[] {
  return careerQuestions;
}

export function getStyleQuestions(): SeekerQuestion[] {
  return styleQuestions;
}

const MAX_ROLE_QUESTIONS = 12;

export function getRoleQuestions(roles: string[]): SeekerQuestion[] {
  const seen = new Set<string>();
  const result: SeekerQuestion[] = [];

  for (const role of roles) {
    const questions = roleQuestionsMap[role] || [];
    for (const q of questions) {
      if (!seen.has(q.id) && result.length < MAX_ROLE_QUESTIONS) {
        seen.add(q.id);
        result.push(q);
      }
    }
  }

  return result;
}

export const ROLES = ['개발자', 'PM', '디자이너', '마케터', '기획자', '데이터분석가', '영업', 'HR', '재무/회계', '기타'];
export const INDUSTRIES = ['IT/소프트웨어', '금융', '제조', '유통', '의료', '교육', '미디어', '컨설팅', '스타트업', '기타'];

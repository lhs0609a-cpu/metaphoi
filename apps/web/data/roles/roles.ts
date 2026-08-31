import type { JobRole } from './types';

/**
 * 직무 목록.
 *
 * 직군 프로필을 상속하고, 흥미코드나 역량이 실제로 다른 직무만 덮어쓴다.
 * aliases 에는 채용 시장에서 실제로 쓰이는 이름을 넣는다 — 기업이 공고를
 * 쓸 때 "그로스 마케터"로 검색해도 찾아져야 하고, 나중에 LLM 이 직무기술서를
 * 읽고 매핑할 때도 이 목록이 후보가 된다.
 */
export const JOB_ROLES: JobRole[] = [
  // ── 소프트웨어 개발 ──────────────────────────────────────────────
  { id: 'backend', familyId: 'swe', name: '백엔드 개발자', aliases: ['서버 개발자', 'Backend Engineer'], onetCode: '15-1252.00' },
  { id: 'frontend', familyId: 'swe', name: '프론트엔드 개발자', aliases: ['웹 개발자', 'Frontend Engineer'],
    competencyOverrides: { aesthetics: 72, creativity: 76 } },
  { id: 'mobile', familyId: 'swe', name: '모바일 앱 개발자', aliases: ['iOS 개발자', '안드로이드 개발자'] },
  { id: 'fullstack', familyId: 'swe', name: '풀스택 개발자', aliases: ['Full Stack Engineer'],
    competencyOverrides: { adaptability: 80, multitasking: 74 } },
  { id: 'ml-eng', familyId: 'swe', name: 'ML 엔지니어', aliases: ['머신러닝 엔지니어', 'AI 엔지니어'], onetCode: '15-2051.00',
    competencyOverrides: { analysis: 92, learningSpeed: 88 } },
  { id: 'game-dev', familyId: 'swe', name: '게임 개발자', aliases: ['클라이언트 개발자'], hollandCode: 'IRA',
    competencyOverrides: { creativity: 82, spatialAwareness: 76 } },
  { id: 'embedded', familyId: 'swe', name: '임베디드 개발자', aliases: ['펌웨어 개발자'], hollandCode: 'RIC' },

  // ── 인프라·보안 ──────────────────────────────────────────────────
  { id: 'devops', familyId: 'infra', name: 'DevOps 엔지니어', aliases: ['SRE', '인프라 엔지니어'] },
  { id: 'security', familyId: 'infra', name: '보안 엔지니어', aliases: ['정보보안 담당자'], onetCode: '15-1212.00',
    competencyOverrides: { analysis: 88, diligence: 86 } },
  { id: 'sysadmin', familyId: 'infra', name: '시스템 운영자', aliases: ['서버 관리자', 'IT 운영'] },
  { id: 'dba', familyId: 'infra', name: 'DBA', aliases: ['데이터베이스 관리자'],
    competencyOverrides: { precision: 94 } },

  // ── QA·품질 ──────────────────────────────────────────────────────
  { id: 'qa-eng', familyId: 'qa', name: 'QA 엔지니어', aliases: ['테스트 엔지니어'] },
  { id: 'qa-auto', familyId: 'qa', name: '테스트 자동화 엔지니어', aliases: ['SDET'], hollandCode: 'IRC',
    competencyOverrides: { problemSolving: 84 } },

  // ── 프로덕트 매니지먼트 ──────────────────────────────────────────
  { id: 'pm', familyId: 'pm-tech', name: '프로덕트 매니저', aliases: ['PM', 'PO', '서비스 기획자'] },
  { id: 'project-mgr', familyId: 'pm-tech', name: '프로젝트 매니저', aliases: ['PMO'],
    competencyOverrides: { timeManagement: 88, precision: 80 } },
  { id: 'biz-analyst', familyId: 'pm-tech', name: '비즈니스 분석가', aliases: ['BA'], hollandCode: 'ICE',
    competencyOverrides: { analysis: 88 } },

  // ── 데이터 ───────────────────────────────────────────────────────
  { id: 'data-scientist', familyId: 'data-science', name: '데이터 사이언티스트', aliases: ['DS'] },
  { id: 'research-eng', familyId: 'data-science', name: 'AI 리서치 엔지니어', aliases: ['연구원'],
    competencyOverrides: { creativity: 82, focus: 90 } },
  { id: 'data-engineer', familyId: 'data-eng', name: '데이터 엔지니어', aliases: ['DE'] },
  { id: 'data-analyst', familyId: 'data-analyst', name: '데이터 분석가', aliases: ['DA', 'BI 분석가'] },
  { id: 'growth-analyst', familyId: 'data-analyst', name: '그로스 분석가', aliases: ['프로덕트 분석가'], hollandCode: 'EIC',
    competencyOverrides: { innovation: 76, influence: 72 } },

  // ── 디자인 ───────────────────────────────────────────────────────
  { id: 'ux-designer', familyId: 'product-design', name: 'UX 디자이너', aliases: ['UI 디자이너', 'UXUI 디자이너'] },
  { id: 'product-designer', familyId: 'product-design', name: '프로덕트 디자이너', aliases: ['서비스 디자이너'] },
  { id: 'bx-designer', familyId: 'graphic-design', name: 'BX 디자이너', aliases: ['브랜드 디자이너'] },
  { id: 'graphic-designer', familyId: 'graphic-design', name: '그래픽 디자이너', aliases: ['편집 디자이너'] },
  { id: 'motion-designer', familyId: 'graphic-design', name: '모션 디자이너', aliases: ['영상 디자이너'],
    competencyOverrides: { spatialAwareness: 84 } },
  { id: 'ux-researcher', familyId: 'ux-research', name: 'UX 리서처', aliases: ['사용자 조사'] },

  // ── 기획·경영지원 ────────────────────────────────────────────────
  { id: 'strategy-planner', familyId: 'strategy', name: '전략기획', aliases: ['사업기획', '경영기획'] },
  { id: 'consultant', familyId: 'strategy', name: '컨설턴트', aliases: ['경영 컨설턴트'], onetCode: '13-1111.00',
    competencyOverrides: { verbalAbility: 86, stressTolerance: 80 } },
  { id: 'bizdev', familyId: 'strategy', name: '사업개발', aliases: ['BD', '제휴 담당'], hollandCode: 'ESC',
    competencyOverrides: { networking: 88, influence: 86 } },
  { id: 'hr-recruit', familyId: 'hr', name: '채용 담당자', aliases: ['리크루터', 'HR'] },
  { id: 'hr-ops', familyId: 'hr', name: '인사운영', aliases: ['HR Operations', '노무'],
    competencyOverrides: { precision: 84, diligence: 82 } },
  { id: 'hrd', familyId: 'hr', name: '교육·조직개발', aliases: ['HRD', 'L&D'], hollandCode: 'SEA' },
  { id: 'office-mgr', familyId: 'ops', name: '총무·오피스 매니저', aliases: ['경영지원'] },
  { id: 'assistant', familyId: 'ops', name: '비서·어시스턴트', aliases: ['Executive Assistant'] },
  { id: 'legal-counsel', familyId: 'legal', name: '사내 변호사', aliases: ['법무 담당'] },
  { id: 'compliance', familyId: 'legal', name: '컴플라이언스', aliases: ['준법감시'] },

  // ── 영업·마케팅 ──────────────────────────────────────────────────
  { id: 'sales-rep', familyId: 'sales-b2b', name: 'B2B 영업', aliases: ['기업영업', 'Account Executive'] },
  { id: 'account-mgr', familyId: 'sales-b2b', name: '어카운트 매니저', aliases: ['AM', '고객 관리'],
    competencyOverrides: { empathy: 82, cooperation: 78 } },
  { id: 'sales-engineer', familyId: 'sales-b2b', name: '세일즈 엔지니어', aliases: ['기술영업', 'SE'], hollandCode: 'EIR',
    competencyOverrides: { analysis: 82, problemSolving: 78 } },
  { id: 'retail-sales', familyId: 'sales-b2c', name: '리테일 세일즈', aliases: ['매장 판매'] },
  { id: 'insurance-sales', familyId: 'sales-b2c', name: '보험·금융 설계', aliases: ['FC', '재무설계사'], hollandCode: 'ECS',
    competencyOverrides: { resilience: 86, networking: 84 } },
  { id: 'brand-marketer', familyId: 'marketing', name: '브랜드 마케터', aliases: ['브랜드 매니저'], hollandCode: 'AEI',
    competencyOverrides: { aesthetics: 78, creativity: 88 } },
  { id: 'performance-marketer', familyId: 'marketing', name: '퍼포먼스 마케터', aliases: ['광고 운영', '그로스 마케터'], hollandCode: 'ECI',
    competencyOverrides: { analysis: 88, precision: 78 } },
  { id: 'content-marketer', familyId: 'marketing', name: '콘텐츠 마케터', aliases: ['SNS 마케터'],
    competencyOverrides: { verbalAbility: 84, creativity: 86 } },
  { id: 'pr', familyId: 'marketing', name: '홍보·PR', aliases: ['커뮤니케이션'], hollandCode: 'EAS',
    competencyOverrides: { networking: 84, verbalAbility: 86 } },
  { id: 'cs-agent', familyId: 'cs', name: '고객 상담', aliases: ['CS', '컨택센터'] },
  { id: 'cs-manager', familyId: 'cs', name: 'CX 매니저', aliases: ['고객경험 관리'],
    competencyOverrides: { planning: 78, analysis: 74 } },

  // ── 금융·회계 ────────────────────────────────────────────────────
  { id: 'accountant', familyId: 'accounting', name: '회계 담당', aliases: ['경리', '결산'] },
  { id: 'tax', familyId: 'accounting', name: '세무 담당', aliases: ['세무사'] },
  { id: 'auditor', familyId: 'accounting', name: '감사', aliases: ['내부감사', '회계사'],
    competencyOverrides: { analysis: 86, determination: 76 } },
  { id: 'finance-mgr', familyId: 'finance-corp', name: '재무 담당', aliases: ['자금 담당', 'FP&A'] },
  { id: 'ir', familyId: 'finance-corp', name: 'IR 담당', aliases: ['투자자 관계'], hollandCode: 'ECI',
    competencyOverrides: { verbalAbility: 84, networking: 78 } },
  { id: 'vc', familyId: 'invest', name: '투자심사역', aliases: ['VC', '심사역'] },
  { id: 'analyst-fin', familyId: 'invest', name: '금융 애널리스트', aliases: ['리서치 애널리스트'], hollandCode: 'ICE',
    competencyOverrides: { analysis: 94, verbalAbility: 78 } },

  // ── 제조·엔지니어링 ──────────────────────────────────────────────
  { id: 'mech-engineer', familyId: 'mech-eng', name: '기계 설계 엔지니어', aliases: ['설계 엔지니어'] },
  { id: 'elec-engineer', familyId: 'mech-eng', name: '전기·전자 엔지니어', aliases: ['회로 설계'], onetCode: '17-2071.00' },
  { id: 'chem-engineer', familyId: 'mech-eng', name: '화학 엔지니어', aliases: ['공정 엔지니어'], onetCode: '17-2041.00' },
  { id: 'production-mgr', familyId: 'production', name: '생산관리', aliases: ['공정관리'] },
  { id: 'safety-mgr', familyId: 'production', name: '안전관리자', aliases: ['환경안전', 'EHS'], hollandCode: 'RCE',
    competencyOverrides: { precision: 88, determination: 80 } },
  { id: 'qc-mgr', familyId: 'quality-mfg', name: '품질관리', aliases: ['QC', 'QA(제조)'] },

  // ── 건설·부동산 ──────────────────────────────────────────────────
  { id: 'architect', familyId: 'civil-eng', name: '건축사·건축설계', aliases: ['건축 디자이너'], onetCode: '17-1011.00',
    competencyOverrides: { aesthetics: 84, creativity: 80 } },
  { id: 'civil-engineer', familyId: 'civil-eng', name: '토목 엔지니어', aliases: ['구조 엔지니어'], onetCode: '17-2051.00' },
  { id: 'site-mgr', familyId: 'construction-mgmt', name: '현장소장·시공관리', aliases: ['공무', '감리'] },
  { id: 'realestate-agent', familyId: 'realestate', name: '부동산 중개·컨설팅', aliases: ['공인중개사'] },
  { id: 'asset-mgr', familyId: 'realestate', name: '자산관리', aliases: ['PM(부동산)', '임대관리'], hollandCode: 'CES',
    competencyOverrides: { precision: 82 } },

  // ── 의료·바이오 ──────────────────────────────────────────────────
  { id: 'nurse', familyId: 'clinical', name: '간호사', aliases: ['RN'], onetCode: '29-1141.00' },
  { id: 'doctor', familyId: 'clinical', name: '의사', aliases: ['전문의'], onetCode: '29-1216.00',
    competencyOverrides: { determination: 86, analysis: 88 } },
  { id: 'pharmacist', familyId: 'clinical', name: '약사', aliases: ['제약 약사'], onetCode: '29-1051.00', hollandCode: 'ICS',
    competencyOverrides: { precision: 94 } },
  { id: 'therapist', familyId: 'clinical', name: '물리·작업치료사', aliases: ['재활치료사'], hollandCode: 'SRI',
    competencyOverrides: { empathy: 92, endurance: 86 } },
  { id: 'bio-researcher', familyId: 'bio-research', name: '바이오 연구원', aliases: ['제약 연구원'] },
  { id: 'clinical-trial', familyId: 'bio-research', name: '임상시험 담당', aliases: ['CRA', 'CRC'], hollandCode: 'CIS',
    competencyOverrides: { precision: 92, communication: 76 } },
  { id: 'medical-admin', familyId: 'health-admin', name: '의료행정', aliases: ['원무', '병원 코디네이터'] },

  // ── 교육·연구 ────────────────────────────────────────────────────
  { id: 'teacher', familyId: 'teaching', name: '교사', aliases: ['중등교사', '초등교사'] },
  { id: 'instructor', familyId: 'teaching', name: '강사·튜터', aliases: ['학원 강사'] },
  { id: 'professor', familyId: 'research', name: '교수·연구원', aliases: ['박사후연구원'] },
  { id: 'policy-researcher', familyId: 'research', name: '정책·시장 연구원', aliases: ['리서처'], hollandCode: 'IEC',
    competencyOverrides: { verbalAbility: 84 } },
  { id: 'curriculum', familyId: 'edu-planning', name: '교육기획', aliases: ['커리큘럼 개발'] },

  // ── 미디어·콘텐츠 ────────────────────────────────────────────────
  { id: 'content-planner', familyId: 'content', name: '콘텐츠 기획자', aliases: ['PD', '방송작가'] },
  { id: 'creator', familyId: 'content', name: '크리에이터·유튜브 기획', aliases: ['채널 운영'], hollandCode: 'AES',
    competencyOverrides: { innovation: 84, resilience: 78 } },
  { id: 'journalist', familyId: 'writing', name: '기자', aliases: ['취재기자'] },
  { id: 'editor', familyId: 'writing', name: '에디터', aliases: ['카피라이터', '출판 편집자'] },
  { id: 'videographer', familyId: 'av-production', name: '영상 촬영·편집', aliases: ['비디오그래퍼'] },
  { id: 'sound-eng', familyId: 'av-production', name: '음향 엔지니어', aliases: ['사운드 디자이너'], hollandCode: 'ARI' },

  // ── 서비스·물류 ──────────────────────────────────────────────────
  { id: 'scm', familyId: 'logistics', name: 'SCM·구매', aliases: ['공급망 관리', '자재 구매'] },
  { id: 'logistics-mgr', familyId: 'logistics', name: '물류 운영', aliases: ['창고 관리', '배송 관리'] },
  { id: 'hotel-staff', familyId: 'hospitality', name: '호텔·리조트 운영', aliases: ['프론트 데스크'] },
  { id: 'fnb-mgr', familyId: 'hospitality', name: '외식·매장 관리', aliases: ['점장', 'F&B 매니저'],
    competencyOverrides: { leadership: 82, timeManagement: 84 } },
  { id: 'chef', familyId: 'hospitality', name: '조리사·셰프', aliases: ['요리사'], onetCode: '35-1011.00', hollandCode: 'RAE',
    competencyOverrides: { aesthetics: 80, endurance: 90, creativity: 78 } },
  { id: 'maintenance', familyId: 'facility', name: '설비 기사', aliases: ['시설관리', '기계 정비'] },
  { id: 'technician', familyId: 'facility', name: '기술 서비스 기사', aliases: ['A/S 기사', '설치 기사'], hollandCode: 'RSC',
    competencyOverrides: { communication: 76, empathy: 72 } },
];

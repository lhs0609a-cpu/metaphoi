import { type RawTestScores, type AbilityScore } from '@/data/tests/comprehensive';
import { type CrossValidationResult } from './cross-validation';

// 30가지 능력치 정의 + 산출 공식
// 각 능력치는 여러 검사의 raw 점수를 가중 합산하여 0-100으로 정규화

interface AbilityDef {
  key: string;
  name: string;
  category: string;
  description: string;
  compute: (r: RawTestScores) => number;
}

// 유틸: 점수를 0-100 범위로 클램프
function clamp(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

// 양극성 점수: 두 극 중 첫 번째(a)의 우세 정도 (0-1 전체 범위)
// 기존 dominance()는 0.5-1.0 범위 → 0-1로 리매핑
function polarityScore(a: number, b: number): number {
  const total = Math.abs(a) + Math.abs(b);
  if (total === 0) return 0.5;
  const raw = Math.max(a, b) / total; // 0.5~1.0
  return (raw - 0.5) * 2; // 0~1 리매핑
}

// 유틸: 오행 점수 정규화 (0-1, max 기준)
function ohaengNorm(scores: Record<string, number>, key: string): number {
  const max = Math.max(...Object.values(scores), 1);
  return (scores[key] || 0) / max;
}

// 유틸: 에니어그램 특정 유형 강도 (0-1)
function enneaStrength(enneagram: Record<string, number>, typeKey: string): number {
  const total = Object.values(enneagram).reduce((s, v) => s + v, 0);
  if (total === 0) return 0;
  return (enneagram[typeKey] || 0) / total;
}

// 유틸: RIASEC 특정 유형 강도 (0-1)
function hollandStrength(holland: Record<string, number>, key: string): number {
  const total = Object.values(holland).reduce((s, v) => s + v, 0);
  if (total === 0) return 0;
  return (holland[key] || 0) / total;
}

// 유틸: DISC 특정 유형 강도 (0-1)
function discStrength(disc: Record<string, number>, key: string): number {
  const total = Object.values(disc).reduce((s, v) => s + v, 0);
  if (total === 0) return 0;
  return (disc[key] || 0) / total;
}

// 유틸: 사상체질 특정 유형 강도 (0-1)
function sasangStrength(sasang: Record<string, number>, key: string): number {
  const total = Object.values(sasang).reduce((s, v) => s + v, 0);
  if (total === 0) return 0;
  return (sasang[key] || 0) / total;
}

const ABILITY_DEFS: AbilityDef[] = [
  // ===== 정신력 (Mental) =====
  {
    key: 'determination', name: '결단력', category: '정신력',
    description: '빠르고 확고한 의사결정 능력',
    compute: (r) => clamp(
      // DISC D(주도성) → 빠른 의사결정과 직결
      discStrength(r.disc, 'D') * 35 +
      // 오행 금(金) → 결단과 추진의 기질
      ohaengNorm(r.saju, '금') * 25 +
      // MBTI J(판단형) → 빠른 결정 선호
      polarityScore(r.mbti.J, r.mbti.P) * 20 +
      // Enneagram T8(도전자) → 과감한 결정력
      enneaStrength(r.enneagram, 'T8') * 20
    ),
  },
  {
    key: 'composure', name: '침착성', category: '정신력',
    description: '압박 상황에서 차분함을 유지하는 능력',
    compute: (r) => clamp(
      // DISC S(안정형) → 평정심의 핵심
      discStrength(r.disc, 'S') * 35 +
      // Enneagram T9(중재자) → 내적 평화 추구
      enneaStrength(r.enneagram, 'T9') * 25 +
      // 사상 소음인 → 차분하고 섬세한 기질
      sasangStrength(r.sasang, 'SE') * 20 +
      // 오행 수(水) → 유연하고 침착한 에너지
      ohaengNorm(r.saju, '수') * 20
    ),
  },
  {
    key: 'focus', name: '집중력', category: '정신력',
    description: '하나의 과제에 깊이 몰입하는 능력',
    compute: (r) => clamp(
      // MBTI I(내향) → 내적 집중 성향
      polarityScore(r.mbti.I, r.mbti.E) * 35 +
      // Enneagram T5(탐구자) → 깊은 몰입과 전문성
      enneaStrength(r.enneagram, 'T5') * 25 +
      // Holland R(실재형) → 구체적 과제 집중력
      hollandStrength(r.holland, 'R') * 20 +
      // DISC C(신중형) → 세밀한 주의력
      discStrength(r.disc, 'C') * 20
    ),
  },
  {
    key: 'creativity', name: '창의성', category: '정신력',
    description: '새로운 아이디어와 관점을 만들어내는 능력',
    compute: (r) => clamp(
      // MBTI N(직관) → 추상적 사고와 상상력
      polarityScore(r.mbti.N, r.mbti.S) * 35 +
      // Enneagram T4(예술가) → 독창적 표현 추구
      enneaStrength(r.enneagram, 'T4') * 25 +
      // Holland A(예술형) → 창의적 활동 선호
      hollandStrength(r.holland, 'A') * 25 +
      // 오행 목(木) → 성장과 창발의 기질
      ohaengNorm(r.saju, '목') * 15
    ),
  },
  {
    key: 'analysis', name: '분석력', category: '정신력',
    description: '복잡한 정보를 논리적으로 분해하는 능력',
    compute: (r) => clamp(
      // MBTI T(사고형) → 논리적 판단의 기본
      polarityScore(r.mbti.T, r.mbti.F) * 35 +
      // Holland I(탐구형) → 분석적 탐구 성향
      hollandStrength(r.holland, 'I') * 25 +
      // Enneagram T5(탐구자) → 심층 분석 능력
      enneaStrength(r.enneagram, 'T5') * 20 +
      // DISC C(신중형) → 데이터 기반 분석
      discStrength(r.disc, 'C') * 20
    ),
  },
  {
    key: 'adaptability', name: '적응력', category: '정신력',
    description: '변화하는 환경에 유연하게 대처하는 능력',
    compute: (r) => clamp(
      // MBTI P(인식형) → 유연한 대응 선호
      polarityScore(r.mbti.P, r.mbti.J) * 35 +
      // DISC I(사교형) → 상황 적응력
      discStrength(r.disc, 'I') * 25 +
      // 오행 수(水) → 유연성과 적응의 기질
      ohaengNorm(r.saju, '수') * 20 +
      // Enneagram T7(낙천가) → 새로운 상황 수용
      enneaStrength(r.enneagram, 'T7') * 20
    ),
  },

  // ===== 사회성 (Social) =====
  {
    key: 'communication', name: '소통능력', category: '사회성',
    description: '생각과 감정을 효과적으로 전달하는 능력',
    compute: (r) => clamp(
      // MBTI E(외향) → 적극적 소통 성향
      polarityScore(r.mbti.E, r.mbti.I) * 35 +
      // DISC I(사교형) → 설득력 있는 소통
      discStrength(r.disc, 'I') * 25 +
      // Holland S(사회형) → 타인과의 상호작용 선호
      hollandStrength(r.holland, 'S') * 20 +
      // 오행 수(水) → 유연한 소통의 기질
      ohaengNorm(r.saju, '수') * 20
    ),
  },
  {
    key: 'cooperation', name: '협동심', category: '사회성',
    description: '팀과 조화롭게 일하는 능력',
    compute: (r) => clamp(
      // DISC S(안정형) → 팀 조화 중시
      discStrength(r.disc, 'S') * 35 +
      // Enneagram T2(조력자) → 타인 돕기 성향
      enneaStrength(r.enneagram, 'T2') * 25 +
      // Holland S(사회형) → 협력적 업무 선호
      hollandStrength(r.holland, 'S') * 20 +
      // 사상 소양인 → 사교적이고 협력적 기질
      sasangStrength(r.sasang, 'SY') * 20
    ),
  },
  {
    key: 'leadership', name: '리더십', category: '사회성',
    description: '사람들을 이끌고 동기부여하는 능력',
    compute: (r) => clamp(
      // DISC D(주도형) → 리더십의 핵심 요소
      discStrength(r.disc, 'D') * 35 +
      // MBTI E(외향) → 적극적 리더십 발휘
      polarityScore(r.mbti.E, r.mbti.I) * 25 +
      // Enneagram T8(도전자) → 자연스러운 리더 기질
      enneaStrength(r.enneagram, 'T8') * 20 +
      // Holland E(진취형) → 조직 이끌기 선호
      hollandStrength(r.holland, 'E') * 20
    ),
  },
  {
    key: 'empathy', name: '공감능력', category: '사회성',
    description: '타인의 감정을 이해하고 공감하는 능력',
    compute: (r) => clamp(
      // MBTI F(감정형) → 감정 공감의 기본
      polarityScore(r.mbti.F, r.mbti.T) * 35 +
      // Enneagram T2(조력자) → 타인 감정 감지력
      enneaStrength(r.enneagram, 'T2') * 25 +
      // 사상 소양인 → 감정 교류에 민감
      sasangStrength(r.sasang, 'SY') * 20 +
      // 오행 화(火) → 따뜻한 감정 교류의 기질
      ohaengNorm(r.saju, '화') * 20
    ),
  },
  {
    key: 'influence', name: '영향력', category: '사회성',
    description: '타인의 생각과 행동에 영향을 미치는 능력',
    compute: (r) => clamp(
      // DISC D(주도형) → 직접적 영향력
      discStrength(r.disc, 'D') * 25 +
      // DISC I(사교형) → 설득적 영향력
      discStrength(r.disc, 'I') * 25 +
      // Holland E(진취형) → 목표 달성을 위한 영향력
      hollandStrength(r.holland, 'E') * 25 +
      // Enneagram T3(성취자) → 이미지를 통한 영향력
      enneaStrength(r.enneagram, 'T3') * 25
    ),
  },
  {
    key: 'networking', name: '네트워킹', category: '사회성',
    description: '인적 네트워크를 형성하고 유지하는 능력',
    compute: (r) => clamp(
      // MBTI E(외향) → 사회적 관계 구축 기반
      polarityScore(r.mbti.E, r.mbti.I) * 35 +
      // DISC I(사교형) → 관계 형성 능력
      discStrength(r.disc, 'I') * 25 +
      // Holland E(진취형) → 전략적 네트워킹
      hollandStrength(r.holland, 'E') * 20 +
      // 오행 화(火) → 활발한 교류의 기질
      ohaengNorm(r.saju, '화') * 20
    ),
  },

  // ===== 업무역량 (Work) =====
  {
    key: 'execution', name: '실행력', category: '업무역량',
    description: '계획을 행동으로 옮기는 능력',
    compute: (r) => clamp(
      // DISC D(주도형) → 즉각적 실행 추구
      discStrength(r.disc, 'D') * 35 +
      // MBTI J(판단형) → 계획적 실행
      polarityScore(r.mbti.J, r.mbti.P) * 25 +
      // 오행 금(金) → 추진력 있는 실행의 기질
      ohaengNorm(r.saju, '금') * 20 +
      // Enneagram T3(성취자) → 성과 중심 실행력
      enneaStrength(r.enneagram, 'T3') * 20
    ),
  },
  {
    key: 'planning', name: '기획력', category: '업무역량',
    description: '체계적으로 전략을 수립하는 능력',
    compute: (r) => clamp(
      // MBTI N(직관) → 큰 그림을 보는 전략적 사고
      polarityScore(r.mbti.N, r.mbti.S) * 25 +
      // MBTI J(판단형) → 체계적 계획 수립
      polarityScore(r.mbti.J, r.mbti.P) * 25 +
      // Holland I(탐구형) → 분석적 기획 능력
      hollandStrength(r.holland, 'I') * 25 +
      // Enneagram T1(개혁가) → 원칙적 기획 성향
      enneaStrength(r.enneagram, 'T1') * 25
    ),
  },
  {
    key: 'problemSolving', name: '문제해결', category: '업무역량',
    description: '장애물을 분석하고 해결책을 찾는 능력',
    compute: (r) => clamp(
      // MBTI T(사고형) → 논리적 문제 분석
      polarityScore(r.mbti.T, r.mbti.F) * 25 +
      // MBTI N(직관) → 창의적 해결책 도출
      polarityScore(r.mbti.N, r.mbti.S) * 25 +
      // Holland I(탐구형) → 근본 원인 파악
      hollandStrength(r.holland, 'I') * 25 +
      // DISC D(주도형) → 적극적 문제 해결 추진
      discStrength(r.disc, 'D') * 25
    ),
  },
  {
    key: 'timeManagement', name: '시간관리', category: '업무역량',
    description: '시간을 효율적으로 배분하고 관리하는 능력',
    compute: (r) => clamp(
      // MBTI J(판단형) → 체계적 시간 배분
      polarityScore(r.mbti.J, r.mbti.P) * 35 +
      // DISC C(신중형) → 계획적 업무 처리
      discStrength(r.disc, 'C') * 25 +
      // Enneagram T1(개혁가) → 규율 있는 시간 활용
      enneaStrength(r.enneagram, 'T1') * 20 +
      // 오행 토(土) → 안정적이고 꾸준한 기질
      ohaengNorm(r.saju, '토') * 20
    ),
  },
  {
    key: 'precision', name: '꼼꼼함', category: '업무역량',
    description: '세부사항을 놓치지 않는 정확성',
    compute: (r) => clamp(
      // DISC C(신중형) → 정확성과 품질 추구
      discStrength(r.disc, 'C') * 35 +
      // MBTI S(감각형) → 세부 사항 인식력
      polarityScore(r.mbti.S, r.mbti.N) * 25 +
      // MBTI J(판단형) → 정리정돈과 체계
      polarityScore(r.mbti.J, r.mbti.P) * 20 +
      // Enneagram T1(개혁가) → 완벽주의 성향
      enneaStrength(r.enneagram, 'T1') * 20
    ),
  },
  {
    key: 'multitasking', name: '멀티태스킹', category: '업무역량',
    description: '여러 과제를 동시에 처리하는 능력',
    compute: (r) => clamp(
      // MBTI P(인식형) → 여러 과제 동시 처리 선호
      polarityScore(r.mbti.P, r.mbti.J) * 35 +
      // DISC I(사교형) → 빠른 전환과 다양성
      discStrength(r.disc, 'I') * 25 +
      // 오행 화(火) → 활발하고 역동적인 기질
      ohaengNorm(r.saju, '화') * 20 +
      // Enneagram T7(낙천가) → 다양한 관심사 추구
      enneaStrength(r.enneagram, 'T7') * 20
    ),
  },

  // ===== 신체/감각 (Physical/Sensory) =====
  {
    key: 'stressTolerance', name: '스트레스내성', category: '신체/감각',
    description: '스트레스를 견디고 관리하는 능력',
    compute: (r) => clamp(
      // 사상 태양인 → 강한 기운과 스트레스 저항
      sasangStrength(r.sasang, 'TY') * 25 +
      // DISC D(주도형) → 압박 상황에서 강해지는 성향
      discStrength(r.disc, 'D') * 25 +
      // Enneagram T8(도전자) → 강인한 의지력
      enneaStrength(r.enneagram, 'T8') * 25 +
      // 오행 금(金) → 단단하고 강인한 기질
      ohaengNorm(r.saju, '금') * 25
    ),
  },
  {
    key: 'endurance', name: '지구력', category: '신체/감각',
    description: '오래 지속하는 끈기와 체력',
    compute: (r) => clamp(
      // 사상 태음인 → 체력과 인내심이 뛰어난 체질
      sasangStrength(r.sasang, 'TE') * 35 +
      // 오행 토(土) → 안정적이고 지속적인 기질
      ohaengNorm(r.saju, '토') * 25 +
      // MBTI J(판단형) → 꾸준한 수행 성향
      polarityScore(r.mbti.J, r.mbti.P) * 20 +
      // Enneagram T6(충성가) → 끈기 있는 책임감
      enneaStrength(r.enneagram, 'T6') * 20
    ),
  },
  {
    key: 'intuition', name: '직관력', category: '신체/감각',
    description: '논리를 넘어 본질을 파악하는 감각',
    compute: (r) => clamp(
      // MBTI N(직관) → 직관적 인식의 핵심
      polarityScore(r.mbti.N, r.mbti.S) * 35 +
      // Enneagram T4(예술가) → 깊은 내면 통찰
      enneaStrength(r.enneagram, 'T4') * 25 +
      // 오행 수(水) → 직관과 지혜의 기질
      ohaengNorm(r.saju, '수') * 20 +
      // 사상 소양인 → 빠른 감지력
      sasangStrength(r.sasang, 'SY') * 20
    ),
  },
  {
    key: 'aesthetics', name: '심미안', category: '신체/감각',
    description: '아름다움을 감지하고 판단하는 능력',
    compute: (r) => clamp(
      // Holland A(예술형) → 예술적 감각의 핵심
      hollandStrength(r.holland, 'A') * 35 +
      // MBTI N(직관) → 추상적 아름다움 인식
      polarityScore(r.mbti.N, r.mbti.S) * 20 +
      // MBTI F(감정형) → 감성적 미적 판단
      polarityScore(r.mbti.F, r.mbti.T) * 20 +
      // Enneagram T4(예술가) → 미적 감수성
      enneaStrength(r.enneagram, 'T4') * 25
    ),
  },
  {
    key: 'spatialAwareness', name: '공간지각', category: '신체/감각',
    description: '공간과 구조를 파악하는 능력',
    compute: (r) => clamp(
      // Holland R(실재형) → 물리적 공간 인식
      hollandStrength(r.holland, 'R') * 35 +
      // MBTI S(감각형) → 구체적 환경 인식
      polarityScore(r.mbti.S, r.mbti.N) * 25 +
      // 오행 토(土) → 안정적 공간 감각의 기질
      ohaengNorm(r.saju, '토') * 20 +
      // DISC C(신중형) → 구조적 사고
      discStrength(r.disc, 'C') * 20
    ),
  },
  {
    key: 'verbalAbility', name: '언어능력', category: '신체/감각',
    description: '언어를 통한 표현과 이해 능력',
    compute: (r) => clamp(
      // Holland A(예술형) → 언어적 창작력
      hollandStrength(r.holland, 'A') * 25 +
      // Holland S(사회형) → 소통 기반 언어 능력
      hollandStrength(r.holland, 'S') * 25 +
      // MBTI E(외향) → 적극적 언어 사용
      polarityScore(r.mbti.E, r.mbti.I) * 25 +
      // DISC I(사교형) → 설득적 언어 구사
      discStrength(r.disc, 'I') * 25
    ),
  },

  // ===== 잠재력 (Potential) =====
  {
    key: 'growthPotential', name: '성장가능성', category: '잠재력',
    description: '새로운 역량을 습득하고 성장하는 잠재력',
    compute: (r) => clamp(
      // MBTI N(직관) → 새로운 가능성 탐색
      polarityScore(r.mbti.N, r.mbti.S) * 35 +
      // 오행 목(木) → 성장과 발전의 기질
      ohaengNorm(r.saju, '목') * 25 +
      // Enneagram T7(낙천가) → 성장에 대한 낙관
      enneaStrength(r.enneagram, 'T7') * 20 +
      // Holland I(탐구형) → 지적 성장 추구
      hollandStrength(r.holland, 'I') * 20
    ),
  },
  {
    key: 'learningSpeed', name: '학습속도', category: '잠재력',
    description: '새로운 지식과 기술을 빠르게 익히는 능력',
    compute: (r) => clamp(
      // Holland I(탐구형) → 지식 습득 능력
      hollandStrength(r.holland, 'I') * 35 +
      // MBTI N(직관) → 패턴 파악을 통한 빠른 학습
      polarityScore(r.mbti.N, r.mbti.S) * 25 +
      // 오행 수(水) → 지혜와 학습의 기질
      ohaengNorm(r.saju, '수') * 20 +
      // Enneagram T5(탐구자) → 지적 호기심과 학습력
      enneaStrength(r.enneagram, 'T5') * 20
    ),
  },
  {
    key: 'innovation', name: '혁신성', category: '잠재력',
    description: '기존 틀을 깨고 새로운 방식을 시도하는 성향',
    compute: (r) => clamp(
      // MBTI N(직관) → 새로운 방식 구상
      polarityScore(r.mbti.N, r.mbti.S) * 25 +
      // MBTI P(인식형) → 기존 틀에 대한 유연성
      polarityScore(r.mbti.P, r.mbti.J) * 25 +
      // Enneagram T7(낙천가) → 새로운 시도에 대한 열정
      enneaStrength(r.enneagram, 'T7') * 25 +
      // Holland A(예술형) → 독창적 접근
      hollandStrength(r.holland, 'A') * 25
    ),
  },
  {
    key: 'resilience', name: '회복탄력성', category: '잠재력',
    description: '실패와 역경에서 다시 일어서는 능력',
    compute: (r) => clamp(
      // 사상 태양인 → 강한 기운과 회복력
      sasangStrength(r.sasang, 'TY') * 25 +
      // 사상 태음인 → 묵묵한 인내와 회복
      sasangStrength(r.sasang, 'TE') * 15 +
      // Enneagram T7(낙천가) → 낙관적 회복
      enneaStrength(r.enneagram, 'T7') * 20 +
      // 오행 목(木) → 재생과 회복의 기질
      ohaengNorm(r.saju, '목') * 20 +
      // DISC D(주도형) → 적극적 역경 극복
      discStrength(r.disc, 'D') * 20
    ),
  },
  {
    key: 'ambition', name: '야망', category: '잠재력',
    description: '높은 목표를 설정하고 추구하는 성향',
    compute: (r) => clamp(
      // DISC D(주도형) → 목표 달성 의지
      discStrength(r.disc, 'D') * 35 +
      // Enneagram T3(성취자) → 성공 지향 동기
      enneaStrength(r.enneagram, 'T3') * 25 +
      // Holland E(진취형) → 높은 목표 설정
      hollandStrength(r.holland, 'E') * 20 +
      // 오행 화(火) → 열정과 야망의 기질
      ohaengNorm(r.saju, '화') * 20
    ),
  },
  {
    key: 'diligence', name: '성실성', category: '잠재력',
    description: '꾸준하고 책임감 있게 임하는 성향',
    compute: (r) => clamp(
      // DISC C(신중형) → 꼼꼼한 업무 처리
      discStrength(r.disc, 'C') * 25 +
      // DISC S(안정형) → 꾸준한 수행
      discStrength(r.disc, 'S') * 20 +
      // MBTI J(판단형) → 계획적이고 규칙적
      polarityScore(r.mbti.J, r.mbti.P) * 25 +
      // Enneagram T1(개혁가) → 원칙적 성실함
      enneaStrength(r.enneagram, 'T1') * 15 +
      // 오행 토(土) → 안정적이고 꾸준한 기질
      ohaengNorm(r.saju, '토') * 15
    ),
  },
];

// 30가지 능력치 산출 메인 함수
// crossValidation이 주어지면 모순된 능력치를 중앙(50)으로 수축
export function computeAbilities(
  rawScores: RawTestScores,
  crossValidation?: CrossValidationResult,
): AbilityScore[] {
  return ABILITY_DEFS.map((def) => {
    let score = def.compute(rawScores);

    // 교차 검증 기반 신뢰도 반영
    if (crossValidation) {
      const confidence = crossValidation.confidenceModifiers[def.key] ?? 1.0;
      if (confidence < 1.0) {
        // 모순 발견 시 점수를 중앙(50)으로 수축
        score = Math.round(score * confidence + 50 * (1 - confidence));
      }
    }

    return {
      key: def.key,
      name: def.name,
      category: def.category,
      score: clamp(score),
      description: def.description,
    };
  });
}

// 카테고리별 그룹핑
export function getAbilitiesByCategory(abilities: AbilityScore[]): { category: string; abilities: AbilityScore[] }[] {
  const categories = ['정신력', '사회성', '업무역량', '신체/감각', '잠재력'];
  return categories.map((cat) => ({
    category: cat,
    abilities: abilities.filter((a) => a.category === cat),
  }));
}

// 상위 N개 능력치
export function getTopAbilities(abilities: AbilityScore[], n: number): AbilityScore[] {
  return [...abilities].sort((a, b) => b.score - a.score).slice(0, n);
}

// 하위 N개 능력치
export function getBottomAbilities(abilities: AbilityScore[], n: number): AbilityScore[] {
  return [...abilities].sort((a, b) => a.score - b.score).slice(0, n);
}

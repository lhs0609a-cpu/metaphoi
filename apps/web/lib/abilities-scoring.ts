import { type RawTestScores, type AbilityScore } from '@/data/tests/comprehensive';

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

// 유틸: 두 값 중 큰 쪽의 비율 (0-1)
function dominance(a: number, b: number): number {
  const total = Math.abs(a) + Math.abs(b);
  if (total === 0) return 0.5;
  return Math.max(a, b) / total;
}

// 유틸: 오행 점수 정규화 (0-1, max 8 기준)
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
      discStrength(r.disc, 'D') * 40 +
      ohaengNorm(r.saju, '금') * 30 +
      dominance(r.mbti.J, r.mbti.P) * 30
    ),
  },
  {
    key: 'composure', name: '침착성', category: '정신력',
    description: '압박 상황에서 차분함을 유지하는 능력',
    compute: (r) => clamp(
      discStrength(r.disc, 'S') * 35 +
      enneaStrength(r.enneagram, 'T9') * 30 +
      sasangStrength(r.sasang, 'SE') * 20 +
      ohaengNorm(r.saju, '수') * 15
    ),
  },
  {
    key: 'focus', name: '집중력', category: '정신력',
    description: '하나의 과제에 깊이 몰입하는 능력',
    compute: (r) => clamp(
      dominance(r.mbti.I, r.mbti.E) * 30 +
      enneaStrength(r.enneagram, 'T5') * 30 +
      hollandStrength(r.holland, 'R') * 20 +
      discStrength(r.disc, 'C') * 20
    ),
  },
  {
    key: 'creativity', name: '창의성', category: '정신력',
    description: '새로운 아이디어와 관점을 만들어내는 능력',
    compute: (r) => clamp(
      dominance(r.mbti.N, r.mbti.S) * 35 +
      enneaStrength(r.enneagram, 'T4') * 25 +
      hollandStrength(r.holland, 'A') * 25 +
      ohaengNorm(r.saju, '목') * 15
    ),
  },
  {
    key: 'analysis', name: '분석력', category: '정신력',
    description: '복잡한 정보를 논리적으로 분해하는 능력',
    compute: (r) => clamp(
      dominance(r.mbti.T, r.mbti.F) * 35 +
      hollandStrength(r.holland, 'I') * 30 +
      enneaStrength(r.enneagram, 'T5') * 20 +
      discStrength(r.disc, 'C') * 15
    ),
  },
  {
    key: 'adaptability', name: '적응력', category: '정신력',
    description: '변화하는 환경에 유연하게 대처하는 능력',
    compute: (r) => clamp(
      dominance(r.mbti.P, r.mbti.J) * 30 +
      discStrength(r.disc, 'I') * 25 +
      ohaengNorm(r.saju, '수') * 25 +
      enneaStrength(r.enneagram, 'T7') * 20
    ),
  },

  // ===== 사회성 (Social) =====
  {
    key: 'communication', name: '소통능력', category: '사회성',
    description: '생각과 감정을 효과적으로 전달하는 능력',
    compute: (r) => clamp(
      dominance(r.mbti.E, r.mbti.I) * 30 +
      discStrength(r.disc, 'I') * 30 +
      hollandStrength(r.holland, 'S') * 20 +
      ohaengNorm(r.saju, '수') * 20
    ),
  },
  {
    key: 'cooperation', name: '협동심', category: '사회성',
    description: '팀과 조화롭게 일하는 능력',
    compute: (r) => clamp(
      discStrength(r.disc, 'S') * 35 +
      enneaStrength(r.enneagram, 'T2') * 25 +
      hollandStrength(r.holland, 'S') * 20 +
      sasangStrength(r.sasang, 'SY') * 20
    ),
  },
  {
    key: 'leadership', name: '리더십', category: '사회성',
    description: '사람들을 이끌고 동기부여하는 능력',
    compute: (r) => clamp(
      discStrength(r.disc, 'D') * 30 +
      dominance(r.mbti.E, r.mbti.I) * 25 +
      enneaStrength(r.enneagram, 'T8') * 25 +
      hollandStrength(r.holland, 'E') * 20
    ),
  },
  {
    key: 'empathy', name: '공감능력', category: '사회성',
    description: '타인의 감정을 이해하고 공감하는 능력',
    compute: (r) => clamp(
      dominance(r.mbti.F, r.mbti.T) * 35 +
      enneaStrength(r.enneagram, 'T2') * 25 +
      sasangStrength(r.sasang, 'SY') * 20 +
      ohaengNorm(r.saju, '화') * 20
    ),
  },
  {
    key: 'influence', name: '영향력', category: '사회성',
    description: '타인의 생각과 행동에 영향을 미치는 능력',
    compute: (r) => clamp(
      discStrength(r.disc, 'D') * 25 +
      discStrength(r.disc, 'I') * 25 +
      hollandStrength(r.holland, 'E') * 25 +
      enneaStrength(r.enneagram, 'T3') * 25
    ),
  },
  {
    key: 'networking', name: '네트워킹', category: '사회성',
    description: '인적 네트워크를 형성하고 유지하는 능력',
    compute: (r) => clamp(
      dominance(r.mbti.E, r.mbti.I) * 35 +
      discStrength(r.disc, 'I') * 30 +
      hollandStrength(r.holland, 'E') * 20 +
      ohaengNorm(r.saju, '화') * 15
    ),
  },

  // ===== 업무역량 (Work) =====
  {
    key: 'execution', name: '실행력', category: '업무역량',
    description: '계획을 행동으로 옮기는 능력',
    compute: (r) => clamp(
      discStrength(r.disc, 'D') * 35 +
      dominance(r.mbti.J, r.mbti.P) * 30 +
      ohaengNorm(r.saju, '금') * 20 +
      enneaStrength(r.enneagram, 'T3') * 15
    ),
  },
  {
    key: 'planning', name: '기획력', category: '업무역량',
    description: '체계적으로 전략을 수립하는 능력',
    compute: (r) => clamp(
      dominance(r.mbti.N, r.mbti.S) * 25 +
      dominance(r.mbti.J, r.mbti.P) * 25 +
      hollandStrength(r.holland, 'I') * 25 +
      enneaStrength(r.enneagram, 'T1') * 25
    ),
  },
  {
    key: 'problemSolving', name: '문제해결', category: '업무역량',
    description: '장애물을 분석하고 해결책을 찾는 능력',
    compute: (r) => clamp(
      dominance(r.mbti.T, r.mbti.F) * 25 +
      dominance(r.mbti.N, r.mbti.S) * 25 +
      hollandStrength(r.holland, 'I') * 25 +
      discStrength(r.disc, 'D') * 25
    ),
  },
  {
    key: 'timeManagement', name: '시간관리', category: '업무역량',
    description: '시간을 효율적으로 배분하고 관리하는 능력',
    compute: (r) => clamp(
      dominance(r.mbti.J, r.mbti.P) * 35 +
      discStrength(r.disc, 'C') * 30 +
      enneaStrength(r.enneagram, 'T1') * 20 +
      ohaengNorm(r.saju, '토') * 15
    ),
  },
  {
    key: 'precision', name: '꼼꼼함', category: '업무역량',
    description: '세부사항을 놓치지 않는 정확성',
    compute: (r) => clamp(
      discStrength(r.disc, 'C') * 35 +
      dominance(r.mbti.S, r.mbti.N) * 25 +
      dominance(r.mbti.J, r.mbti.P) * 20 +
      enneaStrength(r.enneagram, 'T1') * 20
    ),
  },
  {
    key: 'multitasking', name: '멀티태스킹', category: '업무역량',
    description: '여러 과제를 동시에 처리하는 능력',
    compute: (r) => clamp(
      dominance(r.mbti.P, r.mbti.J) * 30 +
      discStrength(r.disc, 'I') * 25 +
      ohaengNorm(r.saju, '화') * 20 +
      enneaStrength(r.enneagram, 'T7') * 25
    ),
  },

  // ===== 신체/감각 (Physical/Sensory) =====
  {
    key: 'stressTolerance', name: '스트레스내성', category: '신체/감각',
    description: '스트레스를 견디고 관리하는 능력',
    compute: (r) => clamp(
      sasangStrength(r.sasang, 'TY') * 30 +
      discStrength(r.disc, 'D') * 25 +
      enneaStrength(r.enneagram, 'T8') * 25 +
      ohaengNorm(r.saju, '금') * 20
    ),
  },
  {
    key: 'endurance', name: '지구력', category: '신체/감각',
    description: '오래 지속하는 끈기와 체력',
    compute: (r) => clamp(
      sasangStrength(r.sasang, 'TE') * 30 +
      ohaengNorm(r.saju, '토') * 25 +
      dominance(r.mbti.J, r.mbti.P) * 25 +
      enneaStrength(r.enneagram, 'T6') * 20
    ),
  },
  {
    key: 'intuition', name: '직관력', category: '신체/감각',
    description: '논리를 넘어 본질을 파악하는 감각',
    compute: (r) => clamp(
      dominance(r.mbti.N, r.mbti.S) * 35 +
      enneaStrength(r.enneagram, 'T4') * 25 +
      ohaengNorm(r.saju, '수') * 25 +
      sasangStrength(r.sasang, 'SY') * 15
    ),
  },
  {
    key: 'aesthetics', name: '심미안', category: '신체/감각',
    description: '아름다움을 감지하고 판단하는 능력',
    compute: (r) => clamp(
      hollandStrength(r.holland, 'A') * 35 +
      dominance(r.mbti.N, r.mbti.S) * 20 +
      dominance(r.mbti.F, r.mbti.T) * 20 +
      enneaStrength(r.enneagram, 'T4') * 25
    ),
  },
  {
    key: 'spatialAwareness', name: '공간지각', category: '신체/감각',
    description: '공간과 구조를 파악하는 능력',
    compute: (r) => clamp(
      hollandStrength(r.holland, 'R') * 35 +
      dominance(r.mbti.S, r.mbti.N) * 25 +
      ohaengNorm(r.saju, '토') * 25 +
      discStrength(r.disc, 'C') * 15
    ),
  },
  {
    key: 'verbalAbility', name: '언어능력', category: '신체/감각',
    description: '언어를 통한 표현과 이해 능력',
    compute: (r) => clamp(
      hollandStrength(r.holland, 'A') * 25 +
      hollandStrength(r.holland, 'S') * 25 +
      dominance(r.mbti.E, r.mbti.I) * 25 +
      discStrength(r.disc, 'I') * 25
    ),
  },

  // ===== 잠재력 (Potential) =====
  {
    key: 'growthPotential', name: '성장가능성', category: '잠재력',
    description: '새로운 역량을 습득하고 성장하는 잠재력',
    compute: (r) => clamp(
      dominance(r.mbti.N, r.mbti.S) * 30 +
      ohaengNorm(r.saju, '목') * 30 +
      enneaStrength(r.enneagram, 'T7') * 20 +
      hollandStrength(r.holland, 'I') * 20
    ),
  },
  {
    key: 'learningSpeed', name: '학습속도', category: '잠재력',
    description: '새로운 지식과 기술을 빠르게 익히는 능력',
    compute: (r) => clamp(
      hollandStrength(r.holland, 'I') * 30 +
      dominance(r.mbti.N, r.mbti.S) * 25 +
      ohaengNorm(r.saju, '수') * 25 +
      enneaStrength(r.enneagram, 'T5') * 20
    ),
  },
  {
    key: 'innovation', name: '혁신성', category: '잠재력',
    description: '기존 틀을 깨고 새로운 방식을 시도하는 성향',
    compute: (r) => clamp(
      dominance(r.mbti.N, r.mbti.S) * 25 +
      dominance(r.mbti.P, r.mbti.J) * 25 +
      enneaStrength(r.enneagram, 'T7') * 25 +
      hollandStrength(r.holland, 'A') * 25
    ),
  },
  {
    key: 'resilience', name: '회복탄력성', category: '잠재력',
    description: '실패와 역경에서 다시 일어서는 능력',
    compute: (r) => clamp(
      sasangStrength(r.sasang, 'TY') * 25 +
      sasangStrength(r.sasang, 'TE') * 15 +
      enneaStrength(r.enneagram, 'T7') * 20 +
      ohaengNorm(r.saju, '목') * 20 +
      discStrength(r.disc, 'D') * 20
    ),
  },
  {
    key: 'ambition', name: '야망', category: '잠재력',
    description: '높은 목표를 설정하고 추구하는 성향',
    compute: (r) => clamp(
      discStrength(r.disc, 'D') * 30 +
      enneaStrength(r.enneagram, 'T3') * 30 +
      hollandStrength(r.holland, 'E') * 20 +
      ohaengNorm(r.saju, '화') * 20
    ),
  },
  {
    key: 'diligence', name: '성실성', category: '잠재력',
    description: '꾸준하고 책임감 있게 임하는 성향',
    compute: (r) => clamp(
      discStrength(r.disc, 'C') * 25 +
      discStrength(r.disc, 'S') * 20 +
      dominance(r.mbti.J, r.mbti.P) * 25 +
      enneaStrength(r.enneagram, 'T1') * 15 +
      ohaengNorm(r.saju, '토') * 15
    ),
  },
];

// 30가지 능력치 산출 메인 함수
export function computeAbilities(rawScores: RawTestScores): AbilityScore[] {
  return ABILITY_DEFS.map((def) => ({
    key: def.key,
    name: def.name,
    category: def.category,
    score: def.compute(rawScores),
    description: def.description,
  }));
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

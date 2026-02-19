import { type RawTestScores } from '@/data/tests/comprehensive';

export interface CrossConflict {
  rule: string;
  expected: string;
  actual: string;
  severity: number; // 0-1, 모순 심각도
  affectedAbilities: string[];
}

export interface CrossValidationResult {
  consistencyScore: number;          // 0-1
  conflicts: CrossConflict[];
  confidenceModifiers: Record<string, number>;  // 능력치별 신뢰도 조정 계수
}

// 유틸: 두 값의 우세 비율 (0-1)
function dominanceRatio(a: number, b: number): number {
  const total = a + b;
  if (total === 0) return 0.5;
  return a / total;
}

// 유틸: 특정 검사 내 상대적 강도 (0-1)
function relativeStrength(scores: Record<string, number>, key: string): number {
  const total = Object.values(scores).reduce((s, v) => s + Math.max(0, v), 0);
  if (total === 0) return 0;
  return Math.max(0, scores[key] || 0) / total;
}

interface ValidationRule {
  name: string;
  check: (r: RawTestScores) => { consistent: boolean; expected: string; actual: string; severity: number };
  affectedAbilities: string[];
}

const VALIDATION_RULES: ValidationRule[] = [
  {
    // MBTI E/I ↔ DISC I: E가 높으면 DISC I도 높아야 함
    name: 'MBTI E ↔ DISC I',
    check: (r) => {
      const mbtiE = dominanceRatio(r.mbti.E, r.mbti.I);
      const discI = relativeStrength(r.disc, 'I');
      const isExtraverted = mbtiE > 0.6;
      const discIHigh = discI > 0.3;
      const consistent = !isExtraverted || discIHigh; // E면 DISC I도 높아야
      return {
        consistent,
        expected: isExtraverted ? 'DISC I(사교형) 높음' : '-',
        actual: `DISC I 강도 ${Math.round(discI * 100)}%`,
        severity: isExtraverted && !discIHigh ? 0.3 : 0,
      };
    },
    affectedAbilities: ['communication', 'networking', 'cooperation'],
  },
  {
    // MBTI E/I ↔ Holland S/E: E가 높으면 Holland S 또는 E도 높아야
    name: 'MBTI E ↔ Holland S/E',
    check: (r) => {
      const mbtiE = dominanceRatio(r.mbti.E, r.mbti.I);
      const hollandSE = relativeStrength(r.holland, 'S') + relativeStrength(r.holland, 'E');
      const isExtraverted = mbtiE > 0.6;
      const hollandSEHigh = hollandSE > 0.35;
      const consistent = !isExtraverted || hollandSEHigh;
      return {
        consistent,
        expected: isExtraverted ? 'Holland S/E 합산 높음' : '-',
        actual: `Holland S+E 강도 ${Math.round(hollandSE * 100)}%`,
        severity: isExtraverted && !hollandSEHigh ? 0.2 : 0,
      };
    },
    affectedAbilities: ['leadership', 'influence', 'empathy'],
  },
  {
    // MBTI T/F ↔ Enneagram T2 vs T5: F가 높으면 T2 > T5
    name: 'MBTI F ↔ Enneagram T2/T5',
    check: (r) => {
      const mbtiF = dominanceRatio(r.mbti.F, r.mbti.T);
      const enneaT2 = relativeStrength(r.enneagram, 'T2');
      const enneaT5 = relativeStrength(r.enneagram, 'T5');
      const isFeeling = mbtiF > 0.6;
      const t2OverT5 = enneaT2 >= enneaT5;
      const consistent = !isFeeling || t2OverT5;
      return {
        consistent,
        expected: isFeeling ? 'Enneagram T2 >= T5' : '-',
        actual: `T2: ${Math.round(enneaT2 * 100)}%, T5: ${Math.round(enneaT5 * 100)}%`,
        severity: isFeeling && !t2OverT5 ? 0.25 : 0,
      };
    },
    affectedAbilities: ['empathy', 'cooperation', 'analysis'],
  },
  {
    // MBTI J/P ↔ DISC C vs I: J가 높으면 C > I
    name: 'MBTI J ↔ DISC C',
    check: (r) => {
      const mbtiJ = dominanceRatio(r.mbti.J, r.mbti.P);
      const discC = relativeStrength(r.disc, 'C');
      const discI = relativeStrength(r.disc, 'I');
      const isJudging = mbtiJ > 0.6;
      const cOverI = discC >= discI;
      const consistent = !isJudging || cOverI;
      return {
        consistent,
        expected: isJudging ? 'DISC C >= I' : '-',
        actual: `C: ${Math.round(discC * 100)}%, I: ${Math.round(discI * 100)}%`,
        severity: isJudging && !cOverI ? 0.2 : 0,
      };
    },
    affectedAbilities: ['timeManagement', 'precision', 'planning'],
  },
  {
    // DISC D ↔ Enneagram T8: D가 높으면 T8도 높아야
    name: 'DISC D ↔ Enneagram T8',
    check: (r) => {
      const discD = relativeStrength(r.disc, 'D');
      const enneaT8 = relativeStrength(r.enneagram, 'T8');
      const isDominant = discD > 0.3;
      const t8High = enneaT8 > 0.12;
      const consistent = !isDominant || t8High;
      return {
        consistent,
        expected: isDominant ? 'Enneagram T8 높음' : '-',
        actual: `T8 강도 ${Math.round(enneaT8 * 100)}%`,
        severity: isDominant && !t8High ? 0.25 : 0,
      };
    },
    affectedAbilities: ['determination', 'leadership', 'stressTolerance'],
  },
  {
    // Enneagram T7 ↔ Holland A/E: T7이 높으면 A 또는 E도 높아야
    name: 'Enneagram T7 ↔ Holland A/E',
    check: (r) => {
      const enneaT7 = relativeStrength(r.enneagram, 'T7');
      const hollandAE = relativeStrength(r.holland, 'A') + relativeStrength(r.holland, 'E');
      const t7High = enneaT7 > 0.15;
      const aeHigh = hollandAE > 0.35;
      const consistent = !t7High || aeHigh;
      return {
        consistent,
        expected: t7High ? 'Holland A/E 합산 높음' : '-',
        actual: `Holland A+E 강도 ${Math.round(hollandAE * 100)}%`,
        severity: t7High && !aeHigh ? 0.2 : 0,
      };
    },
    affectedAbilities: ['adaptability', 'innovation', 'multitasking'],
  },
];

export function crossValidate(rawScores: RawTestScores): CrossValidationResult {
  const conflicts: CrossConflict[] = [];
  const confidenceModifiers: Record<string, number> = {};

  for (const rule of VALIDATION_RULES) {
    const result = rule.check(rawScores);
    if (!result.consistent && result.severity > 0) {
      conflicts.push({
        rule: rule.name,
        expected: result.expected,
        actual: result.actual,
        severity: result.severity,
        affectedAbilities: rule.affectedAbilities,
      });

      // 관련 능력치의 confidence를 하향 조정
      for (const ability of rule.affectedAbilities) {
        const current = confidenceModifiers[ability] ?? 1.0;
        confidenceModifiers[ability] = current * (1 - result.severity);
      }
    }
  }

  // 전체 일관성 점수
  const totalSeverity = conflicts.reduce((sum, c) => sum + c.severity, 0);
  const maxPossibleSeverity = VALIDATION_RULES.length * 0.3; // 대략적 최대
  const consistencyScore = Math.max(0, Math.min(1, 1 - totalSeverity / maxPossibleSeverity));

  return {
    consistencyScore,
    conflicts,
    confidenceModifiers,
  };
}

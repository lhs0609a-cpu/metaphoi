/**
 * 채용용 능력치
 * ============================================================================
 *
 * 왜 따로 계산하는가
 *
 *   능력치 30개 중 20개가 사주(오행)와 사상체질의 영향을 받는다.
 *   지구력과 회복탄력성은 60%, 스트레스내성은 50%가 그쪽에서 온다.
 *   그런데 사주는 문항이 없고 생년월일시로만, 사상체질은 성별을 써서
 *   계산된다.
 *
 *   B2C 결과 화면에서 이것을 보여주는 것은 이 제품의 성격상 괜찮다.
 *   하지만 같은 값이 기업 화면의 후보 정렬에 들어가면 이야기가 달라진다.
 *   지원자가 "왜 밀렸느냐"고 물었을 때 "생년월일이 지구력을 60% 결정했다"가
 *   답이 되어서는 안 된다. 타당도 이전에 고용상 연령차별금지법과
 *   남녀고용평등법의 문제다.
 *
 *   그래서 채용 경로로 나가는 값은 사주·사상체질 항목을 빼고 계산한다.
 *
 * 어떻게 빼는가
 *
 *   모든 능력치 공식은 정규화된 0~1 항에 가중치를 곱해 더한 선형식이고
 *   가중치 합은 100이다. 사주·사상 입력을 0으로 두면 그 항만 사라지므로,
 *   남은 가중치 합으로 나눠 100 기준으로 되돌리면 척도가 유지된다.
 *
 *      점수 = compute(사주·사상 제거) × 100 / (100 − 제거된 가중치)
 *
 * 아래 표는 lib/abilities-scoring.ts 의 공식에서 추출한 값이다.
 * 공식을 바꾸면 이 표도 같이 바꿔야 한다 — 어긋나면 척도가 조용히 틀어진다.
 * assertTraditionalWeightsInSync() 가 그 어긋남을 잡는다.
 */
import { computeAbilities } from './abilities-scoring';
import { type RawTestScores, type AbilityScore } from '@/data/tests/comprehensive';
import { type CrossValidationResult } from './cross-validation';

/** 능력치별로 사주(오행)+사상체질이 차지하는 가중치. 전체는 100 기준 */
export const TRADITIONAL_WEIGHT: Record<string, number> = {
  determination: 25, // 결단력 — 총 100 중
  composure: 40, // 침착성 — 총 100 중
  creativity: 15, // 창의성 — 총 100 중
  adaptability: 20, // 적응력 — 총 100 중
  communication: 20, // 소통능력 — 총 100 중
  cooperation: 20, // 협동심 — 총 100 중
  empathy: 40, // 공감능력 — 총 100 중
  networking: 20, // 네트워킹 — 총 100 중
  execution: 20, // 실행력 — 총 100 중
  timeManagement: 20, // 시간관리 — 총 100 중
  multitasking: 20, // 멀티태스킹 — 총 100 중
  stressTolerance: 50, // 스트레스내성 — 총 100 중
  endurance: 60, // 지구력 — 총 100 중
  intuition: 40, // 직관력 — 총 100 중
  spatialAwareness: 20, // 공간지각 — 총 100 중
  growthPotential: 25, // 성장가능성 — 총 100 중
  learningSpeed: 20, // 학습속도 — 총 100 중
  resilience: 60, // 회복탄력성 — 총 100 중
  ambition: 20, // 야망 — 총 100 중
  diligence: 15, // 성실성 — 총 100 중
};

/** 사주·사상 입력을 0으로 만든 사본. 원본은 건드리지 않는다 */
function withoutTraditional(raw: RawTestScores): RawTestScores {
  return {
    ...raw,
    saju: {},
    sasang: { TY: 0, TE: 0, SY: 0, SE: 0 },
  };
}

/**
 * 기업에 전달되는 능력치.
 *
 * 결과 화면에 보이는 값과 다를 수 있다. 그건 버그가 아니라 의도다 —
 * 두 화면이 서로 다른 것을 재고 있기 때문이고, 기업 화면에는 그 사실을
 * 표시한다.
 */
export function computeHiringAbilities(
  rawScores: RawTestScores,
  crossValidation?: CrossValidationResult,
): AbilityScore[] {
  const reduced = computeAbilities(withoutTraditional(rawScores), crossValidation);

  return reduced.map((a) => {
    const removed = TRADITIONAL_WEIGHT[a.key] ?? 0;
    if (removed === 0) return a;
    const retained = 100 - removed;
    // 제거된 비중이 100이면 남는 근거가 없다는 뜻이라 그대로 둔다
    if (retained <= 0) return a;
    return { ...a, score: Math.max(0, Math.min(100, Math.round((a.score * 100) / retained))) };
  });
}

/**
 * 표가 공식과 어긋나지 않았는지 확인한다.
 *
 * 사주·사상 입력만 0으로 둔 점수와 원점수의 차이가 표의 가중치와 맞아야
 * 한다. 공식을 고치고 표를 안 고치면 여기서 걸린다.
 */
export function assertTraditionalWeightsInSync(raw: RawTestScores): string[] {
  const full = computeAbilities(raw);
  const reduced = computeAbilities(withoutTraditional(raw));
  const problems: string[] = [];

  full.forEach((f, i) => {
    const declared = TRADITIONAL_WEIGHT[f.key] ?? 0;
    const dropped = f.score - reduced[i].score;
    // 입력이 0이면 원래 기여가 없어 차이도 0이다. 과다 선언만 잡는다.
    if (dropped > declared + 1) {
      problems.push(`${f.name}(${f.key}): 실제 감소 ${dropped} > 선언 ${declared}`);
    }
  });

  return problems;
}

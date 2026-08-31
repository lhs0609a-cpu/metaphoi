import {
  CULTURE_DIMENSIONS,
  type CultureKey,
  type CultureProfile,
} from '@/data/culture/cvf';

/**
 * 조직문화 적합도
 * ============================================================================
 *
 * 같은 척도로 잰 두 프로필의 거리로 계산한다.
 *
 * 여기서는 RIASEC 매칭과 달리 상관이 아니라 거리를 쓴다.
 * 경쟁가치모형 응답은 100점을 나눠 담는 강제배분이라 네 값의 합이 항상
 * 같다. 그래서 응답 강도 차이(어떤 사람은 전반적으로 높게 답하는 문제)가
 * 생기지 않고, 대신 "얼마나 다른가"가 그대로 의미를 갖는다.
 * 강제배분 자료에 상관을 쓰면 합이 고정된 탓에 인위적인 음의 상관이 생긴다.
 */

/** 한 사분면에 100점이 몰린 두 프로필 사이의 거리 — 이론상 최대 */
const MAX_DISTANCE = Math.sqrt(100 * 100 * 2);

export type CultureFitLevel = 'high' | 'good' | 'fair' | 'low';

export interface CultureFitResult {
  score: number;
  level: CultureFitLevel;
  /** 가장 크게 어긋난 축 — 무엇이 다른지 말해 주기 위해 */
  biggestGap: { key: CultureKey; name: string; seeker: number; company: number } | null;
  /** 가장 잘 맞는 축 */
  strongest: { key: CultureKey; name: string } | null;
}

export const CULTURE_LEVEL_LABEL: Record<CultureFitLevel, string> = {
  high: '매우 잘 맞음',
  good: '잘 맞는 편',
  fair: '보통',
  low: '차이가 큼',
};

/**
 * 두 문화 프로필의 적합도.
 *
 * 한쪽이라도 측정되지 않았으면 null 을 돌려준다.
 * 예전 구현은 이럴 때 50을 넣었는데, 그러면 "재보니 보통"과
 * "아직 안 쟀음"이 화면에서 같은 숫자가 된다. 안 잰 것은 안 잰 것이다.
 */
export function calculateCultureFit(
  seeker: CultureProfile | null | undefined,
  company: CultureProfile | null | undefined
): CultureFitResult | null {
  if (!seeker || !company) return null;

  const keys = CULTURE_DIMENSIONS.map((d) => d.key);

  let sumSq = 0;
  keys.forEach((k) => {
    const d = (seeker[k] ?? 0) - (company[k] ?? 0);
    sumSq += d * d;
  });
  const distance = Math.sqrt(sumSq);

  const score = Math.round(Math.max(0, 100 - (distance / MAX_DISTANCE) * 100));

  const diffs = keys
    .map((k) => ({
      key: k,
      name: CULTURE_DIMENSIONS.find((d) => d.key === k)!.name,
      seeker: seeker[k] ?? 0,
      company: company[k] ?? 0,
      gap: Math.abs((seeker[k] ?? 0) - (company[k] ?? 0)),
    }))
    .sort((a, b) => b.gap - a.gap);

  return {
    score,
    level: toCultureLevel(score),
    // 차이가 8점 미만이면 "어긋난 축"이라고 부를 만한 것이 없다
    biggestGap: diffs[0] && diffs[0].gap >= 8 ? diffs[0] : null,
    strongest: diffs.length > 0 ? { key: diffs[diffs.length - 1].key, name: diffs[diffs.length - 1].name } : null,
  };
}

/**
 * 경계값은 관례적인 구분이고 이 제품의 데이터로 검증된 값이 아니다.
 * 채용 결과가 쌓이면 여기부터 교정한다.
 */
export function toCultureLevel(score: number): CultureFitLevel {
  if (score >= 85) return 'high';
  if (score >= 70) return 'good';
  if (score >= 55) return 'fair';
  return 'low';
}

/**
 * 문화 적합을 한 줄로 설명한다.
 *
 * 숫자만 주면 채용 담당자는 그 숫자를 믿거나 무시하거나 둘 중 하나를 한다.
 * 무엇이 어떻게 다른지 말해 주면 판단할 거리가 생긴다.
 */
export function describeCultureFit(fit: CultureFitResult | null): string {
  if (!fit) return '양쪽 모두 문화 문항에 답해야 계산됩니다';
  if (!fit.biggestGap) return '네 축 모두 비슷한 분포입니다';

  const g = fit.biggestGap;
  const who = g.seeker > g.company ? '후보자' : '회사';
  const other = g.seeker > g.company ? '회사' : '후보자';
  return `${g.name}을(를) ${who} 쪽이 ${other}보다 중요하게 봅니다`;
}

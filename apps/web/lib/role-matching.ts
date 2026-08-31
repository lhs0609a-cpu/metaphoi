import {
  riasecFromHollandCode,
  type AbilityKey,
  type JobFamily,
  type JobRole,
  type RiasecKey,
  type RiasecProfile,
  type SourceKind,
} from '@/data/roles/types';
import { INDUSTRIES, JOB_FAMILIES } from '@/data/roles/families';
import { JOB_ROLES } from '@/data/roles/roles';

/**
 * 직무 매칭
 * ============================================================================
 *
 * 두 방향이 있다.
 *
 *   1) 유저 → 직무   "나는 어떤 직무와 맞나"
 *      Holland RIASEC 프로필 사이의 상관으로 계산한다.
 *      이 경로는 근거가 있다 — RIASEC 흥미 일치도로 직업 적합을 보는 것은
 *      수십 년간 검증된 방법이고, O*NET 이 직업마다 흥미코드를 공개한다.
 *
 *   2) 직무 → 요구 역량   "이 직무를 뽑으려면 어떤 능력이 필요한가"
 *      직군 프로필을 상속해 채운다. 지금 이 숫자들은 provisional 이므로
 *      기업 화면에서 그렇게 표시하고, 기업이 조정하면 manual 로 바뀐다.
 *
 * 두 방향을 한 점수로 합치지 않는다.
 * 흥미(하고 싶은가)와 역량(할 수 있는가)은 다른 것이고, 실제로 상관도 낮다.
 * 합쳐 버리면 "흥미는 높은데 역량이 안 맞는" 경우와 그 반대가 같은 숫자가 된다.
 */

export interface ResolvedRole {
  id: string;
  name: string;
  aliases: string[];
  familyId: string;
  familyName: string;
  industryId: string;
  industryName: string;
  summary: string;
  hollandCode: string;
  onetCode?: string;
  riasec: RiasecProfile;
  competencies: Partial<Record<AbilityKey, number>>;
  competencySource: SourceKind;
}

const FAMILY_BY_ID = new Map<string, JobFamily>(JOB_FAMILIES.map((f) => [f.id, f]));
const INDUSTRY_BY_ID = new Map(INDUSTRIES.map((i) => [i.id, i]));

/** 직무 하나를 직군 상속까지 적용해 완전한 형태로 편다 */
export function resolveRole(role: JobRole): ResolvedRole | null {
  const family = FAMILY_BY_ID.get(role.familyId);
  if (!family) return null;
  const industry = INDUSTRY_BY_ID.get(family.industryId);

  const hollandCode = role.hollandCode ?? family.hollandCode;

  return {
    id: role.id,
    name: role.name,
    aliases: role.aliases ?? [],
    familyId: family.id,
    familyName: family.name,
    industryId: family.industryId,
    industryName: industry?.name ?? family.industryId,
    summary: family.summary,
    hollandCode,
    onetCode: role.onetCode ?? family.onetCode,
    riasec: riasecFromHollandCode(hollandCode),
    competencies: { ...family.competencies, ...(role.competencyOverrides ?? {}) },
    // 직무가 값을 덮어썼어도 근거의 질은 직군과 같다. 출처를 승격시키지 않는다.
    competencySource: family.competencySource,
  };
}

export const RESOLVED_ROLES: ResolvedRole[] = JOB_ROLES.map(resolveRole).filter(
  (r): r is ResolvedRole => r !== null
);

const RIASEC_KEYS: RiasecKey[] = ['R', 'I', 'A', 'S', 'E', 'C'];

/**
 * 두 RIASEC 프로필의 피어슨 상관.
 *
 * 유클리드 거리를 쓰지 않는 이유: 사람마다 응답 강도가 달라서 전체적으로
 * 높게 답하는 사람과 낮게 답하는 사람이 생긴다. 거리로 재면 그 사람의
 * 성향이 아니라 응답 습관을 재게 된다. 상관은 모양만 본다.
 */
export function riasecCorrelation(a: RiasecProfile, b: RiasecProfile): number {
  const av = RIASEC_KEYS.map((k) => a[k] ?? 0);
  const bv = RIASEC_KEYS.map((k) => b[k] ?? 0);
  const n = RIASEC_KEYS.length;
  const meanA = av.reduce((s, v) => s + v, 0) / n;
  const meanB = bv.reduce((s, v) => s + v, 0) / n;

  let num = 0;
  let devA = 0;
  let devB = 0;
  for (let i = 0; i < n; i++) {
    const da = av[i] - meanA;
    const db = bv[i] - meanB;
    num += da * db;
    devA += da * da;
    devB += db * db;
  }
  const den = Math.sqrt(devA * devB);
  // 한쪽이 완전히 평평하면 상관이 정의되지 않는다. 그럴 때는 "판단 못 함"이 정답이다.
  if (den === 0) return 0;
  return num / den;
}

export type FitBand = 'high' | 'good' | 'fair' | 'low';

export const BAND_LABEL: Record<FitBand, string> = {
  high: '매우 잘 맞음',
  good: '잘 맞는 편',
  fair: '보통',
  low: '덜 맞음',
};

/**
 * 상관계수를 구간으로 끊는다.
 * 경계값(0.65 / 0.35 / 0)은 관례적인 효과크기 구분을 따른 것이고
 * 이 제품의 데이터로 검증된 값은 아니다.
 */
export function toBand(r: number): FitBand {
  if (r >= 0.65) return 'high';
  if (r >= 0.35) return 'good';
  if (r >= 0) return 'fair';
  return 'low';
}

/**
 * 이 사람의 흥미 프로필로 직무를 가릴 수 있는가.
 *
 * 여섯 축을 다 비슷하게 답하면 상관은 0 근처에서 흔들리고, 그때 나오는
 * 1·2·3위는 배열 순서일 뿐이다. 그런 결과를 "당신에게 맞는 직무"라고
 * 내보내는 것이 이 제품이 하지 않기로 한 일이다. 그래서 먼저 확인한다.
 *
 * 기준: 최고축과 최저축의 차이가 15점 미만이면 판단하지 않는다.
 */
export function isDiscriminative(riasec: RiasecProfile): boolean {
  const values = RIASEC_KEYS.map((k) => riasec[k] ?? 0);
  return Math.max(...values) - Math.min(...values) >= 15;
}

export interface RoleMatch {
  role: ResolvedRole;
  /** -1 ~ 1 상관계수 */
  correlation: number;
  /**
   * 흥미 일치 정도. 상관계수를 네 구간으로 끊은 값이다.
   *
   * 퍼센트를 쓰지 않는 이유: (r+1)/2*100 으로 펴면 r=0.77 이 89% 가 되어
   * 실제보다 훨씬 정밀하고 높아 보인다. 이 모델이 말할 수 있는 것은
   * "잘 맞는 편"까지이지 "89% 맞음"이 아니다.
   */
  band: FitBand;
  /** 이 직무에서 특히 중요한데 유저 능력치가 받쳐주는 항목 */
  strongFor: AbilityKey[];
  /** 중요한데 낮은 항목 */
  gapsFor: AbilityKey[];
}

/**
 * 유저의 RIASEC 로 맞는 직무를 찾는다.
 *
 * abilities 를 같이 넘기면 각 직무에서 강점·약점 항목을 함께 돌려준다.
 * 다만 순위는 흥미(RIASEC)로만 매긴다 — 능력치는 규준이 없어서 사람 사이
 * 비교에 쓸 수 없고, 그걸 순위에 섞으면 없는 근거를 있는 것처럼 만들게 된다.
 */
export function matchRolesForSeeker(
  riasec: RiasecProfile,
  options?: {
    abilities?: Partial<Record<AbilityKey, number>>;
    limit?: number;
    industryId?: string;
  }
): RoleMatch[] {
  const { abilities, limit = 10, industryId } = options ?? {};
  if (!isDiscriminative(riasec)) return [];

  const pool = industryId
    ? RESOLVED_ROLES.filter((r) => r.industryId === industryId)
    : RESOLVED_ROLES;

  return pool
    .map((role) => {
      const correlation = riasecCorrelation(riasec, role.riasec);

      let strongFor: AbilityKey[] = [];
      let gapsFor: AbilityKey[] = [];

      if (abilities) {
        // 이 직무에서 중요도 80 이상인 능력만 본다.
        // 전부 나열하면 무엇을 봐야 할지 알 수 없다.
        const important = (Object.entries(role.competencies) as [AbilityKey, number][])
          .filter(([, w]) => w >= 80)
          .sort((x, y) => y[1] - x[1]);

        strongFor = important.filter(([k]) => (abilities[k] ?? 0) >= 60).map(([k]) => k).slice(0, 3);
        gapsFor = important.filter(([k]) => (abilities[k] ?? 0) < 45).map(([k]) => k).slice(0, 3);
      }

      return { role, correlation, band: toBand(correlation), strongFor, gapsFor };
    })
    .sort((a, b) => b.correlation - a.correlation)
    .slice(0, limit);
}

/**
 * 직군 단위 적합도.
 *
 * 이 모델이 실제로 구분하는 단위는 직군이다. 같은 직군의 직무들은
 * 흥미코드를 공유하므로 상관이 같게 나온다 — 백엔드와 프론트엔드를
 * 96%와 96%로 나란히 세우면 구분하지 못하는 것을 구분한 척하게 된다.
 * 그래서 직군으로 묶어 순위를 매기고, 그 안의 직무는 나열만 한다.
 */
export function matchFamiliesForSeeker(
  riasec: RiasecProfile,
  options?: { limit?: number; industryId?: string }
) {
  const { limit = 6, industryId } = options ?? {};
  if (!isDiscriminative(riasec)) return [];

  return JOB_FAMILIES.filter((f) => !industryId || f.industryId === industryId)
    .map((family) => {
      const correlation = riasecCorrelation(riasec, riasecFromHollandCode(family.hollandCode));
      const roles = RESOLVED_ROLES.filter((r) => r.familyId === family.id);
      return {
        family,
        industryName: INDUSTRY_BY_ID.get(family.industryId)?.name ?? family.industryId,
        correlation,
        band: toBand(correlation),
        roles,
      };
    })
    .sort((a, b) => b.correlation - a.correlation)
    .slice(0, limit);
}

/** 업종 단위 적합도 — 그 업종 직무들의 평균 상관 */
export function matchIndustriesForSeeker(riasec: RiasecProfile) {
  if (!isDiscriminative(riasec)) return [];
  return INDUSTRIES.map((industry) => {
    const roles = RESOLVED_ROLES.filter((r) => r.industryId === industry.id);
    if (roles.length === 0) return null;
    const avg = roles.reduce((s, r) => s + riasecCorrelation(riasec, r.riasec), 0) / roles.length;
    return { industry, correlation: avg, band: toBand(avg), roleCount: roles.length };
  })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.correlation - a.correlation);
}

/**
 * 기업 쪽: 직무를 고르면 요구 역량 초안을 돌려준다.
 *
 * threshold 이상만 넘긴다. 30개를 다 채워 주면 기업이 전부 지우는 일부터
 * 하게 되고, 그러면 자동으로 채운 의미가 없다.
 */
export function requiredAbilitiesForRole(
  roleId: string,
  threshold = 70
): { abilities: Partial<Record<AbilityKey, number>>; source: SourceKind } | null {
  const role = RESOLVED_ROLES.find((r) => r.id === roleId);
  if (!role) return null;

  const abilities: Partial<Record<AbilityKey, number>> = {};
  (Object.entries(role.competencies) as [AbilityKey, number][])
    .filter(([, w]) => w >= threshold)
    .forEach(([k, w]) => {
      abilities[k] = w;
    });

  return { abilities, source: role.competencySource };
}

/** 직무명·별칭으로 검색. 기업이 공고를 쓸 때 자기 직무를 찾는 용도 */
export function searchRoles(query: string, limit = 8): ResolvedRole[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return RESOLVED_ROLES.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.familyName.toLowerCase().includes(q) ||
      r.aliases.some((a) => a.toLowerCase().includes(q))
  ).slice(0, limit);
}

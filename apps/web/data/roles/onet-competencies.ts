import type { AbilityKey } from './types';

/**
 * O*NET 실측 중요도 — 있으면 쓰고 없으면 넘어간다.
 *
 * scripts/onet/import.ts 를 돌리면 onet-competencies.generated.ts 가 생긴다.
 * 그 파일은 저장소에 커밋하지 않는다 — O*NET 배포판에서 파생된 값이고,
 * 라이선스 조건은 받는 쪽에서 확인해야 하기 때문이다.
 *
 * 파일이 없어도 앱은 그대로 동작한다. 그때는 families.ts 의 provisional
 * 값이 쓰이고, 화면에도 잠정값이라고 표시된다. "데이터를 넣으면 좋아지지만
 * 없어도 돌아간다"가 이 구조의 요점이다.
 */

let loaded: Record<string, Partial<Record<AbilityKey, number>>> = {};

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('./onet-competencies.generated');
  if (mod?.ONET_COMPETENCIES) loaded = mod.ONET_COMPETENCIES;
} catch {
  // 생성 파일 없음 — 정상 경로다
}

export const ONET_COMPETENCIES = loaded;

export function hasOnetData(): boolean {
  return Object.keys(ONET_COMPETENCIES).length > 0;
}

/** 직군/직무 id 로 실측 중요도를 찾는다. 직무가 없으면 직군 값을 쓴다 */
export function onetCompetenciesFor(
  familyId: string,
  roleId?: string,
): Partial<Record<AbilityKey, number>> | null {
  if (roleId && ONET_COMPETENCIES[`role:${roleId}`]) {
    return ONET_COMPETENCIES[`role:${roleId}`];
  }
  return ONET_COMPETENCIES[`family:${familyId}`] ?? null;
}

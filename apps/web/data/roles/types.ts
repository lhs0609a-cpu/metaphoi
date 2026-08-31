/**
 * 직무 택소노미
 * ============================================================================
 *
 * 업종(industry) → 직군(family) → 직무(role) 3단계.
 *
 * 왜 3단계인가
 *   전업종 직무를 하나하나 손으로 채우면 150개 프로필의 품질을 아무도
 *   관리하지 못한다. 그래서 검증 가능한 단위인 직군에 프로필을 두고,
 *   직무는 직군을 상속받아 다른 부분만 덮어쓴다. 직군 40개는 사람이
 *   검토할 수 있는 양이고, 직무 150개는 아니다.
 *
 * source 필드를 왜 두는가
 *   이 저장소의 기존 산출 로직은 가중치가 실측치인지 누가 적어넣은 값인지
 *   코드만 봐서는 구분되지 않는다(예: 결단력 = DISC_D*35 + 오행금*25 …).
 *   같은 실수를 반복하지 않으려고 모든 수치에 출처를 붙인다.
 *   화면에서도 provisional 인 값은 그렇게 표시한다.
 */

/** 능력치 30개의 키. lib/abilities-scoring.ts 의 ABILITY_DEFS 와 1:1 */
export type AbilityKey =
  | 'determination' | 'composure' | 'focus' | 'creativity' | 'analysis' | 'adaptability'
  | 'communication' | 'cooperation' | 'leadership' | 'empathy' | 'influence' | 'networking'
  | 'execution' | 'planning' | 'problemSolving' | 'timeManagement' | 'precision' | 'multitasking'
  | 'stressTolerance' | 'endurance' | 'intuition' | 'aesthetics' | 'spatialAwareness' | 'verbalAbility'
  | 'growthPotential' | 'learningSpeed' | 'innovation' | 'resilience' | 'ambition' | 'diligence';

/** Holland RIASEC 6축 */
export type RiasecKey = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export type RiasecProfile = Record<RiasecKey, number>;

/**
 * 수치의 출처.
 *
 *  onet        O*NET(미국 노동부)이 공개한 실측치를 그대로 옮긴 값
 *  onet-code   O*NET이 부여한 Holland 흥미코드(예: 'IRC')에서 규칙으로 환산한 값
 *              — 코드 자체는 실측이지만 6축 수치는 우리가 만든 규칙의 결과다
 *  worknet     한국고용정보원 직업정보 기반
 *  provisional 근거 데이터 없이 채운 임시값. 화면에 그렇게 표시하고, 실측치로 교체 대상
 *  manual      기업이 자기 공고에서 직접 조정한 값
 */
export type SourceKind = 'onet' | 'onet-code' | 'worknet' | 'provisional' | 'manual';

export interface JobFamily {
  id: string;
  /** 소속 업종 id */
  industryId: string;
  name: string;
  /** 이 직군이 하는 일 한 줄 */
  summary: string;
  /**
   * O*NET 흥미코드. 첫 글자가 가장 강한 축.
   * O*NET 이 직업마다 1~3글자로 공개하는 값이라 실측 근거가 있다.
   */
  hollandCode: string;
  /** 대표 O*NET SOC 코드. 나중에 실측치를 끌어올 때의 조인 키 */
  onetCode?: string;
  /**
   * 이 직군에서 특히 중요한 능력치. 0-100 중요도.
   * 여기 없는 능력치는 "중요하지 않다"가 아니라 "구분에 쓰지 않는다"는 뜻이다.
   */
  competencies: Partial<Record<AbilityKey, number>>;
  competencySource: SourceKind;
}

export interface JobRole {
  id: string;
  familyId: string;
  name: string;
  /** 시장에서 실제로 쓰이는 다른 이름들. 검색과 LLM 매핑에 쓴다 */
  aliases?: string[];
  onetCode?: string;
  /** 직군과 다른 부분만. 비우면 직군 값을 그대로 쓴다 */
  hollandCode?: string;
  competencyOverrides?: Partial<Record<AbilityKey, number>>;
}

export interface Industry {
  id: string;
  name: string;
}

/**
 * Holland 흥미코드 → 6축 수치 환산.
 *
 * O*NET 은 직업마다 흥미코드를 1~3글자로 공개한다(예: 'IRC').
 * 6축 실측 수치는 별도 파일로만 제공되므로, 코드만 아는 단계에서는
 * 순위를 수치로 펴서 쓴다. 아래 값은 측정치가 아니라 환산 규칙이며,
 * 그래서 이 값을 쓰는 프로필은 source 가 'onet-code' 로 남는다.
 *
 *   1순위 92 · 2순위 74 · 3순위 58 · 나머지 22
 *
 * 간격을 일정하게 두는 이유는 상관계수 계산에서 순위 정보만 살리기 위해서다.
 * 실측치가 들어오면 이 함수는 쓰이지 않는다.
 */
const RANK_VALUES = [92, 74, 58];
const RIASEC_BASE = 22;

export function riasecFromHollandCode(code: string): RiasecProfile {
  const profile: RiasecProfile = { R: RIASEC_BASE, I: RIASEC_BASE, A: RIASEC_BASE, S: RIASEC_BASE, E: RIASEC_BASE, C: RIASEC_BASE };
  code
    .toUpperCase()
    .split('')
    .slice(0, 3)
    .forEach((letter, i) => {
      if (letter in profile) profile[letter as RiasecKey] = RANK_VALUES[i];
    });
  return profile;
}

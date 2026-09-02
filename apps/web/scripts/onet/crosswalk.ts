import type { AbilityKey } from '@/data/roles/types';

/**
 * O*NET → Metaphoi 능력치 크로스워크
 * ============================================================================
 *
 * O*NET(미국 노동부)은 직업 약 900개에 대해 요소별 중요도를 실측해서 공개한다.
 * 우리 능력치 30개는 그 요소들과 이름이 다르므로, 어떤 요소가 어떤 능력치를
 * 얼마나 설명하는지 사람이 정해서 적어 둔다.
 *
 * 이 표 자체는 판단이다 — 그래서 표를 코드에 두고 검토할 수 있게 한다.
 * 표가 틀렸다고 생각되면 여기만 고치면 되고, 임포트를 다시 돌리면 된다.
 *
 * 세 파일에서 가져온다
 *   Work_Styles.txt  성격·태도 계열. 우리 능력치와 가장 많이 겹친다
 *   Abilities.txt    인지·감각·신체 능력
 *   Skills.txt       학습으로 습득하는 기술
 *
 * 척도
 *   Work Styles / Skills / Abilities 모두 Importance(IM)가 1~5다.
 *   0~100 으로 펼 때는 (v - 1) / 4 * 100 을 쓴다.
 *   Level(LV)은 쓰지 않는다 — 우리가 알고 싶은 것은 "이 직무에서 얼마나
 *   중요한가"이지 "얼마나 높은 수준이 필요한가"가 아니다.
 */

export interface CrosswalkEntry {
  /** O*NET Element ID. 파일에서 이 값으로 찾는다 */
  elementId: string;
  /** 사람이 읽기 위한 이름. 매칭에는 쓰지 않는다 */
  elementName: string;
  /** 어느 파일에 있는지 */
  file: 'work_styles' | 'abilities' | 'skills';
  /** 이 요소가 기여하는 우리 능력치 */
  target: AbilityKey;
  /**
   * 같은 능력치에 여러 요소가 붙을 때의 가중치.
   * 합이 1이 아니어도 되고, 임포트에서 가중평균으로 계산한다.
   */
  weight: number;
}

export const CROSSWALK: CrosswalkEntry[] = [
  // ── Work Styles (1.C.*) ─────────────────────────────────────────
  { elementId: '1.C.1.a', elementName: 'Achievement/Effort', file: 'work_styles', target: 'ambition', weight: 1 },
  { elementId: '1.C.1.b', elementName: 'Persistence', file: 'work_styles', target: 'resilience', weight: 1 },
  { elementId: '1.C.1.c', elementName: 'Initiative', file: 'work_styles', target: 'execution', weight: 1 },
  { elementId: '1.C.2.a', elementName: 'Leadership', file: 'work_styles', target: 'leadership', weight: 1 },
  { elementId: '1.C.3.a', elementName: 'Cooperation', file: 'work_styles', target: 'cooperation', weight: 1 },
  { elementId: '1.C.3.b', elementName: 'Concern for Others', file: 'work_styles', target: 'empathy', weight: 0.6 },
  { elementId: '1.C.3.c', elementName: 'Social Orientation', file: 'work_styles', target: 'networking', weight: 1 },
  { elementId: '1.C.4.a', elementName: 'Self Control', file: 'work_styles', target: 'composure', weight: 1 },
  { elementId: '1.C.4.b', elementName: 'Stress Tolerance', file: 'work_styles', target: 'stressTolerance', weight: 1 },
  { elementId: '1.C.4.c', elementName: 'Adaptability/Flexibility', file: 'work_styles', target: 'adaptability', weight: 1 },
  { elementId: '1.C.5.a', elementName: 'Dependability', file: 'work_styles', target: 'diligence', weight: 1 },
  { elementId: '1.C.5.b', elementName: 'Attention to Detail', file: 'work_styles', target: 'precision', weight: 1 },
  { elementId: '1.C.7.a', elementName: 'Innovation', file: 'work_styles', target: 'innovation', weight: 1 },
  { elementId: '1.C.7.b', elementName: 'Analytical Thinking', file: 'work_styles', target: 'analysis', weight: 0.6 },

  // ── Abilities (1.A.*) ───────────────────────────────────────────
  { elementId: '1.A.1.a.1', elementName: 'Oral Comprehension', file: 'abilities', target: 'verbalAbility', weight: 0.3 },
  { elementId: '1.A.1.a.2', elementName: 'Written Comprehension', file: 'abilities', target: 'verbalAbility', weight: 0.3 },
  { elementId: '1.A.1.a.3', elementName: 'Oral Expression', file: 'abilities', target: 'verbalAbility', weight: 0.2 },
  { elementId: '1.A.1.a.4', elementName: 'Written Expression', file: 'abilities', target: 'verbalAbility', weight: 0.2 },
  { elementId: '1.A.1.b.1', elementName: 'Fluency of Ideas', file: 'abilities', target: 'creativity', weight: 0.4 },
  { elementId: '1.A.1.b.4', elementName: 'Originality', file: 'abilities', target: 'creativity', weight: 0.6 },
  { elementId: '1.A.1.b.2', elementName: 'Deductive Reasoning', file: 'abilities', target: 'analysis', weight: 0.2 },
  { elementId: '1.A.1.b.3', elementName: 'Inductive Reasoning', file: 'abilities', target: 'analysis', weight: 0.2 },
  { elementId: '1.A.1.b.5', elementName: 'Problem Sensitivity', file: 'abilities', target: 'problemSolving', weight: 0.4 },
  { elementId: '1.A.1.c.1', elementName: 'Selective Attention', file: 'abilities', target: 'focus', weight: 1 },
  { elementId: '1.A.1.c.2', elementName: 'Time Sharing', file: 'abilities', target: 'multitasking', weight: 1 },
  { elementId: '1.A.1.f.1', elementName: 'Spatial Orientation', file: 'abilities', target: 'spatialAwareness', weight: 0.4 },
  { elementId: '1.A.1.f.2', elementName: 'Visualization', file: 'abilities', target: 'spatialAwareness', weight: 0.6 },
  { elementId: '1.A.3.a.4', elementName: 'Stamina', file: 'abilities', target: 'endurance', weight: 1 },

  // ── Skills (2.*) ────────────────────────────────────────────────
  { elementId: '2.A.1.a', elementName: 'Reading Comprehension', file: 'skills', target: 'verbalAbility', weight: 0.2 },
  { elementId: '2.A.1.d', elementName: 'Speaking', file: 'skills', target: 'communication', weight: 0.5 },
  { elementId: '2.A.1.b', elementName: 'Active Listening', file: 'skills', target: 'communication', weight: 0.5 },
  { elementId: '2.A.1.e', elementName: 'Learning Strategies', file: 'skills', target: 'learningSpeed', weight: 0.5 },
  { elementId: '2.A.1.f', elementName: 'Active Learning', file: 'skills', target: 'learningSpeed', weight: 0.5 },
  { elementId: '2.A.2.a', elementName: 'Critical Thinking', file: 'skills', target: 'analysis', weight: 0.4 },
  { elementId: '2.B.1.a', elementName: 'Social Perceptiveness', file: 'skills', target: 'empathy', weight: 0.4 },
  { elementId: '2.B.1.e', elementName: 'Negotiation', file: 'skills', target: 'influence', weight: 0.5 },
  { elementId: '2.B.1.f', elementName: 'Persuasion', file: 'skills', target: 'influence', weight: 0.5 },
  { elementId: '2.B.2.i', elementName: 'Complex Problem Solving', file: 'skills', target: 'problemSolving', weight: 0.6 },
  { elementId: '2.B.4.e', elementName: 'Judgment and Decision Making', file: 'skills', target: 'determination', weight: 1 },
  { elementId: '2.B.5.a', elementName: 'Time Management', file: 'skills', target: 'timeManagement', weight: 1 },
  { elementId: '2.B.4.g', elementName: 'Systems Evaluation', file: 'skills', target: 'planning', weight: 0.5 },
  { elementId: '2.B.4.h', elementName: 'Systems Analysis', file: 'skills', target: 'planning', weight: 0.5 },
];

/**
 * O*NET 에 대응 요소가 없는 능력치.
 *
 * 이것들은 임포트 후에도 provisional 로 남는다. 억지로 비슷한 요소를 갖다
 * 붙이면 실측치라는 이름표만 붙고 근거는 여전히 없는 상태가 된다 —
 * 그게 이 프로젝트가 처음에 겪은 문제다.
 *
 *   intuition        직관력   — O*NET 에 해당 구성개념이 없다
 *   aesthetics       심미안   — Artistic 흥미는 있으나 역량 요소가 아니다
 *   growthPotential  성장가능성 — 현재 직무 요구가 아니라 미래 예측이다
 */
export const UNMAPPED: AbilityKey[] = ['intuition', 'aesthetics', 'growthPotential'];

/** Importance(1~5)를 0~100으로 편다 */
export function normalizeImportance(value: number): number {
  return Math.max(0, Math.min(100, ((value - 1) / 4) * 100));
}

/**
 * 조직문화 적합 — 경쟁가치모형(Competing Values Framework)
 * ============================================================================
 *
 * 기존 구현의 문제
 *
 *   컬처핏이 하드코딩된 대응표였다.
 *
 *     "자율출퇴근": ["P", "I"],
 *     "성과중심":   ["J", "D", "C"],
 *
 *   기업이 고른 태그에 후보의 MBTI/DISC 글자가 들어 있으면 한 점.
 *   이 대응에는 근거가 없고, 구현에도 결함이 있었다. MBTI 의 I(내향)와
 *   DISC 의 I(사교형)를 문자열 포함으로 구분 없이 세고 있었고,
 *   "안정적": ["S","J","S"] 처럼 같은 글자가 중복돼 있었다.
 *
 *   더 근본적으로, 성격 유형에서 조직 적합을 끌어내는 것 자체가
 *   검증된 방법이 아니다.
 *
 * 무엇으로 바꿨나
 *
 *   개인–조직 적합(P–O fit)에서 실제로 쓰이는 방법은 값 일치도다.
 *   양쪽을 같은 척도로 재고 프로필을 비교한다. RIASEC 직무 매칭이
 *   작동하는 것과 같은 구조다.
 *
 *   척도는 경쟁가치모형(Cameron & Quinn)의 네 사분면을 쓴다.
 *   조직문화 연구에서 가장 널리 쓰이고, 문항이 짧고, 무엇보다
 *   같은 문항을 기업과 개인 양쪽에 그대로 물을 수 있다.
 *
 *     관계지향(clan)      사람과 관계가 먼저. 함께 키우고 함께 간다
 *     혁신지향(adhocracy) 새로운 시도가 먼저. 실패해도 해본다
 *     성과지향(market)    결과가 먼저. 목표와 숫자로 말한다
 *     위계지향(hierarchy) 절차가 먼저. 예측 가능하고 안정적이다
 *
 *   원래 도구(OCAI)처럼 100점을 네 항목에 나눠 배분하는 강제배분식이다.
 *   "다 중요하다"고 답할 수 없게 만드는 것이 핵심이다 — 그렇게 답할 수
 *   있으면 모든 조직이 비슷해 보이고 비교가 무의미해진다.
 *
 *   개인에게는 "어디서 일하고 싶은가", 기업에는 "우리는 실제로 어떤가"를
 *   묻는다. 물어보는 대상이 다를 뿐 척도는 같다.
 */

export type CultureKey = 'clan' | 'adhocracy' | 'market' | 'hierarchy';

export const CULTURE_DIMENSIONS: { key: CultureKey; name: string; short: string }[] = [
  { key: 'clan', name: '관계지향', short: '사람과 성장' },
  { key: 'adhocracy', name: '혁신지향', short: '실험과 변화' },
  { key: 'market', name: '성과지향', short: '목표와 결과' },
  { key: 'hierarchy', name: '위계지향', short: '절차와 안정' },
];

export type CultureProfile = Record<CultureKey, number>;

export interface CultureItem {
  id: string;
  /** 무엇에 대해 묻는지 */
  aspect: string;
  /** 개인에게 묻는 문장 */
  seekerPrompt: string;
  /** 기업에게 묻는 문장 */
  companyPrompt: string;
  /** 네 사분면 각각의 선택지 */
  options: Record<CultureKey, string>;
}

/**
 * 6문항. 원 도구는 6개 측면을 묻는다.
 * 문항을 더 줄이면 네 사분면을 가를 만한 정보가 남지 않는다.
 */
export const CULTURE_ITEMS: CultureItem[] = [
  {
    id: 'cvf_character',
    aspect: '조직의 성격',
    seekerPrompt: '어떤 분위기의 조직에서 일하고 싶으신가요?',
    companyPrompt: '우리 조직의 분위기를 가장 잘 설명하는 것은?',
    options: {
      clan: '서로 챙기고 오래 함께 가는 분위기',
      adhocracy: '새로운 걸 계속 시도해 보는 분위기',
      market: '목표를 향해 빠르게 밀어붙이는 분위기',
      hierarchy: '정해진 방식대로 안정적으로 굴러가는 분위기',
    },
  },
  {
    id: 'cvf_leadership',
    aspect: '리더의 역할',
    seekerPrompt: '어떤 리더와 일할 때 잘 맞으신가요?',
    companyPrompt: '우리 리더들은 주로 어떤 역할을 하나요?',
    options: {
      clan: '팀원을 키우고 돌보는 사람',
      adhocracy: '새로운 방향을 먼저 던지는 사람',
      market: '목표를 명확히 하고 결과를 챙기는 사람',
      hierarchy: '일이 매끄럽게 돌아가도록 조율하는 사람',
    },
  },
  {
    id: 'cvf_management',
    aspect: '일하는 방식',
    seekerPrompt: '어떤 방식으로 일할 때 편하신가요?',
    companyPrompt: '우리는 주로 어떤 방식으로 일하나요?',
    options: {
      clan: '합의하고 같이 결정한다',
      adhocracy: '각자 재량껏 해보고 빠르게 고친다',
      market: '개인 목표가 명확하고 성과로 평가한다',
      hierarchy: '역할과 절차가 정해져 있다',
    },
  },
  {
    id: 'cvf_glue',
    aspect: '조직을 묶는 것',
    seekerPrompt: '조직에 남는 이유가 무엇이면 좋겠나요?',
    companyPrompt: '우리 구성원을 붙잡아 두는 것은 무엇인가요?',
    options: {
      clan: '사람들과의 관계와 신뢰',
      adhocracy: '새로운 것을 만드는 재미',
      market: '성과에 대한 보상',
      hierarchy: '안정적인 규칙과 예측 가능성',
    },
  },
  {
    id: 'cvf_emphasis',
    aspect: '중요하게 보는 것',
    seekerPrompt: '조직이 무엇을 가장 중요하게 여기면 좋겠나요?',
    companyPrompt: '우리가 가장 중요하게 여기는 것은?',
    options: {
      clan: '구성원의 성장과 만족',
      adhocracy: '새로운 시도와 변화',
      market: '경쟁에서 이기는 것',
      hierarchy: '효율과 안정적인 운영',
    },
  },
  {
    id: 'cvf_success',
    aspect: '성공의 기준',
    seekerPrompt: '무엇을 이뤘을 때 잘하고 있다고 느끼시나요?',
    companyPrompt: '우리는 무엇을 성공이라고 부르나요?',
    options: {
      clan: '팀이 잘 굴러가고 사람이 성장했을 때',
      adhocracy: '전에 없던 것을 만들어냈을 때',
      market: '목표 수치를 넘겼을 때',
      hierarchy: '차질 없이 계획대로 끝냈을 때',
    },
  },
];

/** 문항 하나에 배분하는 총점 */
export const POINTS_PER_ITEM = 100;

/**
 * 문항별 배분(각 100점)을 네 사분면 프로필로 합산한다.
 * 결과는 합이 100이 되도록 정규화한다.
 */
export function scoreCultureResponses(
  responses: Record<string, Partial<CultureProfile>>
): CultureProfile | null {
  const totals: CultureProfile = { clan: 0, adhocracy: 0, market: 0, hierarchy: 0 };
  let answered = 0;

  CULTURE_ITEMS.forEach((item) => {
    const r = responses[item.id];
    if (!r) return;
    const sum = (r.clan ?? 0) + (r.adhocracy ?? 0) + (r.market ?? 0) + (r.hierarchy ?? 0);
    if (sum <= 0) return;
    answered += 1;
    // 배분 합이 100이 아니어도 비율로 환산해서 받는다.
    // 입력을 엄격하게 막는 것보다 답한 내용을 살리는 편이 낫다.
    (Object.keys(totals) as CultureKey[]).forEach((k) => {
      totals[k] += ((r[k] ?? 0) / sum) * POINTS_PER_ITEM;
    });
  });

  // 절반도 답하지 않았으면 프로필로 쓰지 않는다.
  // 부족한 응답으로 만든 프로필은 있는 것보다 나쁘다.
  if (answered < Math.ceil(CULTURE_ITEMS.length / 2)) return null;

  const grand = (Object.values(totals) as number[]).reduce((s, v) => s + v, 0);
  if (grand <= 0) return null;

  return {
    clan: Math.round((totals.clan / grand) * 100),
    adhocracy: Math.round((totals.adhocracy / grand) * 100),
    market: Math.round((totals.market / grand) * 100),
    hierarchy: Math.round((totals.hierarchy / grand) * 100),
  };
}

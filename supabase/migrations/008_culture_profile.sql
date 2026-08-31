-- ============================================================================
-- 조직문화 프로필 (경쟁가치모형)
-- ============================================================================
--
-- 무엇을 바꾸는가
--
--   컬처핏이 하드코딩된 대응표였다. 기업이 고른 문화 태그에 후보의
--   MBTI/DISC 글자가 들어 있으면 점수를 주는 방식이다.
--
--     "자율출퇴근" -> ["P", "I"]
--     "성과중심"   -> ["J", "D", "C"]
--
--   근거가 없을 뿐 아니라 구현에도 결함이 있었다. MBTI 의 I(내향)와
--   DISC 의 I(사교형)를 문자열 포함으로 구분 없이 셌고, "안정적"은
--   ["S","J","S"] 처럼 같은 글자가 중복돼 있었다.
--
--   이제 양쪽에 같은 문항(6문항, 100점 강제배분)을 묻고 프로필을
--   비교한다. 개인–조직 적합에서 실제로 쓰이는 방법이고, RIASEC 직무
--   매칭이 작동하는 것과 같은 구조다.
--
-- 저장 형태
--   {"clan": 30, "adhocracy": 25, "market": 25, "hierarchy": 20}
--   네 값의 합은 100.
--
-- NULL 의 의미
--   "문화가 없다"가 아니라 "아직 답하지 않았다"이다.
--   매칭 쪽에서는 이 경우 컬처핏을 계산에서 빼고 남은 항목의 가중치를
--   다시 정규화한다. 예전처럼 50점을 채워 넣지 않는다 — 그러면
--   "재보니 보통"과 "아직 안 쟀음"이 같은 값이 된다.

ALTER TABLE seeker_profiles
  ADD COLUMN IF NOT EXISTS culture_profile JSONB,
  -- 원본 응답. 문항이나 채점 방식이 바뀌었을 때 다시 계산할 수 있어야 한다
  ADD COLUMN IF NOT EXISTS culture_responses JSONB;

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS culture_profile JSONB,
  ADD COLUMN IF NOT EXISTS culture_responses JSONB;

ALTER TABLE company_team_profiles
  -- 사람은 회사가 아니라 팀에서 일한다. 팀 단위로도 잰다
  ADD COLUMN IF NOT EXISTS culture_profile JSONB,
  ADD COLUMN IF NOT EXISTS culture_responses JSONB;

COMMENT ON COLUMN seeker_profiles.culture_profile IS
  '경쟁가치모형 4축 (clan/adhocracy/market/hierarchy), 합 100. 구직자가 "일하고 싶은" 조직';
COMMENT ON COLUMN companies.culture_profile IS
  '경쟁가치모형 4축, 합 100. 회사가 "실제로 어떤지" 스스로 답한 값';
COMMENT ON COLUMN company_team_profiles.culture_profile IS
  '팀 단위 문화 프로필. 회사 전체 값과 평균해서 쓴다';

-- 기존 culture_tags 는 남겨 둔다.
-- 공고 카드에 보여주는 용도로는 여전히 쓸모가 있고,
-- 다만 적합도 계산에서는 더 이상 쓰지 않는다.
COMMENT ON COLUMN companies.culture_tags IS
  '표시용 태그. 적합도 계산에는 쓰지 않는다 — culture_profile 을 쓴다';

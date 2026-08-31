-- ============================================================================
-- 직무 택소노미 연결
-- ============================================================================
--
-- 공고가 어떤 직무를 뽑는 것인지 기록한다.
--
-- 왜 필요한가
--   지금까지 공고는 제목(자유 텍스트)과 요구 능력치 체크박스만 가지고 있었다.
--   그래서 "백엔드 개발자"와 "서버 개발자"와 "Backend Engineer"가 서로 다른
--   것으로 취급됐고, 직무 단위로 무엇이 중요한지 쌓이지 않았다.
--
--   role_id 를 붙이면
--     - 공고를 만들 때 그 직무의 요구 역량 초안을 채울 수 있고
--     - 구직자에게 "당신 흥미와 맞는 직군의 공고"를 보여줄 수 있고
--     - 나중에 채용 결과가 쌓이면 직무별로 가중치를 교정할 수 있다
--
-- role_id 는 애플리케이션 쪽 data/roles/roles.ts 의 id 다.
-- 외래키를 걸지 않는 이유: 택소노미는 코드와 함께 배포되고 버전이 바뀐다.
-- DB 제약으로 묶으면 택소노미를 고칠 때마다 마이그레이션이 필요해진다.
-- 대신 저장 시점의 값을 함께 남겨서 나중에 무엇으로 매칭했는지 추적한다.

ALTER TABLE job_postings
  ADD COLUMN IF NOT EXISTS role_id VARCHAR(60),
  -- 요구 능력치가 자동 초안인지 담당자가 고친 것인지.
  -- 근거의 질을 기록해 두지 않으면 나중에 구분할 수 없다.
  ADD COLUMN IF NOT EXISTS required_abilities_source VARCHAR(20) DEFAULT 'manual';

CREATE INDEX IF NOT EXISTS idx_job_postings_role ON job_postings(role_id);

COMMENT ON COLUMN job_postings.role_id IS
  '직무 택소노미 id (data/roles/roles.ts). 외래키 아님 — 택소노미는 코드와 함께 버전이 바뀐다';
COMMENT ON COLUMN job_postings.required_abilities_source IS
  'provisional = 택소노미 초안 그대로, manual = 담당자가 조정함';

-- ============================================================================
-- 구직자 희망 직무
-- ============================================================================
--
-- 검사 결과로 추천한 직군과, 본인이 실제로 원한다고 고른 직무는 다르다.
-- 둘을 같은 칸에 넣으면 나중에 "추천이 맞았는지"를 확인할 수 없다.

ALTER TABLE seeker_profiles
  -- 추천 결과 — Holland 흥미로 계산한 상위 직군
  ADD COLUMN IF NOT EXISTS suggested_family_ids JSONB,
  -- 본인 선택 — 실제로 지원하고 싶은 직무
  ADD COLUMN IF NOT EXISTS preferred_role_ids JSONB;

COMMENT ON COLUMN seeker_profiles.suggested_family_ids IS
  '흥미 검사로 계산된 추천 직군. 본인 선택과 구분해서 저장한다 — 나중에 추천 적중률을 볼 수 있어야 한다';
COMMENT ON COLUMN seeker_profiles.preferred_role_ids IS
  '구직자가 직접 고른 희망 직무';

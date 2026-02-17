-- 익명 세션 지원: 비로그인 사용자도 검사 결과를 서버에 저장
-- session_id (UUID)로 식별, 로그인 시 user_id로 claim

-- session_id 컬럼 추가
ALTER TABLE comprehensive_results ADD COLUMN IF NOT EXISTS session_id UUID;

-- session_id 고유 인덱스 (NULL 제외)
CREATE UNIQUE INDEX IF NOT EXISTS idx_comprehensive_results_session
    ON comprehensive_results(session_id) WHERE session_id IS NOT NULL;

-- user_id 또는 session_id 중 하나는 반드시 존재해야 함
ALTER TABLE comprehensive_results
    ADD CONSTRAINT chk_has_identity CHECK (user_id IS NOT NULL OR session_id IS NOT NULL);

-- 종합 검사 결과 저장 테이블
-- 사용자가 로그인한 상태에서 검사 결과를 서버에 영구 저장

CREATE TABLE IF NOT EXISTS comprehensive_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    comprehensive_profile JSONB NOT NULL,
    abilities_snapshot JSONB NOT NULL,
    personal_info JSONB,
    answers JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comprehensive_results_user ON comprehensive_results(user_id);

-- Updated_at 트리거
CREATE TRIGGER update_comprehensive_results_updated_at
    BEFORE UPDATE ON comprehensive_results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

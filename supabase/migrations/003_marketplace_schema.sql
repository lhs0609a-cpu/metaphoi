-- Metaphoi 채용 마켓플레이스 스키마
-- 12개 신규 테이블: 기업, 구직자, 채용공고, 매칭, ATS, 메시지

-- ==========================================
-- 기업 (회사 단위)
-- ==========================================
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    industry VARCHAR(100),
    size_range VARCHAR(50),
    description TEXT,
    logo_url TEXT,
    website VARCHAR(500),
    location VARCHAR(200),
    culture_tags JSONB DEFAULT '[]',
    team_atmosphere TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 기업 멤버 (채용담당자 등)
-- ==========================================
CREATE TABLE IF NOT EXISTS company_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'recruiter',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 기업 팀 프로필
-- ==========================================
CREATE TABLE IF NOT EXISTS company_team_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    team_name VARCHAR(100) NOT NULL,
    team_size INTEGER,
    ideal_abilities JSONB,
    ideal_culture_tags JSONB,
    current_team_types JSONB,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 구직자 프로필
-- ==========================================
CREATE TABLE IF NOT EXISTS seeker_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(50),
    headline VARCHAR(200),
    desired_roles JSONB DEFAULT '[]',
    desired_industries JSONB DEFAULT '[]',
    experience_years INTEGER,
    education VARCHAR(200),
    salary_range VARCHAR(100),
    location_pref VARCHAR(200),
    remote_pref VARCHAR(50),
    available_from DATE,
    is_active BOOLEAN DEFAULT TRUE,
    visibility VARCHAR(20) DEFAULT 'public',
    comprehensive_profile JSONB,
    abilities_snapshot JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 채용 공고
-- ==========================================
CREATE TABLE IF NOT EXISTS job_postings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    team_profile_id UUID REFERENCES company_team_profiles(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    required_abilities JSONB,
    preferred_culture JSONB,
    preferred_types JSONB,
    conditions JSONB,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 관심 표시 (양방향)
-- ==========================================
CREATE TABLE IF NOT EXISTS interests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_type VARCHAR(20) NOT NULL,
    from_id UUID NOT NULL,
    to_type VARCHAR(20) NOT NULL,
    to_id UUID NOT NULL,
    job_posting_id UUID REFERENCES job_postings(id),
    status VARCHAR(20) DEFAULT 'pending',
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 매칭 (양쪽 관심 성사)
-- ==========================================
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seeker_profile_id UUID REFERENCES seeker_profiles(id),
    company_id UUID REFERENCES companies(id),
    job_posting_id UUID REFERENCES job_postings(id),
    fit_score JSONB,
    status VARCHAR(20) DEFAULT 'active',
    matched_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 채용 지원 (ATS 파이프라인)
-- ==========================================
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id),
    seeker_profile_id UUID REFERENCES seeker_profiles(id),
    job_posting_id UUID REFERENCES job_postings(id),
    company_id UUID REFERENCES companies(id),
    stage VARCHAR(30) DEFAULT 'applied',
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 면접 스케줄링
-- ==========================================
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    round INTEGER DEFAULT 1,
    interview_type VARCHAR(30),
    scheduled_at TIMESTAMPTZ,
    duration_minutes INTEGER DEFAULT 60,
    location TEXT,
    interviewer_names JSONB,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 면접 평가
-- ==========================================
CREATE TABLE IF NOT EXISTS evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
    evaluator_member_id UUID REFERENCES company_members(id),
    scores JSONB,
    overall_rating INTEGER,
    strengths TEXT,
    concerns TEXT,
    recommendation VARCHAR(30),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 지원 노트 (내부 메모)
-- ==========================================
CREATE TABLE IF NOT EXISTS application_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    author_member_id UUID REFERENCES company_members(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 메시지 (매칭 후 대화)
-- ==========================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL,
    sender_id UUID NOT NULL,
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 인덱스
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_company_members_company ON company_members(company_id);
CREATE INDEX IF NOT EXISTS idx_company_members_email ON company_members(email);
CREATE INDEX IF NOT EXISTS idx_company_team_profiles_company ON company_team_profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_seeker_profiles_user ON seeker_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_seeker_profiles_active ON seeker_profiles(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_job_postings_company ON job_postings(company_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_interests_from ON interests(from_type, from_id);
CREATE INDEX IF NOT EXISTS idx_interests_to ON interests(to_type, to_id);
CREATE INDEX IF NOT EXISTS idx_matches_seeker ON matches(seeker_profile_id);
CREATE INDEX IF NOT EXISTS idx_matches_company ON matches(company_id);
CREATE INDEX IF NOT EXISTS idx_applications_seeker ON applications(seeker_profile_id);
CREATE INDEX IF NOT EXISTS idx_applications_company ON applications(company_id);
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_interviews_application ON interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_interview ON evaluations(interview_id);
CREATE INDEX IF NOT EXISTS idx_application_notes_app ON application_notes(application_id);
CREATE INDEX IF NOT EXISTS idx_messages_match ON messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- ==========================================
-- Updated_at 트리거
-- ==========================================
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seeker_profiles_updated_at
    BEFORE UPDATE ON seeker_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_postings_updated_at
    BEFORE UPDATE ON job_postings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

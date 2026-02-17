ALTER TABLE seeker_profiles
ADD COLUMN IF NOT EXISTS career_questionnaire JSONB DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_seeker_career_questionnaire
ON seeker_profiles USING gin(career_questionnaire)
WHERE career_questionnaire IS NOT NULL;

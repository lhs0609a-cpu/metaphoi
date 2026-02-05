-- Metaphoi 초기 데이터 (시드 데이터)

-- ==========================================
-- 14가지 검사 등록
-- ==========================================
INSERT INTO tests (code, name, description, question_count, estimated_minutes, category) VALUES
    ('mbti', 'MBTI 성격 유형', '16가지 성격 유형을 분석하는 세계적으로 유명한 성격 검사', 48, 15, 'personality'),
    ('disc', 'DISC 행동 유형', '4가지 행동 유형(주도, 사교, 안정, 신중)을 분석하는 검사', 28, 10, 'personality'),
    ('enneagram', '에니어그램', '9가지 성격 유형과 날개를 분석하는 심층 성격 검사', 36, 12, 'personality'),
    ('tci', 'TCI 기질 및 성격', '기질과 성격의 7가지 차원을 측정하는 과학적 검사', 140, 30, 'personality'),
    ('gallup', 'Gallup 강점 검사', '34개 강점 테마 중 자신의 핵심 강점을 발견하는 검사', 34, 15, 'aptitude'),
    ('holland', 'Holland 직업 흥미', '6가지 직업 흥미 유형을 분석하는 진로 탐색 검사', 42, 15, 'aptitude'),
    ('iq', 'IQ 테스트', '논리적 사고와 패턴 인식 능력을 측정하는 간이 지능 검사', 30, 20, 'aptitude'),
    ('mmpi', 'MMPI 간이 검사', '다면적 인성을 검사하는 심리 검사의 간이 버전', 50, 15, 'personality'),
    ('tarot', '타로 성격 검사', '직관적 이미지 선택을 통한 잠재의식 분석', 10, 5, 'traditional'),
    ('htp', 'HTP 그림 검사', '집, 나무, 사람 그림을 통한 심층 심리 분석', 3, 15, 'traditional'),
    ('saju', '사주 분석', '생년월일시를 기반으로 한 동양 운명학적 분석', 1, 5, 'traditional'),
    ('sasang', '사상체질 검사', '태양인, 태음인, 소양인, 소음인 체질 분석', 20, 10, 'traditional'),
    ('face', '관상 분석', 'AI 기반 얼굴 분석을 통한 성격 추론', 1, 5, 'traditional'),
    ('blood', '혈액형 성격', '혈액형에 따른 성격 특성 분석', 5, 3, 'traditional')
ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 30가지 능력치 등록
-- ==========================================
INSERT INTO abilities (code, name, category, description) VALUES
    -- 정신력 (Mental)
    ('determination', '결단력', 'mental', '중요한 결정을 빠르고 확신있게 내리는 능력'),
    ('composure', '침착성', 'mental', '어려운 상황에서도 평정을 유지하는 능력'),
    ('concentration', '집중력', 'mental', '한 가지 일에 깊이 몰입하는 능력'),
    ('creativity', '창의성', 'mental', '새롭고 독창적인 아이디어를 생성하는 능력'),
    ('analytical', '분석력', 'mental', '정보를 체계적으로 분석하고 이해하는 능력'),
    ('adaptability', '적응력', 'mental', '새로운 환경이나 상황에 유연하게 대처하는 능력'),

    -- 사회성 (Social)
    ('communication', '소통능력', 'social', '자신의 생각을 명확하게 전달하고 타인을 이해하는 능력'),
    ('teamwork', '협동심', 'social', '팀원들과 효과적으로 협력하는 능력'),
    ('leadership', '리더십', 'social', '팀을 이끌고 동기부여하는 능력'),
    ('empathy', '공감능력', 'social', '타인의 감정을 이해하고 공감하는 능력'),
    ('influence', '영향력', 'social', '타인의 생각이나 행동에 긍정적 영향을 미치는 능력'),
    ('networking', '네트워킹', 'social', '관계를 형성하고 유지하는 능력'),

    -- 업무역량 (Work)
    ('execution', '실행력', 'work', '계획을 실제 행동으로 옮기는 능력'),
    ('planning', '기획력', 'work', '목표 달성을 위한 전략과 계획을 수립하는 능력'),
    ('problem_solving', '문제해결', 'work', '복잡한 문제를 분석하고 해결책을 찾는 능력'),
    ('time_management', '시간관리', 'work', '시간을 효율적으로 배분하고 활용하는 능력'),
    ('attention_detail', '꼼꼼함', 'work', '세부사항에 주의를 기울이고 정확하게 처리하는 능력'),
    ('multitasking', '멀티태스킹', 'work', '여러 작업을 동시에 효과적으로 처리하는 능력'),

    -- 신체/감각 (Physical)
    ('stress_resistance', '스트레스내성', 'physical', '스트레스 상황에서 건강하게 대처하는 능력'),
    ('endurance', '지구력', 'physical', '장시간 집중과 노력을 유지하는 능력'),
    ('intuition', '직관력', 'physical', '논리를 넘어 본능적으로 올바른 판단을 내리는 능력'),
    ('aesthetic', '심미안', 'physical', '아름다움과 조화를 인식하고 창조하는 능력'),
    ('spatial', '공간지각', 'physical', '공간과 형태를 인식하고 조작하는 능력'),
    ('verbal', '언어능력', 'physical', '언어를 이해하고 표현하는 능력'),

    -- 잠재력 (Potential)
    ('growth_potential', '성장가능성', 'potential', '앞으로 발전하고 성장할 수 있는 잠재력'),
    ('learning_speed', '학습속도', 'potential', '새로운 지식과 기술을 빠르게 습득하는 능력'),
    ('innovation', '혁신성', 'potential', '기존 방식을 개선하고 혁신하는 능력'),
    ('resilience', '회복탄력성', 'potential', '실패나 어려움에서 빠르게 회복하는 능력'),
    ('ambition', '야망', 'potential', '높은 목표를 설정하고 추구하는 의지'),
    ('integrity', '성실성', 'potential', '맡은 일에 책임감을 가지고 꾸준히 임하는 태도')
ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- MBTI 검사 문항 (샘플 - 48문항 중 일부)
-- ==========================================
INSERT INTO questions (test_id, question_number, question_type, question_text, options, scoring_weights)
SELECT
    t.id,
    q.question_number,
    'likert',
    q.question_text,
    '{"scale": [1, 2, 3, 4, 5], "labels": ["매우 아니다", "아니다", "보통", "그렇다", "매우 그렇다"]}'::jsonb,
    q.scoring_weights
FROM tests t
CROSS JOIN (
    VALUES
        (1, '파티에서 새로운 사람들과 이야기하는 것을 즐긴다.', '{"E": 1, "I": -1}'::jsonb),
        (2, '혼자만의 시간이 충분히 필요하다.', '{"E": -1, "I": 1}'::jsonb),
        (3, '실제적이고 구체적인 정보를 선호한다.', '{"S": 1, "N": -1}'::jsonb),
        (4, '가능성과 미래에 대해 상상하는 것을 좋아한다.', '{"S": -1, "N": 1}'::jsonb),
        (5, '결정을 내릴 때 논리와 일관성을 중시한다.', '{"T": 1, "F": -1}'::jsonb),
        (6, '다른 사람의 감정을 고려하여 결정한다.', '{"T": -1, "F": 1}'::jsonb),
        (7, '계획을 세우고 그대로 실행하는 것을 선호한다.', '{"J": 1, "P": -1}'::jsonb),
        (8, '상황에 따라 유연하게 대처하는 것을 좋아한다.', '{"J": -1, "P": 1}'::jsonb),
        (9, '사람들과 어울리면 에너지가 충전된다.', '{"E": 1, "I": -1}'::jsonb),
        (10, '깊이 있는 대화를 선호한다.', '{"E": -1, "I": 1}'::jsonb),
        (11, '경험에서 배우는 것을 선호한다.', '{"S": 1, "N": -1}'::jsonb),
        (12, '이론적인 개념에 관심이 많다.', '{"S": -1, "N": 1}'::jsonb),
        (13, '객관적인 기준으로 판단하려고 노력한다.', '{"T": 1, "F": -1}'::jsonb),
        (14, '조화로운 관계 유지가 중요하다.', '{"T": -1, "F": 1}'::jsonb),
        (15, '마감 기한을 잘 지킨다.', '{"J": 1, "P": -1}'::jsonb),
        (16, '즉흥적인 활동을 즐긴다.', '{"J": -1, "P": 1}'::jsonb)
) AS q(question_number, question_text, scoring_weights)
WHERE t.code = 'mbti'
ON CONFLICT (test_id, question_number) DO NOTHING;

-- ==========================================
-- DISC 검사 문항 (샘플)
-- ==========================================
INSERT INTO questions (test_id, question_number, question_type, question_text, options, scoring_weights)
SELECT
    t.id,
    q.question_number,
    'choice',
    q.question_text,
    q.options,
    q.scoring_weights
FROM tests t
CROSS JOIN (
    VALUES
        (1, '나는 주로...',
         '{"choices": ["도전적인 목표를 세운다", "사람들과 어울린다", "안정적인 환경을 선호한다", "세부사항에 주의를 기울인다"]}'::jsonb,
         '{"0": {"D": 2}, "1": {"I": 2}, "2": {"S": 2}, "3": {"C": 2}}'::jsonb),
        (2, '의견 충돌이 있을 때 나는...',
         '{"choices": ["직접적으로 의견을 말한다", "분위기를 좋게 만들려 한다", "상대방의 의견을 경청한다", "논리적으로 분석한다"]}'::jsonb,
         '{"0": {"D": 2}, "1": {"I": 2}, "2": {"S": 2}, "3": {"C": 2}}'::jsonb),
        (3, '새로운 프로젝트를 시작할 때 나는...',
         '{"choices": ["빠르게 결정하고 실행한다", "팀원들과 아이디어를 나눈다", "기존 방식을 참고한다", "세부 계획을 먼저 세운다"]}'::jsonb,
         '{"0": {"D": 2}, "1": {"I": 2}, "2": {"S": 2}, "3": {"C": 2}}'::jsonb),
        (4, '스트레스 상황에서 나는...',
         '{"choices": ["더 강하게 밀어붙인다", "다른 사람에게 이야기한다", "차분하게 기다린다", "원인을 분석한다"]}'::jsonb,
         '{"0": {"D": 2}, "1": {"I": 2}, "2": {"S": 2}, "3": {"C": 2}}'::jsonb)
) AS q(question_number, question_text, options, scoring_weights)
WHERE t.code = 'disc'
ON CONFLICT (test_id, question_number) DO NOTHING;

-- ==========================================
-- Enneagram 검사 문항 (샘플)
-- ==========================================
INSERT INTO questions (test_id, question_number, question_type, question_text, options, scoring_weights)
SELECT
    t.id,
    q.question_number,
    'likert',
    q.question_text,
    '{"scale": [1, 2, 3, 4, 5], "labels": ["전혀 아니다", "아니다", "보통", "그렇다", "매우 그렇다"]}'::jsonb,
    q.scoring_weights
FROM tests t
CROSS JOIN (
    VALUES
        (1, '완벽하게 하지 않으면 아예 하지 않는 편이다.', '{"1": 1}'::jsonb),
        (2, '다른 사람들을 돕는 것에서 큰 보람을 느낀다.', '{"2": 1}'::jsonb),
        (3, '성공과 성취가 나에게 매우 중요하다.', '{"3": 1}'::jsonb),
        (4, '나는 다른 사람들과 다르다는 것을 자주 느낀다.', '{"4": 1}'::jsonb),
        (5, '혼자서 연구하고 분석하는 시간이 필요하다.', '{"5": 1}'::jsonb),
        (6, '최악의 상황에 대비하는 것이 중요하다.', '{"6": 1}'::jsonb),
        (7, '새로운 경험과 모험을 좋아한다.', '{"7": 1}'::jsonb),
        (8, '내 의견을 강하게 주장하는 편이다.', '{"8": 1}'::jsonb),
        (9, '평화롭고 조화로운 환경을 선호한다.', '{"9": 1}'::jsonb)
) AS q(question_number, question_text, scoring_weights)
WHERE t.code = 'enneagram'
ON CONFLICT (test_id, question_number) DO NOTHING;

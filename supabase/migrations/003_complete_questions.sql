-- Metaphoi 전체 검사 문항
-- 이 파일은 14개 검사의 완전한 문항 세트를 포함합니다

-- ==========================================
-- MBTI 검사 문항 (48문항)
-- ==========================================
DELETE FROM questions WHERE test_id = (SELECT id FROM tests WHERE code = 'mbti');

INSERT INTO questions (test_id, question_number, question_type, question_text, options, scoring_weights)
SELECT t.id, q.question_number, 'likert', q.question_text,
    '{"scale": [1, 2, 3, 4, 5], "labels": ["매우 아니다", "아니다", "보통", "그렇다", "매우 그렇다"]}'::jsonb,
    q.scoring_weights
FROM tests t
CROSS JOIN (VALUES
    -- E/I 차원 (12문항)
    (1, '파티에서 새로운 사람들과 이야기하는 것을 즐긴다.', '{"E": 1, "I": -1}'::jsonb),
    (2, '혼자만의 시간이 충분히 필요하다.', '{"E": -1, "I": 1}'::jsonb),
    (3, '사람들과 어울리면 에너지가 충전된다.', '{"E": 1, "I": -1}'::jsonb),
    (4, '깊이 있는 소수의 관계를 선호한다.', '{"E": -1, "I": 1}'::jsonb),
    (5, '먼저 말을 거는 편이다.', '{"E": 1, "I": -1}'::jsonb),
    (6, '생각을 정리한 후에 말하는 것을 선호한다.', '{"E": -1, "I": 1}'::jsonb),
    (7, '사교적인 활동을 자주 한다.', '{"E": 1, "I": -1}'::jsonb),
    (8, '혼자 작업하는 것이 더 효율적이다.', '{"E": -1, "I": 1}'::jsonb),
    (9, '주변 사람들의 에너지에 영향을 받는다.', '{"E": 1, "I": -1}'::jsonb),
    (10, '내면의 세계가 풍부하다.', '{"E": -1, "I": 1}'::jsonb),
    (11, '그룹 활동에서 적극적으로 참여한다.', '{"E": 1, "I": -1}'::jsonb),
    (12, '조용한 환경에서 더 잘 집중한다.', '{"E": -1, "I": 1}'::jsonb),

    -- S/N 차원 (12문항)
    (13, '실제적이고 구체적인 정보를 선호한다.', '{"S": 1, "N": -1}'::jsonb),
    (14, '가능성과 미래에 대해 상상하는 것을 좋아한다.', '{"S": -1, "N": 1}'::jsonb),
    (15, '경험에서 배우는 것을 선호한다.', '{"S": 1, "N": -1}'::jsonb),
    (16, '이론적인 개념에 관심이 많다.', '{"S": -1, "N": 1}'::jsonb),
    (17, '현재에 집중하는 편이다.', '{"S": 1, "N": -1}'::jsonb),
    (18, '미래의 가능성에 더 흥미를 느낀다.', '{"S": -1, "N": 1}'::jsonb),
    (19, '세부사항에 주의를 기울인다.', '{"S": 1, "N": -1}'::jsonb),
    (20, '큰 그림을 먼저 파악하려 한다.', '{"S": -1, "N": 1}'::jsonb),
    (21, '검증된 방법을 따르는 것이 편하다.', '{"S": 1, "N": -1}'::jsonb),
    (22, '새로운 아이디어를 탐색하는 것을 좋아한다.', '{"S": -1, "N": 1}'::jsonb),
    (23, '사실에 기반한 정보를 신뢰한다.', '{"S": 1, "N": -1}'::jsonb),
    (24, '직관적인 판단을 자주 한다.', '{"S": -1, "N": 1}'::jsonb),

    -- T/F 차원 (12문항)
    (25, '결정을 내릴 때 논리와 일관성을 중시한다.', '{"T": 1, "F": -1}'::jsonb),
    (26, '다른 사람의 감정을 고려하여 결정한다.', '{"T": -1, "F": 1}'::jsonb),
    (27, '객관적인 기준으로 판단하려고 노력한다.', '{"T": 1, "F": -1}'::jsonb),
    (28, '조화로운 관계 유지가 중요하다.', '{"T": -1, "F": 1}'::jsonb),
    (29, '비판적인 피드백을 잘 수용한다.', '{"T": 1, "F": -1}'::jsonb),
    (30, '칭찬과 인정이 동기부여가 된다.', '{"T": -1, "F": 1}'::jsonb),
    (31, '원칙을 지키는 것이 중요하다.', '{"T": 1, "F": -1}'::jsonb),
    (32, '상황에 따라 유연하게 대처한다.', '{"T": -1, "F": 1}'::jsonb),
    (33, '논쟁에서 이기는 것이 중요하다.', '{"T": 1, "F": -1}'::jsonb),
    (34, '모두가 만족하는 해결책을 찾으려 한다.', '{"T": -1, "F": 1}'::jsonb),
    (35, '감정보다 사실에 집중한다.', '{"T": 1, "F": -1}'::jsonb),
    (36, '다른 사람의 관점을 이해하려 노력한다.', '{"T": -1, "F": 1}'::jsonb),

    -- J/P 차원 (12문항)
    (37, '계획을 세우고 그대로 실행하는 것을 선호한다.', '{"J": 1, "P": -1}'::jsonb),
    (38, '상황에 따라 유연하게 대처하는 것을 좋아한다.', '{"J": -1, "P": 1}'::jsonb),
    (39, '마감 기한을 잘 지킨다.', '{"J": 1, "P": -1}'::jsonb),
    (40, '즉흥적인 활동을 즐긴다.', '{"J": -1, "P": 1}'::jsonb),
    (41, '정리정돈된 환경을 선호한다.', '{"J": 1, "P": -1}'::jsonb),
    (42, '여러 옵션을 열어두는 것을 좋아한다.', '{"J": -1, "P": 1}'::jsonb),
    (43, '결정을 빨리 내리는 편이다.', '{"J": 1, "P": -1}'::jsonb),
    (44, '정보를 더 수집한 후 결정하려 한다.', '{"J": -1, "P": 1}'::jsonb),
    (45, '일정과 루틴이 있으면 편안하다.', '{"J": 1, "P": -1}'::jsonb),
    (46, '변화와 다양성을 추구한다.', '{"J": -1, "P": 1}'::jsonb),
    (47, '목표를 세우고 체계적으로 달성한다.', '{"J": 1, "P": -1}'::jsonb),
    (48, '흥미로운 것을 따라가며 살아간다.', '{"J": -1, "P": 1}'::jsonb)
) AS q(question_number, question_text, scoring_weights)
WHERE t.code = 'mbti';


-- ==========================================
-- DISC 검사 문항 (28문항)
-- ==========================================
DELETE FROM questions WHERE test_id = (SELECT id FROM tests WHERE code = 'disc');

INSERT INTO questions (test_id, question_number, question_type, question_text, options, scoring_weights)
SELECT t.id, q.question_number, 'choice', q.question_text, q.options, q.scoring_weights
FROM tests t
CROSS JOIN (VALUES
    (1, '업무 환경에서 나는 주로...',
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
     '{"0": {"D": 2}, "1": {"I": 2}, "2": {"S": 2}, "3": {"C": 2}}'::jsonb),
    (5, '팀에서 나의 역할은 주로...',
     '{"choices": ["방향을 제시한다", "분위기를 띄운다", "지원하고 협력한다", "품질을 관리한다"]}'::jsonb,
     '{"0": {"D": 2}, "1": {"I": 2}, "2": {"S": 2}, "3": {"C": 2}}'::jsonb),
    (6, '나는 ___ 을/를 중요하게 생각한다.',
     '{"choices": ["결과와 성취", "인정과 즐거움", "안정과 조화", "정확성과 품질"]}'::jsonb,
     '{"0": {"D": 2}, "1": {"I": 2}, "2": {"S": 2}, "3": {"C": 2}}'::jsonb),
    (7, '결정을 내릴 때 나는...',
     '{"choices": ["빠르게 결정한다", "다른 사람의 의견을 구한다", "신중하게 생각한다", "데이터를 분석한다"]}'::jsonb,
     '{"0": {"D": 2}, "1": {"I": 2}, "2": {"S": 2}, "3": {"C": 2}}'::jsonb),
    (8, '변화에 대해 나는...',
     '{"choices": ["변화를 주도한다", "변화를 환영한다", "변화에 적응하려 노력한다", "변화의 영향을 분석한다"]}'::jsonb,
     '{"0": {"D": 2}, "1": {"I": 2}, "2": {"S": 2}, "3": {"C": 2}}'::jsonb),
    (9, '다른 사람들은 나를 ___ 하다고 한다.',
     '{"choices": ["추진력 있다", "사교적이다", "믿음직하다", "꼼꼼하다"]}'::jsonb,
     '{"0": {"D": 2}, "1": {"I": 2}, "2": {"S": 2}, "3": {"C": 2}}'::jsonb),
    (10, '회의에서 나는 주로...',
     '{"choices": ["결론을 이끌어낸다", "아이디어를 제안한다", "경청하고 지지한다", "논리적 검토를 한다"]}'::jsonb,
     '{"0": {"D": 2}, "1": {"I": 2}, "2": {"S": 2}, "3": {"C": 2}}'::jsonb),
    (11, '나의 강점은...',
     '{"choices": ["결단력과 추진력", "설득력과 열정", "인내심과 협동심", "분석력과 정확성"]}'::jsonb,
     '{"0": {"D": 2}, "1": {"I": 2}, "2": {"S": 2}, "3": {"C": 2}}'::jsonb),
    (12, '문제가 생겼을 때 나는...',
     '{"choices": ["즉시 해결책을 실행한다", "도움을 요청한다", "침착하게 대처한다", "원인을 파악한다"]}'::jsonb,
     '{"0": {"D": 2}, "1": {"I": 2}, "2": {"S": 2}, "3": {"C": 2}}'::jsonb),
    (13, '나는 ___ 할 때 가장 보람을 느낀다.',
     '{"choices": ["목표를 달성했을 때", "인정받았을 때", "팀에 기여했을 때", "완벽하게 마무리했을 때"]}'::jsonb,
     '{"0": {"D": 2}, "1": {"I": 2}, "2": {"S": 2}, "3": {"C": 2}}'::jsonb),
    (14, '커뮤니케이션 스타일은...',
     '{"choices": ["직접적이고 간결하다", "열정적이고 설득적이다", "친절하고 인내심 있다", "정확하고 사실 기반이다"]}'::jsonb,
     '{"0": {"D": 2}, "1": {"I": 2}, "2": {"S": 2}, "3": {"C": 2}}'::jsonb),
    (15, '나는 ___ 것을 싫어한다.',
     '{"choices": ["시간 낭비", "혼자 있는 것", "갑작스러운 변화", "실수하는 것"]}'::jsonb,
     '{"0": {"D": 2}, "1": {"I": 2}, "2": {"S": 2}, "3": {"C": 2}}'::jsonb),
    (16, '업무 스타일은...',
     '{"choices": ["결과 중심적", "관계 중심적", "과정 중심적", "품질 중심적"]}'::jsonb,
     '{"0": {"D": 2}, "1": {"I": 2}, "2": {"S": 2}, "3": {"C": 2}}'::jsonb),
    (17, '리더가 된다면 나는...',
     '{"choices": ["방향을 제시하고 이끈다", "팀을 고무시키고 동기부여한다", "지원하고 협력한다", "체계적으로 관리한다"]}'::jsonb,
     '{"0": {"D": 2}, "1": {"I": 2}, "2": {"S": 2}, "3": {"C": 2}}'::jsonb),
    (18, '압박감을 받으면...',
     '{"choices": ["더 공격적이 된다", "더 말이 많아진다", "더 조용해진다", "더 비판적이 된다"]}'::jsonb,
     '{"0": {"D": 2}, "1": {"I": 2}, "2": {"S": 2}, "3": {"C": 2}}'::jsonb),
    (19, '나의 두려움은...',
     '{"choices": ["통제력 상실", "거부당하는 것", "불안정", "비판받는 것"]}'::jsonb,
     '{"0": {"D": 2}, "1": {"I": 2}, "2": {"S": 2}, "3": {"C": 2}}'::jsonb),
    (20, '선호하는 환경은...',
     '{"choices": ["도전적이고 경쟁적인", "활기차고 사교적인", "안정적이고 예측 가능한", "체계적이고 조직적인"]}'::jsonb,
     '{"0": {"D": 2}, "1": {"I": 2}, "2": {"S": 2}, "3": {"C": 2}}'::jsonb),
    (21, '피드백을 줄 때 나는...',
     '{"choices": ["직설적으로 말한다", "긍정적인 면을 강조한다", "부드럽게 전달한다", "구체적인 사실을 제시한다"]}'::jsonb,
     '{"0": {"D": 2}, "1": {"I": 2}, "2": {"S": 2}, "3": {"C": 2}}'::jsonb),
    (22, '나에게 동기부여가 되는 것은...',
     '{"choices": ["권한과 도전", "인정과 칭찬", "안정과 감사", "자율성과 전문성"]}'::jsonb,
     '{"0": {"D": 2}, "1": {"I": 2}, "2": {"S": 2}, "3": {"C": 2}}'::jsonb),
    (23, '시간 관리 스타일은...',
     '{"choices": ["빠르게 처리한다", "유연하게 대처한다", "꾸준히 진행한다", "계획대로 실행한다"]}'::jsonb,
     '{"0": {"D": 2}, "1": {"I": 2}, "2": {"S": 2}, "3": {"C": 2}}'::jsonb),
    (24, '팀원과 갈등이 있을 때...',
     '{"choices": ["직접 대면해서 해결한다", "대화로 풀어나간다", "시간을 두고 기다린다", "객관적 사실로 논의한다"]}'::jsonb,
     '{"0": {"D": 2}, "1": {"I": 2}, "2": {"S": 2}, "3": {"C": 2}}'::jsonb),
    (25, '나의 약점은...',
     '{"choices": ["참을성 부족", "집중력 부족", "변화 적응 어려움", "유연성 부족"]}'::jsonb,
     '{"0": {"D": 2}, "1": {"I": 2}, "2": {"S": 2}, "3": {"C": 2}}'::jsonb),
    (26, '성공의 기준은...',
     '{"choices": ["목표 달성", "관계 형성", "팀 기여", "완벽한 수행"]}'::jsonb,
     '{"0": {"D": 2}, "1": {"I": 2}, "2": {"S": 2}, "3": {"C": 2}}'::jsonb),
    (27, '새로운 아이디어에 대해...',
     '{"choices": ["빨리 실행해보고 싶다", "다른 사람과 공유하고 싶다", "충분히 검토하고 싶다", "분석하고 싶다"]}'::jsonb,
     '{"0": {"D": 2}, "1": {"I": 2}, "2": {"S": 2}, "3": {"C": 2}}'::jsonb),
    (28, '중요한 결정 전에...',
     '{"choices": ["직감을 믿는다", "다른 사람과 상의한다", "시간을 가지고 생각한다", "데이터를 검토한다"]}'::jsonb,
     '{"0": {"D": 2}, "1": {"I": 2}, "2": {"S": 2}, "3": {"C": 2}}'::jsonb)
) AS q(question_number, question_text, options, scoring_weights)
WHERE t.code = 'disc';


-- ==========================================
-- Enneagram 검사 문항 (36문항)
-- ==========================================
DELETE FROM questions WHERE test_id = (SELECT id FROM tests WHERE code = 'enneagram');

INSERT INTO questions (test_id, question_number, question_type, question_text, options, scoring_weights)
SELECT t.id, q.question_number, 'likert', q.question_text,
    '{"scale": [1, 2, 3, 4, 5], "labels": ["전혀 아니다", "아니다", "보통", "그렇다", "매우 그렇다"]}'::jsonb,
    q.scoring_weights
FROM tests t
CROSS JOIN (VALUES
    -- Type 1: 개혁가 (4문항)
    (1, '완벽하게 하지 않으면 아예 하지 않는 편이다.', '{"1": 1}'::jsonb),
    (2, '옳고 그름에 대한 기준이 명확하다.', '{"1": 1}'::jsonb),
    (3, '실수를 하면 스스로에게 비판적이다.', '{"1": 1}'::jsonb),
    (4, '세상을 더 나은 곳으로 만들고 싶다.', '{"1": 1}'::jsonb),

    -- Type 2: 조력자 (4문항)
    (5, '다른 사람들을 돕는 것에서 큰 보람을 느낀다.', '{"2": 1}'::jsonb),
    (6, '다른 사람의 필요를 잘 알아챈다.', '{"2": 1}'::jsonb),
    (7, '인정받지 못하면 서운하다.', '{"2": 1}'::jsonb),
    (8, '관계에서 주는 것이 받는 것보다 익숙하다.', '{"2": 1}'::jsonb),

    -- Type 3: 성취자 (4문항)
    (9, '성공과 성취가 나에게 매우 중요하다.', '{"3": 1}'::jsonb),
    (10, '목표 달성을 위해 효율적으로 일한다.', '{"3": 1}'::jsonb),
    (11, '다른 사람에게 어떻게 보이는지 신경 쓴다.', '{"3": 1}'::jsonb),
    (12, '실패하는 것이 두렵다.', '{"3": 1}'::jsonb),

    -- Type 4: 예술가 (4문항)
    (13, '나는 다른 사람들과 다르다는 것을 자주 느낀다.', '{"4": 1}'::jsonb),
    (14, '감정의 깊이가 중요하다.', '{"4": 1}'::jsonb),
    (15, '평범한 것에 만족하지 못한다.', '{"4": 1}'::jsonb),
    (16, '우울하거나 멜랑콜리한 감정을 자주 느낀다.', '{"4": 1}'::jsonb),

    -- Type 5: 탐구자 (4문항)
    (17, '혼자서 연구하고 분석하는 시간이 필요하다.', '{"5": 1}'::jsonb),
    (18, '지식을 쌓는 것을 좋아한다.', '{"5": 1}'::jsonb),
    (19, '감정적인 상황이 불편하다.', '{"5": 1}'::jsonb),
    (20, '에너지가 소진되지 않도록 혼자 시간을 보낸다.', '{"5": 1}'::jsonb),

    -- Type 6: 충성가 (4문항)
    (21, '최악의 상황에 대비하는 것이 중요하다.', '{"6": 1}'::jsonb),
    (22, '권위자나 시스템을 신뢰하기 어렵다.', '{"6": 1}'::jsonb),
    (23, '결정을 내리기 전에 많이 고민한다.', '{"6": 1}'::jsonb),
    (24, '충성심이 강하고 책임감이 있다.', '{"6": 1}'::jsonb),

    -- Type 7: 열정가 (4문항)
    (25, '새로운 경험과 모험을 좋아한다.', '{"7": 1}'::jsonb),
    (26, '부정적인 감정을 피하려고 한다.', '{"7": 1}'::jsonb),
    (27, '여러 가지 일을 동시에 하는 것을 좋아한다.', '{"7": 1}'::jsonb),
    (28, '제한받는 것을 싫어한다.', '{"7": 1}'::jsonb),

    -- Type 8: 도전자 (4문항)
    (29, '내 의견을 강하게 주장하는 편이다.', '{"8": 1}'::jsonb),
    (30, '약한 사람을 보호하고 싶다.', '{"8": 1}'::jsonb),
    (31, '통제당하는 것을 매우 싫어한다.', '{"8": 1}'::jsonb),
    (32, '직접적이고 솔직하게 말한다.', '{"8": 1}'::jsonb),

    -- Type 9: 평화주의자 (4문항)
    (33, '평화롭고 조화로운 환경을 선호한다.', '{"9": 1}'::jsonb),
    (34, '갈등을 피하려고 노력한다.', '{"9": 1}'::jsonb),
    (35, '다른 사람의 관점을 쉽게 이해한다.', '{"9": 1}'::jsonb),
    (36, '나의 의견보다 다른 사람의 의견을 따르는 편이다.', '{"9": 1}'::jsonb)
) AS q(question_number, question_text, scoring_weights)
WHERE t.code = 'enneagram';


-- ==========================================
-- TCI 검사 문항 (70문항 - 간이버전)
-- ==========================================
DELETE FROM questions WHERE test_id = (SELECT id FROM tests WHERE code = 'tci');

INSERT INTO questions (test_id, question_number, question_type, question_text, options, scoring_weights)
SELECT t.id, q.question_number, 'likert', q.question_text,
    '{"scale": [1, 2, 3, 4, 5], "labels": ["전혀 아니다", "아니다", "보통", "그렇다", "매우 그렇다"]}'::jsonb,
    q.scoring_weights
FROM tests t
CROSS JOIN (VALUES
    -- NS (자극추구) - 10문항
    (1, '새롭고 흥미로운 것을 경험하고 싶다.', '{"NS": 1}'::jsonb),
    (2, '충동적으로 행동하는 경향이 있다.', '{"NS": 1}'::jsonb),
    (3, '규칙을 어기는 것이 재미있다.', '{"NS": 1}'::jsonb),
    (4, '돈을 쉽게 쓰는 편이다.', '{"NS": 1}'::jsonb),
    (5, '모험적인 활동을 좋아한다.', '{"NS": 1}'::jsonb),
    (6, '감정을 자주 표현한다.', '{"NS": 1}'::jsonb),
    (7, '지루함을 못 참는다.', '{"NS": 1}'::jsonb),
    (8, '즉흥적인 결정을 자주 한다.', '{"NS": 1}'::jsonb),
    (9, '자극적인 것을 추구한다.', '{"NS": 1}'::jsonb),
    (10, '변화를 좋아한다.', '{"NS": 1}'::jsonb),

    -- HA (위험회피) - 10문항
    (11, '걱정이 많은 편이다.', '{"HA": 1}'::jsonb),
    (12, '불확실한 상황이 불안하다.', '{"HA": 1}'::jsonb),
    (13, '비판받으면 오래 상처받는다.', '{"HA": 1}'::jsonb),
    (14, '낯선 사람을 만나는 것이 어렵다.', '{"HA": 1}'::jsonb),
    (15, '실패가 두렵다.', '{"HA": 1}'::jsonb),
    (16, '긴장을 자주 느낀다.', '{"HA": 1}'::jsonb),
    (17, '거절당할까 봐 걱정된다.', '{"HA": 1}'::jsonb),
    (18, '안전한 선택을 하는 편이다.', '{"HA": 1}'::jsonb),
    (19, '새로운 도전이 두렵다.', '{"HA": 1}'::jsonb),
    (20, '예민한 편이다.', '{"HA": 1}'::jsonb),

    -- RD (사회적 민감성) - 10문항
    (21, '다른 사람의 인정이 중요하다.', '{"RD": 1}'::jsonb),
    (22, '감정에 쉽게 동요된다.', '{"RD": 1}'::jsonb),
    (23, '따뜻한 관계가 중요하다.', '{"RD": 1}'::jsonb),
    (24, '다른 사람의 감정에 민감하다.', '{"RD": 1}'::jsonb),
    (25, '거절당하면 힘들다.', '{"RD": 1}'::jsonb),
    (26, '칭찬을 받으면 기분이 좋다.', '{"RD": 1}'::jsonb),
    (27, '사람들과 어울리는 것을 좋아한다.', '{"RD": 1}'::jsonb),
    (28, '감사 표현을 자주 한다.', '{"RD": 1}'::jsonb),
    (29, '다른 사람의 기대에 부응하려 한다.', '{"RD": 1}'::jsonb),
    (30, '관계를 유지하려고 노력한다.', '{"RD": 1}'::jsonb),

    -- PS (인내력) - 10문항
    (31, '목표를 위해 꾸준히 노력한다.', '{"PS": 1}'::jsonb),
    (32, '어려운 일도 끝까지 한다.', '{"PS": 1}'::jsonb),
    (33, '성취감을 위해 열심히 일한다.', '{"PS": 1}'::jsonb),
    (34, '포기하지 않는 편이다.', '{"PS": 1}'::jsonb),
    (35, '야망이 있다.', '{"PS": 1}'::jsonb),
    (36, '완벽을 추구한다.', '{"PS": 1}'::jsonb),
    (37, '노력에 대한 보상을 기대한다.', '{"PS": 1}'::jsonb),
    (38, '근면성실하다.', '{"PS": 1}'::jsonb),
    (39, '계획대로 실행한다.', '{"PS": 1}'::jsonb),
    (40, '어려움을 견딘다.', '{"PS": 1}'::jsonb),

    -- SD (자율성) - 10문항
    (41, '스스로 결정하는 것을 좋아한다.', '{"SD": 1}'::jsonb),
    (42, '내 인생에 책임감을 느낀다.', '{"SD": 1}'::jsonb),
    (43, '목표가 명확하다.', '{"SD": 1}'::jsonb),
    (44, '자기 통제력이 있다.', '{"SD": 1}'::jsonb),
    (45, '문제를 스스로 해결한다.', '{"SD": 1}'::jsonb),
    (46, '자존감이 높다.', '{"SD": 1}'::jsonb),
    (47, '독립적이다.', '{"SD": 1}'::jsonb),
    (48, '자기 발전에 관심이 있다.', '{"SD": 1}'::jsonb),
    (49, '내 능력을 믿는다.', '{"SD": 1}'::jsonb),
    (50, '자기 관리를 잘한다.', '{"SD": 1}'::jsonb),

    -- CO (연대감) - 10문항
    (51, '다른 사람을 돕는 것을 좋아한다.', '{"CO": 1}'::jsonb),
    (52, '공정함을 중요시한다.', '{"CO": 1}'::jsonb),
    (53, '다른 사람의 입장을 이해하려 한다.', '{"CO": 1}'::jsonb),
    (54, '협력적이다.', '{"CO": 1}'::jsonb),
    (55, '관용적이다.', '{"CO": 1}'::jsonb),
    (56, '공동체를 위해 기여하고 싶다.', '{"CO": 1}'::jsonb),
    (57, '다른 사람의 성공을 축하한다.', '{"CO": 1}'::jsonb),
    (58, '타인을 존중한다.', '{"CO": 1}'::jsonb),
    (59, '신뢰할 수 있는 사람이다.', '{"CO": 1}'::jsonb),
    (60, '팀워크를 중요시한다.', '{"CO": 1}'::jsonb),

    -- ST (자기초월) - 10문항
    (61, '인생에 더 큰 의미가 있다고 믿는다.', '{"ST": 1}'::jsonb),
    (62, '영적인 경험에 관심이 있다.', '{"ST": 1}'::jsonb),
    (63, '자연과 연결된 느낌을 받는다.', '{"ST": 1}'::jsonb),
    (64, '직관을 신뢰한다.', '{"ST": 1}'::jsonb),
    (65, '겸손함을 중요시한다.', '{"ST": 1}'::jsonb),
    (66, '우주의 일부라는 느낌을 받는다.', '{"ST": 1}'::jsonb),
    (67, '명상이나 묵상을 좋아한다.', '{"ST": 1}'::jsonb),
    (68, '삶의 신비에 경이로움을 느낀다.', '{"ST": 1}'::jsonb),
    (69, '모든 것이 연결되어 있다고 믿는다.', '{"ST": 1}'::jsonb),
    (70, '내면의 평화를 추구한다.', '{"ST": 1}'::jsonb)
) AS q(question_number, question_text, scoring_weights)
WHERE t.code = 'tci';


-- ==========================================
-- Holland 직업흥미 검사 (42문항)
-- ==========================================
DELETE FROM questions WHERE test_id = (SELECT id FROM tests WHERE code = 'holland');

INSERT INTO questions (test_id, question_number, question_type, question_text, options, scoring_weights)
SELECT t.id, q.question_number, 'likert', q.question_text,
    '{"scale": [1, 2, 3, 4, 5], "labels": ["전혀 흥미없다", "흥미없다", "보통", "흥미있다", "매우 흥미있다"]}'::jsonb,
    q.scoring_weights
FROM tests t
CROSS JOIN (VALUES
    -- R (실재형) - 7문항
    (1, '기계를 조작하거나 수리하는 일', '{"R": 1}'::jsonb),
    (2, '손으로 물건을 만드는 일', '{"R": 1}'::jsonb),
    (3, '야외에서 일하는 것', '{"R": 1}'::jsonb),
    (4, '도구를 사용하는 일', '{"R": 1}'::jsonb),
    (5, '건설이나 건축 관련 일', '{"R": 1}'::jsonb),
    (6, '농업이나 원예 관련 일', '{"R": 1}'::jsonb),
    (7, '자동차나 기계 관련 일', '{"R": 1}'::jsonb),

    -- I (탐구형) - 7문항
    (8, '과학적 연구를 하는 일', '{"I": 1}'::jsonb),
    (9, '실험을 설계하고 수행하는 일', '{"I": 1}'::jsonb),
    (10, '복잡한 문제를 분석하는 일', '{"I": 1}'::jsonb),
    (11, '이론을 개발하는 일', '{"I": 1}'::jsonb),
    (12, '데이터를 분석하는 일', '{"I": 1}'::jsonb),
    (13, '새로운 지식을 탐구하는 일', '{"I": 1}'::jsonb),
    (14, '수학적 문제를 푸는 일', '{"I": 1}'::jsonb),

    -- A (예술형) - 7문항
    (15, '그림을 그리거나 조각하는 일', '{"A": 1}'::jsonb),
    (16, '음악을 연주하거나 작곡하는 일', '{"A": 1}'::jsonb),
    (17, '글을 쓰는 일', '{"A": 1}'::jsonb),
    (18, '디자인하는 일', '{"A": 1}'::jsonb),
    (19, '연기하거나 무대에 서는 일', '{"A": 1}'::jsonb),
    (20, '사진을 찍는 일', '{"A": 1}'::jsonb),
    (21, '창작 활동을 하는 일', '{"A": 1}'::jsonb),

    -- S (사회형) - 7문항
    (22, '사람들을 가르치는 일', '{"S": 1}'::jsonb),
    (23, '상담하고 조언하는 일', '{"S": 1}'::jsonb),
    (24, '사람들의 건강을 돌보는 일', '{"S": 1}'::jsonb),
    (25, '사회봉사 활동', '{"S": 1}'::jsonb),
    (26, '사람들을 돕는 일', '{"S": 1}'::jsonb),
    (27, '그룹 활동을 이끄는 일', '{"S": 1}'::jsonb),
    (28, '복지 관련 일', '{"S": 1}'::jsonb),

    -- E (진취형) - 7문항
    (29, '사업을 운영하는 일', '{"E": 1}'::jsonb),
    (30, '영업이나 판매하는 일', '{"E": 1}'::jsonb),
    (31, '사람들을 설득하는 일', '{"E": 1}'::jsonb),
    (32, '협상하는 일', '{"E": 1}'::jsonb),
    (33, '조직을 관리하는 일', '{"E": 1}'::jsonb),
    (34, '프로젝트를 이끄는 일', '{"E": 1}'::jsonb),
    (35, '투자하고 경영하는 일', '{"E": 1}'::jsonb),

    -- C (관습형) - 7문항
    (36, '문서를 정리하고 관리하는 일', '{"C": 1}'::jsonb),
    (37, '데이터를 입력하고 정리하는 일', '{"C": 1}'::jsonb),
    (38, '회계 관련 일', '{"C": 1}'::jsonb),
    (39, '사무 행정 일', '{"C": 1}'::jsonb),
    (40, '체계적으로 분류하는 일', '{"C": 1}'::jsonb),
    (41, '규칙을 따르는 일', '{"C": 1}'::jsonb),
    (42, '정확하게 계산하는 일', '{"C": 1}'::jsonb)
) AS q(question_number, question_text, scoring_weights)
WHERE t.code = 'holland';


-- ==========================================
-- Gallup 강점 검사 (34문항)
-- ==========================================
DELETE FROM questions WHERE test_id = (SELECT id FROM tests WHERE code = 'gallup');

INSERT INTO questions (test_id, question_number, question_type, question_text, options, scoring_weights)
SELECT t.id, q.question_number, 'likert', q.question_text,
    '{"scale": [1, 2, 3, 4, 5], "labels": ["전혀 아니다", "아니다", "보통", "그렇다", "매우 그렇다"]}'::jsonb,
    q.scoring_weights
FROM tests t
CROSS JOIN (VALUES
    -- 실행력 영역
    (1, '항상 목표를 달성하려고 노력한다.', '{"achiever": 1, "domain": "executing"}'::jsonb),
    (2, '계획을 세우고 체계적으로 실행한다.', '{"arranger": 1, "domain": "executing"}'::jsonb),
    (3, '모든 일에 최선을 다한다.', '{"belief": 1, "domain": "executing"}'::jsonb),
    (4, '약속을 반드시 지킨다.', '{"responsibility": 1, "domain": "executing"}'::jsonb),
    (5, '어려운 일도 꾸준히 한다.', '{"discipline": 1, "domain": "executing"}'::jsonb),
    (6, '집중해서 빠르게 일을 처리한다.', '{"focus": 1, "domain": "executing"}'::jsonb),
    (7, '문제가 생기면 해결책을 찾는다.', '{"restorative": 1, "domain": "executing"}'::jsonb),
    (8, '신중하게 결정한다.', '{"deliberative": 1, "domain": "executing"}'::jsonb),

    -- 영향력 영역
    (9, '다른 사람을 자주 칭찬한다.', '{"activator": 1, "domain": "influencing"}'::jsonb),
    (10, '자신감 있게 의견을 말한다.', '{"command": 1, "domain": "influencing"}'::jsonb),
    (11, '다른 사람을 잘 설득한다.', '{"communication": 1, "domain": "influencing"}'::jsonb),
    (12, '경쟁에서 이기고 싶다.', '{"competition": 1, "domain": "influencing"}'::jsonb),
    (13, '다른 사람의 잠재력을 발견한다.', '{"maximizer": 1, "domain": "influencing"}'::jsonb),
    (14, '스스로를 믿는다.', '{"self-assurance": 1, "domain": "influencing"}'::jsonb),
    (15, '큰 목표를 세운다.', '{"significance": 1, "domain": "influencing"}'::jsonb),
    (16, '긍정적인 에너지를 준다.', '{"woo": 1, "domain": "influencing"}'::jsonb),

    -- 관계구축 영역
    (17, '변화에 쉽게 적응한다.', '{"adaptability": 1, "domain": "relationship"}'::jsonb),
    (18, '모든 사람과 연결되어 있다고 느낀다.', '{"connectedness": 1, "domain": "relationship"}'::jsonb),
    (19, '다른 사람의 성장을 돕고 싶다.', '{"developer": 1, "domain": "relationship"}'::jsonb),
    (20, '다른 사람의 감정을 잘 이해한다.', '{"empathy": 1, "domain": "relationship"}'::jsonb),
    (21, '조화로운 환경을 만든다.', '{"harmony": 1, "domain": "relationship"}'::jsonb),
    (22, '사람들의 강점을 발견한다.', '{"includer": 1, "domain": "relationship"}'::jsonb),
    (23, '다양한 관점을 이해한다.', '{"individualization": 1, "domain": "relationship"}'::jsonb),
    (24, '긍정적으로 생각한다.', '{"positivity": 1, "domain": "relationship"}'::jsonb),
    (25, '깊은 관계를 중요시한다.', '{"relator": 1, "domain": "relationship"}'::jsonb),

    -- 전략적 사고 영역
    (26, '분석적으로 생각한다.', '{"analytical": 1, "domain": "strategic"}'::jsonb),
    (27, '맥락과 배경을 중요시한다.', '{"context": 1, "domain": "strategic"}'::jsonb),
    (28, '미래에 대해 자주 생각한다.', '{"futuristic": 1, "domain": "strategic"}'::jsonb),
    (29, '새로운 아이디어를 잘 떠올린다.', '{"ideation": 1, "domain": "strategic"}'::jsonb),
    (30, '정보 수집을 좋아한다.', '{"input": 1, "domain": "strategic"}'::jsonb),
    (31, '지적인 대화를 즐긴다.', '{"intellection": 1, "domain": "strategic"}'::jsonb),
    (32, '배우는 것을 좋아한다.', '{"learner": 1, "domain": "strategic"}'::jsonb),
    (33, '여러 가지 방법을 고려한다.', '{"strategic": 1, "domain": "strategic"}'::jsonb),
    (34, '패턴을 잘 발견한다.', '{"connectedness": 1, "domain": "strategic"}'::jsonb)
) AS q(question_number, question_text, scoring_weights)
WHERE t.code = 'gallup';


-- ==========================================
-- IQ 검사 문항 (30문항)
-- ==========================================
DELETE FROM questions WHERE test_id = (SELECT id FROM tests WHERE code = 'iq');

INSERT INTO questions (test_id, question_number, question_type, question_text, options, scoring_weights)
SELECT t.id, q.question_number, q.question_type, q.question_text, q.options, q.scoring_weights
FROM tests t
CROSS JOIN (VALUES
    -- 언어 추론 (5문항)
    (1, 'choice', '사과 : 과일 = 장미 : ?',
     '{"choices": ["꽃", "빨간색", "정원", "가시"]}'::jsonb,
     '{"correct": 0, "domain": "verbal"}'::jsonb),
    (2, 'choice', '빠르다의 반대말은?',
     '{"choices": ["느리다", "작다", "크다", "무겁다"]}'::jsonb,
     '{"correct": 0, "domain": "verbal"}'::jsonb),
    (3, 'choice', '다음 중 나머지와 다른 것은?',
     '{"choices": ["강아지", "고양이", "토끼", "참새"]}'::jsonb,
     '{"correct": 3, "domain": "verbal"}'::jsonb),
    (4, 'choice', '책 : 읽다 = 노래 : ?',
     '{"choices": ["듣다", "보다", "쓰다", "만들다"]}'::jsonb,
     '{"correct": 0, "domain": "verbal"}'::jsonb),
    (5, 'choice', '차갑다 : 뜨겁다 = 어둡다 : ?',
     '{"choices": ["밝다", "검다", "희다", "작다"]}'::jsonb,
     '{"correct": 0, "domain": "verbal"}'::jsonb),

    -- 수리 추론 (5문항)
    (6, 'choice', '2, 4, 8, 16, ?',
     '{"choices": ["24", "32", "30", "28"]}'::jsonb,
     '{"correct": 1, "domain": "numerical"}'::jsonb),
    (7, 'choice', '15의 20%는?',
     '{"choices": ["2", "3", "4", "5"]}'::jsonb,
     '{"correct": 1, "domain": "numerical"}'::jsonb),
    (8, 'choice', '3, 6, 12, 24, ?',
     '{"choices": ["36", "42", "48", "30"]}'::jsonb,
     '{"correct": 2, "domain": "numerical"}'::jsonb),
    (9, 'choice', '100 - 37 = ?',
     '{"choices": ["63", "67", "73", "53"]}'::jsonb,
     '{"correct": 0, "domain": "numerical"}'::jsonb),
    (10, 'choice', '5 x 7 + 3 = ?',
     '{"choices": ["35", "38", "40", "32"]}'::jsonb,
     '{"correct": 1, "domain": "numerical"}'::jsonb),

    -- 공간 추론 (5문항)
    (11, 'choice', '정육면체의 면은 몇 개인가?',
     '{"choices": ["4", "6", "8", "12"]}'::jsonb,
     '{"correct": 1, "domain": "spatial"}'::jsonb),
    (12, 'choice', '종이를 반으로 2번 접으면 몇 겹이 되는가?',
     '{"choices": ["2겹", "4겹", "6겹", "8겹"]}'::jsonb,
     '{"correct": 1, "domain": "spatial"}'::jsonb),
    (13, 'choice', '직사각형의 대각선은 몇 개인가?',
     '{"choices": ["1", "2", "3", "4"]}'::jsonb,
     '{"correct": 1, "domain": "spatial"}'::jsonb),
    (14, 'choice', '거울에 비친 시계가 3시를 가리킨다면 실제 시간은?',
     '{"choices": ["3시", "9시", "12시", "6시"]}'::jsonb,
     '{"correct": 1, "domain": "spatial"}'::jsonb),
    (15, 'choice', '삼각형의 내각의 합은?',
     '{"choices": ["90도", "180도", "270도", "360도"]}'::jsonb,
     '{"correct": 1, "domain": "spatial"}'::jsonb),

    -- 패턴 인식 (5문항)
    (16, 'choice', '1, 1, 2, 3, 5, 8, ?',
     '{"choices": ["10", "11", "12", "13"]}'::jsonb,
     '{"correct": 3, "domain": "pattern"}'::jsonb),
    (17, 'choice', 'A, C, E, G, ?',
     '{"choices": ["H", "I", "J", "K"]}'::jsonb,
     '{"correct": 1, "domain": "pattern"}'::jsonb),
    (18, 'choice', '1, 4, 9, 16, 25, ?',
     '{"choices": ["30", "32", "34", "36"]}'::jsonb,
     '{"correct": 3, "domain": "pattern"}'::jsonb),
    (19, 'choice', '월, 수, 금, ?',
     '{"choices": ["일", "토", "목", "화"]}'::jsonb,
     '{"correct": 0, "domain": "pattern"}'::jsonb),
    (20, 'choice', '2, 6, 12, 20, 30, ?',
     '{"choices": ["40", "42", "44", "46"]}'::jsonb,
     '{"correct": 1, "domain": "pattern"}'::jsonb),

    -- 기억력 (5문항)
    (21, 'choice', '다음 숫자를 기억하세요: 7, 3, 9, 2. 세 번째 숫자는?',
     '{"choices": ["7", "3", "9", "2"]}'::jsonb,
     '{"correct": 2, "domain": "memory"}'::jsonb),
    (22, 'choice', '사과, 바나나, 오렌지, 포도. 두 번째 과일은?',
     '{"choices": ["사과", "바나나", "오렌지", "포도"]}'::jsonb,
     '{"correct": 1, "domain": "memory"}'::jsonb),
    (23, 'choice', '빨강, 파랑, 노랑, 초록, 검정. 네 번째 색은?',
     '{"choices": ["빨강", "노랑", "초록", "검정"]}'::jsonb,
     '{"correct": 2, "domain": "memory"}'::jsonb),
    (24, 'choice', '3, 8, 1, 6, 4. 첫 번째와 마지막 숫자의 합은?',
     '{"choices": ["5", "6", "7", "8"]}'::jsonb,
     '{"correct": 2, "domain": "memory"}'::jsonb),
    (25, 'choice', '강아지, 고양이, 토끼, 햄스터. 첫 번째 동물은?',
     '{"choices": ["강아지", "고양이", "토끼", "햄스터"]}'::jsonb,
     '{"correct": 0, "domain": "memory"}'::jsonb),

    -- 처리속도 (5문항)
    (26, 'choice', '7 + 8 = ?',
     '{"choices": ["14", "15", "16", "17"]}'::jsonb,
     '{"correct": 1, "domain": "speed"}'::jsonb),
    (27, 'choice', '12 - 5 = ?',
     '{"choices": ["6", "7", "8", "9"]}'::jsonb,
     '{"correct": 1, "domain": "speed"}'::jsonb),
    (28, 'choice', '6 x 4 = ?',
     '{"choices": ["22", "24", "26", "28"]}'::jsonb,
     '{"correct": 1, "domain": "speed"}'::jsonb),
    (29, 'choice', '다음 중 가장 큰 수는?',
     '{"choices": ["99", "101", "97", "100"]}'::jsonb,
     '{"correct": 1, "domain": "speed"}'::jsonb),
    (30, 'choice', '1 + 2 + 3 + 4 = ?',
     '{"choices": ["8", "9", "10", "11"]}'::jsonb,
     '{"correct": 2, "domain": "speed"}'::jsonb)
) AS q(question_number, question_type, question_text, options, scoring_weights)
WHERE t.code = 'iq';


-- ==========================================
-- MMPI 간이 검사 (50문항)
-- ==========================================
DELETE FROM questions WHERE test_id = (SELECT id FROM tests WHERE code = 'mmpi');

INSERT INTO questions (test_id, question_number, question_type, question_text, options, scoring_weights)
SELECT t.id, q.question_number, 'boolean', q.question_text,
    '{"labels": ["아니오", "예"]}'::jsonb,
    q.scoring_weights
FROM tests t
CROSS JOIN (VALUES
    -- L (거짓말 척도) - 5문항
    (1, '나는 항상 진실만을 말한다.', '{"L": {"true": 1, "false": 0}}'::jsonb),
    (2, '나는 남의 험담을 한 적이 없다.', '{"L": {"true": 1, "false": 0}}'::jsonb),
    (3, '나는 화가 난 적이 한 번도 없다.', '{"L": {"true": 1, "false": 0}}'::jsonb),
    (4, '나는 모든 사람을 좋아한다.', '{"L": {"true": 1, "false": 0}}'::jsonb),
    (5, '나는 약속을 어긴 적이 없다.', '{"L": {"true": 1, "false": 0}}'::jsonb),

    -- F (비전형 척도) - 5문항
    (6, '이상한 것들이 보인다.', '{"F": {"true": 1, "false": 0}}'::jsonb),
    (7, '사람들이 나를 해치려 한다.', '{"F": {"true": 1, "false": 0}}'::jsonb),
    (8, '아무도 나를 이해하지 못한다.', '{"F": {"true": 1, "false": 0}}'::jsonb),
    (9, '삶이 의미 없다고 느낀다.', '{"F": {"true": 1, "false": 0}}'::jsonb),
    (10, '세상이 비현실적으로 느껴진다.', '{"F": {"true": 1, "false": 0}}'::jsonb),

    -- K (교정 척도) - 5문항
    (11, '나는 스트레스를 잘 관리한다.', '{"K": {"true": 1, "false": 0}}'::jsonb),
    (12, '나는 자신감이 있다.', '{"K": {"true": 1, "false": 0}}'::jsonb),
    (13, '나는 다른 사람들과 잘 지낸다.', '{"K": {"true": 1, "false": 0}}'::jsonb),
    (14, '나는 감정 조절을 잘한다.', '{"K": {"true": 1, "false": 0}}'::jsonb),
    (15, '나는 문제 해결 능력이 뛰어나다.', '{"K": {"true": 1, "false": 0}}'::jsonb),

    -- Hs (건강염려증) - 5문항
    (16, '자주 두통이 있다.', '{"Hs": {"true": 1, "false": 0}}'::jsonb),
    (17, '소화가 잘 안 된다.', '{"Hs": {"true": 1, "false": 0}}'::jsonb),
    (18, '몸 여기저기가 아프다.', '{"Hs": {"true": 1, "false": 0}}'::jsonb),
    (19, '건강이 걱정된다.', '{"Hs": {"true": 1, "false": 0}}'::jsonb),
    (20, '병원에 자주 간다.', '{"Hs": {"true": 1, "false": 0}}'::jsonb),

    -- D (우울증) - 5문항
    (21, '슬픔을 자주 느낀다.', '{"D": {"true": 1, "false": 0}}'::jsonb),
    (22, '미래에 대한 희망이 없다.', '{"D": {"true": 1, "false": 0}}'::jsonb),
    (23, '아무것도 하고 싶지 않다.', '{"D": {"true": 1, "false": 0}}'::jsonb),
    (24, '쉽게 피곤하다.', '{"D": {"true": 1, "false": 0}}'::jsonb),
    (25, '잠을 잘 못 잔다.', '{"D": {"true": 1, "false": 0}}'::jsonb),

    -- Hy (히스테리) - 5문항
    (26, '스트레스를 받으면 몸이 아프다.', '{"Hy": {"true": 1, "false": 0}}'::jsonb),
    (27, '감정 기복이 심하다.', '{"Hy": {"true": 1, "false": 0}}'::jsonb),
    (28, '관심을 받고 싶다.', '{"Hy": {"true": 1, "false": 0}}'::jsonb),
    (29, '때때로 몸이 마비되는 느낌이 든다.', '{"Hy": {"true": 1, "false": 0}}'::jsonb),
    (30, '극적으로 감정을 표현한다.', '{"Hy": {"true": 1, "false": 0}}'::jsonb),

    -- Pd (반사회성) - 5문항
    (31, '규칙을 어기는 것이 즐겁다.', '{"Pd": {"true": 1, "false": 0}}'::jsonb),
    (32, '쉽게 화가 난다.', '{"Pd": {"true": 1, "false": 0}}'::jsonb),
    (33, '충동적으로 행동한다.', '{"Pd": {"true": 1, "false": 0}}'::jsonb),
    (34, '권위에 반항한다.', '{"Pd": {"true": 1, "false": 0}}'::jsonb),
    (35, '후회 없이 산다.', '{"Pd": {"true": 1, "false": 0}}'::jsonb),

    -- Pa (편집증) - 5문항
    (36, '사람들이 나에 대해 말한다.', '{"Pa": {"true": 1, "false": 0}}'::jsonb),
    (37, '다른 사람을 쉽게 믿지 못한다.', '{"Pa": {"true": 1, "false": 0}}'::jsonb),
    (38, '나를 이용하려는 사람이 있다.', '{"Pa": {"true": 1, "false": 0}}'::jsonb),
    (39, '비판에 예민하다.', '{"Pa": {"true": 1, "false": 0}}'::jsonb),
    (40, '오해받는다고 느낀다.', '{"Pa": {"true": 1, "false": 0}}'::jsonb),

    -- Pt (강박증) - 5문항
    (41, '걱정이 많다.', '{"Pt": {"true": 1, "false": 0}}'::jsonb),
    (42, '불안감을 자주 느낀다.', '{"Pt": {"true": 1, "false": 0}}'::jsonb),
    (43, '같은 생각이 반복된다.', '{"Pt": {"true": 1, "false": 0}}'::jsonb),
    (44, '확인을 여러 번 한다.', '{"Pt": {"true": 1, "false": 0}}'::jsonb),
    (45, '완벽하지 않으면 불안하다.', '{"Pt": {"true": 1, "false": 0}}'::jsonb),

    -- Ma (경조증) - 5문항
    (46, '에너지가 넘친다.', '{"Ma": {"true": 1, "false": 0}}'::jsonb),
    (47, '말이 빠르다.', '{"Ma": {"true": 1, "false": 0}}'::jsonb),
    (48, '아이디어가 넘친다.', '{"Ma": {"true": 1, "false": 0}}'::jsonb),
    (49, '잠을 적게 자도 괜찮다.', '{"Ma": {"true": 1, "false": 0}}'::jsonb),
    (50, '위험한 일을 좋아한다.', '{"Ma": {"true": 1, "false": 0}}'::jsonb)
) AS q(question_number, question_text, scoring_weights)
WHERE t.code = 'mmpi';


-- ==========================================
-- 사상체질 검사 (20문항)
-- ==========================================
DELETE FROM questions WHERE test_id = (SELECT id FROM tests WHERE code = 'sasang');

INSERT INTO questions (test_id, question_number, question_type, question_text, options, scoring_weights)
SELECT t.id, q.question_number, 'choice', q.question_text, q.options, q.scoring_weights
FROM tests t
CROSS JOIN (VALUES
    (1, '체형이 어떤 편인가요?',
     '{"choices": ["상체 발달, 목덜미 굵음", "골격 큼, 배가 나옴", "가슴 발달, 엉덩이 작음", "체격 작음, 하체 발달"]}'::jsonb,
     '{"0": {"태양인": 2}, "1": {"태음인": 2}, "2": {"소양인": 2}, "3": {"소음인": 2}, "area": "body"}'::jsonb),
    (2, '피부가 어떤 편인가요?',
     '{"choices": ["건조하고 거친 편", "두껍고 탄력 있음", "부드럽고 윤기 있음", "희고 섬세함"]}'::jsonb,
     '{"0": {"태양인": 2}, "1": {"태음인": 2}, "2": {"소양인": 2}, "3": {"소음인": 2}, "area": "body"}'::jsonb),
    (3, '걸음걸이가 어떤가요?',
     '{"choices": ["당당하고 빠름", "느리고 무거움", "경쾌하고 날렵함", "조심스럽고 작음"]}'::jsonb,
     '{"0": {"태양인": 2}, "1": {"태음인": 2}, "2": {"소양인": 2}, "3": {"소음인": 2}, "area": "body"}'::jsonb),
    (4, '목소리가 어떤 편인가요?',
     '{"choices": ["크고 힘참", "굵고 낮음", "맑고 높음", "작고 가늠"]}'::jsonb,
     '{"0": {"태양인": 2}, "1": {"태음인": 2}, "2": {"소양인": 2}, "3": {"소음인": 2}, "area": "body"}'::jsonb),
    (5, '땀을 많이 흘리나요?',
     '{"choices": ["땀이 적음", "땀이 많음", "상체에 땀이 많음", "잘 나지 않음"]}'::jsonb,
     '{"0": {"태양인": 2}, "1": {"태음인": 2}, "2": {"소양인": 2}, "3": {"소음인": 2}, "area": "body"}'::jsonb),

    (6, '성격이 어떤 편인가요?',
     '{"choices": ["진취적, 창의적", "침착, 인내심", "활발, 정의감", "내성적, 꼼꼼"]}'::jsonb,
     '{"0": {"태양인": 2}, "1": {"태음인": 2}, "2": {"소양인": 2}, "3": {"소음인": 2}, "area": "personality"}'::jsonb),
    (7, '결정을 어떻게 내리나요?',
     '{"choices": ["빠르고 과감하게", "신중하고 느리게", "직관적으로", "조심스럽게"]}'::jsonb,
     '{"0": {"태양인": 2}, "1": {"태음인": 2}, "2": {"소양인": 2}, "3": {"소음인": 2}, "area": "personality"}'::jsonb),
    (8, '화가 나면 어떻게 하나요?',
     '{"choices": ["강하게 표출", "참다가 한꺼번에", "바로 표현", "속으로 삭힘"]}'::jsonb,
     '{"0": {"태양인": 2}, "1": {"태음인": 2}, "2": {"소양인": 2}, "3": {"소음인": 2}, "area": "personality"}'::jsonb),
    (9, '대인관계는 어떤가요?',
     '{"choices": ["리더 역할, 독립적", "신뢰받음, 보수적", "사교적, 폭넓은 관계", "깊고 좁은 관계"]}'::jsonb,
     '{"0": {"태양인": 2}, "1": {"태음인": 2}, "2": {"소양인": 2}, "3": {"소음인": 2}, "area": "personality"}'::jsonb),
    (10, '스트레스를 어떻게 푸나요?',
     '{"choices": ["활동적인 취미", "먹거나 자기", "사람들과 어울림", "혼자 조용히"]}'::jsonb,
     '{"0": {"태양인": 2}, "1": {"태음인": 2}, "2": {"소양인": 2}, "3": {"소음인": 2}, "area": "personality"}'::jsonb),

    (11, '소화력은 어떤가요?',
     '{"choices": ["소화가 잘 안됨", "잘 먹고 소화도 잘됨", "빠르게 소화됨", "소식해야 편함"]}'::jsonb,
     '{"0": {"태양인": 2}, "1": {"태음인": 2}, "2": {"소양인": 2}, "3": {"소음인": 2}, "area": "health"}'::jsonb),
    (12, '대변 상태는?',
     '{"choices": ["무른 편", "굵고 규칙적", "빠르고 묽음", "가늘고 불규칙"]}'::jsonb,
     '{"0": {"태양인": 2}, "1": {"태음인": 2}, "2": {"소양인": 2}, "3": {"소음인": 2}, "area": "health"}'::jsonb),
    (13, '더위와 추위 중 어떤 것에 약한가요?',
     '{"choices": ["더위에 약함", "더위에 약함", "더위에 약함", "추위에 약함"]}'::jsonb,
     '{"0": {"태양인": 2}, "1": {"태음인": 2}, "2": {"소양인": 2}, "3": {"소음인": 2}, "area": "health"}'::jsonb),
    (14, '잠은 어떤 편인가요?',
     '{"choices": ["잠이 적음", "깊이 잠", "잠이 적음", "잠이 많음"]}'::jsonb,
     '{"0": {"태양인": 2}, "1": {"태음인": 2}, "2": {"소양인": 2}, "3": {"소음인": 2}, "area": "health"}'::jsonb),
    (15, '피로하면 어느 부위가 힘든가요?',
     '{"choices": ["다리, 허리", "호흡, 가슴", "신장, 방광", "위장, 소화"]}'::jsonb,
     '{"0": {"태양인": 2}, "1": {"태음인": 2}, "2": {"소양인": 2}, "3": {"소음인": 2}, "area": "health"}'::jsonb),

    (16, '선호하는 음식은?',
     '{"choices": ["담백하고 시원한 음식", "기름진 고기류", "신선하고 차가운 음식", "따뜻하고 부드러운 음식"]}'::jsonb,
     '{"0": {"태양인": 2}, "1": {"태음인": 2}, "2": {"소양인": 2}, "3": {"소음인": 2}, "area": "preference"}'::jsonb),
    (17, '물을 어떻게 마시나요?',
     '{"choices": ["시원한 물 좋아함", "물을 많이 마심", "시원한 물 좋아함", "따뜻한 물 선호"]}'::jsonb,
     '{"0": {"태양인": 2}, "1": {"태음인": 2}, "2": {"소양인": 2}, "3": {"소음인": 2}, "area": "preference"}'::jsonb),
    (18, '운동 취향은?',
     '{"choices": ["가벼운 운동", "땀나는 운동", "활동적인 운동", "조용한 운동"]}'::jsonb,
     '{"0": {"태양인": 2}, "1": {"태음인": 2}, "2": {"소양인": 2}, "3": {"소음인": 2}, "area": "preference"}'::jsonb),
    (19, '어떤 환경이 편한가요?',
     '{"choices": ["시원하고 넓은 곳", "안정적인 곳", "활기찬 곳", "아늑한 곳"]}'::jsonb,
     '{"0": {"태양인": 2}, "1": {"태음인": 2}, "2": {"소양인": 2}, "3": {"소음인": 2}, "area": "preference"}'::jsonb),
    (20, '일하는 스타일은?',
     '{"choices": ["큰 그림, 창의적", "꾸준히, 끈기있게", "빠르게, 다양하게", "신중하게, 차분히"]}'::jsonb,
     '{"0": {"태양인": 2}, "1": {"태음인": 2}, "2": {"소양인": 2}, "3": {"소음인": 2}, "area": "preference"}'::jsonb)
) AS q(question_number, question_text, options, scoring_weights)
WHERE t.code = 'sasang';


-- ==========================================
-- 타로 성격 검사 (10문항)
-- ==========================================
DELETE FROM questions WHERE test_id = (SELECT id FROM tests WHERE code = 'tarot');

INSERT INTO questions (test_id, question_number, question_type, question_text, options, scoring_weights)
SELECT t.id, q.question_number, 'image_choice', q.question_text, q.options, q.scoring_weights
FROM tests t
CROSS JOIN (VALUES
    (1, '현재 당신의 상황을 나타내는 카드를 선택하세요.',
     '{"images": [0, 1, 2, 3, 4, 5, 6]}'::jsonb,
     '{"position": "present"}'::jsonb),
    (2, '당신의 강점을 나타내는 카드를 선택하세요.',
     '{"images": [7, 8, 9, 10, 11, 12, 13]}'::jsonb,
     '{"position": "strength"}'::jsonb),
    (3, '당신이 극복해야 할 도전을 나타내는 카드를 선택하세요.',
     '{"images": [14, 15, 16, 17, 18, 19, 20]}'::jsonb,
     '{"position": "challenge"}'::jsonb),
    (4, '당신의 과거에 영향을 미친 카드를 선택하세요.',
     '{"images": [0, 2, 4, 9, 12, 15, 18]}'::jsonb,
     '{"position": "past"}'::jsonb),
    (5, '당신의 미래 가능성을 나타내는 카드를 선택하세요.',
     '{"images": [17, 19, 21, 1, 3, 6, 10]}'::jsonb,
     '{"position": "future"}'::jsonb),
    (6, '당신에게 필요한 조언을 나타내는 카드를 선택하세요.',
     '{"images": [5, 8, 11, 14, 17, 20, 21]}'::jsonb,
     '{"position": "advice"}'::jsonb),
    (7, '당신의 내면을 나타내는 카드를 선택하세요.',
     '{"images": [2, 4, 9, 12, 18, 5, 13]}'::jsonb,
     '{"position": "inner"}'::jsonb),
    (8, '당신의 외적 모습을 나타내는 카드를 선택하세요.',
     '{"images": [1, 3, 4, 7, 11, 19, 21]}'::jsonb,
     '{"position": "outer"}'::jsonb),
    (9, '당신의 희망을 나타내는 카드를 선택하세요.',
     '{"images": [17, 19, 21, 6, 10, 14, 3]}'::jsonb,
     '{"position": "hope"}'::jsonb),
    (10, '당신의 두려움을 나타내는 카드를 선택하세요.',
     '{"images": [12, 13, 15, 16, 18, 8, 9]}'::jsonb,
     '{"position": "fear"}'::jsonb)
) AS q(question_number, question_text, options, scoring_weights)
WHERE t.code = 'tarot';


-- ==========================================
-- HTP 그림 검사 (3문항)
-- ==========================================
DELETE FROM questions WHERE test_id = (SELECT id FROM tests WHERE code = 'htp');

INSERT INTO questions (test_id, question_number, question_type, question_text, options, scoring_weights)
SELECT t.id, q.question_number, 'drawing', q.question_text, q.options, q.scoring_weights
FROM tests t
CROSS JOIN (VALUES
    (1, '집을 그려주세요. (가능한 자세하게 그려주세요)',
     '{"canvas_size": {"width": 400, "height": 300}, "instruction": "집을 자유롭게 그려주세요. 문, 창문, 지붕 등을 포함해도 좋습니다."}'::jsonb,
     '{"type": "house"}'::jsonb),
    (2, '나무를 그려주세요. (가능한 자세하게 그려주세요)',
     '{"canvas_size": {"width": 400, "height": 300}, "instruction": "나무를 자유롭게 그려주세요. 줄기, 가지, 잎 등을 포함해도 좋습니다."}'::jsonb,
     '{"type": "tree"}'::jsonb),
    (3, '사람을 그려주세요. (가능한 자세하게 그려주세요)',
     '{"canvas_size": {"width": 400, "height": 300}, "instruction": "사람을 자유롭게 그려주세요. 전신을 그려주세요."}'::jsonb,
     '{"type": "person"}'::jsonb)
) AS q(question_number, question_text, options, scoring_weights)
WHERE t.code = 'htp';


-- ==========================================
-- 사주 분석 (1문항 - 생년월일시 입력)
-- ==========================================
DELETE FROM questions WHERE test_id = (SELECT id FROM tests WHERE code = 'saju');

INSERT INTO questions (test_id, question_number, question_type, question_text, options, scoring_weights)
SELECT t.id, q.question_number, 'datetime', q.question_text, q.options, q.scoring_weights
FROM tests t
CROSS JOIN (VALUES
    (1, '생년월일시를 입력해주세요.',
     '{"fields": ["year", "month", "day", "hour"], "format": "YYYY-MM-DD HH:mm"}'::jsonb,
     '{"type": "birth_info"}'::jsonb)
) AS q(question_number, question_text, options, scoring_weights)
WHERE t.code = 'saju';


-- ==========================================
-- 관상 분석 (7문항 - 자가 평가)
-- ==========================================
DELETE FROM questions WHERE test_id = (SELECT id FROM tests WHERE code = 'face');

INSERT INTO questions (test_id, question_number, question_type, question_text, options, scoring_weights)
SELECT t.id, q.question_number, 'choice', q.question_text, q.options, q.scoring_weights
FROM tests t
CROSS JOIN (VALUES
    (1, '얼굴형이 어떤 편인가요?',
     '{"choices": ["긴 얼굴형", "둥근 얼굴형", "각진 얼굴형", "달걀형 얼굴", "하트형 얼굴"]}'::jsonb,
     '{"feature": "face_shape", "0": "long", "1": "round", "2": "square", "3": "oval", "4": "heart"}'::jsonb),
    (2, '이마가 어떤 편인가요?',
     '{"choices": ["넓은 편", "좁은 편", "높은 편", "낮은 편"]}'::jsonb,
     '{"feature": "forehead", "0": "wide", "1": "narrow", "2": "high", "3": "low"}'::jsonb),
    (3, '눈썹이 어떤 편인가요?',
     '{"choices": ["진하고 굵음", "가늘고 연함", "일자형", "곡선형"]}'::jsonb,
     '{"feature": "eyebrows", "0": "thick", "1": "thin", "2": "straight", "3": "curved"}'::jsonb),
    (4, '눈이 어떤 편인가요?',
     '{"choices": ["크고 동그란 편", "작은 편", "긴 편", "깊은 편"]}'::jsonb,
     '{"feature": "eyes", "0": "large", "1": "small", "2": "long", "3": "detailed"}'::jsonb),
    (5, '코가 어떤 편인가요?',
     '{"choices": ["높고 오똑함", "곧은 편", "코끝이 둥근 편", "코끝이 뾰족함"]}'::jsonb,
     '{"feature": "nose", "0": "high", "1": "straight", "2": "round_tip", "3": "pointed"}'::jsonb),
    (6, '입이 어떤 편인가요?',
     '{"choices": ["큰 편", "작은 편", "입술이 두꺼움", "입술이 얇음"]}'::jsonb,
     '{"feature": "mouth", "0": "large", "1": "small", "2": "thick_lips", "3": "thin_lips"}'::jsonb),
    (7, '턱이 어떤 편인가요?',
     '{"choices": ["뚜렷하고 강함", "부드럽고 약함", "둥근 편", "뾰족한 편"]}'::jsonb,
     '{"feature": "chin", "0": "strong", "1": "weak", "2": "round", "3": "pointed"}'::jsonb)
) AS q(question_number, question_text, options, scoring_weights)
WHERE t.code = 'face';


-- ==========================================
-- 혈액형 성격 검사 (5문항)
-- ==========================================
DELETE FROM questions WHERE test_id = (SELECT id FROM tests WHERE code = 'blood');

INSERT INTO questions (test_id, question_number, question_type, question_text, options, scoring_weights)
SELECT t.id, q.question_number, q.question_type, q.question_text, q.options, q.scoring_weights
FROM tests t
CROSS JOIN (VALUES
    (1, 'choice', '혈액형이 무엇인가요?',
     '{"choices": ["A형", "B형", "O형", "AB형"]}'::jsonb,
     '{"field": "blood_type", "0": "A", "1": "B", "2": "O", "3": "AB"}'::jsonb),
    (2, 'choice', 'Rh 인자를 알고 있다면?',
     '{"choices": ["Rh+", "Rh-", "모름"]}'::jsonb,
     '{"field": "rh_factor"}'::jsonb),
    (3, 'likert', '나는 혼자 있는 것보다 사람들과 어울리는 것을 좋아한다.',
     '{"scale": [1, 2, 3, 4, 5], "labels": ["전혀 아니다", "아니다", "보통", "그렇다", "매우 그렇다"]}'::jsonb,
     '{"extrovert": 1, "introvert": -1}'::jsonb),
    (4, 'likert', '나는 계획을 세우고 그대로 실행하는 것을 좋아한다.',
     '{"scale": [1, 2, 3, 4, 5], "labels": ["전혀 아니다", "아니다", "보통", "그렇다", "매우 그렇다"]}'::jsonb,
     '{"planning": 1, "flexible": -1}'::jsonb),
    (5, 'likert', '나는 결정을 내릴 때 논리보다 감정을 더 중시한다.',
     '{"scale": [1, 2, 3, 4, 5], "labels": ["전혀 아니다", "아니다", "보통", "그렇다", "매우 그렇다"]}'::jsonb,
     '{"feeling": 1, "thinking": -1}'::jsonb)
) AS q(question_number, question_type, question_text, options, scoring_weights)
WHERE t.code = 'blood';


-- 테스트 문항 수 업데이트
UPDATE tests SET question_count = (SELECT COUNT(*) FROM questions WHERE questions.test_id = tests.id);

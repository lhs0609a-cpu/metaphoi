from typing import Optional
from uuid import UUID

from app.services.supabase_client import get_supabase
from app.models.ability import (
    AbilityScore,
    AbilityRadarData,
    AllAbilitiesResponse,
    ABILITY_DEFINITIONS,
)


# 검사별 능력치 매핑 (어떤 검사가 어떤 능력치에 기여하는지)
TEST_ABILITY_MAPPING = {
    "mbti": [
        "determination",
        "composure",
        "creativity",
        "analytical",
        "communication",
        "teamwork",
        "leadership",
        "empathy",
        "planning",
        "adaptability",
    ],
    "disc": [
        "determination",
        "communication",
        "leadership",
        "influence",
        "execution",
        "teamwork",
        "adaptability",
    ],
    "enneagram": [
        "composure",
        "empathy",
        "ambition",
        "integrity",
        "creativity",
        "analytical",
        "resilience",
    ],
    "tci": [
        "composure",
        "stress_resistance",
        "resilience",
        "integrity",
        "adaptability",
        "endurance",
    ],
    "gallup": [
        "leadership",
        "communication",
        "execution",
        "influence",
        "networking",
        "growth_potential",
    ],
    "holland": [
        "creativity",
        "analytical",
        "execution",
        "planning",
        "aesthetic",
        "spatial",
    ],
    "iq": [
        "analytical",
        "concentration",
        "problem_solving",
        "learning_speed",
        "spatial",
        "verbal",
    ],
    "mmpi": [
        "stress_resistance",
        "composure",
        "resilience",
        "empathy",
        "adaptability",
    ],
    "tarot": ["intuition", "creativity", "growth_potential"],
    "htp": [
        "creativity",
        "aesthetic",
        "spatial",
        "intuition",
        "stress_resistance",
    ],
    "saju": ["growth_potential", "ambition", "resilience", "adaptability"],
    "sasang": ["endurance", "stress_resistance", "adaptability", "composure"],
    "face": ["intuition", "influence", "leadership", "communication"],
    "blood": ["teamwork", "communication", "adaptability"],
}


async def get_user_abilities(user_id: str) -> list[dict]:
    supabase = get_supabase()

    result = (
        supabase.table("user_abilities")
        .select("*, abilities(*)")
        .eq("user_id", user_id)
        .execute()
    )

    return result.data or []


async def calculate_abilities(user_id: str) -> AllAbilitiesResponse:
    """
    사용자의 모든 검사 결과를 기반으로 30개 능력치를 계산합니다.
    """
    supabase = get_supabase()

    # Get all test results for user
    results = (
        supabase.table("test_results")
        .select("*, tests(code)")
        .eq("user_id", user_id)
        .execute()
    )

    test_results = results.data or []
    completed_tests = [r["tests"]["code"] for r in test_results if r.get("tests")]

    # Initialize ability scores
    ability_scores = {}
    ability_sources = {}

    for ability in ABILITY_DEFINITIONS:
        code = ability["code"]
        ability_scores[code] = []
        ability_sources[code] = []

    # Process each test result
    for result in test_results:
        test_code = result.get("tests", {}).get("code")
        if not test_code:
            continue

        raw_scores = result.get("raw_scores", {})
        mapped_abilities = TEST_ABILITY_MAPPING.get(test_code, [])

        for ability_code in mapped_abilities:
            if ability_code in ability_scores:
                # Calculate score contribution (normalized to 0-20)
                score = _calculate_ability_score(test_code, ability_code, raw_scores)
                if score is not None:
                    ability_scores[ability_code].append(score)
                    ability_sources[ability_code].append(test_code)

    # Aggregate scores
    categories_data = {}
    total_score = 0
    total_abilities = 0

    for ability in ABILITY_DEFINITIONS:
        code = ability["code"]
        category = ability["category"]
        scores = ability_scores[code]

        if scores:
            avg_score = sum(scores) / len(scores)
            confidence = min(len(scores) / 3, 1.0)  # Max confidence at 3 tests
        else:
            avg_score = 10  # Default middle score
            confidence = 0

        ability_data = AbilityScore(
            code=code,
            name=ability["name"],
            category=category,
            score=round(avg_score, 1),
            max_score=20,
            confidence=round(confidence, 2),
            source_tests=ability_sources[code],
        )

        if category not in categories_data:
            categories_data[category] = []
        categories_data[category].append(ability_data)

        total_score += avg_score
        total_abilities += 1

        # Save to database
        await _save_user_ability(
            user_id, code, avg_score, confidence, ability_sources[code]
        )

    # Build response
    all_tests = list(TEST_ABILITY_MAPPING.keys())
    pending_tests = [t for t in all_tests if t not in completed_tests]

    radar_data = [
        AbilityRadarData(category=cat, abilities=abilities)
        for cat, abilities in categories_data.items()
    ]

    return AllAbilitiesResponse(
        total_score=round(total_score, 1),
        max_total_score=total_abilities * 20,
        reliability=round(len(completed_tests) / len(all_tests), 2),
        categories=radar_data,
        completed_tests=completed_tests,
        pending_tests=pending_tests,
    )


def _calculate_ability_score(
    test_code: str, ability_code: str, raw_scores: dict
) -> Optional[float]:
    """
    검사 결과에서 특정 능력치 점수를 계산합니다.
    실제 구현에서는 각 검사별로 세부적인 변환 로직이 필요합니다.
    """
    if not raw_scores:
        return None

    # 간단한 예시 로직 - 실제로는 검사별로 다른 알고리즘 적용
    if test_code == "mbti":
        # MBTI 유형에 따른 능력치 매핑
        type_code = raw_scores.get("type", "")
        return _mbti_to_ability(type_code, ability_code)

    elif test_code == "disc":
        # DISC 유형에 따른 능력치 매핑
        d_score = raw_scores.get("D", 0)
        i_score = raw_scores.get("I", 0)
        s_score = raw_scores.get("S", 0)
        c_score = raw_scores.get("C", 0)
        return _disc_to_ability(d_score, i_score, s_score, c_score, ability_code)

    elif test_code == "iq":
        # IQ 점수 기반
        iq_score = raw_scores.get("score", 100)
        return min(20, max(0, (iq_score - 70) / 8))  # 70-230 -> 0-20

    # 기본값: raw_scores에서 직접 매핑
    if ability_code in raw_scores:
        return min(20, max(0, raw_scores[ability_code]))

    return None


def _mbti_to_ability(type_code: str, ability_code: str) -> float:
    """MBTI 유형을 능력치로 변환"""
    if not type_code or len(type_code) != 4:
        return 10.0

    mappings = {
        "determination": {"E": 12, "I": 8, "T": 14, "F": 10, "J": 14, "P": 10},
        "composure": {"I": 14, "E": 10, "T": 14, "F": 10, "J": 12, "P": 10},
        "creativity": {"N": 16, "S": 10, "P": 14, "J": 10},
        "analytical": {"T": 16, "F": 10, "N": 12, "S": 12},
        "communication": {"E": 16, "I": 10, "F": 14, "T": 10},
        "teamwork": {"F": 14, "T": 10, "S": 12, "N": 12},
        "leadership": {"E": 14, "I": 10, "T": 12, "F": 12, "J": 14, "P": 10},
        "empathy": {"F": 16, "T": 10, "E": 12, "I": 12},
        "planning": {"J": 16, "P": 10, "S": 12, "N": 12},
        "adaptability": {"P": 16, "J": 10, "N": 12, "S": 12},
    }

    if ability_code not in mappings:
        return 10.0

    score = 0
    count = 0
    for letter, value in mappings[ability_code].items():
        if letter in type_code:
            score += value
            count += 1

    return score / count if count > 0 else 10.0


def _disc_to_ability(d: float, i: float, s: float, c: float, ability_code: str) -> float:
    """DISC 점수를 능력치로 변환"""
    mappings = {
        "determination": d * 0.8,
        "communication": i * 0.8,
        "leadership": (d + i) * 0.4,
        "influence": i * 0.8,
        "execution": (d + c) * 0.4,
        "teamwork": s * 0.8,
        "adaptability": (i + s) * 0.4,
    }

    return min(20, max(0, mappings.get(ability_code, 10)))


async def _save_user_ability(
    user_id: str,
    ability_code: str,
    score: float,
    confidence: float,
    source_tests: list[str],
) -> None:
    """사용자 능력치를 데이터베이스에 저장"""
    supabase = get_supabase()

    # Get ability ID
    ability = (
        supabase.table("abilities")
        .select("id")
        .eq("code", ability_code)
        .single()
        .execute()
    )

    if not ability.data:
        return

    ability_id = ability.data["id"]

    # Upsert user ability
    supabase.table("user_abilities").upsert(
        {
            "user_id": user_id,
            "ability_id": ability_id,
            "score": score,
            "confidence": confidence,
            "source_tests": source_tests,
        },
        on_conflict="user_id,ability_id",
    ).execute()

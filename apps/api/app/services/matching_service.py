import math
from typing import Optional


def calculate_fit_score(
    seeker_profile: dict,
    job_posting: dict,
    company: Optional[dict],
    team_profile: Optional[dict],
) -> dict:
    ability_fit = calc_ability_fit(
        seeker_profile.get("abilities_snapshot"),
        job_posting.get("required_abilities"),
    )
    culture_fit = calc_culture_fit(
        seeker_profile.get("comprehensive_profile"),
        company.get("culture_tags") if company else job_posting.get("preferred_culture"),
        team_profile,
    )
    condition_fit = calc_condition_fit(seeker_profile, job_posting.get("conditions"))

    total = round(ability_fit * 0.6 + culture_fit * 0.25 + condition_fit * 0.15, 1)

    return {
        "ability": round(ability_fit, 1),
        "culture": round(culture_fit, 1),
        "condition": round(condition_fit, 1),
        "total": total,
    }


def calc_ability_fit(
    abilities_snapshot: Optional[list],
    required_abilities: Optional[dict],
) -> float:
    if not abilities_snapshot or not required_abilities:
        return 50.0

    # abilities_snapshot: [{"key": "leadership", "score": 75, ...}, ...]
    seeker_map = {}
    for a in abilities_snapshot:
        if isinstance(a, dict) and "key" in a:
            seeker_map[a["key"]] = a.get("score", 0)

    if not seeker_map or not required_abilities:
        return 50.0

    total_diff = 0
    count = 0
    for key, req in required_abilities.items():
        min_score = req.get("min", 0) if isinstance(req, dict) else req
        seeker_score = seeker_map.get(key, 50)
        diff = max(0, min_score - seeker_score)
        total_diff += diff ** 2
        count += 1

    if count == 0:
        return 50.0

    rmse = math.sqrt(total_diff / count)
    score = max(0, 100 - rmse * 2)
    return score


def calc_culture_fit(
    comprehensive_profile: Optional[dict],
    culture_tags: Optional[list],
    team_profile: Optional[dict],
) -> float:
    if not comprehensive_profile:
        return 50.0

    score = 50.0

    # 문화 태그 매칭
    if culture_tags and isinstance(culture_tags, list):
        # MBTI/DISC 기반 문화 성향 매칭
        mbti = comprehensive_profile.get("mbti", {})
        disc = comprehensive_profile.get("disc", {})

        culture_keywords = {
            "자율출퇴근": ["P", "I"],
            "수평문화": ["P", "S", "I"],
            "성과중심": ["J", "D", "C"],
            "데이터중심": ["T", "C"],
            "팀워크중심": ["E", "S", "I"],
            "혁신적": ["N", "D", "I"],
            "안정적": ["S", "J", "S"],
            "성장지향": ["N", "D"],
        }

        mbti_type = mbti.get("type", "")
        disc_type = disc.get("type", "")
        combined = mbti_type + disc_type

        match_count = 0
        total_tags = len(culture_tags)
        for tag in culture_tags:
            keywords = culture_keywords.get(tag, [])
            if any(k in combined for k in keywords):
                match_count += 1

        if total_tags > 0:
            score = 30 + (match_count / total_tags) * 70

    # 팀 프로필 기반 보정
    if team_profile and team_profile.get("current_team_types"):
        team_types = team_profile.get("current_team_types", {})
        if team_types:
            score = min(100, score + 5)

    return score


def calc_condition_fit(
    seeker_profile: dict,
    conditions: Optional[dict],
) -> float:
    if not conditions:
        return 70.0

    score = 0
    checks = 0

    # 근무 형태
    if conditions.get("remote"):
        checks += 1
        if seeker_profile.get("remote_pref") == conditions["remote"]:
            score += 100
        elif seeker_profile.get("remote_pref") == "hybrid":
            score += 70
        else:
            score += 30

    # 경력
    if conditions.get("experience_min") is not None:
        checks += 1
        exp = seeker_profile.get("experience_years", 0) or 0
        if exp >= conditions["experience_min"]:
            score += 100
        else:
            gap = conditions["experience_min"] - exp
            score += max(0, 100 - gap * 20)

    if conditions.get("experience_max") is not None:
        checks += 1
        exp = seeker_profile.get("experience_years", 0) or 0
        if exp <= conditions["experience_max"]:
            score += 100
        else:
            gap = exp - conditions["experience_max"]
            score += max(0, 100 - gap * 20)

    # 위치
    if conditions.get("location"):
        checks += 1
        if seeker_profile.get("location_pref"):
            if conditions["location"] in seeker_profile["location_pref"]:
                score += 100
            else:
                score += 40
        else:
            score += 60

    if checks == 0:
        return 70.0

    return score / checks

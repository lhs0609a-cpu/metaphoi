import math
from typing import Optional


# 적합도 가중치.
#
# 이 값들은 실제 채용 결과로 검증된 것이 아니라 설정값이다.
# 화면에도 그렇게 적혀 있고, 채용 데이터가 쌓이면 여기부터 교정한다.
# 코드 여기저기에 흩어놓지 않고 한곳에 모아 두는 이유가 그것이다.
WEIGHTS = {
    "ability": 0.60,
    "culture": 0.25,
    "condition": 0.15,
}


def calculate_fit_score(
    seeker_profile: dict,
    job_posting: dict,
    company: Optional[dict],
    team_profile: Optional[dict],
) -> dict:
    """
    적합도를 계산한다.

    측정되지 않은 항목은 점수를 만들어내지 않고 빼고 계산한다.

    예전에는 데이터가 없으면 50을 넣었다. 그러면 "재보니 보통"과
    "아직 안 쟀음"이 같은 값이 되고, 아무것도 모르는 후보가 50점을
    받아 중간 순위에 자리를 잡는다. 화면에는 그 사실이 드러나지 않는다.
    그래서 없는 항목은 빼고, 남은 항목의 가중치를 다시 정규화한다.
    무엇으로 계산했는지는 measured 에 남긴다.
    """
    parts: dict[str, Optional[float]] = {
        "ability": calc_ability_fit(
            seeker_profile.get("abilities_snapshot"),
            job_posting.get("required_abilities"),
        ),
        "culture": calc_culture_fit(
            seeker_profile.get("culture_profile"),
            (company or {}).get("culture_profile") or job_posting.get("culture_profile"),
            team_profile,
        ),
        "condition": calc_condition_fit(seeker_profile, job_posting.get("conditions")),
    }

    measured = {k: v for k, v in parts.items() if v is not None}

    if not measured:
        return {
            "ability": None,
            "culture": None,
            "condition": None,
            "total": None,
            "measured": [],
            "coverage": 0.0,
        }

    weight_sum = sum(WEIGHTS[k] for k in measured)
    total = sum(measured[k] * WEIGHTS[k] for k in measured) / weight_sum

    return {
        "ability": _round(parts["ability"]),
        "culture": _round(parts["culture"]),
        "condition": _round(parts["condition"]),
        "total": round(total, 1),
        # 어떤 항목으로 계산했는지. 화면에서 "능력·조건만으로 계산됨"처럼 밝힌다
        "measured": sorted(measured.keys()),
        # 전체 가중치 중 실제로 잰 비율. 낮으면 총점을 믿을 근거가 적다
        "coverage": round(weight_sum, 2),
    }


def _round(v: Optional[float]) -> Optional[float]:
    return None if v is None else round(v, 1)


def calc_ability_fit(
    abilities_snapshot: Optional[list],
    required_abilities: Optional[dict],
) -> Optional[float]:
    """
    요구 최소치에 못 미치는 만큼만 감점한다. 넘친다고 가점하지 않는다.

    공고가 요구 능력치를 정하지 않았거나 후보에게 측정값이 없으면
    None 을 돌려준다 — 이 항목은 계산에서 빠진다.
    """
    if not abilities_snapshot or not required_abilities:
        return None

    seeker_map = {
        a["key"]: a.get("score", 0)
        for a in abilities_snapshot
        if isinstance(a, dict) and "key" in a
    }
    if not seeker_map:
        return None

    total_diff = 0.0
    count = 0
    unmatched = 0

    for key, req in required_abilities.items():
        min_score = req.get("min", 0) if isinstance(req, dict) else req
        if key not in seeker_map:
            # 공고가 요구한 능력치가 후보 데이터에 아예 없는 경우.
            # 예전에는 기본값 50을 넣어서, 키 이름이 어긋나 있어도
            # 아무 표시 없이 그럴듯한 점수가 나왔다. 그래서 능력 적합이
            # 조용히 무력화돼 있었다. 지금은 세어 두고 계산에서 뺀다.
            unmatched += 1
            continue
        diff = max(0, min_score - seeker_map[key])
        total_diff += diff ** 2
        count += 1

    if count == 0:
        return None

    rmse = math.sqrt(total_diff / count)
    score = max(0.0, 100.0 - rmse * 2)

    # 요구 항목의 절반 이상을 못 재면 이 점수를 믿을 근거가 부족하다
    if unmatched > count:
        return None

    return score


def calc_culture_fit(
    seeker_culture: Optional[dict],
    company_culture: Optional[dict],
    team_profile: Optional[dict],
) -> Optional[float]:
    """
    경쟁가치모형(관계·혁신·성과·위계) 프로필 사이의 거리로 계산한다.

    예전에는 기업이 고른 문화 태그에 후보의 MBTI/DISC 글자가 들어 있으면
    점수를 주는 하드코딩 대응표였다("자율출퇴근" -> ["P","I"]). 근거가 없고,
    MBTI 의 I 와 DISC 의 I 를 문자열 포함으로 구분 없이 세는 결함도 있었다.
    성격 유형에서 조직 적합을 끌어내는 것 자체가 검증된 방법이 아니다.

    지금은 양쪽에 같은 문항을 묻고 프로필을 비교한다.
    한쪽이라도 답하지 않았으면 None 이다.
    """
    if not seeker_culture or not company_culture:
        return None

    keys = ("clan", "adhocracy", "market", "hierarchy")

    def normalize(p: dict) -> Optional[dict]:
        total = sum(float(p.get(k, 0) or 0) for k in keys)
        if total <= 0:
            return None
        return {k: float(p.get(k, 0) or 0) / total * 100 for k in keys}

    a = normalize(seeker_culture)
    b = normalize(company_culture)
    if a is None or b is None:
        return None

    distance = math.sqrt(sum((a[k] - b[k]) ** 2 for k in keys))
    max_distance = math.sqrt(100 ** 2 * 2)
    score = max(0.0, 100.0 - (distance / max_distance) * 100)

    # 팀 프로필까지 같은 척도로 잰 경우, 회사 전체와 팀의 평균으로 본다.
    # 사람은 회사가 아니라 팀에서 일한다.
    team_culture = (team_profile or {}).get("culture_profile")
    if team_culture:
        t = normalize(team_culture)
        if t is not None:
            t_distance = math.sqrt(sum((a[k] - t[k]) ** 2 for k in keys))
            t_score = max(0.0, 100.0 - (t_distance / max_distance) * 100)
            score = (score + t_score) / 2

    return score


def calc_condition_fit(
    seeker_profile: dict,
    conditions: Optional[dict],
) -> Optional[float]:
    """
    근무 조건 일치. 공고가 조건을 명시하지 않았으면 None 이다
    — 조건이 없다는 것은 "잘 맞는다"가 아니라 "따질 것이 없다"이다.
    """
    if not conditions:
        return None

    score = 0.0
    checks = 0

    if conditions.get("remote"):
        checks += 1
        pref = seeker_profile.get("remote_pref")
        if pref == conditions["remote"]:
            score += 100
        elif pref == "hybrid":
            score += 70
        elif pref:
            score += 30
        else:
            # 후보가 답하지 않은 항목. 불리하게도 유리하게도 두지 않는다
            score += 50

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

    if conditions.get("location"):
        checks += 1
        pref = seeker_profile.get("location_pref")
        if pref:
            score += 100 if conditions["location"] in pref else 40
        else:
            score += 50

    if checks == 0:
        return None

    return score / checks
